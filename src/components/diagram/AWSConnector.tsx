import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface AWSConnectorProps {
  position: Position;
  type: 'source' | 'target';
  id: string;
  isVisible: boolean;
}

const AWSConnector: React.FC<AWSConnectorProps> = ({ position, id, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Position connectors at different points along each edge
  // Extract the point number from id (e.g., "top-1" -> 1, "top-2" -> 2)
  const pointNumber = parseInt(id.split('-').pop() || '1');

  const getPositionStyle = () => {
    // Evenly distribute: 33%, 50%, 67% for uniform spacing
    const positions = [33, 50, 67];
    const percent = positions[pointNumber - 1] || 50;
    const gap = -5; // Just outside the box edge

    switch (position) {
      case Position.Top:
        return { top: gap, left: `${percent}%`, transform: 'translateX(-50%)' };
      case Position.Right:
        return { right: gap, top: `${percent}%`, transform: 'translateY(-50%)' };
      case Position.Bottom:
        return { bottom: gap, left: `${percent}%`, transform: 'translateX(-50%)' };
      case Position.Left:
        return { left: gap, top: `${percent}%`, transform: 'translateY(-50%)' };
      default:
        return {};
    }
  };

  return (
    <>
      {/* Source and Target handles - both functional */}
      <Handle
        type="source"
        position={position}
        id={`${id}-src`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="react-flow__handle"
        style={{
          ...getPositionStyle(),
          width: 8,
          height: 8,
          border: '1px solid white',
          background: isHovered ? '#3b82f6' : '#60a5fa',
          opacity: isVisible ? 1 : 0,
          transition: 'all 150ms',
          cursor: 'crosshair',
          zIndex: 10,
        }}
      />

      <Handle
        type="target"
        position={position}
        id={`${id}-tgt`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="react-flow__handle"
        style={{
          ...getPositionStyle(),
          width: 8,
          height: 8,
          border: '1px solid white',
          background: isHovered ? '#3b82f6' : '#60a5fa',
          opacity: isVisible ? 1 : 0,
          transition: 'all 150ms',
          cursor: 'crosshair',
          zIndex: 10,
        }}
      />

      {/* Blue overlay on hover */}
      {isVisible && isHovered && (
        <div
          className="absolute rounded-full bg-blue-500 pointer-events-none"
          style={{
            ...getPositionStyle(),
            width: 12,
            height: 12,
            zIndex: 9,
          }}
        />
      )}
    </>
  );
};

export default AWSConnector;
