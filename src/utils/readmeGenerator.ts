/**
 * Generate AI-friendly README content for AWS Architecture Diagrams
 */

import type { AWSService } from './serviceUtils';
import { getUniformServiceId } from './serviceUtils';

export const generateReadmeContent = (services: AWSService[]): string => {
  return `# AWS Architecture JSON Specification for AI

## AI INSTRUCTIONS
Generate AWS architecture diagrams using ONLY this specification. Follow all rules exactly.

## CRITICAL RULES
1. Service Format: ALL services use "arch::other::service-name" (NO exceptions)
2. Service List: Use ONLY services from COMPLETE SERVICE LIST below  
3. Connections: Use numeric indexes (0,1,2...) NOT strings or IDs
4. Node Order: Groups first, then child nodes
5. Unique IDs: Each node ID must be unique when used

## BASIC JSON STRUCTURE
\`\`\`json
{
  "nodes": [
    {
      "service": "arch::other::amazon-ec2",
      "position": { "x": 100, "y": 100 },
      "label": "Web Server"
    }
  ],
  "connections": [
    {
      "source": 0,
      "target": 1,
      "flow": "horizontal"
    }
  ]
}
\`\`\`

## WRONG vs CORRECT
- WRONG: "arch::database::amazon-dynamodb" → CORRECT: "arch::other::amazon-dynamodb"
- WRONG: "arch::compute::amazon-ec2" → CORRECT: "arch::other::amazon-ec2"
- WRONG: "source": "0" (string) → CORRECT: "source": 0 (number)

## GROUP CONTAINERS
- Generic: "service": "group"
- AWS Icons: private-subnet, public-subnet, region, aws-cloud, auto-scaling-group
- Format: "group": "width::height::container[::locked]"
- Parent: "group": "::::parent::parent-id"
- Note: All group services can contain other AWS services as children

## AWS HIERARCHY
AWS Cloud → Region → VPC → AZ → Subnet → Services

## CONNECTION FLOWS
horizontal, vertical, diagonal-down, diagonal-up

## EXAMPLE: Simple 3-Tier
\`\`\`json
{
  "nodes": [
    {
      "service": "group",
      "label": "VPC",
      "position": { "x": 0, "y": 0 },
      "group": "600::400::container::locked",
      "id": "vpc"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 50, "y": 50 },
      "group": "::::parent::vpc"
    },
    {
      "service": "arch::other::amazon-rds",
      "label": "Database",
      "position": { "x": 300, "y": 100 }
    }
  ],
  "connections": [
    {
      "source": 1,
      "target": 2,
      "flow": "horizontal",
      "label": "queries"
    }
  ]
}
\`\`\`

## EXAMPLE: Multi-AZ with Subnets
\`\`\`json
{
  "nodes": [
    {
      "service": "region",
      "label": "us-east-1",
      "position": { "x": 0, "y": 0 },
      "group": "800::600::container::locked",
      "id": "region"
    },
    {
      "service": "public-subnet",
      "label": "Public Subnet",
      "position": { "x": 50, "y": 50 },
      "group": "300::150::container",
      "id": "public"
    },
    {
      "service": "private-subnet",
      "label": "Private Subnet",
      "position": { "x": 400, "y": 50 },
      "group": "300::150::container",
      "id": "private"
    },
    {
      "service": "arch::other::elastic-load-balancing",
      "label": "Load Balancer",
      "position": { "x": 100, "y": 100 },
      "group": "::::parent::public"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 450, "y": 100 },
      "group": "::::parent::private"
    },
    {
      "service": "arch::other::amazon-rds",
      "label": "Database",
      "position": { "x": 450, "y": 150 },
      "group": "::::parent::private"
    }
  ],
  "connections": [
    {
      "source": 3,
      "target": 4,
      "flow": "horizontal",
      "label": "routes to"
    },
    {
      "source": 4,
      "target": 5,
      "flow": "vertical",
      "label": "queries"
    }
  ]
}
\`\`\`

## EXAMPLE: Auto Scaling Group with EC2 Instances
\`\`\`json
{
  "nodes": [
    {
      "service": "private-subnet",
      "label": "Private Subnet",
      "position": { "x": 0, "y": 0 },
      "group": "500::300::container",
      "id": "private-subnet"
    },
    {
      "service": "auto-scaling-group",
      "label": "Web Servers ASG",
      "position": { "x": 50, "y": 50 },
      "group": "400::200::container",
      "id": "asg"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server 1",
      "position": { "x": 100, "y": 100 },
      "group": "::::parent::asg"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server 2",
      "position": { "x": 200, "y": 100 },
      "group": "::::parent::asg"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server 3",
      "position": { "x": 300, "y": 100 },
      "group": "::::parent::asg"
    }
  ],
  "connections": []
}
\`\`\`

## GROUP CONTAINER SERVICES
private-subnet, public-subnet, region, aws-cloud, aws-account, auto-scaling-group, corporate-data-center, ec2-instance-contents

## COMPLETE SERVICE LIST (${services.filter(s => s.sizes[64]).length} services)

${services
      .filter(s => s.sizes[64])
      .map(service => `${getUniformServiceId(service)}`)
      .join('\n')}
`;
};

/**
 * Download README as markdown file
 */
export const downloadReadme = (content: string): void => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'AWS-Architecture-JSON-Format-README.md';
  link.click();
  URL.revokeObjectURL(url);
};