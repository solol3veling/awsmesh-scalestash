import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../public/aws-icons');
const OUTPUT_DIR = path.join(__dirname, '../public/aws-icons-optimized');
const MANIFEST_PATH = path.join(__dirname, '../public/icons-manifest.json');

// Category mapping based on folder structure
const CATEGORY_MAP = {
  compute: 'Compute',
  storage: 'Storage',
  database: 'Database',
  networking: 'Networking',
  security: 'Security',
  analytics: 'Analytics',
  ml: 'ML',
  container: 'Container',
  serverless: 'Serverless',
};

async function optimizeSVG(inputPath, outputPath) {
  try {
    // For SVG files, just copy them (they're already optimized)
    await fs.promises.copyFile(inputPath, outputPath);
    return true;
  } catch (error) {
    console.error(`Error copying SVG ${inputPath}:`, error.message);
    return false;
  }
}

async function optimizePNG(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Error optimizing PNG ${inputPath}:`, error.message);
    return false;
  }
}

async function optimizeIcon(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.svg') {
    return optimizeSVG(inputPath, outputPath);
  } else if (ext === '.png') {
    return optimizePNG(inputPath, outputPath);
  }

  return false;
}

function extractServiceName(filename) {
  // Remove extension and clean up name
  const name = path.basename(filename, path.extname(filename));

  // Convert kebab-case or snake_case to Title Case
  return name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function scanAndOptimizeIcons() {
  console.log('🔍 Scanning for AWS icons...\n');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Scan for all icon files
  const iconFiles = await glob('**/*.{svg,png}', {
    cwd: ICONS_DIR,
    absolute: false,
  });

  if (iconFiles.length === 0) {
    console.warn('⚠️  No icons found in', ICONS_DIR);
    console.log('📥 Please download AWS Architecture Icons from:');
    console.log('   https://aws.amazon.com/architecture/icons/\n');

    // Create sample manifest
    const sampleManifest = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      totalIcons: 0,
      categories: [],
      services: [],
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sampleManifest, null, 2));
    return;
  }

  console.log(`📦 Found ${iconFiles.length} icons\n`);

  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalIcons: 0,
    categories: new Set(),
    services: [],
  };

  let optimizedCount = 0;

  for (const iconFile of iconFiles) {
    const inputPath = path.join(ICONS_DIR, iconFile);
    const relativePath = iconFile;

    // Extract category from folder structure
    const parts = relativePath.split(path.sep);
    const categoryFolder = parts[0];
    const category = CATEGORY_MAP[categoryFolder] || 'Other';

    // Create full directory path in output
    const outputPath = path.join(OUTPUT_DIR, relativePath);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const serviceName = extractServiceName(path.basename(iconFile));

    // Optimize icon
    const success = await optimizeIcon(inputPath, outputPath);

    if (success) {
      optimizedCount++;
      manifest.categories.add(category);

      // Add to manifest
      manifest.services.push({
        id: path.basename(iconFile, path.extname(iconFile)).toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: serviceName,
        category: category,
        iconPath: `/aws-icons-optimized/${relativePath.replace(/\\/g, '/')}`,
        originalPath: `/aws-icons/${relativePath.replace(/\\/g, '/')}`,
        fileSize: fs.statSync(outputPath).size,
      });

      console.log(`✅ ${serviceName} (${category})`);
    }
  }

  // Convert Set to Array for JSON
  manifest.categories = Array.from(manifest.categories).sort();
  manifest.totalIcons = manifest.services.length;

  // Sort services by category then name
  manifest.services.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log('\n✨ Icon optimization complete!');
  console.log(`📊 Optimized: ${optimizedCount}/${iconFiles.length} icons`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📄 Manifest: ${MANIFEST_PATH}\n`);
}

// Run the script
scanAndOptimizeIcons().catch(console.error);
