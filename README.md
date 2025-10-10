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

## DSL JSON Schema

```json
{
  "version": "1.0",
  "metadata": {
    "title": "My AWS Architecture",
    "description": "Production infrastructure",
    "author": "Your Name",
    "createdAt": "2025-10-10T00:00:00Z",
    "updatedAt": "2025-10-10T00:00:00Z"
  },
  "nodes": [
    {
      "id": "ec2-1",
      "type": "aws-service",
      "service": "EC2",
      "category": "Compute",
      "label": "Web Server",
      "position": { "x": 100, "y": 100 },
      "data": {
        "instanceType": "t3.micro",
        "region": "us-east-1"
      }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "source": "ec2-1",
      "target": "rds-1",
      "label": "Database connection",
      "animated": true
    }
  ]
}
```

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
