import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import type { NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagram } from '../../context/DiagramContext';
import AWSNode from './AWSNode';

const DiagramCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useDiagram();

  const nodeTypes: NodeTypes = useMemo(() => ({ awsNode: AWSNode }), []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data.category) {
              case 'Compute':
                return '#ff6b6b';
              case 'Storage':
                return '#4ecdc4';
              case 'Database':
                return '#45b7d1';
              case 'Networking':
                return '#96ceb4';
              default:
                return '#95a5a6';
            }
          }}
          className="bg-white border border-gray-300"
        />
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;
