import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import OptionsBubble from './OptionsBubble';

interface AWSEdgeProps extends EdgeProps {
  data?: {
    onDelete?: (edgeId: string) => void;
    onLabelChange?: (edgeId: string, label: string) => void;
  };
}

const AWSEdge: React.FC<AWSEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState((label as string) || '');
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleDelete = () => {
    if (data?.onDelete) {
      data.onDelete(id);
    }
    setContextMenu(null);
  };

  const handleAddLabel = () => {
    setIsEditingLabel(true);
    setContextMenu(null);
  };

  const handleLabelSubmit = () => {
    if (data?.onLabelChange) {
      data.onLabelChange(id, labelText);
    }
    setIsEditingLabel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setLabelText((label as string) || '');
      setIsEditingLabel(false);
    }
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 1.5 : 1,
          stroke: selected ? '#3b82f6' : '#94a3b8',
        }}
        onContextMenu={handleContextMenu}
      />

      {/* Invisible wider path for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ pointerEvents: 'stroke' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
      />

      <EdgeLabelRenderer>
        {/* Options bubble on hover/select */}
        {(isHovered || selected) && !isEditingLabel && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 20}px)`,
              pointerEvents: 'all',
            }}
          >
            <OptionsBubble
              onDelete={handleDelete}
              showLock={false}
            />
          </div>
        )}

        {/* Label or input */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={handleAddLabel}
          onContextMenu={handleContextMenu}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditingLabel ? (
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleLabelSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-[10px] px-1.5 py-0.5 border border-blue-500 rounded bg-white text-center min-w-[60px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <div
              className={`text-[10px] px-1.5 py-0.5 rounded text-gray-600 border cursor-pointer transition-colors ${
                label
                  ? 'bg-white border-gray-200 hover:border-blue-400'
                  : 'bg-transparent border-transparent hover:bg-gray-100 hover:border-gray-200'
              }`}
            >
              {label || (selected ? 'Double-click to add label' : '')}
            </div>
          )}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000,
            }}
            className="bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-[120px]"
          >
            <button
              onClick={handleAddLabel}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <span>✏️</span> Add Label
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <span>🗑️</span> Delete
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default AWSEdge;
