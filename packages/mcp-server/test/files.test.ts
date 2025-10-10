import fs from 'fs';
import path from 'path';

describe('files listing', () => {
  it('can read README.md from repo root', () => {
    const repoRoot = path.resolve(__dirname, '..', '..');
    const readme = path.join(repoRoot, 'README.md');
    const exists = fs.existsSync(readme);
    expect(exists).toBe(true);
  });
});
