import React, { useState, useEffect } from 'react';
import { Search, LogOut, Shield, ShieldCheck, ShieldAlert, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import Avatar from '../common/Avatar';
import ThemeToggle from '../../theme/ThemeToggle';
import ProfileModal from '../chat/ProfileModal';
import { searchUsers } from '../../services/api';
import { formatTime, truncate } from '../../utils/formatters';

const Sidebar = ({ onContactSelect }) => {
  const { user, logout } = useAuth();
  const { contacts, activeChat, setActiveChat, onlineUsers, unreadCounts, messages, addContact } = useChat();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  // Debounced search for registered users when >= 3 chars
  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(q);
        setSearchResults(results || []);
      } catch (err) {
        console.error('User search failed', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredContacts = contacts
    .filter(c => 
      c.display_name.toLowerCase().includes(search.toLowerCase()) || 
      c.username.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Prioritize contacts over unverified threads, then online status, then name
      if (a.is_contact !== b.is_contact) return a.is_contact ? -1 : 1;
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

  const handleAddFromSearch = async (userResult, e) => {
    if (e) e.stopPropagation();
    try {
      const added = await addContact(userResult);
      setSearchResults(prev => prev.map(r => r.id === userResult.id ? { ...r, is_contact: true } : r));
      setActiveChat(added);
      if (onContactSelect) onContactSelect();
    } catch (err) {
      console.error('Failed to add contact from search', err);
    }
  };

  return (
    <div className="h-full flex flex-col select-none">
      {/* Current User Profile Bar + Theme Toggle + Logout */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--edge-rest)] bg-[var(--surface-inner)]/30 backdrop-blur-xl shadow-[inset_0_1px_0_var(--border-highlight)]">
        <div 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-85 transition-opacity group"
          title="Click to view & edit profile"
        >
          <Avatar 
            name={currentUser?.display_name || user?.display_name} 
            color={currentUser?.avatar_color || user?.avatar_color} 
            avatarUrl={currentUser?.avatar_url || user?.avatar_url}
            isOnline={true} 
            size="md" 
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[var(--text-primary)] font-medium text-sm truncate group-hover:underline">
              {currentUser?.display_name || user?.display_name}
            </h2>
            <p className="text-[var(--text-secondary)] text-xs truncate">@{currentUser?.username || user?.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button 
            onClick={logout}
            className="p-1.5 text-[var(--text-secondary)] hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Header Label: Messages */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <h1 className="text-base font-medium text-[var(--text-primary)] tracking-tight">Messages</h1>
      </div>

      {/* Search Input with rest edge and inset glass fill */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search contacts or users (3+ chars)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] rounded-xl py-2 pl-9 pr-8 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--edge-hover)] transition-all font-sans"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-4">
        {/* Remote Directory Search Results (when search is >= 3 chars) */}
        {search.trim().length >= 3 && (
          <div className="space-y-1.5 p-2 rounded-2xl bg-[var(--surface-inner)]/40 border border-[var(--edge-rest)]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-1">
              <span>Directory Search ({searchResults.length})</span>
              {isSearching && <Loader2 size={12} className="animate-spin text-[var(--col-standard)]" />}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="py-2.5 px-3 text-center text-xs text-[var(--text-tertiary)] font-sans">
                No users found for "{search}"
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-elevated)]/60 border border-[var(--edge-rest)] hover:border-[var(--edge-hover)] transition-all"
                  >
                    <div 
                      onClick={() => {
                        setActiveChat(result);
                        if (onContactSelect) onContactSelect();
                      }}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    >
                      <Avatar 
                        name={result.display_name} 
                        color={result.avatar_color} 
                        avatarUrl={result.avatar_url}
                        size="sm" 
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{result.display_name}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate">@{result.username}</p>
                      </div>
                    </div>

                    {result.is_contact ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--col-verified)] bg-[var(--col-verified)]/10 px-2 py-0.5 rounded-full border border-[var(--col-verified)]/20 shrink-0">
                        <Check size={11} /> Contact
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleAddFromSearch(result, e)}
                        className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-primary)] bg-[var(--surface-inner)] border border-[var(--edge-rest)] hover:border-[var(--edge-hover)] hover:bg-[var(--glass-l2-bg)] px-2.5 py-1 rounded-full transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
                      >
                        <UserPlus size={12} className="text-[var(--col-standard)]" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Existing Contacts & Active Threads Section Header */}
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-2 pt-1">
          <span>{search.trim().length >= 3 ? 'Contacts & Threads' : 'Contacts'}</span>
          <span className="text-[10px]">{filteredContacts.length}</span>
        </div>

        {/* Contact List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)] text-xs py-8 px-4 font-sans">
            {search ? 'No contacts match search filter' : 'No contacts in your list. Use the search bar above to find and add registered users.'}
          </div>
        ) : (
          filteredContacts.map(contact => {
            const isOnline = onlineUsers.has(contact.id);
            const isActive = activeChat?.id === contact.id;
            const unread = unreadCounts[contact.id] || 0;
            const lastMsg = getLastMessage(contact.id);
            const isCritical = lastMsg && (lastMsg.encryption_lane === 'critical' || lastMsg.encryption_lane === 'QKD');
            const isVerifiedContact = contact.is_contact !== false;
            
            return (
              <button
                key={contact.id}
                onClick={() => {
                  setActiveChat(contact);
                  if (onContactSelect) onContactSelect();
                }}
                className={`w-full text-left p-2.5 rounded-[16px] flex items-center gap-3 transition-all duration-150 group border ${
                  isActive 
                    ? 'bg-[var(--glass-l2-bg)] border-[var(--edge-selected-t)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_16px_var(--shadow-color)]' 
                    : 'hover:bg-[var(--surface-inner)]/60 border-transparent'
                }`}
              >
                <Avatar 
                  name={contact.display_name} 
                  color={contact.avatar_color} 
                  avatarUrl={contact.avatar_url}
                  isOnline={isOnline} 
                  size="md" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className={`font-medium text-xs sm:text-sm truncate ${isActive ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-primary)]/90'}`}>
                        {contact.display_name}
                      </h3>
                      {!isVerifiedContact && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500/90 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded shrink-0" title="Sender is not in your contacts">
                          Unverified
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-[11px] text-[var(--text-tertiary)] font-sans whitespace-nowrap ml-2">
                        {formatTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center gap-1.5">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                      {lastMsg ? truncate(lastMsg.content || 'File attachment', 28) : (isVerifiedContact ? 'No messages yet' : 'Incoming unverified thread')}
                    </p>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {lastMsg && (
                        isCritical ? (
                          <ShieldAlert size={12} className="text-[var(--col-critical)] opacity-80" title="Critical lane" />
                        ) : (
                          <ShieldCheck size={12} className="text-[var(--text-tertiary)] opacity-60" title="Standard lane" />
                        )
                      )}
                      {unread > 0 && (
                        <span className="bg-[var(--col-standard)] text-[var(--text-inverse)] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer System Status matching rest edge */}
      <div className="p-3 border-t border-[var(--edge-rest)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1.5">
          <Shield size={12} className="text-[var(--col-standard)]" />
          <span className="font-sans">FIPS 203 / 204</span>
        </span>
        <span className="text-[var(--col-verified)] text-[11px] font-medium tracking-wide">SECURE</span>
      </div>

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser || user}
        onUserUpdated={(updated) => setCurrentUser(updated)}
      />
    </div>
  );
};

export default Sidebar;
