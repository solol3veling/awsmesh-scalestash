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
    removeEdge,
    updateEdgeLabel,
  } = useDiagram();

  const [connectionNodeId, setConnectionNodeId] = React.useState<string | null>(null);

  // Add onLabelChange callback and connection state to all nodes
  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onLabelChange: updateNodeLabel,
          isConnecting: connectionNodeId !== null,
        },
      })),
    [nodes, updateNodeLabel, connectionNodeId]
  );

  const nodeTypes: NodeTypes = useMemo(() => ({ awsNode: AWSNode }), []);

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      awsEdge: AWSEdge,
    }),
    []
  );

  // Add default edge styling, arrow markers, and callbacks
  const edgesWithStyle = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: edge.type || 'awsEdge',
        style: {
          strokeWidth: 1,
          stroke: '#94a3b8',
          ...edge.style,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 8,
          height: 8,
          color: '#94a3b8',
        },
        data: {
          ...edge.data,
          onDelete: removeEdge,
          onLabelChange: updateEdgeLabel,
        },
      })),
    [edges, removeEdge, updateEdgeLabel]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edgesWithStyle}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(connection) => {
          console.log('DiagramCanvas onConnect called:', connection);
          onConnect(connection);
        }}
        onConnectStart={(_, params) => {
          console.log('Connection started:', params);
          setConnectionNodeId(params.nodeId || null);
        }}
        onConnectEnd={(event) => {
          console.log('Connection ended:', event);
          setConnectionNodeId(null);
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode="loose"
        connectOnClick={false}
        isValidConnection={(connection) => {
          console.log('Validating connection:', connection);
          return connection.source !== connection.target;
        }}
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
