import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../../types/diagram';

const AWSNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-lg min-w-[120px] ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col items-center gap-2">
        {data.iconUrl ? (
          <img
            src={data.iconUrl}
            alt={data.service}
            className="w-12 h-12 object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
            {data.service?.substring(0, 2).toUpperCase()}
          </div>
        )}

        <div className="text-center">
          <div className="font-semibold text-sm text-gray-800">{data.service}</div>
          <div className="text-xs text-gray-500">{data.label}</div>
        </div>

        {data.category && (
          <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
            {data.category}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default AWSNode;
