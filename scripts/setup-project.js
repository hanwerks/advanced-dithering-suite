#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Project Structure Setup Script
 * Creates the complete directory structure for the Advanced Dithering Suite
 */

const directories = [
  // Source directories
  'src/components/Header',
  'src/components/ImagePreview',
  'src/components/ImageSection', 
  'src/components/ControlsPanel',
  'src/components/DebugConsole',
  'src/components/ProcessingOverlay',
  'src/components/MatrixEditor',
  'src/components/PaletteEditor',
  'src/components/NoiseControls',
  'src/components/ParameterPanel',
  'src/components/common',
  
  // Algorithm directories
  'src/algorithms/errorDiffusion',
  'src/algorithms/ordered',
  'src/algorithms/specialized',
  'src/algorithms/noise',
  
  // Utility directories
  'src/utils/imageProcessing',
  'src/utils/colorUtils',
  'src/utils/mathUtils',
  'src/utils/fileUtils',
  
  // Store directories
  'src/stores',
  
  // Hook directories
  'src/hooks',
  
  // Style directories
  'src/styles/components',
  'src/styles/utils',
  
  // Public directories
  'public/icons',
  'public/samples',
  
  // Documentation
  'docs/components',
  'docs/algorithms',
  'docs/guides',
  
  // Scripts
  'scripts',
  
  // Tests
  'tests/components',
  'tests/algorithms',
  'tests/utils'
];

const files = [
  // Component index files
  { path: 'src/components/index.js', content: '// Component exports will be added here\n' },
  { path: 'src/algorithms/index.js', content: '// Algorithm exports will be added here\n' },
  { path: 'src/utils/index.js', content: '// Utility exports will be added here\n' },
  { path: 'src/hooks/index.js', content: '// Hook exports will be added here\n' },
  
  // README files for documentation
  { path: 'src/components/README.md', content: '# Components\n\nReusable UI components for the Advanced Dithering Suite.\n' },
  { path: 'src/algorithms/README.md', content: '# Algorithms\n\nDithering and image processing algorithms.\n' },
  { path: 'src/utils/README.md', content: '# Utilities\n\nHelper functions and utilities.\n' },
  
  // ESLint configuration
  { 
    path: '.eslintrc.json', 
    content: JSON.stringify({
      "env": {
        "browser": true,
        "es2021": true,
        "node": true
      },
      "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended"
      ],
      "parserOptions": {
        "ecmaFeatures": {
          "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
      },
      "plugins": [
        "react",
        "react-hooks",
        "react-refresh"
      ],
      "rules": {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "warn",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "no-unused-vars": "warn"
      },
      "settings": {
        "react": {
          "version": "detect"
        }
      }
    }, null, 2)
  },
  
  // Prettier configuration
  {
    path: '.prettierrc',
    content: JSON.stringify({
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 100,
      "tabWidth": 2,
      "useTabs": false
    }, null, 2)
  }
];

/**
 * Create directory if it doesn't exist
 */
function createDirectory(dirPath) {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  } else {
    console.log(`📁 Directory exists: ${dirPath}`);
  }
}

/**
 * Create file if it doesn't exist
 */
function createFile(filePath, content) {
  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Created file: ${filePath}`);
  } else {
    console.log(`📄 File exists: ${filePath}`);
  }
}

/**
 * Main setup function
 */
function setupProject() {
  console.log('🚀 Setting up Advanced Dithering Suite project structure...\n');
  
  try {
    // Create directories
    console.log('📁 Creating directories...');
    directories.forEach(createDirectory);
    
    console.log('\n📄 Creating files...');
    // Create files
    files.forEach(file => createFile(file.path, file.content));
    
    console.log('\n✨ Project structure setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run dev');
    console.log('3. Start developing components!');
    
  } catch (error) {
    console.error('❌ Error setting up project:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProject();
}

export { setupProject };