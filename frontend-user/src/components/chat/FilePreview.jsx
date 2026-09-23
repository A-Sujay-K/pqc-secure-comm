import React from 'react';
import { X, File, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

const FilePreview = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="glass-card p-2 flex items-center gap-3 animate-slide-in shadow-xl max-w-sm border-white/20">
      <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0">
        {isImage ? (
          <ImageIcon size={20} className="text-accent-blue" />
        ) : (
          <File size={20} className="text-accent-purple" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>
        <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
      </div>

      <button 
        onClick={onRemove}
        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default FilePreview;
