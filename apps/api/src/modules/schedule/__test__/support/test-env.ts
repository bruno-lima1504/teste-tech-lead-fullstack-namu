import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';
import { REPO_ROOT } from './repo-root';

// Mesmo .env do desenvolvimento (sem sobrescrever o que já vem do ambiente), mas
// num banco só dos testes: cada suíte o recria do zero. O process.env do Jest é
// uma cópia por arquivo de teste, por isso não dá para usar process.loadEnvFile.
const envFile = join(REPO_ROOT, '.env');
if (existsSync(envFile)) {
  for (const [key, value] of Object.entries(parseEnv(readFileSync(envFile, 'utf8')))) {
    process.env[key] ??= value;
  }
}
process.env.DB_NAME = `${process.env.DB_NAME ?? 'namu_sessions'}_test`;
