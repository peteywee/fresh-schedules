#!/usr/bin/env node
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
    console.log(`\n${type.toUpperCase()} DIFFS:`);
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
              console.log(`git diff ${branch1}:${file1} ${branch2}:${file2}`);
            }
          });
        });
      }
    }
  }
});
