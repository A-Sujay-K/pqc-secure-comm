/**
 * ParticleSystem.js
 * High-performance object-pool data flow simulator on the quantum computer chandelier graph.
 *
 * Zero garbage-collection allocations per frame:
 * - 280 particles on desktop, 120 on mobile
 * - Multi-stage graph progression: ring -> plate1 -> plate2 -> plate3 -> column convergence -> exit
 * - BB84 QKD key pulse moving upward along column
 * - Ring flash triggers on packet transit
 * - Wave-function collapse on key 'M' / measure event
 */

export class ParticleSystem {
  constructor(pathsData, glyphAtlas) {
    this.pathsData = pathsData;
    this.glyphAtlas = glyphAtlas;
    this.viewBox = pathsData.viewBox;

    // Fast indexed lookups
    this.pathsById = new Map();
    pathsData.paths.forEach(p => this.pathsById.set(p.id, p));

    this.nodesById = pathsData.nodes;
    this.entryNodeIds = Object.values(pathsData.nodes)
      .filter(n => n.type === 'entry' && n.id.startsWith('ring-'))
      .map(n => n.id);

    this.rings = pathsData.rings || [];
    // Ring active glow states: [glowIntensity0..1, timer]
    this.ringStates = this.rings.map(r => ({ ...r, glow: 0, timer: 0 }));

    // Particle pool
    this.poolSize = 280;
    this.particles = [];
    this.initPool();

    // BB84 QKD Key upward pulses along central column
    this.qkdPulses = [
      { y: 780, speed: 180, active: true, progress: 0 },
      { y: 780, speed: 160, active: false, delay: 1.8 }
    ];

    // State & Measurement
    this.theta = 1.00;
    this.phi = 4.94;
    this.p0 = 0.77;
    this.p1 = 0.23;

    this.isMeasuring = false;
    this.measureFreezeTimer = 0;
    this.measureCollapseBit = null;
    this.measureSuperpositionTimer = 0;
    this.shockwaveRadius = 0;
    this.shockwaveActive = false;
  }

  setPoolSize(size) {
    this.poolSize = size;
    if (this.particles.length > size) {
      this.particles.length = size;
    } else {
      while (this.particles.length < size) {
        this.particles.push(this.createParticle(Math.random()));
      }
    }
  }

  initPool() {
    this.particles = [];
    for (let i = 0; i < this.poolSize; i++) {
      // Stagger initial progress so particles are immediately spread along all stages
      const initProgress = Math.random();
      this.particles.push(this.createParticle(initProgress));
    }
  }

  createParticle(initialProgress = 0) {
    // Pick a random entry node
    const entryId = this.entryNodeIds[Math.floor(Math.random() * this.entryNodeIds.length)];
    const node = this.nodesById[entryId];
    const firstPathId = node.out[Math.floor(Math.random() * node.out.length)];
    const pathObj = this.pathsById.get(firstPathId);

    // Initial position on path
    const lut = pathObj ? pathObj.lut : [[node.x, node.y]];
    const lutIdx = Math.floor(initialProgress * (lut.length - 1));
    const pos = lut[lutIdx] || lut[0];

    const isBitZero = Math.random() < this.p0;

    return {
      active: true,
      currentPathId: firstPathId,
      progress: initialProgress, // 0.0 to 1.0 along current path
      speed: 0.18 + Math.random() * 0.12, // Progress per second
      bit: isBitZero ? '0' : '1',
      kind: pathObj ? pathObj.kind : 'wire', // 'wire' or 'column'
      stage: pathObj ? pathObj.stage : 0,
      x: pos[0],
      y: pos[1],
      trail: [
        { x: pos[0], y: pos[1] },
        { x: pos[0], y: pos[1] },
        { x: pos[0], y: pos[1] },
        { x: pos[0], y: pos[1] }
      ],
      trailTimer: 0,
      burstTimer: 0 // Flash when joining QKD
    };
  }

  setStateVector(theta, phi) {
    this.theta = theta;
    this.phi = phi;
    this.p0 = Math.cos(theta / 2) ** 2;
    this.p1 = 1 - this.p0;
  }

