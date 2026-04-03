import React from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';

export default function AppShell({ children, selectedUser, onSelectUser, users }) {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar
        users={users}
        selectedUser={selectedUser}
        onSelectUser={onSelectUser}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedUser && <ChatHeader user={selectedUser} />}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
