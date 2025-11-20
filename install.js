const fs = require('fs');
const path = require('path');
const os = require('os');

const extensionName = '7tv-premiere-extension';

function getExtensionsPath() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    return 'C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions';
  } else if (platform === 'darwin') {
    return '/Library/Application Support/Adobe/CEP/extensions';
  } else {
    throw new Error('Unsupported platform');
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const extensionsPath = getExtensionsPath();
  const targetPath = path.join(extensionsPath, extensionName);
  const sourcePath = __dirname;
  
  console.log('Installing 7TV Extension for Premiere Pro...');
  console.log('Source:', sourcePath);
  console.log('Target:', targetPath);
  
  copyDirectory(sourcePath, targetPath);
  
  console.log('\n✓ Installation complete!');
  console.log('\nNext steps:');
  console.log('1. Restart Adobe Premiere Pro');
  console.log('2. Go to Window > Extensions > 7TV Emotes');
  console.log('3. Start browsing and importing emotes!');
} catch (error) {
  console.error('Installation failed:', error.message);
  console.log('\nManual installation:');
  console.log('1. Copy this folder to:', getExtensionsPath());
  console.log('2. Restart Premiere Pro');
  process.exit(1);
}
