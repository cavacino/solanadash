#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Solana MCP Dashboard - Deployment Helper\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'server.js',
  'dashboard.html',
  'vercel.json',
  'netlify.toml',
  'README.md'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are present.');
  process.exit(1);
}

console.log('\n✅ All required files found!');

// Check if dependencies are installed
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  if (dependencies.length === 0) {
    console.log('❌ No dependencies found in package.json');
    process.exit(1);
  }
  
  console.log(`✅ Found ${dependencies.length} dependencies:`);
  dependencies.forEach(dep => console.log(`   - ${dep}`));
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test local server
console.log('\n🔧 Testing local server...');
try {
  // Start server in background
  const server = execSync('node server.js', { 
    timeout: 5000,
    stdio: 'pipe'
  });
  console.log('✅ Server starts successfully');
} catch (error) {
  if (error.signal === 'SIGTERM') {
    console.log('✅ Server test completed (timeout expected)');
  } else {
    console.log('❌ Server test failed:', error.message);
    console.log('💡 Make sure to run: npm install');
  }
}

// Check git status
console.log('\n📝 Checking git status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  You have uncommitted changes:');
    console.log(gitStatus);
    console.log('\n💡 Consider committing changes before deployment:');
    console.log('   git add .');
    console.log('   git commit -m "Ready for deployment"');
  } else {
    console.log('✅ All changes committed');
  }
} catch (error) {
  console.log('⚠️  Git not initialized or no repository found');
  console.log('💡 Initialize git: git init && git add . && git commit -m "Initial commit"');
}

// Deployment instructions
console.log('\n🎯 Next Steps for Deployment:\n');

console.log('1️⃣  Push to GitHub:');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/solana-mcp-dashboard.git');
console.log('   git push -u origin main\n');

console.log('2️⃣  Deploy Backend to Vercel:');
console.log('   - Go to https://vercel.com');
console.log('   - Import your GitHub repository');
console.log('   - Deploy (auto-detects Node.js)\n');

console.log('3️⃣  Deploy Frontend to Netlify:');
console.log('   - Go to https://netlify.com');
console.log('   - Import your GitHub repository');
console.log('   - Build command: (empty)');
console.log('   - Publish directory: .\n');

console.log('4️⃣  Connect Dashboard to Server:');
console.log('   - Copy your Vercel URL');
console.log('   - Paste it in the dashboard server configuration\n');

console.log('📖 For detailed instructions, see: COMPLETE_DEPLOYMENT.md');
console.log('🔗 Your dashboard will be live at: https://your-site.netlify.app');

console.log('\n🎉 Ready for deployment! 🚀'); 