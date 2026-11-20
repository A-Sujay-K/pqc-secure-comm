import React, { useState, useRef } from 'react';
import { X, Camera, Trash2, Shield, User, Mail, Check, LogOut } from 'lucide-react';
import Avatar from '../common/Avatar';
import AvatarCropModal from '../common/AvatarCropModal';
import { uploadAvatar, deleteAvatar } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProfileModal
 * In-chat user profile settings sheet allowing avatar upload,
 * square crop with circular preview, and photo removal.
 */
export default function ProfileModal({ isOpen, onClose, user, onUserUpdated }) {
  const { logout, updateUser } = useAuth();
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if cancelled
    e.target.value = '';
  };

  const handleApplyCrop = async (croppedBlob) => {
    setLoading(true);
    try {
      const res = await uploadAvatar(croppedBlob);
      if (updateUser) {
        updateUser({ avatar_url: res.avatar_url });
      }
      if (onUserUpdated) {
        onUserUpdated({ ...user, avatar_url: res.avatar_url });
      }
      setSuccessMsg('Profile photo updated');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setLoading(true);
    try {
      await deleteAvatar();
      if (updateUser) {
        updateUser({ avatar_url: null });
      }
      if (onUserUpdated) {
        onUserUpdated({ ...user, avatar_url: null });
      }
      setSuccessMsg('Profile photo removed');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error('Failed to remove avatar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
        <div className="glass-l2 w-full max-w-[420px] rounded-[24px] border border-[var(--edge-rest)] shadow-2xl overflow-hidden flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--edge-rest)]">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--col-standard)]" />
              <h2 className="text-base font-medium text-[var(--text-primary)]">User Profile</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[var(--edge-rest)] hover:bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mt-4 px-3.5 py-2 rounded-[12px] bg-[var(--col-verified)]/10 border border-[var(--col-verified)]/30 text-[var(--col-verified)] text-xs flex items-center gap-2 animate-fade-in">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center my-6 gap-3">
            <div className="relative group">
              <Avatar
                name={user.display_name || user.username}
                avatarUrl={user.avatar_url}
                size="lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                title="Change Photo"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-3 py-1.5 rounded-[10px] btn-glass border border-[var(--edge-rest)] text-xs text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={13} className="text-[var(--text-secondary)]" />
                <span>Upload Photo</span>
              </button>

              {user.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-[10px] border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* User Details */}
          <div className="flex flex-col gap-3 border-t border-[var(--edge-rest)] pt-4 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--surface-inner)]/50 border border-[var(--edge-rest)]">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <User size={13} /> Call-Sign
              </span>
              <span className="text-[var(--text-primary)] font-medium">@{user.username}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--surface-inner)]/50 border border-[var(--edge-rest)]">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Shield size={13} /> Display Name
              </span>
              <span className="text-[var(--text-primary)]">{user.display_name}</span>
            </div>

            {user.email && (
              <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[var(--surface-inner)]/50 border border-[var(--edge-rest)]">
                <span className="text-[var(--text-secondary)] flex items-center gap-2">
                  <Mail size={13} /> Secure Identity
                </span>
                <span className="text-[var(--text-primary)] truncate max-w-[200px]">{user.email}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="px-3.5 py-2 rounded-[12px] text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-[12px] btn-primary text-xs font-medium cursor-pointer active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      <AvatarCropModal
        isOpen={isCropOpen}
        imageSrc={selectedImageSrc}
        onClose={() => setIsCropOpen(false)}
        onApplyCrop={handleApplyCrop}
      />
    </>
  );
}
