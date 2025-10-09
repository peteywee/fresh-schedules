#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const guide = path.resolve('docs/guides/copilot-full-context.guide.md');
if (!fs.existsSync(guide)) {
  console.error('Guide not found:', guide);
  process.exit(1);
}
const content = fs.readFileSync(guide, 'utf8');

const lines = content.split(/\r?\n/);
const created = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^###\s+(.*)$/);
  if (m) {
    const relPath = m[1].trim();
    // find next fenced block
    let j = i + 1;
    while (j < lines.length && !lines[j].startsWith('```')) j++;
    if (j >= lines.length) continue;
    const fenceLine = lines[j];
    const fence = fenceLine.replace(/^```/, '').trim();
    j++;
    const block = [];
    while (j < lines.length && !lines[j].startsWith('```')) {
      block.push(lines[j]);
      j++;
    }
    i = j;

    const outPath = path.resolve(relPath);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(outPath)) {
      // skip existing
      continue;
    }
    fs.writeFileSync(outPath, block.join('\n') + '\n', 'utf8');
    created.push(outPath);
  }
}

if (created.length) {
  console.log('Created files:');
  created.forEach(f => console.log('  ', f));
} else {
  console.log('No files created (all present).');
}
