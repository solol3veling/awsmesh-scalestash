import React from 'react';
import { Lock, Unlock, Trash2 } from 'lucide-react';

interface OptionsBubbleProps {
  isLocked?: boolean;
  onToggleLock?: () => void;
  onDelete: () => void;
  showLock?: boolean;
}

const OptionsBubble: React.FC<OptionsBubbleProps> = ({
  isLocked = false,
  onToggleLock,
  onDelete,
  showLock = true
}) => {
  return (
    <div
      className="flex items-center gap-2 bg-white rounded-md px-2 py-1"
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
