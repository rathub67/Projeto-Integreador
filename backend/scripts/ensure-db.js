import 'dotenv/config';

import { resolveDbConfig, ensureDbDir } from '../src/lib/dbConfig.js';

try {
  const db = resolveDbConfig();
  ensureDbDir(db);

  console.log(`[db] Base SQLite pronta: ${db.file}`);
} catch (error) {
  console.error(`[db] Não foi possível preparar a base SQLite: ${error.message}`);
  process.exit(1);
}
