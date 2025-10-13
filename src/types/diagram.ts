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
  id?: string; // Optional for minimal JSON - will be auto-generated
  type?: 'aws-service'; // Optional for minimal JSON
  service: string; // e.g., 'arch::compute::amazon-ec2'
  category?: AWSServiceCategory; // Optional - can be derived from service
  label?: string; // Optional - will default to service name
  position: {
    x: number;
    y: number;
  };
  data?: {
    instanceType?: string;
    region?: string;
    description?: string;
    iconUrl?: string;
    [key: string]: any;
  };
}

export type ConnectionDirection = 'top' | 'right' | 'bottom' | 'left';

export interface Connection {
  id?: string; // Optional for minimal JSON
  source: string | number; // Support both node IDs and array indices
  target: string | number; // Support both node IDs and array indices
  flow?: string; // Simple format: "right::left" (sourceDirection::targetDirection) - AI-friendly
  sourceDirection?: ConnectionDirection; // Optional: which side to connect from (e.g., "right", "bottom")
  targetDirection?: ConnectionDirection; // Optional: which side to connect to (e.g., "left", "top")
  sourceHandle?: string; // Optional: specific handle ID (e.g., "right-2", "bottom-1") - overrides sourceDirection
  targetHandle?: string; // Optional: specific handle ID (e.g., "left-2", "top-1") - overrides targetDirection
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
}

export interface DiagramDSL {
  version?: string; // Optional for minimal JSON
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  nodes: AWSNode[];
  connections?: Connection[]; // Optional - edges can be empty
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
