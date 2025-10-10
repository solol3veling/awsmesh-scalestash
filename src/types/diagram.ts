// DSL JSON Schema Types for AWS Architecture Diagrams

export type AWSServiceCategory =
  | 'Compute'
  | 'Storage'
  | 'Database'
  | 'Networking'
  | 'Security'
  | 'Analytics'
  | 'ML'
  | 'Container'
  | 'Serverless';

export interface AWSNode {
  id: string;
  type: 'aws-service';
  service: string; // e.g., 'EC2', 'S3', 'RDS'
  category: AWSServiceCategory;
  label: string;
  position: {
    x: number;
    y: number;
  };
  data?: {
    instanceType?: string;
    region?: string;
    description?: string;
    [key: string]: any;
  };
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
}

export interface DiagramDSL {
  version: string;
  metadata: {
    title: string;
    description?: string;
    author?: string;
    createdAt: string;
    updatedAt: string;
  };
  nodes: AWSNode[];
  connections: Connection[];
}

// React Flow types
export interface NodeData {
  service: string;
  category: AWSServiceCategory;
  label: string;
  iconUrl?: string;
  onLabelChange?: (nodeId: string, label: string) => void;
  [key: string]: any;
}
