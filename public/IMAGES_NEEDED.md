# Images Needed for SEO

You need to create these images and place them in the `/public` folder:

## 1. Social Media Preview (CRITICAL)

**og-image.png** - 1200x630px
- This shows when people share your site on Twitter, LinkedIn, Facebook, Slack, Discord
- Should show your app's interface with AWS icons
- Include text: "AWS Mesh - Architecture Diagram Tool"
- Use brand colors: #ff9900 (AWS orange) and dark background

**Quick way to create:**
1. Take a screenshot of your app with a diagram
2. Resize to 1200x630px
3. Add text overlay
4. Save as `og-image.png`

**Or use Canva:**
- Go to https://www.canva.com
- Search for "Open Graph Image" template
- Upload screenshot of your app
- Add text and branding
- Download as PNG

---

## 2. Favicons (Use Generator)

**Easiest way: Use https://realfavicongenerator.net/**

1. Upload your `favicon.svg` (or create a simple icon)
2. The generator creates ALL these files automatically:
   - `apple-touch-icon.png` (180x180px)
   - `favicon-32x32.png` (32x32px)
   - `favicon-16x16.png` (16x16px)
   - `android-chrome-192x192.png` (192x192px)
   - `android-chrome-512x512.png` (512x512px)

3. Download the ZIP file
4. Extract all images to `/public` folder

**Your favicon should:**
- Be simple and recognizable at small sizes
- Use AWS orange (#ff9900) or your brand colors
- Could be: AWS cloud icon, mesh/network icon, or "AM" letters

---

## 3. Screenshot (Optional but Recommended)

**screenshot.png** - 1280x720px
- Full screenshot of your app in use
- Shows a complete AWS architecture diagram
- Used in structured data for Google
- Can be the same as your README demo image

**How to create:**
1. Open your app
2. Create a nice-looking AWS diagram
3. Take fullscreen screenshot
4. Crop to 1280x720px
5. Save as `screenshot.png`

---

## Quick Checklist

After creating images, verify:

- [ ] `og-image.png` exists in `/public` (1200x630px)
- [ ] `apple-touch-icon.png` exists (180x180px)
- [ ] `favicon-32x32.png` exists (32x32px)
- [ ] `favicon-16x16.png` exists (16x16px)
- [ ] `android-chrome-192x192.png` exists (192x192px)
- [ ] `android-chrome-512x512.png` exists (512x512px)
- [ ] `screenshot.png` exists (1280x720px) - optional
- [ ] `manifest.json` exists (already created)

---

## Testing

After adding images:

1. **Test OG image:**
   - Go to https://www.opengraph.xyz/
   - Enter your URL
   - Verify image shows correctly

2. **Test Twitter Card:**
   - Go to https://cards-dev.twitter.com/validator
   - Enter your URL
   - Verify card preview

3. **Test Facebook:**
   - Go to https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Click "Scrape Again" to refresh cache

4. **Test LinkedIn:**
   - Go to https://www.linkedin.com/post-inspector/
   - Enter your URL
   - Verify preview

---

## Current Status

✅ index.html - Updated with all meta tags
✅ manifest.json - Created
✅ sitemap.xml - Fixed with absolute URLs
✅ robots.txt - Updated
✅ App.tsx - Removed invalid meta tags

❌ og-image.png - **NEEDS TO BE CREATED**
❌ Favicon files - **NEEDS TO BE CREATED**
❌ screenshot.png - Optional

**Priority: Create og-image.png first** - This is most visible to users when sharing your site!
