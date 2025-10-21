import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const ROOT_DIR = path.resolve('.');
const METADATA_FILE = path.join(ROOT_DIR, 'file-metadata.json');
const IGNORE_PATTERNS = ['node_modules', '.git', '.next', 'dist', 'build', '*.log', '*.lock', '*.tsbuildinfo'];
const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];

// Helper: Check if file should be ignored
function shouldIgnore(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  return IGNORE_PATTERNS.some(pattern => relativePath.includes(pattern)) ||
         BINARY_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

// Helper: Get language from extension
function getLanguage(ext) {
  const langMap = {
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
    '.mjs': 'javascript'
  };
  return langMap[ext] || 'unknown';
}

// Helper: Get framework from imports/content
function getFramework(content, ext) {
  if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
    if (content.includes('from \'next\'') || content.includes('from "next"') ||
        /import.*next/.test(content) || content.includes('NextPage') ||
        content.includes('getServerSideProps') || content.includes('getStaticProps')) return 'nextjs';
    if (content.includes('from \'react\'') || content.includes('from "react"') ||
        content.includes('React.') || content.includes('useState') ||
        content.includes('useEffect') || content.includes('JSX.Element')) return 'react';
    if (content.includes('from \'firebase\'') || content.includes('from "firebase"') ||
        content.includes('firebase/') || content.includes('initializeApp')) return 'firebase';
    if (content.includes('from \'express\'') || content.includes('from "express"') ||
        content.includes('express()') || content.includes('app.listen')) return 'express';
    if (content.includes('from \'@mui\'') || content.includes('from \'mui\'') ||
        content.includes('@mui/') || content.includes('Material-UI')) return 'material-ui';
    if (content.includes('from \'@radix-ui\'') || content.includes('from "radix-ui"') ||
        content.includes('@radix-ui/')) return 'radix-ui';
    if (content.includes('tailwind') || content.includes('Tailwind') ||
        /className=.*bg-/.test(content) || /className=.*text-/.test(content)) return 'tailwind';
  }
  if (ext === '.json') {
    if (content.includes('"next"') || content.includes('next.config')) return 'nextjs';
    if (content.includes('"react"')) return 'react';
    if (content.includes('"firebase"')) return 'firebase';
  }
  return null;
}

// Helper: Get scope from path
function getScope(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (relativePath.startsWith('apps/web')) return 'frontend';
  if (relativePath.startsWith('services/api')) return 'backend';
  if (relativePath.startsWith('functions')) return 'serverless';
  if (relativePath.startsWith('packages')) return 'shared';
  if (relativePath.startsWith('docs')) return 'documentation';
  if (relativePath.startsWith('scripts')) return 'automation';
  return 'other';
}

// Helper: Get folder from path
function getFolder(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const parts = relativePath.split(path.sep);
  if (parts.length > 1) {
    const folder = parts[parts.length - 2];
    if (folder === 'components') return 'ui';
    if (folder === 'lib') return 'utilities';
    if (folder === 'hooks') return 'logic';
    if (folder === 'routes') return 'api';
    return folder;
  }
  return 'root';
}

// Helper: Get file action from content
function getAction(content, ext, filename) {
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    if (content.includes('export default function') || content.includes('function ') && content.includes('return') ||
        content.includes('const.*=.*=>') || content.includes('return.*<')) return 'renders';
    if (content.includes('useState') || content.includes('useEffect') || content.includes('useReducer') ||
        content.includes('useContext') || content.includes('useMemo') || content.includes('useCallback')) return 'manages';
    if (content.includes('const ') && content.includes('=') && !content.includes('function') &&
        !content.includes('=>') && !content.includes('useState')) return 'defines';
    if (content.includes('router.') || content.includes('fetch(') || content.includes('axios') ||
        content.includes('api/') || content.includes('http')) return 'handles';
    if (filename.includes('config') || filename.includes('setup') || content.includes('export.*config')) return 'configures';
    if (content.includes('export.*default') || content.includes('export.*const') ||
        content.includes('export.*function')) return 'exports';
    if (content.includes('import') && content.includes('from')) return 'imports';
    if (content.includes('interface') || content.includes('type ') || content.includes('enum')) return 'types';
    if (content.includes('class ') || content.includes('extends')) return 'classes';
  }
  if (ext === '.json') return 'stores';
  if (ext === '.md') return 'documents';
  if (ext === '.sh') return 'executes';
  if (ext === '.yml' || ext === '.yaml') return 'configures';
  if (ext === '.css' || ext === '.scss') return 'styles';
  return 'contains';
}

