import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface PersistenceIndicatorProps {
  hasPersistedState: boolean;
  lastSaved: Date | null;
  nodeCount?: number;
  edgeCount?: number;
  onClearState: () => void;
  onRestoreState: () => void;
}

const PersistenceIndicator: React.FC<PersistenceIndicatorProps> = ({
  hasPersistedState,
  lastSaved,
  nodeCount = 0,
  edgeCount = 0,
  onClearState,
  onRestoreState,
}) => {
  const { theme } = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);

  if (!hasPersistedState) return null;

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-30 rounded-full shadow-lg border transition-all ${
        theme === 'dark'
          ? 'bg-[#232f3e] border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </div>
          <span className={`text-xs font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Auto-saved {lastSaved ? formatTimeAgo(lastSaved) : 'recently'}
          </span>
        </div>

        {/* Divider */}
        <div className={`w-px h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />

        {/* Info button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Show details"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Restore button */}
        <button
          onClick={onRestoreState}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Restore last saved state"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Clear button */}
        <button
          onClick={onClearState}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
              : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
          }`}
          title="Clear saved state"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 min-w-[200px] rounded-lg shadow-lg border p-3 ${
          theme === 'dark'
            ? 'bg-[#232f3e] border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Nodes:</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {nodeCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Connections:</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {edgeCount}
              </span>
            </div>
            {lastSaved && (
              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Last saved:</span>
                  <div className={`font-medium mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {lastSaved.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersistenceIndicator;
