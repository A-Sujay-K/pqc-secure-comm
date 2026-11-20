import React from 'react';
import Sidebar from './Sidebar';
import GlassLayer from '../primitives/GlassLayer';
import { useChat } from '../../hooks/useChat';

/**
 * AppShell — Master-Detail VisionOS / Apple Liquid Glass Layout
 * - On Mobile (< md): Displays Sidebar (Contacts, Profile, Search) when activeChat is null.
 *   Smoothly swaps to full-screen Conversation Pane when activeChat is selected.
 * - On Desktop (>= md): Displays elegant side-by-side split view.
 */
const AppShell = ({ children }) => {
  const { activeChat } = useChat();

  return (
    <div className="h-[100dvh] w-screen p-0 sm:p-3 md:p-6 overflow-hidden flex items-center justify-center relative select-none">
      {/* visionOS style single floating L1 glass window */}
      <GlassLayer 
        level="l1" 
        className="w-full h-full max-w-[1600px] flex overflow-hidden rounded-none sm:rounded-[24px] md:rounded-[28px] border-0 sm:border border-[var(--edge-rest)] shadow-none sm:shadow-[0_24px_64px_var(--shadow-color)] relative"
      >
        {/* Contacts Pane (Sidebar) — On mobile: visible full-width when no chat is active; on desktop: always visible fixed width */}
        <div 
          className={`
            ${activeChat ? 'hidden md:flex' : 'flex'}
            w-full md:w-80 lg:w-96 flex-shrink-0 h-full flex-col
            border-r-0 md:border-r border-[var(--edge-rest)] bg-[var(--glass-l2-bg)] backdrop-blur-xl
          `}
        >
          <Sidebar />
        </div>

        {/* Conversation Pane — On mobile: visible full-width when chat is active; on desktop: flex-1 */}
        <div 
          className={`
            ${activeChat ? 'flex' : 'hidden md:flex'}
            flex-1 flex-col min-w-0 h-full relative overflow-hidden bg-transparent
          `}
        >
          {children}
        </div>
      </GlassLayer>
    </div>
  );
};

export default AppShell;
