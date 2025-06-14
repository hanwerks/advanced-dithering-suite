#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];
if (!componentName) {
  console.log('Usage: npm run create:component ComponentName');
  process.exit(1);
}

const componentDir = path.join('src', 'components', componentName);
fs.mkdirSync(componentDir, { recursive: true });

// Create JSX file
const jsxContent = `import React from 'react';
import './${componentName}.css';

const ${componentName} = ({ 
  // Add your props here
}) => {
  return (
    <div className="${componentName.toLowerCase()}">
      <h3>${componentName} Component</h3>
      {/* Add your component content here */}
    </div>
  );
};

export default ${componentName};
`;

fs.writeFileSync(path.join(componentDir, `${componentName}.jsx`), jsxContent);

// Create CSS file
const cssContent = `.${componentName.toLowerCase()} {
  /* Add your component styles here */
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.${componentName.toLowerCase()} h3 {
  margin: 0 0 15px 0;
  color: #333;
}
`;

fs.writeFileSync(path.join(componentDir, `${componentName}.css`), cssContent);

// Create test file
const testContent = `import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName} Component')).toBeInTheDocument();
  });
});
`;

fs.writeFileSync(path.join(componentDir, `${componentName}.test.jsx`), testContent);

console.log(`✅ Created component: ${componentName}`);
console.log(`📁 Location: ${componentDir}`);
console.log(`📝 Files created:`);
console.log(`   - ${componentName}.jsx`);
console.log(`   - ${componentName}.css`);
console.log(`   - ${componentName}.test.jsx`);
