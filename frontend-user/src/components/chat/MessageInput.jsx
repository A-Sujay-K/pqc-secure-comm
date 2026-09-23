import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import FilePreview from './FilePreview';

const MessageInput = ({ highSecurityMode }) => {
  const { activeChat, sendMessage, startTyping, stopTyping } = useChat();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  const handleInput = (e) => {
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

  const handleSend = () => {
    if (!content.trim() && !file) return;
    if (!activeChat) return;

    // In a real app, file would be uploaded first or sent as base64
    // Here we assume sendMessage handles it
    sendMessage(activeChat.id, content.trim(), file, highSecurityMode);
    
    setContent('');
    setFile(null);
    stopTyping(activeChat.id);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    // Enforce 25MB file size limit
    const MAX_SIZE = 25 * 1024 * 1024;
    if (selected.size > MAX_SIZE) {
      alert('File size exceeds 25MB limit.');
      e.target.value = null;
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is 'data:mime/type;base64,XXXX' — we only need the base64 part
      const base64 = reader.result.split(',')[1];
      setFile({
        name: selected.name,
        size: selected.size,
        type: selected.type,
        data: base64,
      });
    };
    reader.readAsDataURL(selected);
    e.target.value = null;
  };

  return (
    <div className="p-4 bg-dark-surface/50 backdrop-blur-md border-t border-white/5">
      <div className={`relative rounded-2xl transition-all duration-300 ${highSecurityMode ? 'shadow-[0_0_15px_rgba(255,215,0,0.15)] border border-accent-gold/30' : 'border border-white/10'}`}>
        
        {file && (
          <div className="absolute bottom-full left-0 mb-2 w-full px-2">
            <FilePreview file={file} onRemove={() => setFile(null)} />
          </div>
        )}

        <div className="flex items-end gap-2 p-2 bg-white/5 rounded-2xl">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={highSecurityMode ? "Type highly secure message..." : "Type a message..."}
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none resize-none max-h-[120px] py-2.5 placeholder-white/30 custom-scrollbar"
            rows="1"
          />

          <button 
            onClick={handleSend}
            disabled={!content.trim() && !file}
            className={`p-2.5 rounded-xl flex-shrink-0 transition-all transform active:scale-95 ${
              content.trim() || file 
                ? highSecurityMode 
                  ? 'bg-gradient-to-br from-accent-gold to-orange-500 text-dark-bg hover:opacity-90 shadow-lg' 
                  : 'bg-gradient-to-br from-accent-blue to-accent-purple text-white hover:opacity-90 shadow-lg'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send size={18} className={(content.trim() || file) ? 'translate-x-0.5' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
