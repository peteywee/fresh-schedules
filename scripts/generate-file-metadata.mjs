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
    if (content.includes('from \'next\'') || content.includes('from "next"')) return 'nextjs';
    if (content.includes('from \'react\'') || content.includes('from "react"')) return 'react';
    if (content.includes('from \'firebase\'') || content.includes('from "firebase"')) return 'firebase';
    if (content.includes('from \'express\'') || content.includes('from "express"')) return 'express';
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
    if (content.includes('export default function') || content.includes('function ') && content.includes('return')) return 'renders';
    if (content.includes('useState') || content.includes('useEffect')) return 'manages';
    if (content.includes('const ') && content.includes('=') && !content.includes('function')) return 'defines';
    if (content.includes('router.') || content.includes('fetch(')) return 'handles';
    if (filename.includes('config') || filename.includes('setup')) return 'configures';
  }
  if (ext === '.json') return 'stores';
  if (ext === '.md') return 'documents';
  if (ext === '.sh') return 'executes';
  return 'contains';
}

// Helper: Get attributes from content
function getAttributes(content, ext, filename) {
  const attrs = [];
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    if (content.includes('Button') || filename.includes('button')) attrs.push('button');
    if (content.includes('Chart') || filename.includes('chart')) attrs.push('chart');
    if (content.includes('Wizard') || filename.includes('wizard')) attrs.push('wizard');
    if (content.includes('firebase') || filename.includes('firebase')) attrs.push('firebase');
    if (content.includes('auth') || filename.includes('auth')) attrs.push('authentication');
    if (content.includes('schedule') || filename.includes('schedule')) attrs.push('scheduling');
  }
  if (filename.includes('test') || filename.includes('spec')) attrs.push('testing');
  if (filename.includes('config')) attrs.push('configuration');
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
