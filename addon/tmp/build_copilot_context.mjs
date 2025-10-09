#!/usr/bin/env node
/**
 * build_copilot_context.mjs
 * Generate a single markdown file that encodes the repo:
 * - file tree
 * - per-file content (text files), fenced with path annotations
 * - masks secrets and hardcoded Firebase config into __PLACEHOLDER__
 * - tags output as *.place.*
 *
 * Usage:
 *   node build_copilot_context.mjs [repoRoot] [outputFile]
 * Example:
 *   node build_copilot_context.mjs . CopilotFullContext.place.md
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const repoRoot = path.resolve(process.argv[2] || '.');
const outFile = path.resolve(process.argv[3] || 'CopilotFullContext.place.md');

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache', '.pnpm-store', '.turbo'
]);

const TEXT_EXTS = new Set([
  '.md','.txt','.ts','.tsx','.js','.jsx','.json','.yml','.yaml','.css','.scss','.html','.rules','.mjs','.cjs','.env','.gitignore','.editorconfig','.prettierrc','.eslintrc','.tsconfig','.npmrc'
]);

const MAX_BYTES_PER_FILE = 200_000; // 200KB per file cap

const secretPatterns = [
  /apiKey:\s*['"]AIza[0-9A-Za-z_\-]+['"]/g,
  /appId:\s*['"]1:[0-9]+:web:[0-9a-fA-F]+['"]/g,
  /projectId:\s*['"][a-z0-9\-]+['"]/g,
  /authDomain:\s*['"][^'"]+firebaseapp\.com['"]/g,
  /messagingSenderId:\s*['"][0-9]+['"]/g,
  /\bFIREBASE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\bGOOGLE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\b[A-Za-z0-9_]*SECRET[A-Za-z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g
];

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTS.has(ext)) return true;
  // fallback for dotfiles
  if (!ext && filePath.startsWith('.')) return true;
  return false;
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function maskSecrets(content) {
  let out = content;
  for (const re of secretPatterns) {
    out = out.replaceAll(re, (m) => {
      const hash = crypto.createHash('sha256').update(m).digest('hex').slice(0, 8);
      return m.replace(/:['"]?.*?['"]?$/, `: "__PLACEHOLDER__/*${hash}*/"`);
    });
  }
  return out;
}

function rel(p) {
  return path.relative(repoRoot, p) || '.';
}

function header() {
  return `# Copilot Full Context Book (.place.)\n\n` +
  `> Generated from repo: \`${repoRoot}\` on ${new Date().toISOString()}\n` +
  `> This file inlines the file tree and text-file contents (masked), for Copilot to read as a single source.\n` +
  `> Any literals that look like secrets/config are replaced with __PLACEHOLDER__.\n\n` +
  `## Important\n- Do **not** commit real secrets.\n- Treat this file as documentation. Keep under version control on the **notes** branch if needed.\n\n`;
}

function fileTree(files) {
  const lines = files.map(f => rel(f)).sort();
  return "## File Tree (filtered)\n\n```\n" + lines.join('\n') + "\n```\n\n";
}

function sectionForFile(file) {
  const r = rel(file);
  let data = fs.readFileSync(file);
  if (data.length > MAX_BYTES_PER_FILE) {
    data = data.slice(0, MAX_BYTES_PER_FILE);
  }
  let content = data.toString('utf-8');
  content = maskSecrets(content);
  const ext = path.extname(file).toLowerCase().replace(/^\./,'');
  const fence = ext || 'txt';
  return `### ${r}\n\n\`\`\`${fence}\n${content}\n\`\`\`\n\n`;
}

function main() {
  const all = Array.from(walk(repoRoot));
  const textFiles = all.filter(isTextFile);

  let md = header();
  md += fileTree(textFiles);

  for (const f of textFiles) {
    md += sectionForFile(f);
  }

  fs.writeFileSync(outFile, md, 'utf-8');
  console.log(`Wrote ${outFile}`);
}

main();