// Helper: Get attributes from content
function getAttributes(content, ext, filename) {
  const attrs = [];
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    if (content.includes('Button') || filename.includes('button')) attrs.push('button');
    if (content.includes('Chart') || content.includes('Recharts') || filename.includes('chart')) attrs.push('chart');
    if (content.includes('Wizard') || filename.includes('wizard')) attrs.push('wizard');
    if (content.includes('firebase') || content.includes('Firebase') || filename.includes('firebase')) attrs.push('firebase');
    if (content.includes('auth') || content.includes('Auth') || filename.includes('auth')) attrs.push('authentication');
    if (content.includes('schedule') || content.includes('Schedule') || filename.includes('schedule')) attrs.push('scheduling');
    if (content.includes('useState') || content.includes('useEffect')) attrs.push('stateful');
    if (content.includes('useMemo') || content.includes('useCallback')) attrs.push('optimized');
    if (content.includes('React.memo') || content.includes('memo(')) attrs.push('memoized');
    if (content.includes('async') || content.includes('Promise') || content.includes('await')) attrs.push('asynchronous');
    if (content.includes('error') || content.includes('Error') || content.includes('catch')) attrs.push('error-handling');
    if (content.includes('test') || content.includes('describe') || content.includes('it(')) attrs.push('testing');
    if (content.includes('mock') || filename.includes('mock')) attrs.push('mocking');
    if (content.includes('api') || content.includes('API') || content.includes('fetch')) attrs.push('api-integration');
    if (content.includes('database') || content.includes('firestore') || content.includes('collection')) attrs.push('database');
    if (content.includes('validation') || content.includes('zod') || content.includes('schema')) attrs.push('validation');
    if (content.includes('middleware') || filename.includes('middleware')) attrs.push('middleware');
    if (content.includes('route') || content.includes('router') || filename.includes('route')) attrs.push('routing');
  }
  if (filename.includes('test') || filename.includes('spec')) attrs.push('testing');
  if (filename.includes('config')) attrs.push('configuration');
  if (filename.includes('util') || filename.includes('helper')) attrs.push('utility');
  if (filename.includes('hook')) attrs.push('custom-hook');
  if (filename.includes('component')) attrs.push('component');
  if (filename.includes('page')) attrs.push('page');
  if (filename.includes('layout')) attrs.push('layout');
  if (filename.includes('service')) attrs.push('service');
  if (filename.includes('model') || filename.includes('schema')) attrs.push('data-model');
  return attrs.length > 0 ? attrs : null;
}

// Main function
async function generateMetadata() {
  console.log('Starting file metadata generation...');
  const startTime = Date.now();

  const metadata = {};
  let fileCount = 0;

  // Recursive file traversal
  async function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await traverse(filePath);
      } else if (!shouldIgnore(filePath)) {
        const relativePath = path.relative(ROOT_DIR, filePath);
        const ext = path.extname(filePath);
        const filename = path.basename(filePath, ext);

        let content = '';
        try {
          content = fs.readFileSync(filePath, 'utf-8');
        } catch (e) {
          console.warn(`Skipping ${relativePath}: ${e.message}`);
          continue;
        }

        const language = getLanguage(ext);
        const framework = getFramework(content, ext);
        const scope = getScope(filePath);
        const folder = getFolder(filePath);
        const action = getAction(content, ext, filename);
        const attributes = getAttributes(content, ext, filename);

        metadata[relativePath] = {
          language,
          ...(framework && { framework }),
          scope,
          folder,
          action,
          ...(attributes && { attributes })
        };

        fileCount++;
      }
    }
  }

  await traverse(ROOT_DIR);

  // Write metadata
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`Metadata generated for ${fileCount} files in ${duration.toFixed(2)}s.`);
  console.log(`Average time per file: ${(duration / fileCount * 1000).toFixed(2)}ms.`);

  // Basic accuracy check (sample)
  const sampleKeys = Object.keys(metadata).slice(0, 5);
  console.log('Sample metadata:');
  sampleKeys.forEach(key => console.log(`${key}: ${JSON.stringify(metadata[key])}`));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMetadata().catch(console.error);
}

export { generateMetadata };
