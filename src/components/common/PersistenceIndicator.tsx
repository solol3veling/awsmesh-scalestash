import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useDiagram } from '../../context/DiagramContext';

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
  const { undo, redo, canUndo, canRedo } = useDiagram();
  const [showDetails, setShowDetails] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

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
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-30 rounded-full shadow-lg border transition-all duration-500 ease-out ${
        theme === 'dark'
          ? 'bg-[#232f3e] border-gray-700'
          : 'bg-white border-gray-200'
      } ${isHovered ? 'px-4 py-2' : 'p-2.5'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered ? (
        /* Collapsed state - just the info icon */
        <div className="flex items-center justify-center">
          <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ) : (
        /* Expanded state - all controls */
        <div className="flex items-center gap-2">
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

        {/* Undo button */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1 rounded transition-colors ${
            canUndo
              ? theme === 'dark'
                ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
                : 'hover:bg-gray-100 text-gray-600'
              : 'text-gray-600 opacity-30 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Redo button */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1 rounded transition-colors ${
            canRedo
              ? theme === 'dark'
                ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
                : 'hover:bg-gray-100 text-gray-600'
              : 'text-gray-600 opacity-30 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

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
      )}

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
