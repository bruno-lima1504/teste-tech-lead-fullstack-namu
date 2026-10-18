import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const findRepoRoot = (dir: string): string => {
  if (existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    return dir;
  }
  const parent = dirname(dir);
  if (parent === dir) {
    throw new Error('Raiz do monorepo não encontrada (pnpm-workspace.yaml).');
  }
  return findRepoRoot(parent);
};

/** Raiz do monorepo, onde ficam o `.env` e a pasta `infra/`. */
export const REPO_ROOT = findRepoRoot(__dirname);
