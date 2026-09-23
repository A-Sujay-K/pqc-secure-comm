import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import ChatHeader from '../components/layout/ChatHeader';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import SecurityBanner from '../components/chat/SecurityBanner';
import { useChat } from '../hooks/useChat';
import { Shield } from 'lucide-react';

const ChatPage = () => {
  const { activeChat, securityBanner } = useChat();
  const [highSecurityMode, setHighSecurityMode] = useState(false);

  return (
    <AppShell>
      {activeChat ? (
        <div className="flex flex-col h-full bg-dark-bg relative">
          {securityBanner && (
            <div className="absolute top-0 left-0 right-0 z-20">
              <SecurityBanner banner={securityBanner} />
            </div>
          )}
          <ChatHeader 
            contact={activeChat} 
            highSecurityMode={highSecurityMode}
            onToggleSecurity={setHighSecurityMode}
          />
          <div className="flex-1 overflow-hidden flex flex-col pt-[72px]">
            <ChatWindow />
            <MessageInput highSecurityMode={highSecurityMode} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-dark-bg/50">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
              <Shield className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-medium text-white/80 mb-2">PQC Secure Chat</h2>
            <p className="text-white/40">Select a contact to start encrypted messaging</p>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default ChatPage;