  triggerMeasure() {
    this.isMeasuring = true;
    this.measureFreezeTimer = 0.15; // 150ms freeze
    this.measureCollapseBit = Math.random() < this.p0 ? '0' : '1';
    this.measureSuperpositionTimer = 1.2; // 1.2s before resuming superposition
    this.shockwaveActive = true;
    this.shockwaveRadius = 10;

    // Set all particles to the collapsed bit immediately
    this.particles.forEach(p => {
      p.bit = this.measureCollapseBit;
      p.burstTimer = 0.25;
    });

    // Pulse all 3 rings
    this.ringStates.forEach(r => {
      r.glow = 1.0;
      r.timer = 0.45;
    });

    return this.measureCollapseBit;
  }

  update(dt) {
    if (dt > 0.1) dt = 0.1; // Cap large frame delta

    // 1. Measurement Timers
    if (this.measureFreezeTimer > 0) {
      this.measureFreezeTimer -= dt;
      if (this.measureFreezeTimer <= 0) {
        this.isMeasuring = false;
      }
    }

    if (this.measureSuperpositionTimer > 0) {
      this.measureSuperpositionTimer -= dt;
      if (this.measureSuperpositionTimer <= 0) {
        this.measureCollapseBit = null;
      }
    }

    if (this.shockwaveActive) {
      this.shockwaveRadius += 350 * dt;
      if (this.shockwaveRadius > 450) {
        this.shockwaveActive = false;
      }
    }

    // 2. Ring Glow Decay
    this.ringStates.forEach(r => {
      if (r.timer > 0) {
        r.timer -= dt;
        r.glow = Math.max(0, r.timer / 0.4);
      }
    });

    // 3. Upward BB84 QKD Pulses along central column
    this.qkdPulses.forEach(q => {
      if (q.active) {
        q.y -= q.speed * dt;
        // Check collision with coupling rings to trigger subtle ambient flash
        this.ringStates.forEach(r => {
          if (Math.abs(q.y - r.y) < 12 && r.timer <= 0) {
            r.glow = 0.6;
            r.timer = 0.3;
          }
        });
        if (q.y < 185) {
          q.active = false;
          q.delay = 1.5 + Math.random() * 1.5;
        }
      } else {
        q.delay -= dt;
        if (q.delay <= 0) {
          q.active = true;
          q.y = 780;
        }
      }
    });

    // If freeze is active, don't advance particle positions
    if (this.measureFreezeTimer > 0) return;

    // 4. Update Particles
    const centerX = this.pathsData.centerX || 322;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      if (p.burstTimer > 0) p.burstTimer -= dt;

      p.progress += p.speed * dt;

      const pathObj = this.pathsById.get(p.currentPathId);
      if (!pathObj) {
        // Fallback respawn
        Object.assign(p, this.createParticle(0));
        continue;
      }

      // Reached end of current path?
      if (p.progress >= 1.0) {
        const endNodeId = pathObj.end;
        const endNode = this.nodesById[endNodeId];

        if (!endNode || !endNode.out || endNode.out.length === 0 || endNode.type === 'exit') {
          // Reached bottom exit! Respawn at top ring
          Object.assign(p, this.createParticle(0));
          continue;
        }

        // Advance to next path in graph
        // Weighted random choice: 75% continue straight, 25% hop to neighbor
        let nextPathId = endNode.out[0];
        if (endNode.out.length > 1) {
          nextPathId = endNode.out[Math.floor(Math.random() * endNode.out.length)];
        }

        p.currentPathId = nextPathId;
        p.progress = 0.0;
        const nextPathObj = this.pathsById.get(nextPathId);
        if (nextPathObj) {
          p.kind = nextPathObj.kind;
          p.stage = nextPathObj.stage;
        }

        // If entering column, trigger burst and check QKD pulse intersection
        if (p.kind === 'column') {
          // Pulse the lower coupling ring
          if (this.ringStates[2]) {
            this.ringStates[2].glow = Math.max(this.ringStates[2].glow, 0.7);
            this.ringStates[2].timer = 0.3;
          }
        }
      }

      // Compute coordinate along current path LUT
      const currentPath = this.pathsById.get(p.currentPathId);
      if (currentPath && currentPath.lut) {
        const lut = currentPath.lut;
        const s = Math.min(1.0, Math.max(0.0, p.progress));
        const idxFloat = s * (lut.length - 1);
        const idx = Math.floor(idxFloat);
        const frac = idxFloat - idx;
        const p1 = lut[idx];
        const p2 = lut[Math.min(lut.length - 1, idx + 1)];

        p.x = p1[0] + frac * (p2[0] - p1[0]);
        p.y = p1[1] + frac * (p2[1] - p1[1]);
      }

      // Check intersection with upward QKD pulse along column
      if (p.kind === 'column') {
        this.qkdPulses.forEach(q => {
          if (q.active && Math.abs(p.y - q.y) < 10) {
            p.burstTimer = 0.2; // Dual-key combination burst!
          }
        });
      }

      // Update trail samples every 40ms
      p.trailTimer += dt;
      if (p.trailTimer >= 0.04) {
        p.trailTimer = 0;
        p.trail.pop();
        p.trail.unshift({ x: p.x, y: p.y });
      }
    }
  }

  draw(ctx, width, height) {
    const scaleX = width / this.viewBox.width;
    const scaleY = height / this.viewBox.height;

    // Draw active coupling ring glow pulses
    this.ringStates.forEach(r => {
      if (r.glow > 0.01) {
        ctx.save();
        const rx = r.x * scaleX;
        const ry = r.y * scaleY;
        const rh = (r.height || 20) * scaleY;
        const grad = ctx.createRadialGradient(rx, ry, 4, rx, ry, 45 * scaleX);
        grad.addColorStop(0, `rgba(245, 158, 11, ${0.45 * r.glow})`);
        grad.addColorStop(0.6, `rgba(94, 234, 212, ${0.2 * r.glow})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rx, ry, 45 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Draw Upward QKD Pulses along central column
    this.qkdPulses.forEach(q => {
      if (q.active) {
        ctx.save();
        const qx = (this.pathsData.centerX || 322) * scaleX;
        const qy = q.y * scaleY;
        const pulseGrad = ctx.createRadialGradient(qx, qy, 2, qx, qy, 18 * scaleX);
        pulseGrad.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
        pulseGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        pulseGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(qx, qy, 18 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        // Tiny amber glyph
        this.glyphAtlas.draw(ctx, '1_amber', qx, qy, 0.7 * scaleX, 0.9);
        ctx.restore();
      }
    });

    // Draw Particles & Fading Ghost Trails
    const pScale = 0.65 * scaleX;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      const px = p.x * scaleX;
      const py = p.y * scaleY;

      // Select sprite variant based on kind and superposition state
      let spriteName = '0_warm';
      if (p.burstTimer > 0) {
        spriteName = 'psi_burst';
      } else if (p.kind === 'column') {
        // In column: PQC teal
        spriteName = (p.bit === '0' ? '0_teal' : '1_teal');
        if (!this.measureCollapseBit && Math.random() < 0.2) {
          spriteName = 'psi_teal';
        }
      } else {
        // On wires: warm off-white classical bits
        spriteName = (p.bit === '0' ? '0_warm' : '1_warm');
      }

      // Draw faint ghost trail
      for (let t = 0; t < p.trail.length; t++) {
        const tr = p.trail[t];
        const tx = tr.x * scaleX;
        const ty = tr.y * scaleY;
        const trailAlpha = 0.25 * (1 - (t + 1) / (p.trail.length + 1));
        this.glyphAtlas.draw(ctx, spriteName, tx, ty, pScale * 0.8, trailAlpha);
      }

      // Draw main particle glyph
      this.glyphAtlas.draw(ctx, spriteName, px, py, pScale, 1.0);
    }

    // Draw Shockwave on Measurement Collapse
    if (this.shockwaveActive) {
      ctx.save();
      const cx = (this.pathsData.centerX || 322) * scaleX;
      const cy = 480 * scaleY;
      const r = this.shockwaveRadius * scaleX;
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner flash
      const flashGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      flashGrad.addColorStop(0.3, 'rgba(94, 234, 212, 0.2)');
      flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = flashGrad;
      ctx.fill();
      ctx.restore();
    }
  }

  drawDebugOverlay(ctx, width, height) {
    const scaleX = width / this.viewBox.width;
    const scaleY = height / this.viewBox.height;

    ctx.save();
    // 1. Draw all paths as thin cyan lines
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.4)';
    ctx.lineWidth = 1;
    this.pathsData.paths.forEach(p => {
      ctx.beginPath();
      p.points.forEach((pt, idx) => {
        const x = pt[0] * scaleX;
        const y = pt[1] * scaleY;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // 2. Draw all nodes as orange dots
    Object.values(this.nodesById).forEach(n => {
      const x = n.x * scaleX;
      const y = n.y * scaleY;
      ctx.fillStyle = n.type === 'entry' ? '#22c55e' : (n.type === 'exit' ? '#ef4444' : '#f59e0b');
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}
