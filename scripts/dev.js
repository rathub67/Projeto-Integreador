import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

import { rootDir, readBackendEnv } from './env.js';
import { resolveDbConfig, ensureDbDir } from '../backend/src/lib/dbConfig.js';

const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const backendEnv = readBackendEnv();

if (Number(process.versions.node.split('.')[0]) < 20) {
  console.error(`[setup] Node.js ${process.versions.node} é demasiado antigo. Instale Node.js 20 ou superior.`);
  process.exit(1);
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(700);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + 50; port++) {
    if (!(await portOpen(port))) return port;
  }
  return start;
}

// SQLite embutido: não é preciso instalar MariaDB/MySQL.
// A base fica em dados/rmvm.db (ou no caminho definido em DATABASE_URL).
const db = resolveDbConfig({ ...backendEnv, ...process.env });
ensureDbDir(db);

const sharedEnv = {
  ...process.env,
  DATABASE_URL: db.url,
  DB_FILE: db.file,
};

const prismaBin = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');
const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

if (!existsSync(prismaBin) || !existsSync(viteBin)) {
  console.error('[setup] Dependencias em falta. Execute "npm.cmd install" na pasta do projeto.');
  process.exit(1);
}

for (const args of [['generate'], ['db', 'push']]) {
  const result = spawnSync(process.execPath, [prismaBin, ...args], {
    cwd: backendDir,
    stdio: 'inherit',
    env: sharedEnv,
  });

  if (result.status !== 0) {
    console.error('[setup] Falha ao preparar o Prisma.');
    process.exit(1);
  }
}

const configuredApiPort = Number(process.env.PORT || backendEnv.PORT || 3001);
let apiPort = configuredApiPort;

if (await portOpen(apiPort)) {
  apiPort = await findFreePort(apiPort + 1);
  console.log(`[setup] Porta ${configuredApiPort} ocupada; API vai usar ${apiPort}.`);
}

const children = [];
let shuttingDown = false;

function start(command, args, label, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    ...options,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (signal) {
      console.log(`[${label}] encerrado (${signal}).`);
    } else if (code !== 0) {
      console.error(`[${label}] encerrado com código ${code}.`);
    }
    shutdown(code || 1);
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.killed || child.exitCode !== null) continue;
    try {
      child.kill();
    } catch {
      /* ignora */
    }
  }

  setTimeout(() => process.exit(code), 250);
}

console.log(`\n  Site: http://localhost:5173 (ou a próxima porta livre)`);
console.log(`  API:  http://localhost:${apiPort}`);
console.log(`  Base: SQLite (${db.file})\n`);

start(process.execPath, [path.join(backendDir, 'src', 'server.js')], 'api', {
  cwd: backendDir,
  env: { ...sharedEnv, PORT: String(apiPort) },
});

const viteArgs = [viteBin];
if (process.env.RMVM_OPEN !== '0') viteArgs.push('--open');

start(process.execPath, viteArgs, 'frontend', {
  cwd: frontendDir,
  env: { ...process.env, RMVM_API_TARGET: `http://localhost:${apiPort}` },
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
