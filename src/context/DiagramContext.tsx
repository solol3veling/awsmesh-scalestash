import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import type { DiagramDSL, AWSNode } from '../types/diagram';

// Helper function to convert service to uniform ID format
const getUniformServiceId = (serviceName: string, category: string): string => {
  const prefix = serviceName.match(/^(Arch|Res)\s+/i)?.[1].toLowerCase() || 'arch';
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
  const normalizedService = serviceName
    .replace(/^(Arch|Res)\s+/i, '')
    .replace(/\s+(Other)$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim();
  return `${prefix}::${normalizedCategory}::${normalizedService}`;
};

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
  duplicateNode: (nodeId: string) => void;
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

  const duplicateNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const nodeToDuplicate = nds.find((n) => n.id === nodeId);
      if (!nodeToDuplicate) return nds;

      // Deep copy the data to ensure complete independence
      const newNode: Node = {
        ...nodeToDuplicate,
        id: `node-${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 80,
          y: nodeToDuplicate.position.y + 80,
        },
        data: JSON.parse(JSON.stringify({
          ...nodeToDuplicate.data,
          locked: false, // Don't copy lock state
          // Remove callback references since they'll be re-added by DiagramCanvas
          onLabelChange: undefined,
          onToggleLock: undefined,
          onDelete: undefined,
          onDuplicate: undefined,
          isConnecting: undefined,
        })),
        selected: false,
        draggable: true,
      };

      return [...nds, newNode];
    });
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

  // Convert React Flow nodes/edges to minimal DSL JSON
  const updateDSL = useCallback(() => {
    // Create node ID to index mapping for minimal edge references
    const nodeIdToIndex = new Map<string, number>();
    nodes.forEach((node, index) => {
      nodeIdToIndex.set(node.id, index);
    });

    const dslNodes: AWSNode[] = nodes.map((node) => {
      const serviceName = node.data.service || 'unknown';
      const category = node.data.category || 'Compute';

      return {
        id: node.id,
        type: 'aws-service',
        service: getUniformServiceId(serviceName, category),
        category: category,
        label: node.data.label || '',
        position: node.position,
        data: node.data,
      };
    });

    const dslConnections = edges.map((edge) => ({
      id: edge.id,
      source: nodeIdToIndex.get(edge.source) ?? edge.source,
      target: nodeIdToIndex.get(edge.target) ?? edge.target,
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
    const flowNodes: Node[] = dslData.nodes.map((node, index) => ({
      id: node.id || `node-${Date.now()}-${index}`,
      type: 'awsNode',
      position: node.position,
      data: {
        service: node.service,
        category: node.category || 'Compute',
        label: node.label || node.service,
        ...node.data,
      },
    }));

    // Handle both index-based (0, 1, 2) and ID-based edge references
    const flowEdges: Edge[] = (dslData.connections || []).map((conn) => {
      const sourceId = typeof conn.source === 'number'
        ? flowNodes[conn.source]?.id
        : conn.source;
      const targetId = typeof conn.target === 'number'
        ? flowNodes[conn.target]?.id
        : conn.target;

      return {
        id: conn.id || `edge-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId as string,
        target: targetId as string,
        label: conn.label,
        animated: conn.animated,
        type: 'awsEdge',
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);

    // Ensure DSL has required structure even if minimal
    setDSL({
      version: dslData.version || '1.0',
      metadata: dslData.metadata || {
        title: 'Imported Diagram',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      nodes: dslData.nodes,
      connections: dslData.connections || [],
    });
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
        duplicateNode,
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
