import React from 'react';
import { Lock, Unlock, Trash2, Copy } from 'lucide-react';

interface OptionsBubbleProps {
  isLocked?: boolean;
  onToggleLock?: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  showLock?: boolean;
  showDuplicate?: boolean;
}

const OptionsBubble: React.FC<OptionsBubbleProps> = ({
  isLocked = false,
  onToggleLock,
  onDelete,
  onDuplicate,
  showLock = true,
  showDuplicate = false
}) => {
  return (
    <div
      className="flex items-center gap-3 bg-white rounded-md px-3 py-1.5"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {showLock && onToggleLock && (
        <button
          onClick={onToggleLock}
          className="transition-opacity hover:opacity-60"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {isLocked ? (
            <Lock size={11} className="text-amber-500" strokeWidth={2} />
          ) : (
            <Unlock size={11} className="text-gray-600" strokeWidth={2} />
          )}
        </button>
      )}

      {showDuplicate && onDuplicate && (
        <button
          onClick={onDuplicate}
          className="transition-opacity hover:opacity-60"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <Copy size={11} className="text-blue-500" strokeWidth={2} />
        </button>
      )}

      <button
        onClick={onDelete}
        className="transition-opacity hover:opacity-60"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <Trash2 size={11} className="text-red-500" strokeWidth={2} />
      </button>
    </div>
  );
};

export default OptionsBubble;
