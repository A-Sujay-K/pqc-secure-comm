import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ChatContext = createContext(null);

const initialState = {
  messages: {},      // keyed by peer_id
  typingUsers: {},   // keyed by user_id
  activeChat: null,
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: { ...state.messages, [action.peerId]: action.messages } };
    case 'APPEND_MESSAGE': {
      const existing = state.messages[action.peerId] || [];
      return { ...state, messages: { ...state.messages, [action.peerId]: [...existing, action.message] } };
    }
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.userId };
    case 'SET_TYPING':
      return { ...state, typingUsers: { ...state.typingUsers, [action.userId]: action.isTyping } };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const appendMessage = useCallback((peerId, message) => {
    dispatch({ type: 'APPEND_MESSAGE', peerId, message });
  }, []);

  const setMessages = useCallback((peerId, messages) => {
    dispatch({ type: 'SET_MESSAGES', peerId, messages });
  }, []);

  return (
    <ChatContext.Provider value={{ state, dispatch, appendMessage, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
