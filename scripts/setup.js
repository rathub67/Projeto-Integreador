import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { rootDir, readBackendEnv } from './env.js';
import { resolveDbConfig, ensureDbDir } from '../backend/src/lib/dbConfig.js';

const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const isWindows = process.platform === 'win32';

if (Number(process.versions.node.split('.')[0]) < 20) {
  console.error(`[setup] Node.js ${process.versions.node} é demasiado antigo. Use Node.js 20 ou superior.`);
  process.exit(1);
}

const missing = [
  path.join(backendDir, 'node_modules'),
  path.join(frontendDir, 'node_modules')
].filter((dir) => !existsSync(dir));

if (missing.length > 0) {
  console.log('[setup] A instalar dependências (só é preciso internet na primeira vez)...');

  const npm = isWindows ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['install'], { cwd: rootDir, stdio: 'inherit' });

  if (result.error || result.status !== 0) {
    console.error('[setup] Não foi possível instalar as dependências.');
    process.exit(1);
  }
}

const env = readBackendEnv();
const db = resolveDbConfig({ ...env, ...process.env });
ensureDbDir(db);

const sharedEnv = {
  ...process.env,
  DATABASE_URL: db.url,
  DB_FILE: db.file
};

const prismaBin = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');
for (const args of [['generate'], ['db', 'push']]) {
  const result = spawnSync(process.execPath, [prismaBin, ...args], {
    cwd: backendDir,
    stdio: 'inherit',
    env: sharedEnv
  });

  if (result.status !== 0) process.exit(1);
}

console.log('\n[setup] Tudo pronto. Abra o site com "node scripts\\dev.js".\n');
