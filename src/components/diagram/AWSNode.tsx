import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../../types/diagram';

const AWSNode: React.FC<NodeProps<NodeData>> = ({ data, selected, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');

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

  // Handle styles - visible on hover, positioned close to icon
  const baseHandleStyle = `!w-3 !h-3 !rounded-full !border-2 !border-white transition-all ${
    isHovered || selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
  }`;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Handles on all four sides - colored dots close to icon */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={`${baseHandleStyle} !bg-blue-500`}
        style={{ top: -4 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`${baseHandleStyle} !bg-green-500`}
        style={{ right: -4 }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={`${baseHandleStyle} !bg-orange-500`}
        style={{ bottom: 18 }}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`${baseHandleStyle} !bg-purple-500`}
        style={{ left: -4 }}
      />

      {/* Main node container */}
      <div className="flex flex-col items-center gap-1">
        {/* Icon - The main visual element */}
        <div
          className={`relative transition-all ${
            selected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''
          }`}
        >
          {data.iconUrl ? (
            <img
              src={data.iconUrl}
              alt={data.service}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              {data.service?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Editable Label Tag */}
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-xs px-2 py-1 border border-blue-500 rounded bg-white text-center min-w-[80px] max-w-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded cursor-text hover:bg-gray-200 transition-colors min-w-[80px] max-w-[120px] text-center truncate"
            title={label || data.service || 'Click to edit label'}
          >
            {label || data.service || 'Add label'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AWSNode;
