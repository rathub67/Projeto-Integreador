import 'dotenv/config';
import { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import createError from '../utils/createError.js';

const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

function prismaErrorHandler(error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return error;
    }

    switch (error.code) {
        case 'P2002':
            return createError(409, "Já existe um registro com estes dados (chave duplicada).");
        case 'P2025':
            return createError(404, "O registro não existe");
        default:
            return error;
    }
}

export { prisma, prismaErrorHandler };