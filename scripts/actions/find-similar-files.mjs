#!/usr/bin/env node
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
  console.log(`\n${type.toUpperCase()}:`);
  Object.entries(branches).forEach(([branch, files]) => {
    console.log(`  ${branch}: ${files.length} files`);
    files.slice(0, 3).forEach(f => console.log(`    - ${f}`));
    if (files.length > 3) console.log(`    ... and ${files.length - 3} more`);
  });
});
