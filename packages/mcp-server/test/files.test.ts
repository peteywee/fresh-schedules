import fs from 'fs';
import path from 'path';

describe('files listing', () => {
  it('can read package.json from repo root', () => {
    // __dirname is 'packages/mcp-server/test' (so three levels up to reach repo root)
    // repo root is three levels up from here
    const repoRoot = path.resolve(__dirname, '..', '..', '..');
    const pkg = path.join(repoRoot, 'package.json');
    const exists = fs.existsSync(pkg);
    expect(exists).toBe(true);
  });
});
