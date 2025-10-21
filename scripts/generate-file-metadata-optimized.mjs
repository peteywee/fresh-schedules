import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const ROOT_DIR = path.resolve('.');
const METADATA_FILE = path.join(ROOT_DIR, 'file-metadata.json');
const INDEX_FILE = path.join(ROOT_DIR, 'file-metadata-index.json');
const VISUALIZER_FILE = path.join(ROOT_DIR, 'docs', 'visualizer.html');
const ACTION_SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts', 'actions');
const IGNORE_FILE = path.join(ROOT_DIR, '.filetagignore');
const CONCURRENCY = 4;

// Load custom ignore patterns
let CUSTOM_IGNORE_PATTERNS = [];
try {
  const ignoreContent = fs.readFileSync(IGNORE_FILE, 'utf-8');
  CUSTOM_IGNORE_PATTERNS = ignoreContent.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
} catch (e) {
  console.log('No .filetagignore file found, using default patterns.');
}

// Default ignore patterns
const DEFAULT_IGNORE_PATTERNS = ['node_modules', '.git', '.next', 'dist', 'build', '*.log', '*.lock', '*.tsbuildinfo'];

// Combine ignore patterns
const IGNORE_PATTERNS = [...DEFAULT_IGNORE_PATTERNS, ...CUSTOM_IGNORE_PATTERNS];

// Binary extensions
const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar', '.gz'];

// Enhanced language map
const LANGUAGE_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.json': 'json',
  '.md': 'markdown',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.sh': 'shell',
  '.py': 'python',
  '.java': 'java',
  '.php': 'php',
  '.rb': 'ruby',
  '.rs': 'rust',
  '.go': 'go',
  '.cpp': 'cpp',
  '.c': 'c',
  '.mjs': 'javascript',
  '.mts': 'typescript',
  '.cts': 'typescript'
};

// Simple, reliable pattern detection
const SIMPLE_PATTERNS = {
  // File type detection by extension and content
  'react-component': (content, filename, ext) =>
    ['.jsx', '.tsx'].includes(ext) && (
      content.includes('export default') ||
      content.includes('React.') ||
      content.includes('jsx') ||
      filename.includes('component')
    ),

  'react-hook': (content, filename) =>
    filename.startsWith('use') && filename[3] === filename[3]?.toUpperCase() ||
    content.includes('useState') ||
    content.includes('useEffect'),

  'api-route': (content, filename, ext) =>
    ['.js', '.ts', '.mjs'].includes(ext) && (
      content.includes('router.') ||
      content.includes('app.get') ||
      content.includes('app.post') ||
      content.includes('fetch(') ||
      content.includes('axios.') ||
      filename.includes('route') ||
      filename.includes('api')
    ),

  'config-file': (content, filename) =>
    filename.includes('config') ||
    filename.includes('settings') ||
    content.includes('export default') && (
      content.includes('= {') ||
      content.includes('= [')
    ),

  'test-file': (content, filename) =>
    filename.includes('.test.') ||
    filename.includes('.spec.') ||
    content.includes('describe(') ||
    content.includes('it(') ||
    content.includes('test('),

  'utility-file': (content, filename) =>
    filename.includes('util') ||
    filename.includes('helper') ||
    content.includes('export const') ||
    content.includes('export function'),

  'model-file': (content, filename) =>
    filename.includes('model') ||
    content.includes('interface ') ||
    content.includes('type ') ||
    content.includes('class '),

  'style-file': (content, filename, ext) =>
    ['.css', '.scss', '.sass', '.less'].includes(ext),

  'documentation': (content, filename, ext) =>
    ['.md', '.txt', '.rst'].includes(ext),

  'script-file': (content, filename, ext) =>
    ['.sh', '.bash', '.ps1', '.bat'].includes(ext) ||
    (ext === '.mjs' && content.includes('#!/'))
};

