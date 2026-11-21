import { useState, useRef, useCallback, useEffect } from 'react';

const DEMO_MESSAGES = [
  { high_security: false, content: '[Demo 1/10] Telemetry baseline established — Standard Lane active' },
  { high_security: false, content: '[Demo 2/10] ML-KEM-768 lattice key encapsulation verified' },
  { high_security: false, content: '[Demo 3/10] Routine traffic nominal (Threat Score: 0.18 < 0.70)' },
  { high_security: false, content: '[Demo 4/10] Preparing adaptive route for elevated security payload' },
  { high_security: true,  content: '⚠ [Demo 5/10] THREAT SPIKE DETECTED (Q_TL > 0.70) — Activating Critical Lane' },
  { high_security: true,  content: '⚠ [Demo 6/10] BB84 QKD-256 + ML-KEM-768 hybrid key derived via HKDF' },
  { high_security: true,  content: '⚠ [Demo 7/10] Critical payload transmitted under information-theoretic protection' },
  { high_security: false, content: '[Demo 8/10] Threat subsided — hybrid switch returning to Standard Lane' },
  { high_security: false, content: '[Demo 9/10] Standard Lane restored — NIST FIPS 203 encapsulation nominal' },
  { high_security: false, content: '[Demo 10/10] Demonstration sequence complete — full HNDL resilience verified' },
];

export const useDemoMode = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [currentLane, setCurrentLane] = useState('standard');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  const abortRef = useRef(false);
  const wsRef = useRef(null);
  const timeoutRef = useRef(null);

  const stopDemo = useCallback(() => {
    abortRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRunning(false);
    setStatusMessage('Demo stopped');
  }, []);

  const startDemo = useCallback(async () => {
    if (isRunning) return;

    abortRef.current = false;
    setIsRunning(true);
    setStep(0);
    setError(null);
    setStatusMessage('Authenticating simulated sender (alice)...');

    try {
      // 1. Authenticate as demo user alice
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'alice', password: 'password123' }),
      });

      if (!loginRes.ok) {
        throw new Error(`Login failed with HTTP ${loginRes.status}`);
      }

      const { access_token } = await loginRes.json();
      if (abortRef.current) return;

      setStatusMessage('Locating recipient (bob)...');

      // 2. Resolve recipient bob
      const usersRes = await fetch('/api/v1/auth/users', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!usersRes.ok) {
        throw new Error(`User lookup failed with HTTP ${usersRes.status}`);
      }

      const users = await usersRes.json();
      const bob = users.find((u) => u.username === 'bob') || users[0];
      if (!bob) {
        throw new Error('No recipient user found in system');
      }

      if (abortRef.current) return;
      setStatusMessage('Opening Quantum Chat WebSocket...');

      // 3. Establish WebSocket connection
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/chat/${access_token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timed out (5s)'));
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        ws.onerror = (e) => {
          clearTimeout(timeout);
          reject(new Error('WebSocket connection error'));
        };
      });

      if (abortRef.current) {
        ws.close();
        return;
      }

      // 4. Send the 10 messages sequentially
      for (let i = 0; i < DEMO_MESSAGES.length; i++) {
        if (abortRef.current) break;

        const item = DEMO_MESSAGES[i];
        setStep(i + 1);
        setCurrentLane(item.high_security ? 'critical' : 'standard');
        setStatusMessage(
          item.high_security
            ? `Routing Message ${i + 1}/10: CRITICAL LANE (BB84 QKD + ML-KEM)`
            : `Routing Message ${i + 1}/10: STANDARD LANE (ML-KEM)`
        );

        const payload = {
          type: 'chat_message',
          recipient_id: bob.id,
          content: item.content,
          high_security: item.high_security,
        };

        ws.send(JSON.stringify(payload));

        // Wait ~1.4s between messages to allow clear telemetry visualization
        await new Promise((res) => {
          timeoutRef.current = setTimeout(res, 1400);
        });
      }

      if (!abortRef.current) {
        setStatusMessage('Demo cycle completed successfully');
        // Let completion show briefly
        timeoutRef.current = setTimeout(() => {
          setIsRunning(false);
          setStep(0);
          setStatusMessage('');
        }, 2500);
      }
    } catch (err) {
      console.error('Demo Mode Error:', err);
      setError(err.message || 'Demo execution failed');
      setIsRunning(false);
      setStatusMessage('');
    } finally {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  }, [isRunning]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    isRunning,
    step,
    total: DEMO_MESSAGES.length,
    currentLane,
    statusMessage,
    error,
    startDemo,
    stopDemo,
  };
};

export default useDemoMode;
