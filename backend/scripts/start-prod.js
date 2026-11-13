import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

import { resolveDbConfig, ensureDbDir } from '../src/lib/dbConfig.js';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Local: lê backend/.env. Na nuvem as variáveis já vêm do serviço.
dotenv.config({ path: path.join(backendDir, '.env'), quiet: true });

// Este comando serve o site já compilado (frontend/dist).
process.env.NODE_ENV = 'production';

const db = resolveDbConfig();

function runDbPush() {
    const prismaBin = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');

    try {
        ensureDbDir(db);
    } catch (error) {
        console.error(`[deploy] Não foi possível criar a pasta da base: ${error.message}`);
        return false;
    }

    const result = spawnSync(process.execPath, [prismaBin, 'db', 'push'], {
        cwd: backendDir,
        stdio: 'inherit',
        env: {
            ...process.env,
            DATABASE_URL: db.url,
            DB_FILE: db.file
        }
    });

    if (result.error) {
        console.error(`[deploy] Falha ao executar o Prisma: ${result.error.message}`);
        return false;
    }

    return result.status === 0;
}

async function main() {
    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = randomBytes(48).toString('hex');
        console.warn('[deploy] JWT_SECRET não definido; foi criado um segredo temporário.');
        console.warn('[deploy] Defina JWT_SECRET nas variáveis do serviço para manter as sessões.');
    }

    if (process.env.RMVM_SKIP_MIGRATIONS === '1') {
        console.log('[deploy] Base de dados já preparada. A arrancar diretamente.');
        await import('../src/server.js');
        return;
    }

    console.log(`[deploy] Base de dados SQLite: ${db.file}`);

    if (!runDbPush()) {
        console.error('[deploy] Não foi possível preparar a base de dados. A API não vai arrancar.');
        process.exit(1);
    }

    await import('../src/server.js');
}

main().catch((error) => {
    console.error('[deploy] Falha ao arrancar:', error.message);
    process.exit(1);
});