// Framework detection (simple keyword matching)
const FRAMEWORK_KEYWORDS = {
  'nextjs': ['next', 'NextPage', 'getServerSideProps', 'getStaticProps'],
  'react': ['react', 'React', 'jsx', 'tsx', 'useState', 'useEffect'],
  'firebase': ['firebase', 'firestore', 'auth', 'storage'],
  'express': ['express', 'router', 'middleware'],
  'nestjs': ['@nestjs', 'Controller', 'Module', 'Service'],
  'angular': ['@angular', 'Component', 'NgModule'],
  'vue': ['vue', 'Vue', 'template', 'script setup'],
  'svelte': ['svelte', 'Svelte'],
  'django': ['django', 'models', 'views', 'urls'],
  'flask': ['flask', 'Flask', 'route'],
  'fastapi': ['fastapi', 'FastAPI', 'APIRouter'],
  'spring': ['spring', 'Spring', '@Controller', '@Service'],
  'rails': ['rails', 'Rails', 'ActiveRecord'],
  'laravel': ['laravel', 'Laravel', 'Eloquent']
};

// Helper: Check if file should be ignored
function shouldIgnore(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(relativePath);
    }
    return relativePath.includes(pattern);
  }) || BINARY_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

// Helper: Get language
function getLanguage(ext) {
  return LANGUAGE_MAP[ext] || 'unknown';
}

// Helper: Get framework
function getFramework(content) {
  for (const [framework, keywords] of Object.entries(FRAMEWORK_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return framework;
    }
  }
  return null;
}

// Helper: Get scope
function getScope(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (relativePath.startsWith('apps/web')) return 'frontend';
  if (relativePath.startsWith('services/api')) return 'backend';
  if (relativePath.startsWith('functions')) return 'serverless';
  if (relativePath.startsWith('packages')) return 'shared';
  if (relativePath.startsWith('docs')) return 'documentation';
  if (relativePath.startsWith('scripts')) return 'automation';
  if (relativePath.startsWith('tests')) return 'testing';
  return 'other';
}

// Helper: Get folder
function getFolder(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const parts = relativePath.split(path.sep);
  if (parts.length > 1) {
    const folder = parts[parts.length - 2];
    if (folder === 'components') return 'ui';
    if (folder === 'lib') return 'utilities';
    if (folder === 'hooks') return 'logic';
    if (folder === 'routes') return 'api';
    if (folder === 'models') return 'data';
    if (folder === 'controllers') return 'logic';
    if (folder === 'services') return 'logic';
    if (folder === 'utils') return 'utilities';
    if (folder === 'helpers') return 'utilities';
    return folder;
  }
  return 'root';
}

// Helper: Get component type
function getComponentType(content, filename, ext) {
  for (const [type, patternFunc] of Object.entries(SIMPLE_PATTERNS)) {
    if (patternFunc(content, filename, ext)) {
      return type;
    }
  }
  return null;
}

// Helper: Get action (simplified)
function getAction(content, ext, filename) {
  if (content.includes('export default') && (content.includes('function') || content.includes('=>'))) {
    return 'renders';
  }
  if (content.includes('useState') || content.includes('useEffect')) {
    return 'manages';
  }
  if (content.includes('interface ') || content.includes('type ')) {
    return 'defines';
  }
  if (content.includes('router.') || content.includes('fetch(') || content.includes('axios.')) {
    return 'handles';
  }
  if (filename.includes('config') || content.includes('export default {')) {
    return 'configures';
  }
  if (content.includes('describe(') || content.includes('it(')) {
    return 'tests';
  }
  if (['.sh', '.bash'].includes(ext) || content.includes('#!/')) {
    return 'executes';
  }
  if (['.json', '.yml', '.yaml'].includes(ext)) {
    return 'stores';
  }
  if (['.md', '.txt'].includes(ext)) {
    return 'documents';
  }
  return 'contains';
}

// Helper: Get attributes
function getAttributes(content, filename, ext) {
  const attrs = [];
  if (filename.includes('button')) attrs.push('button');
  if (filename.includes('chart')) attrs.push('chart');
  if (filename.includes('wizard')) attrs.push('wizard');
  if (content.includes('firebase')) attrs.push('firebase');
  if (content.includes('auth')) attrs.push('authentication');
  if (content.includes('schedule')) attrs.push('scheduling');
  if (filename.includes('test') || filename.includes('spec')) attrs.push('testing');
  if (filename.includes('config')) attrs.push('configuration');
  if (content.includes('export default')) attrs.push('exported');
  if (content.includes('import')) attrs.push('imports');
  return attrs.length > 0 ? attrs : null;
}

// Helper: Extract dependencies
function getDependencies(content, ext) {
  const deps = [];
  if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
    const importMatches = content.match(/import.*from ['"]([^'"]+)['"]/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const dep = match.match(/from ['"]([^'"]+)['"]/);
        if (dep && dep[1] && !dep[1].startsWith('.')) {
          deps.push(dep[1]);
        }
      });
    }
  }
  return deps.length > 0 ? deps : null;
}

