# AWS Architecture Designer

A lightweight, cost-efficient React application for creating AWS Architecture Diagrams with a visual canvas and JSON DSL.

## Features

- **Visual Diagram Editor**: Drag-and-drop AWS service icons onto a React Flow canvas
- **DSL JSON Format**: Simple JSON schema for defining architectures
- **Live Code Editor**: Monaco-powered editor for direct JSON manipulation
- **Export Capabilities**: Export diagrams as PNG, SVG, or JSON
- **Lightweight State Management**: Context API + React Hooks (no Redux/Zustand)
- **No External Dependencies**: All data stored locally, no database required
- **AWS Service Catalog**: Pre-configured AWS service icons and metadata

## Tech Stack

| Purpose | Technology |
|---------|-----------|
| Framework | React + Vite |
| Diagram Engine | React Flow |
| State Management | Context API + Hooks |
| Routing | React Router |
| UI Styling | TailwindCSS |
| Code Editor | Monaco Editor |
| Export | html-to-image |
| Hosting | Netlify/Vercel (free tier) |

## Project Structure

```
src/
├── components/
│   ├── diagram/
│   │   ├── AWSNode.tsx          # Custom AWS service node
│   │   └── DiagramCanvas.tsx    # Main React Flow canvas
│   ├── editor/
│   │   └── CodeEditor.tsx       # Monaco JSON editor
│   ├── icons/
│   │   └── ServicePalette.tsx   # AWS services sidebar
│   └── layout/
│       └── Toolbar.tsx          # Top toolbar with export buttons
├── context/
│   └── DiagramContext.tsx       # Global state management
├── hooks/                       # Custom React hooks
├── pages/
│   └── DiagramPage.tsx          # Main diagram page
├── types/
│   ├── diagram.ts               # DSL schema types
│   └── aws-services.ts          # AWS services catalog
├── utils/
│   └── export.ts                # Export utilities
└── assets/
    └── aws-icons/               # Local AWS service icons
```

## DSL JSON Schema (Minimal Format)

### Basic AWS Service Node
```json
{
  "nodes": [
    {
      "service": "arch::compute::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 100, "y": 100 }
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
```

### Group Containers (VPC, Subnet, etc.)
```json
{
  "nodes": [
    {
      "service": "group",
      "label": "VPC",
      "position": { "x": 0, "y": 0 },
      "group": "600::300::container::locked"
    },
    {
      "service": "arch::compute::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 50, "y": 50 },
      "group": "::::parent::0"
    }
  ]
}
```

### Group Syntax Format
Groups are containers (like VPC, Subnet) that can hold other nodes:

**Container Format**: `"width::height::container[::locked]"`
- `"500::400::container"` - Unlocked group 500x400px
- `"500::400::container::locked"` - Locked group (cannot be moved)

**Child Node Format**: `"::::parent::parent-id"`
- `"::::parent::0"` - Makes node a child of node at index 0
- `"::::parent::vpc-1"` - Makes node a child of node with id "vpc-1"

### Service Name Format
Use format: `arch::category::service-name` (lowercase, hyphens)

**Common Services**:
- **Compute**: `amazon-ec2`, `aws-lambda`, `aws-batch`
- **Database**: `amazon-rds`, `amazon-dynamodb`, `amazon-elasticache`, `amazon-aurora`
- **Networking**: `amazon-virtual-private-cloud`, `amazon-api-gateway`, `amazon-cloudfront`, `amazon-route-53`, `elastic-load-balancing`
- **Storage**: `amazon-simple-storage-service` (S3), `amazon-elastic-block-store`, `amazon-elastic-file-system`
- **Containers**: `amazon-elastic-container-service`, `amazon-elastic-kubernetes-service`

**Full List**: See ServicePalette in app or check `public/aws-icons/Architecture-Service-Icons_*/Arch_*` directories

### Connection Flow Patterns
**Semantic Keywords** (recommended):
- `"horizontal"` - Right to left flow
- `"vertical"` - Top to bottom flow
- `"diagonal-down"`, `"diagonal-up"` - Diagonal flows
- `"l-shape-down"`, `"l-shape-up"` - L-shaped connections

