import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import api, { getContacts, addContact, removeContact } from '../services/api';
import { API_ENDPOINTS, WS_EVENTS } from '../utils/constants';
import { isCriticalPayload, estimateThreatScore } from '../utils/sensitivity';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { wsManager, status: wsStatus } = useWebSocket();
  
  const [messages, setMessages] = useState(new Map());
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [securityBanner, setSecurityBanner] = useState(null);
  const [encryptionStatus, setEncryptionStatus] = useState({ lane: 'PQC', threat_score: 0 });

  const fetchContacts = useCallback(async () => {
    try {
      const data = await getContacts();
      if (Array.isArray(data)) {
        setContacts(data);
        const online = new Set(data.filter(c => c.is_online).map(c => c.id));
        setOnlineUsers(online);
      } else {
        console.warn('Expected array of contacts, received:', typeof data);
        setContacts([]);
      }
    } catch (error) {
      console.error('Failed to fetch contacts', error);
      setContacts([]);
    }
  }, []);

  const loadHistory = useCallback(async (peerId) => {
    try {
      const response = await api.get(API_ENDPOINTS.MESSAGES(peerId));
      setMessages(prev => {
        const next = new Map(prev);
        next.set(peerId, response.data.items);
        return next;
      });
    } catch (error) {
      console.error('Failed to load history', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user, fetchContacts]);

  // Auto-sync contacts and active chat history when app is foregrounded or regains focus
  useEffect(() => {
    if (!user) return;
    const handleSync = () => {
      fetchContacts();
      if (activeChat?.id) {
        loadHistory(activeChat.id);
      }
    };

    window.addEventListener('focus', handleSync);
    const handleVisibility = () => {
      if (!document.hidden) handleSync();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, activeChat, fetchContacts, loadHistory]);

  useEffect(() => {
    if (!wsManager) return;

    const unsubs = [
      wsManager.on(WS_EVENTS.CHAT_MESSAGE, (payload) => {
        const currentUserId = user?.id;
        const isSelf = currentUserId && (String(payload.sender_id) === String(currentUserId));
        const peerId = isSelf ? payload.recipient_id : payload.sender_id;

        setMessages(prev => {
          const next = new Map(prev);
          const chatMsgs = next.get(peerId) || [];

          // If message is from current user, replace the matching optimistic temporary message
          if (isSelf) {
            const tempIdx = chatMsgs.findIndex(m => 
              (payload.client_msg_id && (m.id === payload.client_msg_id || m.client_msg_id === payload.client_msg_id)) ||
              (typeof m.id === 'string' && m.id.startsWith('temp-') && 
               (m.content || '').trim() === (payload.content || '').trim() && 
               (!m.file_name || m.file_name === payload.file_name))
            );
            if (tempIdx !== -1) {
              const updatedList = [...chatMsgs];
              updatedList[tempIdx] = {
                ...updatedList[tempIdx],
                ...payload,
                status: 'delivered'
              };
              next.set(peerId, updatedList);
              return next;
            }
          }

          // Avoid duplicate messages
          if (!chatMsgs.find(m => m.id === payload.id)) {
            next.set(peerId, [...chatMsgs, payload]);
          }
          return next;
        });

        // Ensure contact/thread presence in sidebar
        setContacts(prev => {
          const exists = prev.some(c => c.id === peerId);
          if (!exists) {
            fetchContacts();
          }
          return prev;
        });
        
        if (activeChat?.id !== peerId && !isSelf) {
          setUnreadCounts(prev => ({
            ...prev,
            [peerId]: (prev[peerId] || 0) + 1
          }));
        }
      }),
      wsManager.on(WS_EVENTS.DELIVERY_CONFIRMATION, (payload) => {
        if (!payload) return;
        setMessages(prev => {
          const next = new Map(prev);
          let modified = false;
          for (const [peerId, list] of next.entries()) {
            const idx = list.findIndex(m => 
              (payload.client_msg_id && (m.id === payload.client_msg_id || m.client_msg_id === payload.client_msg_id)) ||
              m.id === payload.message_id ||
              (typeof m.id === 'string' && m.id.startsWith('temp-') && m.status === 'sending')
            );
            if (idx !== -1) {
              const updated = [...list];
              updated[idx] = {
                ...updated[idx],
                id: payload.message_id || updated[idx].id,
                encryption_lane: payload.encryption_lane || updated[idx].encryption_lane,
                threat_score: payload.threat_score ?? updated[idx].threat_score,
                status: 'delivered'
              };
              next.set(peerId, updated);
              modified = true;
              break;
            }
          }
          return modified ? next : prev;
        });
      }),
      wsManager.on(WS_EVENTS.TYPING_START, (payload) => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.add(payload.user_id);
          return next;
        });
      }),
      wsManager.on(WS_EVENTS.TYPING_STOP, (payload) => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(payload.user_id);
          return next;
        });
      }),
      wsManager.on(WS_EVENTS.SECURITY_BANNER, (payload) => {
        setSecurityBanner(payload);
        setTimeout(() => setSecurityBanner(null), 3000);
      }),
      wsManager.on(WS_EVENTS.ENCRYPTION_STATUS, (payload) => {
        setEncryptionStatus(payload);
      }),
      wsManager.on(WS_EVENTS.USER_STATUS, (payload) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (payload.is_online) next.add(payload.user_id);
          else next.delete(payload.user_id);
          return next;
        });
      })
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [wsManager, activeChat, user, fetchContacts]);

  const sendMessage = (recipientId, content, file = null, isHighSecurity = false) => {
    if (!content && !file) return;

    // Instant optimistic client-side threat & sensitivity evaluation
    const isCritical = isCriticalPayload(content, file, isHighSecurity);
    const estimatedThreat = estimateThreatScore(content, file, isHighSecurity);

    // Instant optimistic client-side message so sender immediately sees their message
    const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg = {
      id: optimisticId,
      client_msg_id: optimisticId,
      sender_id: user?.id,
      recipient_id: recipientId,
      content: content || '',
      file_name: file?.name || null,
      file_url: file?.data ? `data:${file.type || 'application/octet-stream'};base64,${file.data}` : null,
      file_size: file?.size || null,
      encryption_lane: isCritical ? 'critical' : 'standard',
      threat_score: estimatedThreat,
      is_read: false,
      is_contact: true,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => {
      const next = new Map(prev);
      const chatMsgs = next.get(recipientId) || [];
      next.set(recipientId, [...chatMsgs, optimisticMsg]);
      return next;
    });

    wsManager.send(WS_EVENTS.CHAT_MESSAGE, {
      client_msg_id: optimisticId,
      recipient_id: recipientId,
      content,
      high_security: isHighSecurity,
      ...(file && { file_data: file.data, file_name: file.name })
    });
  };

  const startTyping = (recipientId) => {
    wsManager.send(WS_EVENTS.TYPING_START, { recipient_id: recipientId });
  };

  const stopTyping = (recipientId) => {
    wsManager.send(WS_EVENTS.TYPING_STOP, { recipient_id: recipientId });
  };

  const markAsRead = (peerId, messageIds) => {
    wsManager.send(WS_EVENTS.READ_RECEIPT, { recipient_id: peerId, message_ids: messageIds });
    setUnreadCounts(prev => ({ ...prev, [peerId]: 0 }));
  };

  const handleSetActiveChat = (contact) => {
    setActiveChat(contact);
    if (contact) {
      if (!messages.has(contact.id)) {
        loadHistory(contact.id);
      }
      setUnreadCounts(prev => ({ ...prev, [contact.id]: 0 }));
    }
  };

  const handleAddContact = async (target) => {
    try {
      const payload = typeof target === 'string' ? { contact_id: target } : target;
      const added = await addContact(payload);
      setContacts(prev => {
        const exists = prev.some(c => c.id === added.id);
        if (exists) {
          return prev.map(c => c.id === added.id ? { ...c, is_contact: true } : c);
        }
        return [added, ...prev];
      });
      setActiveChat(prev => (prev?.id === added.id ? { ...prev, is_contact: true } : prev));
      return added;
    } catch (err) {
      console.error('Failed to add contact', err);
      throw err;
    }
  };

  const handleRemoveContact = async (contactId) => {
    try {
      await removeContact(contactId);
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, is_contact: false } : c));
      setActiveChat(prev => (prev?.id === contactId ? { ...prev, is_contact: false } : prev));
    } catch (err) {
      console.error('Failed to remove contact', err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      contacts,
      activeChat,
      unreadCounts,
      typingUsers,
      onlineUsers,
      securityBanner,
      encryptionStatus,
      wsStatus,
      setActiveChat: handleSetActiveChat,
      addContact: handleAddContact,
      removeContact: handleRemoveContact,
      fetchContacts,
      sendMessage,
      startTyping,
      stopTyping,
      markAsRead,
      loadHistory
    }}>
      {children}
    </ChatContext.Provider>
  );
};
