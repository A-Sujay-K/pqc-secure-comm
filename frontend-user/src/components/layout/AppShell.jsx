import React from 'react';
import Sidebar from './Sidebar';
import { useChat } from '../../hooks/useChat';
import { Menu } from 'lucide-react';

const AppShell = ({ children }) => {
  const { activeChat, setActiveChat } = useChat();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isMobileView = window.innerWidth < 768;

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden relative">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-80 md:w-80 flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onContactSelect={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden absolute top-4 left-4 z-10">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-dark-surface/80 backdrop-blur rounded-full text-white/80 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AppShell;
