import React, { useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import type { NodeTypes, EdgeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagram } from '../../context/DiagramContext';
import { useTheme } from '../../context/ThemeContext';
import AWSNode from './AWSNode';
import AWSEdge from './AWSEdge';
import GroupNode from './GroupNode';

const DiagramCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeLabel,
    updateNodeColor,
    toggleNodeLock,
    bindChildrenToGroup,
    unbindChildrenFromGroup,
    removeNode,
    duplicateNode,
    removeEdge,
    updateEdgeLabel,
    addNode,
  } = useDiagram();
  const { theme } = useTheme();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [connectionNodeId, setConnectionNodeId] = React.useState<string | null>(null);

  // Add onLabelChange callback and connection state to all nodes
  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        draggable: !node.data.locked, // Make locked nodes non-draggable
        data: {
          ...node.data,
          onLabelChange: updateNodeLabel,
          onColorChange: updateNodeColor,
          onToggleLock: toggleNodeLock,
          onDelete: removeNode,
          onDuplicate: duplicateNode,
          onBindChildren: bindChildrenToGroup,
          onUnbindChildren: unbindChildrenFromGroup,
          isConnecting: connectionNodeId !== null,
        },
      })),
    [nodes, updateNodeLabel, updateNodeColor, toggleNodeLock, removeNode, duplicateNode, bindChildrenToGroup, unbindChildrenFromGroup, connectionNodeId]
  );

  const nodeTypes: NodeTypes = useMemo(() => ({
    awsNode: AWSNode,
    groupNode: GroupNode,
  }), []);

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
        labelStyle: {
          cursor: 'move',
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.9,
        },
        interactionWidth: 20,
        data: {
          ...edge.data,
          onDelete: removeEdge,
          onLabelChange: updateEdgeLabel,
        },
      })),
    [edges, removeEdge, updateEdgeLabel]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const serviceData = JSON.parse(data);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check if it's a group node
      if (serviceData.type === 'group') {
        const newNode = {
          id: `group-${Date.now()}`,
          type: 'groupNode',
          position,
          style: {
            width: 300,
            height: 200,
            zIndex: -1,
          },
          draggable: true,
          selectable: true,
          data: {
            label: serviceData.label || 'Group',
            service: 'group',
            category: 'Container',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: '#3b82f6',
          },
        };
        addNode(newNode);
      } else {
        // Regular AWS service node
        const newNode = {
          id: `node-${Date.now()}`,
          type: 'awsNode',
          position,
          data: {
            service: serviceData.service,
            category: serviceData.category,
            label: serviceData.service,
            iconUrl: serviceData.iconPath,
          },
        };
        addNode(newNode);
      }
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode="loose"
        connectOnClick={false}
        isValidConnection={(connection) => {
          console.log('Validating connection:', connection);
          return connection.source !== connection.target;
        }}
        fitView
        className={theme === 'dark' ? 'bg-[#1a252f]' : 'bg-gray-50'}
        minZoom={0.3}
        maxZoom={5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        translateExtent={[[-2000, -2000], [4000, 4000]]}
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
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color={theme === 'dark' ? '#374151' : '#d1d5db'}
        />
        <Controls />
      </ReactFlow>

      {/* Snap to View button */}
      <button
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        className={`absolute bottom-6 right-6 p-4 rounded-full shadow-lg hover:shadow-xl transition-all border z-10 ${
          theme === 'dark'
            ? 'bg-[#232f3e] hover:bg-[#2d3f52] text-gray-300 border-gray-700'
            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
        }`}
        title="Fit View"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
          <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </div>
  );
};

export default DiagramCanvas;
