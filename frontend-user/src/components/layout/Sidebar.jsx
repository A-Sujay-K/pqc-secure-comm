import React, { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import Avatar from '../common/Avatar';
import { formatTime, truncate } from '../../utils/formatters';

const Sidebar = ({ onContactSelect }) => {
  const { user, logout } = useAuth();
  const { contacts, activeChat, setActiveChat, onlineUsers, unreadCounts, messages } = useChat();
  const [search, setSearch] = useState('');

  const filteredContacts = contacts
    .filter(c => c.display_name.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Sort by online status first, then alphabetically
      const aOnline = onlineUsers.has(a.id);
      const bOnline = onlineUsers.has(b.id);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return a.display_name.localeCompare(b.display_name);
    });

  const getLastMessage = (peerId) => {
    const chatMsgs = messages.get(peerId);
    if (chatMsgs && chatMsgs.length > 0) {
      return chatMsgs[chatMsgs.length - 1];
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col border-r border-white/10 bg-dark-surface/50 backdrop-blur-md">
      {/* Current User Profile */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Avatar name={user.display_name} color={user.avatar_color} isOnline={true} size="md" />
          <div>
            <h2 className="text-white font-medium text-sm">{user.display_name}</h2>
            <p className="text-white/50 text-xs font-mono">@{user.username}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-blue/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {filteredContacts.length === 0 ? (
          <div className="text-center text-white/40 text-sm mt-8">No contacts found</div>
        ) : (
          filteredContacts.map(contact => {
            const isOnline = onlineUsers.has(contact.id);
            const isActive = activeChat?.id === contact.id;
            const unread = unreadCounts[contact.id] || 0;
            const lastMsg = getLastMessage(contact.id);
            
            return (
              <button
                key={contact.id}
                onClick={() => {
                  setActiveChat(contact);
                  if (onContactSelect) onContactSelect();
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
                  isActive 
                    ? 'bg-accent-blue/20 border border-accent-blue/30' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <Avatar 
                  name={contact.display_name} 
                  color={contact.avatar_color} 
                  isOnline={isOnline} 
                  size="md" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                      {contact.display_name}
                    </h3>
                    {lastMsg && (
                      <span className="text-[10px] text-white/40 whitespace-nowrap ml-2">
                        {formatTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-white font-medium' : 'text-white/50'}`}>
                      {lastMsg ? truncate(lastMsg.content || 'File attached', 30) : 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <span className="ml-2 bg-accent-blue text-dark-bg text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
