import React, { useState } from 'react';
import { Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../../types/diagram';
import AWSConnector from './AWSConnector';

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

  const showConnectors = isHovered || selected;

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon container - THIS is the connection box */}
      <div
        className={`relative w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center transition-all ${
          selected ? 'ring-1 ring-blue-400 ring-offset-1' : ''
        }`}
      >
        {/* AWS Connectors - multiple points on each edge for multiple connections */}
        {/* Top edge - 3 connection points */}
        <AWSConnector position={Position.Top} type="target" id="top-1" isVisible={showConnectors} />
        <AWSConnector position={Position.Top} type="target" id="top-2" isVisible={showConnectors} />
        <AWSConnector position={Position.Top} type="target" id="top-3" isVisible={showConnectors} />

        {/* Right edge - 3 connection points */}
        <AWSConnector position={Position.Right} type="source" id="right-1" isVisible={showConnectors} />
        <AWSConnector position={Position.Right} type="source" id="right-2" isVisible={showConnectors} />
        <AWSConnector position={Position.Right} type="source" id="right-3" isVisible={showConnectors} />

        {/* Bottom edge - 3 connection points */}
        <AWSConnector position={Position.Bottom} type="source" id="bottom-1" isVisible={showConnectors} />
        <AWSConnector position={Position.Bottom} type="source" id="bottom-2" isVisible={showConnectors} />
        <AWSConnector position={Position.Bottom} type="source" id="bottom-3" isVisible={showConnectors} />

        {/* Left edge - 3 connection points */}
        <AWSConnector position={Position.Left} type="target" id="left-1" isVisible={showConnectors} />
        <AWSConnector position={Position.Left} type="target" id="left-2" isVisible={showConnectors} />
        <AWSConnector position={Position.Left} type="target" id="left-3" isVisible={showConnectors} />

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
          className="text-[8px] px-1 py-0.5 border border-blue-500 rounded bg-white text-center min-w-[50px] max-w-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="text-[8px] px-1 py-0.5 bg-transparent text-gray-500 rounded cursor-text hover:text-gray-900 transition-colors min-w-[50px] max-w-[80px] text-center truncate mt-1"
          title={label || data.service || 'Click to edit label'}
        >
          {label || data.service || 'Add label'}
        </div>
      )}
    </div>
  );
};

export default AWSNode;
