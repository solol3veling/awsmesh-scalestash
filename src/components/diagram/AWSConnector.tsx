import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface AWSConnectorProps {
  position: Position;
  type: 'source' | 'target';
  id: string;
  isVisible: boolean;
}

const AWSConnector: React.FC<AWSConnectorProps> = ({ position, type, id, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

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
    <div
      className="absolute"
      style={{
        ...getPositionStyle(),
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* React Flow Handle */}
      <Handle
        type={type}
        position={position}
        id={id}
        className="!w-5 !h-5 !opacity-0 !bg-transparent !border-0 !cursor-crosshair relative"
        style={{ position: 'static', transform: 'none' }}
      />

      {/* Custom visible dot with hover effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 150ms',
        }}
      >
        {/* Outer blue circle on hover */}
        {isHovered && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500/20" />
        )}

        {/* Main dot - larger and more visible */}
        <div
          className={`w-2.5 h-2.5 rounded-full shadow-md border border-white transition-all duration-150 ${
            isHovered ? 'bg-blue-600 scale-125' : 'bg-blue-500'
          }`}
        />
      </div>
    </div>
  );
};

export default AWSConnector;
