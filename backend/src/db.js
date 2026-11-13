import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import { resolveDbConfig, ensureDbDir } from "./lib/dbConfig.js";

const db = resolveDbConfig();
ensureDbDir(db);

const adapter = new PrismaLibSql({ url: db.url });

export const prisma = new PrismaClient({ adapter });