// Helper: Get actionable tags
function getActionableTags(content, filename, ext, componentType) {
  const tags = [];

  // Component-specific tags
  if (componentType === 'ui-component') {
    tags.push('interactive', 'renderable');
  } else if (componentType === 'hook') {
    tags.push('stateful', 'reusable');
  } else if (componentType === 'service') {
    tags.push('business-logic', 'injectable');
  } else if (componentType === 'api-route') {
    tags.push('endpoint', 'http-handler');
  } else if (componentType === 'test') {
    tags.push('verifiable', 'qa');
  } else if (componentType === 'config') {
    tags.push('environment', 'settings');
  }

  // Content-based tags
  if (content.includes('async') || content.includes('Promise')) {
    tags.push('async');
  }
  if (content.includes('export default')) {
    tags.push('entry-point');
  }
  if (content.includes('console.log') || content.includes('logger')) {
    tags.push('logging');
  }
  if (content.includes('error') || content.includes('catch')) {
    tags.push('error-handling');
  }

  return tags.length > 0 ? tags : null;
}

// Process single file
function processFile(filePath, branch = 'main') {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const ext = path.extname(filePath);
  const filename = path.basename(filePath, ext);

  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }

  const language = getLanguage(ext);
  const framework = getFramework(content);
  const scope = getScope(filePath);
  const folder = getFolder(filePath);
  const componentType = getComponentType(content, filename, ext);
  const action = getAction(content, ext, filename);
  const attributes = getAttributes(content, filename, ext);
  const dependencies = getDependencies(content, ext);
  const actionableTags = getActionableTags(content, filename, ext, componentType);

  return {
    path: relativePath,
    branch,
    language,
    ...(framework && { framework }),
    scope,
    folder,
    ...(componentType && { componentType }),
    action,
    ...(attributes && { attributes }),
    ...(dependencies && { dependencies }),
    ...(actionableTags && { actionableTags }),
    size: fs.statSync(filePath).size,
    modified: fs.statSync(filePath).mtime.toISOString()
  };
}

