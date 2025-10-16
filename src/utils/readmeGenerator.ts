/**
 * Generate AI-friendly README content for AWS Architecture Diagrams
 */

import type { AWSService } from './serviceUtils';
import { getUniformServiceId } from './serviceUtils';

export const generateReadmeContent = (services: AWSService[]): string => {
  return `# AWS Architecture Diagram JSON Format

## CRITICAL RULES FOR AI GENERATION

**RULE 1: ONLY use service IDs from the "Available Services" list below**
- DO NOT invent or guess service names
- DO NOT use generic names like "user", "database", "storage"
- If a service is not in the list, do NOT include it

**RULE 2: Groups MUST come FIRST in the nodes array**
- Group nodes must appear BEFORE any child nodes that reference them
- Child nodes reference parents by index or ID, so parents must exist first

**RULE 3: Use string IDs for groups when using parent references**
- Example: \`"id": "vpc-group"\` then \`"group": "::::parent::vpc-group"\`
- Or use numeric indices if groups are first: \`"group": "::::parent::0"\`

**RULE 4: Node ordering matters for index-based connections**
- \`"source": 0\` refers to the first node in the array
- Count carefully: [0, 1, 2, 3...] starting from the top

## Minimal JSON Structure

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
      "flow": "horizontal",
      "label": "queries"
    }
  ]
}
\`\`\`

## Node Fields

### Regular AWS Service Nodes
- \`service\`: Service ID (format: \`arch::other::service-name\`) - ALL services use "other" as category
- \`position\`: Coordinates \`{ x, y }\` in pixels
- \`label\`: Display name (optional)
- \`group\`: Parent relationship (optional, see Groups section)

### Group Container Nodes (VPC, Subnet, etc.)

**Option 1: Generic Group Container**
- \`service\`: "group" (required)
- \`label\`: Group name (e.g., "VPC", "Public Subnet")
- \`position\`: Coordinates \`{ x, y }\` in pixels
- \`group\`: Format \`"width::height::container[::locked]"\`
  - Example: \`"600::400::container"\` - 600x400px unlocked group
  - Example: \`"500::300::container::locked"\` - Locked group (cannot be moved)

**Option 2: Specific Group Icons (with AWS icons)**
Use these specific group service IDs for containers with proper AWS icons:
- \`service\`: "private-subnet" - Private subnet container
- \`service\`: "public-subnet" - Public subnet container  
- \`service\`: "region" - AWS region container
- \`service\`: "aws-cloud" - AWS cloud container
- \`service\`: "aws-account" - AWS account container
- \`service\`: "auto-scaling-group" - Auto scaling group container
- \`service\`: "corporate-data-center" - Corporate data center container
- \`service\`: "ec2-instance-contents" - EC2 instance contents container

**Note**: When using specific group icons, you still need the \`group\` field for container behavior.

### Child Nodes (inside groups)
- Include all regular node fields
- Add \`group\`: \`"::::parent::parent-id"\` or \`"::::parent::0"\` (index)

## Groups (VPC, Subnets, etc.)

Groups are containers that can hold other AWS service nodes.

### Creating a Group Container
\`\`\`json
{
  "service": "group",
  "label": "VPC",
  "position": { "x": 0, "y": 0 },
  "group": "600::400::container::locked"
}
\`\`\`

### Adding Nodes Inside a Group
\`\`\`json
{
  "service": "arch::other::amazon-ec2",
  "label": "Web Server",
  "position": { "x": 50, "y": 50 },
  "group": "::::parent::0"
}
\`\`\`

**Note**: Child positions are relative to parent group's top-left corner.

## Connection Fields

- \`source\`: Source node index (0, 1, 2...) or node ID string
- \`target\`: Target node index (0, 1, 2...) or node ID string
- \`flow\`: Connection flow pattern (optional, see Flow Patterns section)
- \`label\`: Connection description (optional)

**Auto-selection**: If \`flow\` is omitted, handles are auto-selected based on node positions.

## Available Services (COMPLETE LIST)

**IMPORTANT: This is the ONLY valid list. Do NOT use any service name not in this list.**

### Common Service Patterns (for quick reference)

**CRITICAL: ALL services use "other" as the category**
- Format: \`arch::other::service-name\`
- Service names have spaces replaced with hyphens and are lowercase
- The manifest categorizes ALL services as "other" regardless of their folder

**Compute:**
- arch::other::amazon-ec2
- arch::other::aws-lambda
- arch::other::aws-batch
- arch::other::amazon-ec2-auto-scaling
- arch::other::aws-elastic-beanstalk

**Storage:**
- arch::other::amazon-simple-storage-service
- arch::other::amazon-elastic-block-store
- arch::other::amazon-elastic-file-system
- arch::other::amazon-fsx
- arch::other::aws-backup

**Database:**
- arch::other::amazon-rds
- arch::other::amazon-dynamodb
- arch::other::amazon-aurora
- arch::other::amazon-elasticache
- arch::other::amazon-neptune

**Networking & Content Delivery:**
- arch::other::amazon-virtual-private-cloud
- arch::other::amazon-api-gateway
- arch::other::amazon-cloudfront
- arch::other::elastic-load-balancing
- arch::other::amazon-route-53
- arch::other::aws-direct-connect

**Containers:**
- arch::other::amazon-elastic-container-service
- arch::other::amazon-elastic-kubernetes-service
- arch::other::amazon-elastic-container-registry

**Developer Tools:**
- arch::other::aws-codepipeline
- arch::other::aws-codebuild
- arch::other::aws-codedeploy
- arch::other::aws-codecommit

**Application Integration:**
- arch::other::amazon-simple-notification-service
- arch::other::amazon-simple-queue-service
- arch::other::amazon-eventbridge
- arch::other::amazon-mq

**Security, Identity & Compliance:**
- arch::other::aws-identity-and-access-management
- arch::other::amazon-cognito
- arch::other::aws-secrets-manager
- arch::other::aws-waf

### GROUP CONTAINER SERVICES (Special containers with AWS icons)

**IMPORTANT: These are special group services that can act as containers:**

- private-subnet
- public-subnet
- region
- aws-cloud
- aws-account
- auto-scaling-group
- corporate-data-center
- ec2-instance-contents

### COMPLETE SERVICE LIST (${services.filter(s => s.sizes[64]).length} services)

${services
  .filter(s => s.sizes[64])
  .map(service => `${getUniformServiceId(service)}`)
  .join('\n')}

## Example 1: Simple 3-Tier Architecture with VPC

\`\`\`json
{
  "nodes": [
    {
      "service": "group",
      "label": "VPC",
      "position": { "x": 0, "y": 0 },
      "group": "600::400::container::locked"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 50, "y": 50 },
      "group": "::::parent::0"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "App Server",
      "position": { "x": 50, "y": 150 },
      "group": "::::parent::0"
    },
    {
      "service": "arch::other::amazon-rds",
      "label": "Database",
      "position": { "x": 700, "y": 100 }
    }
  ],
  "connections": [
    {
      "source": 1,
      "target": 2,
      "flow": "vertical",
      "label": "forwards to"
    },
    {
      "source": 2,
      "target": 3,
      "flow": "horizontal",
      "label": "queries"
    }
  ]
}
\`\`\`

## Example 2: Using Specific Group Icons (VPC, Subnets with AWS Icons)

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
      "service": "aws-cloud",
      "label": "VPC",
      "position": { "x": 50, "y": 50 },
      "group": "700::500::container",
      "id": "vpc"
    },
    {
      "service": "public-subnet",
      "label": "Public Subnet",
      "position": { "x": 100, "y": 100 },
      "group": "300::150::container",
      "id": "public-subnet"
    },
    {
      "service": "private-subnet",
      "label": "Private Subnet",
      "position": { "x": 450, "y": 100 },
      "group": "300::150::container",
      "id": "private-subnet"
    },
    {
      "service": "arch::other::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 150, "y": 150 },
      "group": "::::parent::public-subnet"
    },
    {
      "service": "arch::other::amazon-rds",
      "label": "Database",
      "position": { "x": 500, "y": 150 },
      "group": "::::parent::private-subnet"
    }
  ],
  "connections": [
    {
      "source": 4,
      "target": 5,
      "flow": "horizontal",
      "label": "queries"
    }
  ]
}
\`\`\`

## Example 3: Multiple connections from same node (using custom handles)

\`\`\`json
{
  "nodes": [
    {
      "service": "arch::other::amazon-ec2",
      "position": { "x": 100, "y": 200 },
      "label": "API Server"
    },
    {
      "service": "arch::other::amazon-rds",
      "position": { "x": 400, "y": 100 },
      "label": "User DB"
    },
    {
      "service": "arch::other::amazon-dynamodb",
      "position": { "x": 400, "y": 200 },
      "label": "Session DB"
    },
    {
      "service": "arch::other::amazon-simple-storage-service",
      "position": { "x": 400, "y": 300 },
      "label": "Media Storage"
    }
  ],
  "connections": [
    {
      "source": 0,
      "target": 1,
      "flow": "right::left::1::2",
      "label": "user queries"
    },
    {
      "source": 0,
      "target": 2,
      "flow": "right::left::2::2",
      "label": "session data"
    },
    {
      "source": 0,
      "target": 3,
      "flow": "right::left::3::2",
      "label": "media uploads"
    }
  ]
}
\`\`\`

## Node Handle System

**Each node has 12 connection handles** (3 per side):

\`\`\`
        top-1   top-2   top-3
           •      •      •
    left-1 •              • right-1
    left-2 •    [NODE]    • right-2
    left-3 •              • right-3
           •      •      •
      bottom-1  bottom-2  bottom-3
\`\`\`

## Connection Flow Patterns

### Option 1: Semantic Keywords (Recommended)

Easiest for AI to understand and generate:

- **\`"horizontal"\`** - Right to left flow (uses middle handles: right-2 → left-2)
- **\`"vertical"\`** - Top to bottom flow (uses middle handles: bottom-2 → top-2)
- **\`"diagonal-down"\`** - Diagonal flow downward (right-2 → top-2)
- **\`"diagonal-up"\`** - Diagonal flow upward (right-2 → bottom-2)
- **\`"l-shape-down"\`** - L-shaped connection going down (right-2 → left-2 → bottom-2)
- **\`"l-shape-up"\`** - L-shaped connection going up (right-2 → left-2 → top-2)

### Option 2: Custom Format (Precise Control)

For multiple connections from the same node or precise handle selection:

**Format**: \`"sourceDir::targetDir::sourceHandle::targetHandle"\`

- **Full format**: \`"right::left::1::3"\` means right-1 → left-3
- **Short format**: \`"right::left"\` means right-2 → left-2 (uses middle handle 2)

**Direction options**: \`top\`, \`right\`, \`bottom\`, \`left\`
**Handle numbers**: \`1\`, \`2\`, \`3\` (where 2 is the middle handle)

### Examples:

\`\`\`json
{
  "connections": [
    { "source": 0, "target": 1, "flow": "horizontal" },
    { "source": 1, "target": 2, "flow": "vertical" },
    { "source": 0, "target": 3, "flow": "right::left::1::2" }
  ]
}
\`\`\`

## AI VALIDATION CHECKLIST

Before generating JSON, verify:

1. ✓ **All service IDs exist in the "COMPLETE SERVICE LIST" above**
2. ✓ **Group nodes come FIRST in the nodes array**
3. ✓ **Parent references are correct**
4. ✓ **Connection indices match node positions**
5. ✓ **Required fields are present**
6. ✓ **Group syntax is correct**

## COMMON MISTAKES TO AVOID

❌ **DON'T DO THIS:**
\`\`\`json
{
  "nodes": [
    { "service": "arch::other::amazon-ec2", "group": "::::parent::0" },  // ❌ Parent doesn't exist yet!
    { "service": "group", "id": 0 }  // ❌ Group comes after child
  ]
}
\`\`\`

❌ **DON'T DO THIS:**
\`\`\`json
{
  "service": "arch::storage::s3"  // ❌ Wrong! Must use: arch::other::amazon-simple-storage-service
}
\`\`\`

❌ **DON'T DO THIS:**
\`\`\`json
{
  "service": "arch::networking::amazon-vpc"  // ❌ Wrong category! ALL services use "other"
}
\`\`\`

❌ **DON'T DO THIS:**
\`\`\`json
{
  "service": "arch::compute::aws-lambda"  // ❌ Wrong category! Must use: arch::other::aws-lambda
}
\`\`\`

✅ **DO THIS:**
\`\`\`json
{
  "nodes": [
    { "service": "group", "label": "VPC", "position": {"x": 0, "y": 0}, "group": "600::400::container", "id": "vpc" },
    { "service": "arch::other::amazon-ec2", "label": "Web Server", "position": {"x": 50, "y": 50}, "group": "::::parent::vpc" }
  ]
}
\`\`\`
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
