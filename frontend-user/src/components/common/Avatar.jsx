import React from 'react';

const SIZE_MAP = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };

export default function Avatar({ user, size = 'md' }) {
  const initials = user.display_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: user.avatar_color }}
    >
      {initials}
    </div>
  );
}
