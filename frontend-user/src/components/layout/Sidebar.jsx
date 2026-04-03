import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { Shield } from 'lucide-react';

export default function Sidebar({ users = [], selectedUser, onSelectUser }) {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="text-indigo-400" size={24} />
          <h1 className="text-lg font-bold text-slate-100">PQC Chat</h1>
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={[
              'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
              selectedUser?.id === user.id
                ? 'bg-indigo-600/20 border border-indigo-500/30'
                : 'hover:bg-slate-800',
            ].join(' ')}
          >
            <Avatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-100 truncate">{user.display_name}</p>
              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            </div>
            <Badge isOnline={user.is_online} />
          </button>
        ))}
      </div>
    </aside>
  );
}
