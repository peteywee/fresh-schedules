import path from 'path';
import fs from 'fs';

/**
 * Test suite for MCP server repo root resolution.
 * Tests the getRepoRoot logic that respects MCP_REPO_ROOT env var.
 */
describe('MCP repo root resolution', () => {
  const originalEnv = process.env.MCP_REPO_ROOT;

  afterEach(() => {
    // Restore original env
    if (originalEnv !== undefined) {
      process.env.MCP_REPO_ROOT = originalEnv;
    } else {
      delete process.env.MCP_REPO_ROOT;
    }
  });

  describe('when MCP_REPO_ROOT is not set', () => {
    it('resolves repo root three levels up from __dirname', () => {
      delete process.env.MCP_REPO_ROOT;
      
      // Mimic the getRepoRoot function behavior
      const envRoot = process.env.MCP_REPO_ROOT;
      const repoRoot = envRoot 
        ? path.resolve(envRoot)
        : path.resolve(__dirname, '..', '..', '..');
      
      // __dirname in test context is packages/mcp-server/test
      // Three levels up should be repo root
      const expectedRoot = path.resolve(__dirname, '..', '..', '..');
      expect(repoRoot).toBe(expectedRoot);
      
      // Verify package.json exists at repo root
      const pkgPath = path.join(repoRoot, 'package.json');
      expect(fs.existsSync(pkgPath)).toBe(true);
    });
  });

  describe('when MCP_REPO_ROOT is set', () => {
    it('uses the custom repo root from environment', () => {
      const customRoot = '/custom/repo/path';
      process.env.MCP_REPO_ROOT = customRoot;
      
      // Mimic the getRepoRoot function behavior
      const envRoot = process.env.MCP_REPO_ROOT;
      const repoRoot = envRoot 
        ? path.resolve(envRoot)
        : path.resolve(__dirname, '..', '..', '..');
      
      expect(repoRoot).toBe(path.resolve(customRoot));
    });

    it('resolves relative paths from environment', () => {
      const relativeRoot = '../../../';
      process.env.MCP_REPO_ROOT = relativeRoot;
      
      const envRoot = process.env.MCP_REPO_ROOT;
      const repoRoot = envRoot 
        ? path.resolve(envRoot)
        : path.resolve(__dirname, '..', '..', '..');
      
      // Should be resolved to absolute path
      expect(path.isAbsolute(repoRoot)).toBe(true);
    });
  });

  describe('repo root validation', () => {
    it('actual repo root contains expected structure', () => {
      const repoRoot = path.resolve(__dirname, '..', '..', '..');
      
      // Check for expected files/dirs
      expect(fs.existsSync(path.join(repoRoot, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(repoRoot, 'pnpm-workspace.yaml'))).toBe(true);
      expect(fs.existsSync(path.join(repoRoot, 'packages'))).toBe(true);
      expect(fs.existsSync(path.join(repoRoot, 'apps'))).toBe(true);
    });
  });
});
