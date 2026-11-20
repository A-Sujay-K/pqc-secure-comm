import React, { useState, useEffect } from 'react';
import { getInitials, getFileUrl } from '../../utils/formatters';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Avatar — Muted monogram glass disc (R1 Refined)
 * Low-chroma tint derived from name hash, neutral initials text, quiet presence dot
 */
const MUTED_TINTS_DARK = [
  'rgba(94, 170, 160, 0.16)',   // muted teal
  'rgba(160, 140, 100, 0.16)',  // muted amber
  'rgba(130, 150, 170, 0.16)',  // muted blue-grey
  'rgba(150, 120, 140, 0.16)',  // muted mauve
  'rgba(120, 150, 120, 0.16)',  // muted sage
  'rgba(150, 130, 100, 0.16)',  // muted sand
];

const MUTED_TINTS_LIGHT = [
  'rgba(13, 148, 136, 0.10)',   // muted teal
  'rgba(180, 140, 60, 0.10)',   // muted amber
  'rgba(80, 110, 150, 0.10)',   // muted blue-grey
  'rgba(130, 80, 110, 0.10)',   // muted mauve
  'rgba(80, 130, 80, 0.10)',    // muted sage
  'rgba(140, 110, 70, 0.10)',   // muted sand
];

function nameHash(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const Avatar = ({ name, isOnline = false, size = 'md', avatarUrl = null, src = null }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [imgError, setImgError] = useState(false);

  const effectiveAvatar = src || avatarUrl;

  useEffect(() => {
    setImgError(false);
  }, [effectiveAvatar]);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm'
  };

  const statusSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  const tints = isDark ? MUTED_TINTS_DARK : MUTED_TINTS_LIGHT;
  const tint = tints[nameHash(name) % tints.length];

  const fullAvatarSrc = getFileUrl(effectiveAvatar);

  return (
    <div className="relative inline-flex shrink-0">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium border select-none font-sans transition-colors overflow-hidden`}
        style={{
          backgroundColor: tint,
          borderColor: 'var(--edge-rest, rgba(255, 245, 230, 0.10))',
          color: isDark ? 'rgba(240, 232, 220, 0.75)' : 'rgba(42, 32, 24, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        {fullAvatarSrc && !imgError ? (
          <img
            src={fullAvatarSrc}
            alt={name || 'User avatar'}
            className="w-full h-full object-cover rounded-full transition-opacity duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          getInitials(name)
        )}
      </div>
      {isOnline !== null && (
        <span 
          className={`absolute bottom-0 right-0 block ${statusSize[size]} rounded-full ring-2 ring-[var(--surface-bg)] transition-colors ${
            isOnline ? 'bg-[var(--col-verified)]' : 'bg-[var(--text-tertiary)]'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
