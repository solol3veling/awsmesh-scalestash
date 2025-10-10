import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import type { NodeTypes, EdgeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagram } from '../../context/DiagramContext';
import AWSNode from './AWSNode';
import AWSEdge from './AWSEdge';

const DiagramCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeLabel,
  } = useDiagram();

  // Add onLabelChange callback to all nodes
  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onLabelChange: updateNodeLabel,
        },
      })),
    [nodes, updateNodeLabel]
  );

  const nodeTypes: NodeTypes = useMemo(() => ({ awsNode: AWSNode }), []);

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      awsEdge: AWSEdge,
    }),
    []
  );

  // Add default edge styling and arrow markers
  const edgesWithStyle = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'awsEdge',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 8,
          height: 8,
          color: '#94a3b8',
        },
      })),
    [edges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edgesWithStyle}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        defaultEdgeOptions={{
          type: 'awsEdge',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 8,
            height: 8,
            color: '#94a3b8',
          },
        }}
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