**Custom Format** (for multiple connections):
- `"right::left::2::2"` - Full: source-dir::target-dir::source-handle::target-handle
- `"right::left"` - Short: uses middle handles (handle 2)
- Each node has 12 handles: top-1/2/3, right-1/2/3, bottom-1/2/3, left-1/2/3

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Add Services**: Click or drag AWS services from the left sidebar onto the canvas
2. **Connect Services**: Drag connections between service nodes
3. **Edit Properties**: Click nodes to edit labels and metadata
4. **View/Edit JSON**: Toggle the code editor to see or modify the DSL JSON
5. **Export**: Use toolbar buttons to export as PNG, SVG, or JSON

## AI Prompt Examples

### Example 1: Simple 3-tier architecture
```
Create a 3-tier AWS architecture with:
- VPC group (600x400, locked) containing:
  - EC2 web server at (50, 50)
  - EC2 app server at (50, 150)
- RDS database at (700, 100) outside VPC
- Horizontal connections: web->app, app->db
```

**Generated JSON:**
```json
{
  "nodes": [
    {
      "service": "group",
      "label": "VPC",
      "position": { "x": 0, "y": 0 },
      "group": "600::400::container::locked"
    },
    {
      "service": "arch::compute::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 50, "y": 50 },
      "group": "::::parent::0"
    },
    {
      "service": "arch::compute::amazon-ec2",
      "label": "App Server",
      "position": { "x": 50, "y": 150 },
      "group": "::::parent::0"
    },
    {
      "service": "arch::database::amazon-rds",
      "label": "Database",
      "position": { "x": 700, "y": 100 }
    }
  ],
  "connections": [
    { "source": 1, "target": 2, "flow": "vertical" },
    { "source": 2, "target": 3, "flow": "horizontal" }
  ]
}
```

### Example 2: Microservices with API Gateway
```
Create microservices architecture:
- API Gateway at (100, 100)
- Lambda 1 at (300, 50)
- Lambda 2 at (300, 150)
- DynamoDB at (500, 100)
- Connect gateway to both lambdas horizontally
- Connect both lambdas to DynamoDB horizontally
```

**Generated JSON:**
```json
{
  "nodes": [
    {
      "service": "arch::networking::amazon-api-gateway",
      "label": "API Gateway",
      "position": { "x": 100, "y": 100 }
    },
    {
      "service": "arch::compute::aws-lambda",
      "label": "User Service",
      "position": { "x": 300, "y": 50 }
    },
    {
      "service": "arch::compute::aws-lambda",
      "label": "Order Service",
      "position": { "x": 300, "y": 150 }
    },
    {
      "service": "arch::database::amazon-dynamodb",
      "label": "Database",
      "position": { "x": 500, "y": 100 }
    }
  ],
  "connections": [
    { "source": 0, "target": 1, "flow": "horizontal" },
    { "source": 0, "target": 2, "flow": "horizontal" },
    { "source": 1, "target": 3, "flow": "horizontal" },
    { "source": 2, "target": 3, "flow": "horizontal" }
  ]
}
```

## AWS Icons Setup

To use real AWS Architecture Icons:

1. Download official AWS icons from [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
2. Extract icons to `public/aws-icons/` directory
3. Organize by category: `compute/`, `storage/`, `database/`, etc.
4. Update icon paths in `src/types/aws-services.ts`

**Note**: Currently using placeholder fallback icons (service initials). Replace with actual SVG icons for production use.

## Deployment

### Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
# Drag-drop the 'dist' folder to Netlify or use CLI
npx netlify-cli deploy --prod
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Customization

### Adding New AWS Services

Edit `src/types/aws-services.ts`:

```typescript
{
  id: 'new-service',
  name: 'New Service',
  category: 'Compute',
  iconPath: '/aws-icons/compute/new-service.svg',
  description: 'Service description'
}
```

### Styling Nodes

Customize node appearance in `src/components/diagram/AWSNode.tsx`

### Canvas Settings

Modify canvas background, controls, and minimap in `src/components/diagram/DiagramCanvas.tsx`

## Roadmap

- [ ] Import JSON DSL files
- [ ] Auto-layout algorithms
- [ ] Collaborative editing (WebRTC)
- [ ] Templates library
- [ ] Custom node types
- [ ] Terraform export
- [ ] Cost estimation integration

## License

MIT

## Contributing

Pull requests welcome! Please open an issue first to discuss proposed changes.

---

Built with React, React Flow, and TailwindCSS
