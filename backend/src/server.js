import 'dotenv/config';

import app from './app.js';
import { prisma } from './lib/prisma.js';
import { resolveDbConfig } from './lib/dbConfig.js';
import { criarAdmin } from './lib/seed.js';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

async function start() {
    if (!process.env.JWT_SECRET) {
        throw new Error("Defina JWT_SECRET no backend/.env");
    }

    const criado = await criarAdmin();
    const db = resolveDbConfig();

    app.listen(PORT, HOST, () => {
        console.log(`\n  RMVM API rodando em http://localhost:${PORT}`);
        console.log(`  Banco de dados: SQLite (${db.file})`);
        if (criado) console.log("  Administrador criado neste arranque.");
    });
}

start().catch(async (error) => {
    console.error("Falha ao iniciar a API:", error.message);
    await prisma.$disconnect();
    process.exit(1);
});
