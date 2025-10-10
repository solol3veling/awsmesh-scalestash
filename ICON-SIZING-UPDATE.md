# Icon Sizing Update

## What Changed

I've updated the icon system to intelligently handle different icon sizes for different contexts.

### Key Improvements

1. **Smart Size Detection**
   - Icons with `_16`, `_32`, `_48`, or `_64` in filenames are automatically detected
   - Icons grouped by service name with all available sizes

2. **Context-Aware Icon Usage**
   - **Sidebar**: Uses 16px icons (small, perfect for lists)
   - **Canvas**: Uses 32px/48px/64px icons (larger, better for diagrams)
   - Automatically selects best available size

3. **Search-Only Results**
   - When searching, ONLY search results are shown
   - Category filters are ignored during search
   - Clear button to reset search

## How It Works

### Icon Manifest Structure (New)

```json
{
  "services": [
    {
      "id": "amazon-ec2",
      "name": "Amazon EC2",
      "category": "Compute",
      "sizes": {
        "16": [
          {
            "size": 16,
            "iconPath": "/aws-icons-optimized/.../ec2_16.svg",
            "format": "svg",
            "fileSize": 1234
          }
        ],
        "32": [...],
        "48": [...],
        "64": [...]
      }
    }
  ]
}
```

### Icon Selection Logic

```typescript
// For sidebar (prefer 16px)
getSmallIcon(service) → tries 16px first, then smallest available

// For canvas (prefer 32px+)
getLargeIcon(service) → tries 32px, 48px, 64px, then largest available

// For specific size
getIconForSize(service, 32) → gets 32px version (prefers SVG)
```

### Search Behavior

**Before:**
- Search + Category filter = confusing results
- Had to clear filters manually

**After:**
- Search = ONLY search results (category ignored)
- Clear search button
- Shows result count

## Usage

### 1. Organize Icons by Size

AWS Architecture Icons typically come with multiple sizes:

```
public/aws-icons/
├── Arch_Amazon-EC2_16.svg
├── Arch_Amazon-EC2_32.svg
├── Arch_Amazon-EC2_48.svg
└── Arch_Amazon-EC2_64.svg
```

### 2. Generate Manifest

```bash
npm run icons:generate
```

The script will:
- Detect sizes from filenames
- Group icons by service name
- Create size variants

### 3. Icons Auto-Select Appropriate Sizes

- **Sidebar**: 16px icons (or smallest available)
- **Canvas nodes**: 32px+ icons (or largest available)
- **Drag & drop**: Switches from 16px → 32px automatically

## File Changes

### Modified Files

1. **`scripts/generate-icons-manifest.js`**
   - Added `extractServiceInfo()` to detect sizes
   - Groups icons by service name
   - Stores all size variants

2. **`src/hooks/useIconsManifest.ts`**
   - New `IconVariant` and updated `IconService` types
   - Added `getSmallIcon()` - gets 16px for sidebar
   - Added `getLargeIcon()` - gets 32px+ for canvas
   - Added `getIconForSize()` - gets specific size

3. **`src/components/icons/ServicePalette.tsx`**
   - Uses `getSmallIcon()` for sidebar display (16px)
   - Uses `getLargeIcon()` for canvas nodes (32px+)
   - Search now shows ONLY results (ignores category)
   - Added clear search button

## Benefits

### Performance
- Smaller icons (16px) in sidebar = faster loading
- Larger icons (32px+) on canvas = better visibility
- Optimal file size for each context

### User Experience
- Clearer search results
- Better visual hierarchy
- Icons sized appropriately for context

### Flexibility
- Supports any icon size (16, 32, 48, 64, etc.)
- Automatic fallback to available sizes
- Works with missing sizes gracefully

## Example Output

### Icon Generation
```
npm run icons:generate

🔍 Scanning for AWS icons...
📦 Found 500 icons

✅ Amazon EC2 16px (Compute)
✅ Amazon EC2 32px (Compute)
✅ Amazon S3 16px (Storage)
✅ Amazon S3 64px (Storage)
...

✨ Icon optimization complete!
```

### In the App

**Sidebar:**
- Shows Amazon EC2 with 16px icon ✓
- Small, fits grid nicely ✓

**Canvas Node:**
- Same service uses 32px icon ✓
- Larger, more visible ✓

**Search:**
- Type "EC2" → Shows only EC2 results ✓
- Ignores category filter ✓
- Click X to clear search ✓

## Migration Guide

### If You Already Have Icons

1. Re-run the generation script:
   ```bash
   npm run icons:generate
   ```

2. Old manifest format will be automatically upgraded

3. Test in browser to verify sizes

### If Sizes Not Detected

The script looks for patterns like:
- `_16`, `_32`, `_48`, `_64` in filenames
- If not found, defaults to size `64`

You can manually rename files to match this pattern.

## Troubleshooting

**Icons not showing correct size?**
- Check filename has size suffix (e.g., `icon_16.svg`)
- Re-run `npm run icons:generate`
- Clear browser cache

**Sidebar icons too large?**
- Only 16px variants will be shown
- Falls back to smallest available if no 16px version

**Canvas icons too small?**
- System prefers 32px, 48px, or 64px
- Falls back to largest available

---

Updated: 2025-10-10
