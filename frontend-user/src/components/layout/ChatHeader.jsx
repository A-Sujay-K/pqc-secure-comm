import React from 'react';
import { useChat } from '../../hooks/useChat';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Toggle from '../common/Toggle';
import { ShieldAlert } from 'lucide-react';

const ChatHeader = ({ contact, highSecurityMode, onToggleSecurity }) => {
  const { onlineUsers, encryptionStatus } = useChat();
  const isOnline = onlineUsers.has(contact.id);

  return (
    <div className="absolute top-0 left-0 right-0 h-[72px] px-4 md:px-6 flex items-center justify-between glass z-10 pl-16 md:pl-6 border-b border-white/5">
      <div className="flex items-center gap-4">
        <Avatar 
          name={contact.display_name} 
          color={contact.avatar_color} 
          isOnline={isOnline} 
        />
        <div>
          <h2 className="text-white font-medium leading-tight">{contact.display_name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${isOnline ? 'text-accent-emerald' : 'text-white/40'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <Badge variant={encryptionStatus.lane} className="scale-90 origin-left" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`hidden md:flex items-center gap-2 ${highSecurityMode ? 'text-accent-gold' : 'text-white/40'} transition-colors`}>
          <ShieldAlert size={16} className={highSecurityMode ? 'animate-pulse' : ''} />
          <span className="text-xs font-mono font-medium tracking-wide">
            {highSecurityMode ? 'HIGH SECURITY' : 'STANDARD PQC'}
          </span>
        </div>
        <Toggle 
          checked={highSecurityMode} 
          onChange={onToggleSecurity} 
        />
      </div>
    </div>
  );
};

export default ChatHeader;
