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

## CONNECTION FLOWS & HANDLES

### Node Handle System
Each node has **12 connection handles** (3 per side):
\`\`\`
        top-1   top-2   top-3
           •      •      •
    left-1 •              • right-1
    left-2 •    [NODE]    • right-2  
    left-3 •              • right-3
           •      •      •
      bottom-1  bottom-2  bottom-3
\`\`\`

### Connection Flow Options

**Option 1: Semantic Keywords (Recommended)**
- \`horizontal\` - Right to left (right-2 → left-2)
- \`horizontal-reverse\` - Left to right (left-2 → right-2)
- \`vertical\` - Top to bottom (bottom-2 → top-2)
- \`vertical-reverse\` - Bottom to top (top-2 → bottom-2)
- \`diagonal-down\` - Diagonal downward (bottom-2 → right-2)
- \`diagonal-up\` - Diagonal upward (top-2 → right-2)
- \`l-shape-down\` - L-shaped down (right-2 → top-2)
- \`l-shape-up\` - L-shaped up (right-2 → bottom-2)
- \`l-shape-left-down\` - L-shaped left down (left-2 → top-2)
- \`l-shape-left-up\` - L-shaped left up (left-2 → bottom-2)

**Option 2: Custom Handle Format**
Format: \`"sourceDirection::targetDirection::sourceHandle::targetHandle"\`

**Directions**: \`top\`, \`right\`, \`bottom\`, \`left\`
**Handle Numbers**: \`1\`, \`2\`, \`3\` (where 2 is middle)

**Examples:**
- \`"right::left"\` - Right middle to left middle (right-2 → left-2)
- \`"right::left::1::3"\` - Right top to left bottom (right-1 → left-3)
- \`"top::bottom::2::1"\` - Top middle to bottom top (top-2 → bottom-1)
- \`"bottom::right::3::2"\` - Bottom bottom to right middle (bottom-3 → right-2)

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

## EXAMPLE: Multiple Connection Types & Handles
\`\`\`json
{
  "nodes": [
    {
      "service": "arch::other::amazon-api-gateway",
      "label": "API Gateway",
      "position": { "x": 100, "y": 200 }
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server 1",
      "position": { "x": 400, "y": 100 }
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server 2",
      "position": { "x": 400, "y": 200 }
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server 3",
      "position": { "x": 400, "y": 300 }
    },
    {
      "service": "arch::other::amazon-rds",
      "label": "Database",
      "position": { "x": 700, "y": 200 }
    }
  ],
  "connections": [
    {
      "source": 0,
      "target": 1,
      "flow": "right::left::1::2",
      "label": "route to server 1"
    },
    {
      "source": 0,
      "target": 2,
      "flow": "horizontal",
      "label": "route to server 2"
    },
    {
      "source": 0,
      "target": 3,
      "flow": "right::left::3::2",
      "label": "route to server 3"
    },
    {
      "source": 1,
      "target": 4,
      "flow": "diagonal-down",
      "label": "query db"
    },
    {
      "source": 2,
      "target": 4,
      "flow": "right::left",
      "label": "query db"
    },
    {
      "source": 3,
      "target": 4,
      "flow": "diagonal-up",
      "label": "query db"
    }
  ]
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