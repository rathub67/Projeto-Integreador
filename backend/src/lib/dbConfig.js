import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DB_NAME = 'rmvm.db';

const libDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(libDir, '..', '..');
const rootDir = path.resolve(backendDir, '..');

const defaultDbFile = path.join(rootDir, 'dados', DEFAULT_DB_NAME);

function firstValue(env, keys) {
    for (const key of keys) {
        const value = env[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value).trim();
        }
    }
    return undefined;
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/** Transforma um caminho (relativo ou absoluto) num caminho absoluto. */
function resolveFile(value) {
    let raw = String(value || '').trim();
    if (!raw) return null;

    // Remove parâmetros/fragmentos do URL (ex.: ?mode=rwc).
    const cut = raw.search(/[?#]/);
    if (cut !== -1) raw = raw.slice(0, cut);

    raw = safeDecode(raw);

    // file:///C:/... e file://C:/...
    if (raw.startsWith('///')) raw = raw.slice(3);
    else if (raw.startsWith('//')) raw = raw.slice(2);

    // /C:/... -> C:/...
    if (/^\/[A-Za-z]:[\\/]/.test(raw)) raw = raw.slice(1);

    return path.resolve(rootDir, raw);
}

/**
 * Resolve o caminho do ficheiro SQLite.
 *
 * Ordem de prioridade:
 *   1. DATABASE_URL="file:..."
 *   2. DB_FILE / SQLITE_FILE
 *   3. <pasta do projeto>/dados/rmvm.db
 */
function resolveDbFile(env = process.env) {
    const databaseUrl = firstValue(env, ['DATABASE_URL']);

    if (databaseUrl && /^file:/i.test(databaseUrl)) {
        const file = resolveFile(databaseUrl.slice('file:'.length));
        if (file) return file;
    }

    const configured = firstValue(env, ['DB_FILE', 'SQLITE_FILE']);
    if (configured) {
        const file = resolveFile(configured);
        if (file) return file;
    }

    return defaultDbFile;
}

/** Converte um caminho local no formato de URL aceite pelo libSQL. */
function toFileUrl(file) {
    const normalized = path
        .resolve(file)
        .replace(/\\/g, '/')
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/\?/g, '%3F');

    return `file:${normalized}`;
}

function resolveDbConfig(env = process.env) {
    const file = resolveDbFile(env);

    return {
        file,
        url: toFileUrl(file),
        database: path.basename(file)
    };
}

function toDatabaseUrl(config) {
    if (!config) return toFileUrl(defaultDbFile);
    if (config.url) return config.url;
    if (config.file) return toFileUrl(config.file);
    return toFileUrl(config);
}

/** Variáveis de ambiente equivalentes, úteis para os scripts do Prisma. */
function toDbEnv(config) {
    return {
        DATABASE_URL: toDatabaseUrl(config),
        DB_FILE: config.file
    };
}

/** Garante que a pasta onde vive o ficheiro SQLite existe. */
function ensureDbDir(config) {
    mkdirSync(path.dirname(config.file), { recursive: true });
    return config.file;
}

export { resolveDbConfig, resolveDbFile, toDatabaseUrl, toDbEnv, ensureDbDir, rootDir, defaultDbFile };
