# Quick Start Guide

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Using the Application

### Adding AWS Services

1. **From Sidebar**:
   - Browse AWS services in the left sidebar
   - Filter by category (Compute, Storage, Database, etc.)
   - Search for specific services
   - Click or drag services onto the canvas

2. **Connecting Services**:
   - Drag from the bottom handle of one node to the top handle of another
   - Connections appear as arrows

### Working with the Canvas

- **Pan**: Click and drag the canvas background
- **Zoom**: Use mouse wheel or controls in bottom-right
- **Select**: Click nodes to select them
- **Move**: Drag nodes to reposition
- **Delete**: Select node and press Delete/Backspace

### Using the Code Editor

1. Click "Show Code Editor" button in the toolbar
2. View the live DSL JSON representation
3. Edit the JSON directly
4. Click "Apply Changes" to update the canvas
5. Use "Download JSON" to save your work

### Exporting Diagrams

Use the toolbar buttons to export:
- **PNG**: Raster image for presentations
- **SVG**: Vector image for scalability
- **JSON**: DSL format for later editing

## DSL Example

```json
{
  "version": "1.0",
  "metadata": {
    "title": "Web Application Architecture",
    "description": "Simple 3-tier web app",
    "createdAt": "2025-10-10T00:00:00Z"
  },
  "nodes": [
    {
      "id": "alb-1",
      "type": "aws-service",
      "service": "ALB",
      "category": "Networking",
      "label": "Load Balancer",
      "position": { "x": 250, "y": 100 }
    },
    {
      "id": "ec2-1",
      "type": "aws-service",
      "service": "EC2",
      "category": "Compute",
      "label": "Web Server",
      "position": { "x": 250, "y": 250 }
    },
    {
      "id": "rds-1",
      "type": "aws-service",
      "service": "RDS",
      "category": "Database",
      "label": "Database",
      "position": { "x": 250, "y": 400 }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "source": "alb-1",
      "target": "ec2-1",
      "animated": true
    },
    {
      "id": "conn-2",
      "source": "ec2-1",
      "target": "rds-1",
      "animated": false
    }
  ]
}
```

## Tips & Tricks

### Keyboard Shortcuts
- `Delete` / `Backspace`: Delete selected node
- `Ctrl/Cmd + Z`: Undo (browser default)
- Mouse wheel: Zoom in/out

### Best Practices
1. **Group Related Services**: Keep related services close together
2. **Use Categories**: Color-code by service category
3. **Label Everything**: Add descriptive labels to nodes
4. **Export Regularly**: Save your work as JSON

### Performance
- The app stores everything in memory (no database)
- All data is lost on page refresh unless exported
- For large diagrams, consider exporting JSON frequently

## Adding Custom AWS Icons

1. Download [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
2. Extract to `public/aws-icons/`
3. Organize by category folders
4. Update paths in `src/types/aws-services.ts`

Example structure:
```
public/aws-icons/
├── compute/
│   ├── ec2.svg
│   ├── lambda.svg
│   └── ecs.svg
├── storage/
│   ├── s3.svg
│   └── ebs.svg
└── database/
    ├── rds.svg
    └── dynamodb.svg
```

## Troubleshooting

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18+ (`node --version`)

### Canvas Not Responding
- Refresh the page
- Clear browser cache
- Check browser console for errors

### Export Not Working
- Ensure pop-ups are allowed in your browser
- Try different export format (PNG vs SVG)

## Next Steps

- Add more AWS services to the catalog
- Create reusable architecture templates
- Integrate with AWS CloudFormation/Terraform
- Deploy to Netlify or Vercel

---

Happy diagramming!
