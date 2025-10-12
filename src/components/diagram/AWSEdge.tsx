import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';

const AWSEdge: React.FC<EdgeProps> = ({
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
}) => {
  console.log('AWSEdge rendering:', { id, sourceX, sourceY, targetX, targetY });

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 1.5 : 1,
          stroke: selected ? '#3b82f6' : '#94a3b8', // Blue when selected, gray otherwise
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white px-1.5 py-0.5 rounded text-gray-600 border border-gray-200"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default AWSEdge;
