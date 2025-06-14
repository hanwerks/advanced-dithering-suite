#!/usr/bin/env node

const { execSync } = require('child_process');

const branches = [
  'feature/conversation-1-image-preview',
  'feature/conversation-2-matrix-editor',
  'feature/conversation-3-noise-controls',
  'feature/conversation-4-palette-editor',
  'feature/conversation-5-algorithms',
  'experiment/conversation-6-new-features',
  'integration/multi-conversation-testing'
];

console.log('🌿 Creating development branches...');

branches.forEach(branch => {
  try {
    execSync(`git checkout -b ${branch}`, { stdio: 'inherit' });
    execSync(`git push -u origin ${branch}`, { stdio: 'inherit' });
    console.log(`✅ Created and pushed: ${branch}`);
  } catch (error) {
    console.log(`⚠️  Branch ${branch} might already exist`);
  }
});

execSync('git checkout main', { stdio: 'inherit' });
console.log('\n🎉 All branches created! Ready for parallel development.');
console.log('\nBranches available:');
branches.forEach(branch => console.log(`  - ${branch}`));
