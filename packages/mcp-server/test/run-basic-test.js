const fs = require('fs');
const path = require('path');

try {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const readme = path.join(repoRoot, 'README.md');
  if (fs.existsSync(readme)) {
    console.log('basic-test: README found');
    process.exit(0);
  }
  console.error('basic-test: README not found');
  process.exit(2);
} catch (err) {
  console.error('basic-test: error', err && err.message);
  process.exit(2);
}
