import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import type { DiagramDSL, AWSNode } from '../types/diagram';

interface DiagramContextType {
  nodes: Node[];
  edges: Edge[];
  dsl: DiagramDSL;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  toggleNodeLock: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateDSL: () => void;
  loadFromDSL: (dsl: DiagramDSL) => void;
  exportDSL: () => DiagramDSL;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const useDiagram = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within DiagramProvider');
  }
  return context;
};

interface DiagramProviderProps {
  children: ReactNode;
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dsl, setDSL] = useState<DiagramDSL>({
    version: '1.0',
    metadata: {
      title: 'Untitled Diagram',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    nodes: [],
    connections: [],
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Prevent changes to locked nodes
      const filteredChanges = changes.filter((change) => {
        if (change.type === 'position' || change.type === 'remove') {
          const node = nodes.find((n) => n.id === change.id);
          if (node?.data?.locked) {
            return false; // Block changes to locked nodes
          }
        }
        return true;
      });
      setNodes((nds) => applyNodeChanges(filteredChanges, nds));
    },
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('Connection made:', connection);
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'awsEdge',
        style: { strokeWidth: 1, stroke: '#94a3b8' },
        animated: false,
      };
      console.log('Adding edge:', newEdge);
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        console.log('Updated edges:', updatedEdges);
        return updatedEdges;
      });
    },
    []
  );

  const addNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node]);
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, []);

  const updateNodeLabel = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label } }
          : node
      )
    );
  }, []);

  const toggleNodeLock = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, locked: !node.data.locked }, draggable: node.data.locked }
          : node
      )
    );
  }, []);

  const removeEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, []);

  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, label }
          : edge
      )
    );
  }, []);

  // Convert React Flow nodes/edges to DSL JSON
  const updateDSL = useCallback(() => {
    const dslNodes: AWSNode[] = nodes.map((node) => ({
      id: node.id,
      type: 'aws-service',
      service: node.data.service || 'unknown',
      category: node.data.category || 'Compute',
      label: node.data.label || '',
      position: node.position,
      data: node.data,
    }));

    const dslConnections = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label as string,
      animated: edge.animated,
    }));

    setDSL((prev) => ({
      ...prev,
      nodes: dslNodes,
      connections: dslConnections,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, [nodes, edges]);

  // Load diagram from DSL JSON
  const loadFromDSL = useCallback((dslData: DiagramDSL) => {
    const flowNodes: Node[] = dslData.nodes.map((node) => ({
      id: node.id,
      type: 'awsNode',
      position: node.position,
      data: {
        service: node.service,
        category: node.category,
        label: node.label,
        ...node.data,
      },
    }));

    const flowEdges: Edge[] = dslData.connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      label: conn.label,
      animated: conn.animated,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setDSL(dslData);
  }, []);

  const exportDSL = useCallback(() => {
    updateDSL();
    return dsl;
  }, [dsl, updateDSL]);

  return (
    <DiagramContext.Provider
      value={{
        nodes,
        edges,
        dsl,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        removeNode,
        updateNodeLabel,
        toggleNodeLock,
        removeEdge,
        updateEdgeLabel,
        updateDSL,
        loadFromDSL,
        exportDSL,
      }}
    >
      {children}
    </DiagramContext.Provider>
  );
};
