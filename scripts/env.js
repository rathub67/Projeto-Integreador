import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(rootDir, 'backend', '.env');
const envExampleFile = path.join(rootDir, 'backend', '.env.example');

function readEnv(file) {
  if (!existsSync(file)) return {};

  const values = {};
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const index = line.indexOf('=');
    if (index === -1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function readBackendEnv() {
  if (!existsSync(envFile) && existsSync(envExampleFile)) {
    const content = readFileSync(envExampleFile, 'utf8').replace(
      /^JWT_SECRET=.*$/m,
      `JWT_SECRET="${randomBytes(48).toString('hex')}"`
    );
    writeFileSync(envFile, content);
    console.log('[setup] backend/.env criado com um segredo JWT novo.');
  }

  return existsSync(envFile) ? readEnv(envFile) : {};
}

export { rootDir, readEnv, readBackendEnv };
