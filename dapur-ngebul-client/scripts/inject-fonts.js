#!/usr/bin/env node

/**
 * Post-build script to inject Material Icons font link into HTML files
 * and fix double asset paths in JavaScript bundles
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function injectFontsIntoHTML(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if font link already exists
    if (!content.includes('Material+Icons')) {
      // Find the </head> tag and insert font link before it
      const fontLink = '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">';
      const fontScript = `<script>
(function() {
  // Intercept registerStaticFont and loadAsync to fix material font
  if (typeof window !== 'undefined') {
    const fontSource = { uri: 'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2' };
    
    // Wait for expo to be available
    function interceptExpoFont() {
      if (window.expo && window.expo.modules && window.expo.modules.expoFont) {
        const expoFont = window.expo.modules.expoFont;
        
        // Intercept registerStaticFont
        if (expoFont.registerStaticFont) {
          const originalRegisterStaticFont = expoFont.registerStaticFont;
          expoFont.registerStaticFont = function(fontFamily, source) {
            if (fontFamily === 'material' && (!source || source === null || source === undefined || (typeof source === 'object' && Object.keys(source || {}).length === 0))) {
              source = fontSource;
            }
            try {
              return originalRegisterStaticFont.call(this, fontFamily, source);
            } catch (e) {
              if (fontFamily === 'material') {
                // Silently fail for material font, we're using Google Fonts
                return Promise.resolve();
              }
              throw e;
            }
          };
        }
        
        // Intercept loadAsync if available
        if (expoFont.loadAsync) {
          const originalLoadAsync = expoFont.loadAsync;
          expoFont.loadAsync = function(fonts) {
            if (fonts && typeof fonts === 'object') {
              // Fix material font in fonts object
              if (fonts.material === null || fonts.material === undefined || (typeof fonts.material === 'object' && Object.keys(fonts.material || {}).length === 0)) {
                fonts.material = fontSource;
              }
            }
            return originalLoadAsync.call(this, fonts);
          };
        }
      }
    }
    
    // Try immediately
    interceptExpoFont();
    
    // Also try after a delay
    setTimeout(interceptExpoFont, 0);
    setTimeout(interceptExpoFont, 100);
    
    // Watch for expo object
    let expoObj = window.expo;
    Object.defineProperty(window, 'expo', {
      configurable: true,
      get: function() {
        return expoObj;
      },
      set: function(value) {
        expoObj = value;
        interceptExpoFont();
      }
    });
  }
})();
</script>`;
      const fontStyle = `<style id="material-icons-override">
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}
@font-face {
  font-family: 'MaterialIcons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}
@font-face {
  font-family: 'material';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}
.material-icons, .material-icons-outlined, [class*="material-icons"], [class*="MaterialIcons"], span[data-icon], *[class*="Icon"], *[class*="ExpoVectorIcons"], *[data-testid*="icon"], *[role="img"] {
  font-family: 'Material Icons' !important;
  font-weight: normal !important;
  font-style: normal !important;
  font-size: inherit !important;
  line-height: 1 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  display: inline-block !important;
  white-space: nowrap !important;
  word-wrap: normal !important;
  direction: ltr !important;
  -webkit-font-feature-settings: 'liga' !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  speak: none !important;
  font-variant: normal !important;
  text-rendering: optimizeLegibility !important;
}
</style>`;

      // Insert before </head>
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${fontLink}\n${fontScript}\n${fontStyle}\n</head>`);
        modified = true;
      }
    }

    // Fix double asset paths: /assets/assets/ -> /assets/
    if (content.includes('/assets/assets/')) {
      content = content.replace(/\/assets\/assets\//g, '/assets/');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Processed ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function fixAssetPathsInJS(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix double asset paths in JavaScript files
    if (content.includes('/assets/assets/')) {
      content = content.replace(/\/assets\/assets\//g, '/assets/');
      modified = true;
    }

    // Fix asset image paths: /assets/images/filename.hash.ext -> /assets/hash.ext
    // Match pattern: /assets/images/dapur-ngebul-logo.683bb48849896e4d734b4747632214be.png
    // Replace with: /assets/683bb48849896e4d734b4747632214be.png (keep extension for Surge.sh)
    content = content.replace(/\/assets\/images\/([^.]+)\.([a-f0-9]{32})\.([a-z]+)/g, (match, filename, hash, ext) => {
      modified = true;
      return `/assets/${hash}.${ext}`;
    });

    // Fix MaterialIcons font file paths - block them
    if (content.includes('MaterialIcons') && content.includes('.ttf')) {
      // Replace font file paths with empty string or Google Fonts URL
      content = content.replace(/\/assets\/node_modules\/@expo\/vector-icons\/[^"]+\.ttf/g, '');
      modified = true;
    }

    // Fix font source registration for "material" - prevent error
    // Pattern 1: Object with "material": null or "material": undefined
    // Replace: {"material": null} or {"material": undefined} or {"material": }
    const fontSourceObj = '{"material":{"uri":"https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2"}}';
    content = content.replace(/\{"material"\s*:\s*null\}/g, fontSourceObj);
    content = content.replace(/\{"material"\s*:\s*undefined\}/g, fontSourceObj);
    content = content.replace(/\{"material"\s*:\s*\}/g, fontSourceObj);
    content = content.replace(/\{"material"\s*:\s*void\s*0\}/g, fontSourceObj);
    
    // Pattern 2: registerStaticFont calls
    const fontSource = '{ uri: "https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2" }';
    content = content.replace(/registerStaticFont\(["']material["'],\s*null\)/g, `registerStaticFont("material", ${fontSource})`);
    content = content.replace(/registerStaticFont\(["']material["'],\s*undefined\)/g, `registerStaticFont("material", ${fontSource})`);
    content = content.replace(/registerStaticFont\(["']material["'],\s*\{\s*\}\)/g, `registerStaticFont("material", ${fontSource})`);
    content = content.replace(/registerStaticFont\(["']material["'],\s*void\s*0\)/g, `registerStaticFont("material", ${fontSource})`);
    content = content.replace(/registerStaticFont\(["']material["'],\s*void\s*\(0\)\)/g, `registerStaticFont("material", ${fontSource})`);
    
    // Pattern 3: Check if any font-related patterns were modified
    if (content.includes('registerStaticFont') || content.includes('"material"')) {
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed asset paths in ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function fixAssetFiles() {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return;

  const assetsImagesDir = path.join(assetsDir, 'assets', 'images');
  if (!fs.existsSync(assetsImagesDir)) return;

  // Find all image files in assets/assets/images/
  const imageFiles = fs.readdirSync(assetsImagesDir);
  
  imageFiles.forEach(file => {
    // Extract hash from filename: filename.hash.ext
    const match = file.match(/\.([a-f0-9]{32})\.([a-z]+)$/);
    if (match) {
      const [, hash, ext] = match;
      const sourcePath = path.join(assetsImagesDir, file);
      const targetPath = path.join(assetsDir, `${hash}.${ext}`);
      
      // Copy file with extension for Surge.sh compatibility
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✓ Copied asset: ${file} -> ${hash}.${ext}`);
      }
    }
  });

  // Create _redirects file for Surge.sh (for SPA routing)
  const redirectsPath = path.join(distDir, '_redirects');
  const redirectsContent = `# Surge.sh redirects for SPA
# Redirect all routes to index.html for client-side routing
/*    /index.html   200
`;
  fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');
  console.log('✓ Created _redirects file for Surge.sh');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.html')) {
      injectFontsIntoHTML(filePath);
    } else if (file.endsWith('.js')) {
      fixAssetPathsInJS(filePath);
    }
  });
}

if (fs.existsSync(distDir)) {
  console.log('Processing build files...');
  console.log('- Injecting Material Icons fonts into HTML files...');
  console.log('- Fixing double asset paths...');
  console.log('- Fixing asset files...');
  walkDir(distDir);
  fixAssetFiles();
  console.log('Done!');
} else {
  console.error(`Dist directory not found: ${distDir}`);
  process.exit(1);
}

