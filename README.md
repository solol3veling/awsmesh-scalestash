<div align="center">

# 🏗️ AWS Mesh - ScaleStash

### Interactive AWS Architecture Diagram Tool

[![GitHub Stars](https://img.shields.io/github/stars/solol3veling/awsmesh-scalestash?style=for-the-badge)](https://github.com/solol3veling/awsmesh-scalestash/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/solol3veling/awsmesh-scalestash?style=for-the-badge)](https://github.com/solol3veling/awsmesh-scalestash/issues)
[![License](https://img.shields.io/github/license/solol3veling/awsmesh-scalestash?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/elitekaycy/awsmesh-scalestash)

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

**AWS Mesh - ScaleStash** is a powerful, intuitive web-based tool for creating, editing, and visualizing AWS architecture diagrams. Built with React Flow and TypeScript, it provides a drag-and-drop interface for designing cloud architectures with real AWS service icons and intelligent connection management.

Perfect for cloud architects, DevOps engineers, and developers who need to document and communicate AWS infrastructure designs efficiently.

## ✨ Features

### 🎨 Visual Diagram Editor
- **Drag & Drop Interface** - Intuitive service placement with real AWS icons
- **1200+ AWS Services** - Complete icon library with automatic icon resolution
- **Smart Connections** - 12-handle system per node with customizable flow patterns
- **Group Containers** - Create VPCs, subnets, and logical groupings with parent-child relationships
- **Dark/Light Theme** - Eye-friendly themes for any environment

### 🤖 AI-Powered Generation
- **JSON DSL Format** - Minimal, AI-friendly syntax for diagram generation
- **AI Integration Ready** - Feed structured JSON to AI models for automatic diagram creation
- **Validation Rules** - Built-in validation to prevent common mistakes
- **Export/Import** - Save and load diagrams as JSON files

### 🎯 Advanced Features
- **Code Editor Integration** - View and edit diagram JSON directly
- **Connection Patterns** - Semantic keywords (horizontal, vertical, L-shapes) and custom handle selection
- **Auto-positioning** - Smart handle selection based on node positions
- **Persistence** - Save your work locally with browser storage
- **Responsive Design** - Works on desktop and tablet devices

### 🔧 Developer Friendly
- **TypeScript** - Fully typed for better development experience
- **Component Architecture** - Modular, maintainable codebase
- **React Flow** - Built on top of the powerful React Flow library
- **Docker Ready** - One-command deployment with Docker
- **CI/CD Pipeline** - Automated builds and deployments with GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/solol3veling/awsmesh-scalestash.git
cd awsmesh-scalestash

# Install dependencies
npm install

# Generate AWS icons manifest
npm run icons:generate

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Docker Deployment

```bash
# Build the Docker image
docker build -t awsmesh-scalestash .

# Run the container
docker run -d -p 9090:9090 --name scalestash awsmesh-scalestash
```

Visit `http://localhost:9090` to access the application.

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [📘 Quick Start Guide](docs/QUICKSTART.md) - Get started in minutes
- [🎨 Icons Guide](docs/ICONS-GUIDE.md) - Understanding the AWS icon system
- [🔄 Icon System Summary](docs/ICON-SYSTEM-SUMMARY.md) - Technical details of icon management
- [📏 Icon Sizing](docs/ICON-SIZING-UPDATE.md) - Icon sizing standards
- [💾 Persistence](docs/PERSISTENCE.md) - Local storage implementation
- [🔍 Search Improvements](docs/SEARCH-IMPROVEMENTS.md) - Search functionality details

## 🎯 Usage

### Creating Diagrams

1. **Add Services**: Drag AWS services from the sidebar or click to add
2. **Create Groups**: Add VPC or subnet containers for logical organization
3. **Connect Services**: Click and drag between services to create connections
4. **Customize**: Edit labels, adjust positions, and customize connection flows
5. **Export**: Download your diagram as JSON for version control or AI processing

### AI-Generated Diagrams

Use the built-in JSON format to generate diagrams programmatically:

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
      "service": "arch::other::amazon-ec2",
      "label": "Web Server",
      "position": { "x": 50, "y": 50 },
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
      "flow": "horizontal",
      "label": "queries"
    }
  ]
}
```

## 🏗️ Architecture

```
scalestash-aws/
├── src/
│   ├── components/       # React components
│   │   ├── diagram/      # Diagram-specific components
│   │   ├── icons/        # Service palette & icon handling
│   │   │   └── modals/   # Upload & Info modals
│   │   └── layout/       # Layout components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
│       ├── serviceUtils.ts      # Service ID utilities
│       └── readmeGenerator.ts   # README generation
├── public/
│   └── aws-icons/        # AWS service icons (1200+ SVG files)
├── docs/                 # Documentation
└── .github/workflows/    # CI/CD pipelines
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Diagram Engine**: React Flow
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite
- **Deployment**: Docker, Nginx
- **CI/CD**: GitHub Actions

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS for providing comprehensive icon sets
- React Flow team for the excellent diagram library
- All contributors who help improve this project

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/solol3veling/awsmesh-scalestash/issues)
- **Discussions**: [GitHub Discussions](https://github.com/solol3veling/awsmesh-scalestash/discussions)
- **Organization**: [solol3veling](https://github.com/solol3veling)

---

<div align="center">

Made with ❤️ by the ScaleStash Team

[⬆ Back to Top](#-aws-mesh---scalestash)

</div>
