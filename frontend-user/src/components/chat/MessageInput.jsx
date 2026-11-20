import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { Paperclip, Lock } from 'lucide-react';
import FilePreview from './FilePreview';

const MessageInput = ({ highSecurityMode }) => {
  const { activeChat, sendMessage, startTyping, stopTyping } = useChat();
  const [content, setContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isLocked = activeChat && activeChat.is_contact === false;

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  const handleInput = (e) => {
    if (isLocked) return;
    setContent(e.target.value);
    
    if (activeChat) {
      startTyping(activeChat.id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeChat.id);
      }, 2000);
    }
  };

  const handleFileSelect = (e) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    // Reset file input so the same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (isLocked) return;
    if (!content.trim() && !attachedFile) return;
    if (!activeChat) return;

    if (attachedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.includes(',') 
          ? reader.result.split(',')[1] 
          : reader.result;
          
        sendMessage(activeChat.id, content.trim(), {
          data: base64Data,
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type
        }, highSecurityMode);
        
        setAttachedFile(null);
        setContent('');
        stopTyping(activeChat.id);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      };
      reader.readAsDataURL(attachedFile);
    } else {
      sendMessage(activeChat.id, content.trim(), null, highSecurityMode);
      setContent('');
      stopTyping(activeChat.id);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (isLocked) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !isLocked && (content.trim().length > 0 || attachedFile !== null);

  return (
    <div className="p-3 sm:p-4 bg-transparent shrink-0 select-none space-y-2">
      {/* File Attachment Preview Staged above composer */}
      {attachedFile && (
        <div className="px-1">
          <FilePreview 
            file={attachedFile} 
            onRemove={() => setAttachedFile(null)} 
          />
        </div>
      )}

      {/* Floating pill composer inside the conversation pane */}
      <div 
        className={`flex items-center gap-2 p-1.5 pl-3 sm:pl-4 rounded-full border bg-[var(--glass-l2-bg)] backdrop-blur-2xl shadow-[inset_0_1px_0_var(--border-highlight),0_8px_24px_var(--shadow-color)] transition-all ${
          isLocked
            ? 'border-amber-500/30 bg-[var(--surface-inner)]/40 opacity-75'
            : (highSecurityMode 
                ? 'border-[var(--col-critical)]/40 focus-within:border-[var(--col-critical)]/70 focus-within:shadow-[inset_0_1px_0_var(--border-highlight),0_0_0_2px_rgba(245,158,11,0.2)]' 
                : 'border-[var(--edge-rest)] hover:border-[var(--edge-hover)] focus-within:border-[var(--col-standard)]/50 focus-within:shadow-[inset_0_1px_0_var(--border-highlight),0_0_0_2px_rgba(94,234,212,0.15)]')
        }`}
      >
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          disabled={isLocked}
          className="hidden" 
          aria-hidden="true"
        />

        {/* Attachment Button: Liquid Glass Level 2 */}
        <button
          type="button"
          disabled={isLocked}
          onClick={() => fileInputRef.current?.click()}
          className={`w-8 h-8 rounded-full flex items-center justify-center border border-[var(--edge-rest)] bg-[var(--surface-inner)] text-[var(--text-secondary)] transition-all shrink-0 ${
            isLocked 
              ? 'opacity-40 cursor-not-allowed' 
              : 'hover:text-[var(--text-primary)] hover:border-[var(--edge-hover)] hover:bg-[var(--surface-elevated)] cursor-pointer active:scale-95'
          }`}
          title={isLocked ? "Attachment locked: Add sender to contacts" : "Attach file (Liquid Glass L2)"}
          aria-label="Attach file"
        >
          <Paperclip size={14} className="text-[var(--text-secondary)]" />
        </button>

        {/* Lock indicator icon if sender is not verified */}
        {isLocked && (
          <div className="flex items-center gap-1.5 text-amber-500/80 shrink-0" title="Composer locked">
            <Lock size={14} />
          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          placeholder={
            isLocked
              ? `Add @${activeChat?.username || 'sender'} to contacts to send a message.`
              : (highSecurityMode 
                  ? "Type high-priority message (Critical QKD lane)..." 
                  : "Type a message...")
          }
          className={`flex-1 bg-transparent border-none text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none resize-none max-h-[100px] py-1.5 placeholder-[var(--text-tertiary)] font-sans ${
            isLocked ? 'cursor-not-allowed text-[var(--text-tertiary)] italic' : ''
          }`}
          rows="1"
        />

        {/* Send Button: Pill button with the label 'Send' in active lane softened colour */}
        <button 
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm shrink-0 whitespace-nowrap transition-all active:scale-95 flex items-center justify-center ${
            canSend 
              ? 'text-white cursor-pointer hover:opacity-95' 
              : 'text-[var(--text-tertiary)] bg-[var(--surface-inner)] border border-[var(--edge-rest)] opacity-50 cursor-not-allowed'
          }`}
          style={canSend ? {
            backgroundColor: highSecurityMode ? 'var(--send-btn-critical, #d97706)' : 'var(--send-btn-standard, #2db67d)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 2px 8px var(--shadow-color)'
          } : undefined}
          aria-label="Send message"
          title={isLocked ? "Add sender to contacts to unlock send" : "Send (Enter)"}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
