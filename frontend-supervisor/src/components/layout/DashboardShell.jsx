import React from 'react';
import NavBar from './NavBar';

const DashboardShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-900 grid-bg text-slate-300 font-sans flex flex-col h-screen overflow-hidden">
      <NavBar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10">
        <div className="max-w-[1920px] mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
