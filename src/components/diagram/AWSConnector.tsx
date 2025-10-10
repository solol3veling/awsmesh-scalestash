import React from 'react';
import { Handle, Position } from 'reactflow';

interface AWSConnectorProps {
  position: Position;
  type: 'source' | 'target';
  id: string;
  isVisible: boolean;
}

const AWSConnector: React.FC<AWSConnectorProps> = ({ position, type, id, isVisible }) => {
  // Position connectors at different points along each edge
  // Extract the point number from id (e.g., "top-1" -> 1, "top-2" -> 2)
  const pointNumber = parseInt(id.split('-').pop() || '1');

  const getPositionStyle = () => {
    // Calculate position based on point number (1, 2, 3)
    // Divide edge into quarters: 25%, 50%, 75%
    const positions = [25, 50, 75];
    const percent = positions[pointNumber - 1] || 50;
    const gap = -4; // Negative to position OUTSIDE the box with breathing space

    switch (position) {
      case Position.Top:
        return { top: gap, left: `${percent}%` };
      case Position.Right:
        return { right: gap, top: `${percent}%` };
      case Position.Bottom:
        return { bottom: gap, left: `${percent}%` };
      case Position.Left:
        return { left: gap, top: `${percent}%` };
      default:
        return {};
    }
  };

  return (
    <>
      {/* Invisible React Flow Handle for functionality */}
      <Handle
        type={type}
        position={position}
        id={id}
        className="!w-3 !h-3 !opacity-0 !bg-transparent !border-0"
        style={getPositionStyle()}
      />

      {/* Custom visible dot - always visible for now to test */}
      <div
        className="absolute pointer-events-none"
        style={{
          ...getPositionStyle(),
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 150ms',
        }}
      >
        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-md border border-white" />
      </div>
    </>
  );
};

export default AWSConnector;
