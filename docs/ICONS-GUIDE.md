# AWS Icons Guide

## Overview

This app uses a **real-time directory scanning system** to automatically discover and optimize AWS Architecture Icons. Instead of hardcoding service lists, the app scans the `public/aws-icons/` directory and generates a manifest of all available icons.

## How It Works

### 1. Icon Optimization Pipeline

```
public/aws-icons/          →  scripts/generate-icons-manifest.js  →  public/aws-icons-optimized/
(Original icons)               (Scan & Optimize)                      (Optimized icons)
                                      ↓
                               public/icons-manifest.json
                               (Service metadata)
```

### 2. Directory Structure

```
public/
├── aws-icons/                    # Place downloaded AWS icons here
│   ├── Arch_Compute/
│   │   ├── Arch_Amazon-EC2_64.svg
│   │   └── Arch_Amazon-EC2_64.png
│   ├── Arch_Storage/
│   │   └── Arch_Amazon-S3_64.svg
│   └── ... (other categories)
│
├── aws-icons-optimized/          # Auto-generated optimized icons
│   └── ... (same structure as aws-icons)
│
└── icons-manifest.json           # Auto-generated service catalog
```

## Getting Started

### Step 1: Download AWS Architecture Icons

1. Visit [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
2. Download the icon package (usually a ZIP file)
3. Extract the ZIP file

### Step 2: Organize Icons

You have two options:

#### Option A: Use Official Structure (Recommended)
Simply extract the AWS icons ZIP into `public/aws-icons/`:

```bash
cd public
unzip ~/Downloads/AWS-Architecture-Icons*.zip -d aws-icons/
```

The script will automatically scan ALL subdirectories and find all `.svg` and `.png` files.

#### Option B: Custom Organization
Organize icons by category for better categorization:

```bash
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

Edit `scripts/generate-icons-manifest.js` to map your folder names to categories:

```javascript
const CATEGORY_MAP = {
  compute: 'Compute',
  storage: 'Storage',
  database: 'Database',
  // Add your custom mappings here
};
```

### Step 3: Generate Icon Manifest

Run the optimization script:

```bash
npm run icons:generate
```

This will:
- 🔍 Scan `public/aws-icons/` for all `.svg` and `.png` files
- 🖼️ Optimize PNGs to 128x128 pixels with compression
- 📋 Copy SVGs as-is (already optimized)
- 📄 Generate `public/icons-manifest.json` with metadata
- 📊 Output: `/aws-icons-optimized/` with all optimized icons

**Output example:**
```
🔍 Scanning for AWS icons...
📦 Found 500 icons

✅ Amazon EC2 (Compute)
✅ Amazon S3 (Storage)
✅ Amazon RDS (Database)
...

✨ Icon optimization complete!
📊 Optimized: 500/500 icons
```

### Step 4: Build & Run

The manifest is automatically generated before building:

```bash
npm run build    # Runs icons:generate automatically
npm run dev      # For development
```

## Icon Optimization Details

### PNG Optimization
- Resized to **128x128 pixels** (uniform size)
- Quality: **80%**
- Compression: **Level 9** (maximum)
- Transparent background preserved
- Typically **60-80% smaller** file size

### SVG Optimization
- Copied as-is (SVGs are already vector graphics)
- No modification needed
- Smaller file size than PNGs

### Supported Formats
- `.svg` - Vector graphics (recommended)
- `.png` - Raster graphics (auto-optimized)

## Generated Manifest Structure

`public/icons-manifest.json`:

```json
{
  "version": "1.0",
  "generatedAt": "2025-10-10T00:00:00.000Z",
  "totalIcons": 500,
  "categories": ["Compute", "Storage", "Database", ...],
  "services": [
    {
      "id": "amazon-ec2",
      "name": "Amazon EC2",
      "category": "Compute",
      "iconPath": "/aws-icons-optimized/compute/ec2.svg",
      "originalPath": "/aws-icons/compute/ec2.svg",
      "fileSize": 1234
    },
    ...
  ]
}
```

## Usage in App

### ServicePalette Component

The `ServicePalette` component automatically loads icons from the manifest:

```typescript
import { useIconsManifest } from '../hooks/useIconsManifest';

const { services, categories, loading, error } = useIconsManifest();

// Services are loaded dynamically
// No hardcoded lists needed!
```

### Features

1. **Real-time Search** - Searches across all icon names
2. **Category Filtering** - Filter by AWS service category
3. **Lazy Loading** - Icons loaded on demand
4. **Error Handling** - Graceful fallback if icons missing
5. **Loading States** - Spinner while manifest loads

### Fallback Behavior

If icons fail to load, the app shows:
- ⚠️ Warning message
- 📝 Instructions to run `npm run icons:generate`
- 🟠 Placeholder icons (service initials in colored boxes)

## Custom Category Mapping

To add custom categories, edit `scripts/generate-icons-manifest.js`:

```javascript
const CATEGORY_MAP = {
  // Default categories
  compute: 'Compute',
  storage: 'Storage',
  database: 'Database',
  networking: 'Networking',
  security: 'Security',
  analytics: 'Analytics',
  ml: 'ML',
  container: 'Container',
  serverless: 'Serverless',

  // Add custom categories
  'my-custom-folder': 'Custom Category',
  'iot': 'IoT Services',
};
```

Files in unmapped folders will be categorized as `"Other"`.

## Troubleshooting

### No icons showing up?

1. Check if icons exist:
   ```bash
   ls -la public/aws-icons/
   ```

2. Run the generation script:
   ```bash
   npm run icons:generate
   ```

3. Check the manifest was created:
   ```bash
   cat public/icons-manifest.json
   ```

### Icons not optimized?

- Check Node.js version: `node --version` (requires Node 18+)
- Reinstall dependencies: `npm install`
- Check for errors in console

### Categories not showing correctly?

- Update `CATEGORY_MAP` in `scripts/generate-icons-manifest.js`
- Re-run `npm run icons:generate`

### Build fails?

- Ensure manifest exists: `npm run icons:generate`
- Check `prebuild` script in `package.json`

## Performance Tips

### Icon Loading
- **SVGs preferred** - Smaller file size, scalable
- **PNG fallback** - For complex icons
- **Lazy loading** - Icons load as user scrolls

### Optimization
- Run `icons:generate` only when adding new icons
- Manifest is cached on client side
- Optimized icons are ~70% smaller

### File Size Comparison

| Original PNG | Optimized PNG | Savings |
|--------------|---------------|---------|
| 50 KB        | 10 KB         | 80%     |
| 100 KB       | 15 KB         | 85%     |

## Advanced Usage

### Programmatic Icon Access

```typescript
import { useIconsManifest } from './hooks/useIconsManifest';

const MyComponent = () => {
  const { searchServices, getServicesByCategory } = useIconsManifest();

  // Search for specific service
  const ec2Services = searchServices('ec2');

  // Get all compute services
  const computeServices = getServicesByCategory('Compute');

  return <div>{/* Render icons */}</div>;
};
```

### Custom Icon Filtering

```typescript
const filteredServices = services.filter(s =>
  s.fileSize < 5000 && // Only small icons
  s.iconPath.endsWith('.svg') // Only SVGs
);
```

## Script Commands

```bash
# Generate icons manifest
npm run icons:generate

# Build (auto-generates manifest)
npm run build

# Development (no auto-generation)
npm run dev
```

## FAQ

**Q: Do I need to re-run the script every time?**
A: No, only when you add new icons or change the directory structure.

**Q: Can I use icons from other sources?**
A: Yes! Just place them in `public/aws-icons/` and run the script.

**Q: What if I don't have AWS icons yet?**
A: The app works with placeholder icons until you add real ones.

**Q: Can I skip PNG optimization?**
A: Yes, use only SVG files for best performance.

**Q: How do I update icons?**
A: Replace files in `public/aws-icons/` and re-run `npm run icons:generate`.

---

Built with Node.js, Sharp, and Glob

