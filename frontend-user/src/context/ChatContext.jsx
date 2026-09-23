import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { API_ENDPOINTS, WS_EVENTS } from '../utils/constants';

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
      const response = await api.get(API_ENDPOINTS.USERS);
      if (Array.isArray(response.data)) {
        setContacts(response.data);
        const online = new Set(response.data.filter(c => c.is_online).map(c => c.id));
        setOnlineUsers(online);
      } else {
        console.warn('Expected array of users, received:', typeof response.data);
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

  useEffect(() => {
    if (!wsManager) return;

    const unsubs = [
      wsManager.on(WS_EVENTS.CHAT_MESSAGE, (payload) => {
        const peerId = payload.sender_id === user.id ? payload.recipient_id : payload.sender_id;
        setMessages(prev => {
          const next = new Map(prev);
          const chatMsgs = next.get(peerId) || [];
          // Avoid duplicates
          if (!chatMsgs.find(m => m.id === payload.id)) {
            next.set(peerId, [...chatMsgs, payload]);
          }
          return next;
        });
        
        if (activeChat?.id !== peerId && payload.sender_id !== user.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [peerId]: (prev[peerId] || 0) + 1
          }));
        }
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
  }, [wsManager, activeChat, user]);

  const sendMessage = (recipientId, content, file = null, isHighSecurity = false) => {
    if (!content && !file) return;
    
    wsManager.send(WS_EVENTS.CHAT_MESSAGE, {
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
