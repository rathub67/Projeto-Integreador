import { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';

import createError from '../utils/createError.js';
import { resolveDbConfig, ensureDbDir } from './dbConfig.js';

const db = resolveDbConfig();
ensureDbDir(db);

const adapter = new PrismaLibSql({ url: db.url });

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