// Get Git branches
function getBranches() {
  try {
    const branches = execSync('git branch -a', { encoding: 'utf-8' });
    return branches.split('\n')
      .map(line => line.trim().replace(/^\*\s*/, '').replace(/^remotes\/origin\//, ''))
      .filter(line => line && !line.startsWith('remotes/') && line !== 'HEAD');
  } catch (e) {
    console.warn('Could not get Git branches, using current branch only.');
    return ['main'];
  }
}

// Checkout branch
function checkoutBranch(branch) {
  try {
    execSync(`git checkout ${branch}`, { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.warn(`Could not checkout branch ${branch}`);
    return false;
  }
}

// Generate actionable diff and action scripts
function generateActionScripts(metadata) {
  fs.mkdirSync(ACTION_SCRIPTS_DIR, { recursive: true });

  // Script to find similar files across branches
  const similarFilesScript = `#!/usr/bin/env node
// Find similar files across branches
const fs = require('fs');
const path = require('path');

const metadata = JSON.parse(fs.readFileSync('file-metadata.json', 'utf-8'));
const filesByType = {};

Object.values(metadata).forEach(m => {
  if (m.componentType) {
    if (!filesByType[m.componentType]) filesByType[m.componentType] = {};
    if (!filesByType[m.componentType][m.branch]) filesByType[m.componentType][m.branch] = [];
    filesByType[m.componentType][m.branch].push(m.path);
  }
});

console.log('Similar Files Across Branches:');
Object.entries(filesByType).forEach(([type, branches]) => {
  console.log(\`\\n\${type.toUpperCase()}:\`);
  Object.entries(branches).forEach(([branch, files]) => {
    console.log(\`  \${branch}: \${files.length} files\`);
    files.slice(0, 3).forEach(f => console.log(\`    - \${f}\`));
    if (files.length > 3) console.log(\`    ... and \${files.length - 3} more\`);
  });
});
`;
  fs.writeFileSync(path.join(ACTION_SCRIPTS_DIR, 'find-similar-files.mjs'), similarFilesScript);

  // Script to generate diff commands for similar files
  const diffScript = `#!/usr/bin/env node
// Generate diff commands for similar files
const fs = require('fs');

const metadata = JSON.parse(fs.readFileSync('file-metadata.json', 'utf-8'));
const filesByType = {};

Object.values(metadata).forEach(m => {
  if (m.componentType) {
    if (!filesByType[m.componentType]) filesByType[m.componentType] = {};
    if (!filesByType[m.componentType][m.branch]) filesByType[m.componentType][m.branch] = [];
    filesByType[m.componentType][m.branch].push(m.path);
  }
});

console.log('Diff Commands for Similar Files:');
Object.entries(filesByType).forEach(([type, branches]) => {
  const branchNames = Object.keys(branches);
  if (branchNames.length > 1) {
    console.log(\`\\n\${type.toUpperCase()} DIFFS:\`);
    for (let i = 0; i < branchNames.length - 1; i++) {
      for (let j = i + 1; j < branchNames.length; j++) {
        const branch1 = branchNames[i];
        const branch2 = branchNames[j];
        const files1 = branches[branch1];
        const files2 = branches[branch2];

        // Find files with similar names
        files1.forEach(file1 => {
          const base1 = file1.split('/').pop();
          files2.forEach(file2 => {
            const base2 = file2.split('/').pop();
            if (base1 === base2) {
              console.log(\`git diff \${branch1}:\${file1} \${branch2}:\${file2}\`);
            }
          });
        });
      }
    }
  }
});
`;
  fs.writeFileSync(path.join(ACTION_SCRIPTS_DIR, 'generate-diff-commands.mjs'), diffScript);

  // Script to find all UI components
  const uiComponents = Object.values(metadata).filter(m => m.componentType === 'react-component');
  const uiScript = `#!/usr/bin/env node
// Find all React components
const components = ${JSON.stringify(uiComponents.map(c => c.path), null, 2)};
console.log('React Components:');
components.forEach(c => console.log(' - ' + c));

// Action: Run automated UI tests on these components
console.log('\\nSuggested Actions:');
console.log('1. Run component tests: npm test -- --testPathPattern=components');
console.log('2. Check for accessibility: npm run a11y-check');
console.log('3. Generate component docs: npm run storybook');
`;
  fs.writeFileSync(path.join(ACTION_SCRIPTS_DIR, 'find-ui-components.mjs'), uiScript);

  // Script to find all API routes
  const apiRoutes = Object.values(metadata).filter(m => m.componentType === 'api-route');
  const apiScript = `#!/usr/bin/env node
// Find all API routes
const routes = ${JSON.stringify(apiRoutes.map(r => r.path), null, 2)};
console.log('API Routes:');
routes.forEach(r => console.log(' - ' + r));

// Action: Test API endpoints
console.log('\\nSuggested Actions:');
console.log('1. Run API tests: npm run test:api');
console.log('2. Check API documentation: npm run api-docs');
console.log('3. Validate OpenAPI spec: npm run validate-api');
`;
  fs.writeFileSync(path.join(ACTION_SCRIPTS_DIR, 'find-api-routes.mjs'), apiScript);

  // Script to find all test files
  const testFiles = Object.values(metadata).filter(m => m.componentType === 'test-file');
  const testScript = `#!/usr/bin/env node
// Find all test files
const tests = ${JSON.stringify(testFiles.map(t => t.path), null, 2)};
console.log('Test Files:');
tests.forEach(t => console.log(' - ' + t));

// Action: Run test coverage analysis
console.log('\\nSuggested Actions:');
console.log('1. Run all tests: npm test');
console.log('2. Generate coverage: npm run test:coverage');
console.log('3. Check test quality: npm run test:quality');
`;
  fs.writeFileSync(path.join(ACTION_SCRIPTS_DIR, 'find-test-files.mjs'), testScript);

  console.log('✅ Generated actionable scripts in scripts/actions/');
  console.log('   - find-similar-files.mjs: Find similar files across branches');
  console.log('   - generate-diff-commands.mjs: Generate git diff commands for similar files');
  console.log('   - find-ui-components.mjs: Find React components with test suggestions');
  console.log('   - find-api-routes.mjs: Find API routes with testing suggestions');
  console.log('   - find-test-files.mjs: Find test files with coverage suggestions');
}

// Main function
async function generateMetadata() {
  console.log('🚀 Starting enhanced actionable file metadata generation...');
  const startTime = Date.now();

  const branches = getBranches();
  console.log(`📋 Found ${branches.length} branches: ${branches.join(', ')}`);

  const allMetadata = {};
  let totalFiles = 0;

  // Process each branch
  for (const branch of branches) {
    console.log(`🔍 Scanning branch: ${branch}`);
    if (!checkoutBranch(branch)) continue;

    const branchMetadata = {};
    let branchFiles = 0;

    // Recursive traversal with concurrency
    async function traverse(dir) {
      const files = fs.readdirSync(dir);
      const filePromises = [];

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          await traverse(filePath);
        } else if (!shouldIgnore(filePath)) {
          filePromises.push(processFile(filePath, branch));
          if (filePromises.length >= CONCURRENCY) {
            const results = await Promise.all(filePromises);
            results.forEach(result => {
              if (result) {
                branchMetadata[result.path] = result;
                branchFiles++;
              }
            });
            filePromises.length = 0;
          }
        }
      }

      // Process remaining files
      if (filePromises.length > 0) {
        const results = await Promise.all(filePromises);
        results.forEach(result => {
          if (result) {
            branchMetadata[result.path] = result;
            branchFiles++;
          }
        });
      }
    }

    await traverse(ROOT_DIR);

    // Merge branch metadata
    Object.assign(allMetadata, branchMetadata);
    totalFiles += branchFiles;
    console.log(`✅ Processed ${branchFiles} files in branch ${branch}`);
  }

  // Checkout back to original branch
  try {
    execSync('git checkout -', { stdio: 'inherit' });
  } catch (e) {
    // Ignore
  }

  // Write metadata
  fs.writeFileSync(METADATA_FILE, JSON.stringify(allMetadata, null, 2));

  // Generate index
  const index = {};
  for (const [path, meta] of Object.entries(allMetadata)) {
    if (!index[meta.language]) index[meta.language] = [];
    index[meta.language].push(path);
    if (meta.framework) {
      if (!index[meta.framework]) index[meta.framework] = [];
      index[meta.framework].push(path);
    }
    if (meta.componentType) {
      if (!index[meta.componentType]) index[meta.componentType] = [];
      index[meta.componentType].push(path);
    }
    if (meta.scope) {
      if (!index[meta.scope]) index[meta.scope] = [];
      index[meta.scope].push(path);
    }
    if (meta.actionableTags) {
      meta.actionableTags.forEach(tag => {
        if (!index[tag]) index[tag] = [];
        index[tag].push(path);
      });
    }
  }
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

  // Generate visualizer
  const visualizerHtml = generateVisualizer(allMetadata, index);
  fs.mkdirSync(path.dirname(VISUALIZER_FILE), { recursive: true });
  fs.writeFileSync(VISUALIZER_FILE, visualizerHtml);

  // Generate action scripts
  generateActionScripts(allMetadata);

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`✅ Metadata generated for ${totalFiles} files across ${branches.length} branches in ${duration.toFixed(2)}s.`);
  console.log(`📊 Average time per file: ${(duration / totalFiles * 1000).toFixed(2)}ms.`);

  // Accuracy check
  let accurateCount = 0;
  for (const meta of Object.values(allMetadata)) {
    if (meta.language !== 'unknown' && meta.action !== 'contains') accurateCount++;
  }
  const accuracy = (accurateCount / totalFiles * 100).toFixed(2);
  console.log(`🎯 Estimated accuracy: ${accuracy}%`);

  console.log('\n📋 Actionable Features:');
  console.log('  - Run scripts/actions/find-similar-files.mjs to find similar files across branches');
  console.log('  - Run scripts/actions/generate-diff-commands.mjs to get git diff commands for similar files');
  console.log('  - Run scripts/actions/find-ui-components.mjs to list React components with test suggestions');
  console.log('  - Run scripts/actions/find-api-routes.mjs to list API routes with testing suggestions');
  console.log('  - Run scripts/actions/find-test-files.mjs to list test files with coverage suggestions');
  console.log('  - Open docs/visualizer.html for interactive visualization');
  console.log('  - Use file-metadata-index.json for programmatic queries');

  // Sample actionable queries
  console.log('\n🔍 Sample Actionable Queries:');
  const reactComponents = Object.values(allMetadata).filter(m => m.componentType === 'react-component');
  console.log(`  - Found ${reactComponents.length} React components ready for automated testing`);
  const apiRoutes = Object.values(allMetadata).filter(m => m.componentType === 'api-route');
  console.log(`  - Found ${apiRoutes.length} API routes that need endpoint testing`);
  const testFiles = Object.values(allMetadata).filter(m => m.componentType === 'test-file');
  console.log(`  - Found ${testFiles.length} test files for coverage analysis`);
}

// Generate HTML visualizer
function generateVisualizer(metadata, index) {
  const languages = Object.keys(index).filter(k => !['frontend', 'backend', 'shared', 'documentation', 'automation', 'testing', 'serverless', 'other'].includes(k) && !k.includes('-'));
  const scopes = ['frontend', 'backend', 'serverless', 'shared', 'documentation', 'automation', 'testing', 'other'];
  const componentTypes = Object.keys(index).filter(k => k.includes('-') && !k.includes('actionable'));

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Actionable File Metadata Visualizer</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .stats { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat { background: #f0f0f0; padding: 10px; border-radius: 5px; min-width: 150px; }
    .chart { margin: 20px 0; }
    .bar { height: 20px; margin: 2px 0; background: #007bff; color: white; padding: 2px 5px; border-radius: 3px; }
    .filter { margin-bottom: 20px; }
    select { padding: 5px; margin-right: 10px; }
    .actions { background: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .action-btn { background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; margin: 2px; }
  </style>
</head>
<body>
  <h1>Actionable File Metadata Visualizer</h1>

  <div class="actions">
    <h3>🚀 Actionable Features</h3>
    <p>Use these buttons to perform automated actions on your codebase:</p>
    <button class="action-btn" onclick="runAction('find-ui-components')">Find UI Components</button>
    <button class="action-btn" onclick="runAction('find-api-routes')">Find API Routes</button>
    <button class="action-btn" onclick="runAction('find-test-files')">Find Test Files</button>
    <button class="action-btn" onclick="runAction('analyze-dependencies')">Analyze Dependencies</button>
  </div>

  <div class="stats">
    <div class="stat">Total Files: ${Object.keys(metadata).length}</div>
    <div class="stat">Languages: ${languages.length}</div>
    <div class="stat">Component Types: ${componentTypes.length}</div>
    <div class="stat">Actionable Tags: ${Object.keys(index).filter(k => k.includes('actionable')).length}</div>
  </div>

  <div class="filter">
    <label>Filter by Language: </label>
    <select id="langFilter">
      <option value="">All</option>
      ${languages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}
    </select>
    <label>Filter by Component Type: </label>
    <select id="typeFilter">
      <option value="">All</option>
      ${componentTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
    </select>
  </div>

  <div class="chart">
    <h3>Files by Language</h3>
    ${languages.map(lang => {
      const count = index[lang]?.length || 0;
      const width = (count / Object.keys(metadata).length * 100).toFixed(1);
      return `<div class="bar" style="width: ${width}%">${lang}: ${count}</div>`;
    }).join('')}
  </div>

  <div class="chart">
    <h3>Files by Scope</h3>
    ${scopes.map(scope => {
      const count = index[scope]?.length || 0;
      const width = (count / Object.keys(metadata).length * 100).toFixed(1);
      return `<div class="bar" style="width: ${width}%">${scope}: ${count}</div>`;
    }).join('')}
  </div>

  <div class="chart">
    <h3>Files by Component Type</h3>
    ${componentTypes.map(type => {
      const count = index[type]?.length || 0;
      const width = (count / Object.keys(metadata).length * 100).toFixed(1);
      return `<div class="bar" style="width: ${width}%">${type}: ${count}</div>`;
    }).join('')}
  </div>

  <script>
    function runAction(action) {
      alert('To run this action, execute: node scripts/actions/' + action + '.mjs');
    }

    document.getElementById('langFilter').addEventListener('change', function() {
      const selected = this.value;
      const bars = document.querySelectorAll('.bar');
      bars.forEach(bar => {
        if (!selected || bar.textContent.startsWith(selected + ':')) {
          bar.style.display = 'block';
        } else {
          bar.style.display = 'none';
        }
      });
    });

    document.getElementById('typeFilter').addEventListener('change', function() {
      const selected = this.value;
      const bars = document.querySelectorAll('.bar');
      bars.forEach(bar => {
        if (!selected || bar.textContent.startsWith(selected + ':')) {
          bar.style.display = 'block';
        } else {
          bar.style.display = 'none';
        }
      });
    });
  </script>
</body>
</html>`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMetadata().catch(console.error);
}

export { generateMetadata };
