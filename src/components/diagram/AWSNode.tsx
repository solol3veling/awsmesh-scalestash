import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../../types/diagram';
import OptionsBubble from './OptionsBubble';

const AWSNode: React.FC<NodeProps<NodeData>> = ({ data, selected, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

  const handleLabelSubmit = () => {
    setIsEditing(false);
    // Update the node data through React Flow
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setLabel(data.label || '');
      setIsEditing(false);
    }
  };

  const showConnectors = isHovered || selected || data.isConnecting;

  // Helper to get position style for handles
  const getPositionStyle = (position: Position, pointNumber: number) => {
    const positions = [33, 50, 67];
    const percent = positions[pointNumber - 1] || 50;

    switch (position) {
      case Position.Top:
        return { top: '-5px', left: `${percent}%`, transform: 'translateX(-50%)' };
      case Position.Right:
        return { right: '-5px', top: `${percent}%`, transform: 'translateY(-50%)' };
      case Position.Bottom:
        return { bottom: '-5px', left: `${percent}%`, transform: 'translateX(-50%)' };
      case Position.Left:
        return { left: '-5px', top: `${percent}%`, transform: 'translateY(-50%)' };
      default:
        return {};
    }
  };

  // Render a connection point - single handle acts as both source and target with loose connection mode
  const renderHandle = (position: Position, pointNumber: number, baseId: string) => {
    const handleId = `${baseId}-${pointNumber}`;
    const isHandleHovered = hoveredHandle === handleId;
    const isNodeLocked = data.locked || false;

    const baseStyle = getPositionStyle(position, pointNumber);

    const handleStyle = {
      ...baseStyle,
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      border: '1px solid white',
      borderRadius: '50%',
      background: isHandleHovered ? '#3b82f6' : '#60a5fa',
      opacity: showConnectors ? 1 : 0,
      transition: 'all 150ms',
      cursor: isNodeLocked ? 'not-allowed' : 'crosshair',
      zIndex: 10,
    };

    return (
      <React.Fragment key={handleId}>
        {/* Single source handle - connectionMode="loose" allows it to connect anywhere */}
        <Handle
          type="source"
          position={position}
          id={handleId}
          onMouseEnter={() => setHoveredHandle(handleId)}
          onMouseLeave={() => setHoveredHandle(null)}
          style={handleStyle}
          isConnectable={showConnectors && !isNodeLocked}
        />

        {/* Blue overlay on hover */}
        {showConnectors && isHandleHovered && (
          <div
            style={{
              ...baseStyle,
              position: 'absolute',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#3b82f6',
              opacity: 0.3,
              zIndex: 9,
              pointerEvents: 'none',
            }}
          />
        )}
      </React.Fragment>
    );
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleToggleLock = () => {
    if (data.onToggleLock) {
      data.onToggleLock(id);
    }
  };

  const handleDuplicate = () => {
    if (data.onDuplicate) {
      data.onDuplicate(id);
    }
  };

  const isLocked = data.locked || false;

  return (
    <div
      className="flex flex-col items-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Control toolbar */}
      {(isHovered || selected) && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+8px)] z-30">
          <OptionsBubble
            isLocked={isLocked}
            onToggleLock={handleToggleLock}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            showLock={true}
            showDuplicate={true}
          />
        </div>
      )}

      {/* Icon container - THIS is the connection box */}
      <div
        className={`relative w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center transition-all ${
          selected ? 'ring-1 ring-blue-400 ring-offset-1' : ''
        } ${isLocked ? 'ring-1 ring-yellow-400' : ''}`}
      >
        {/* Top edge - 3 connection points */}
        {renderHandle(Position.Top, 1, 'top')}
        {renderHandle(Position.Top, 2, 'top')}
        {renderHandle(Position.Top, 3, 'top')}

        {/* Right edge - 3 connection points */}
        {renderHandle(Position.Right, 1, 'right')}
        {renderHandle(Position.Right, 2, 'right')}
        {renderHandle(Position.Right, 3, 'right')}

        {/* Bottom edge - 3 connection points */}
        {renderHandle(Position.Bottom, 1, 'bottom')}
        {renderHandle(Position.Bottom, 2, 'bottom')}
        {renderHandle(Position.Bottom, 3, 'bottom')}

        {/* Left edge - 3 connection points */}
        {renderHandle(Position.Left, 1, 'left')}
        {renderHandle(Position.Left, 2, 'left')}
        {renderHandle(Position.Left, 3, 'left')}

        {/* Icon - scales to fit the box */}
        {data.iconUrl ? (
          <img
            src={data.iconUrl}
            alt={data.service}
            className="w-14 h-14 object-contain p-1"
          />
        ) : (
          <div className="w-14 h-14 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-base">
            {data.service?.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Editable Label Tag - smaller and below icon */}
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="text-[10px] px-1 py-0.5 border border-blue-400 rounded bg-white text-center min-w-[40px] max-w-[80px] focus:outline-none focus:border-blue-500 mt-1"
          style={{ borderWidth: '0.5px', fontSize: '10px' }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="text-[10px] px-1 py-0.5 bg-transparent text-gray-500 rounded cursor-text hover:text-gray-700 transition-colors min-w-[40px] max-w-[80px] text-center truncate mt-1"
          style={{ fontSize: '10px' }}
          title={label || data.service || 'Click to edit label'}
        >
          {label || data.service || 'Add label'}
        </div>
      )}
    </div>
  );
};

export default AWSNode;
