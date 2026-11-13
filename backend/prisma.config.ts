import path from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";
import { defineConfig } from "prisma/config";

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(backendDir, "..");
const defaultDbFile = path.join(rootDir, "dados", "rmvm.db");

function toFileUrl(file: string) {
  const normalized = path
    .resolve(file)
    .replace(/\\/g, "/")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/\?/g, "%3F");

  return `file:${normalized}`;
}

function resolveDatabaseUrl() {
  const configured = process.env["DATABASE_URL"]?.trim();

  if (configured && /^file:/i.test(configured)) {
    let raw = configured.slice("file:".length);
    const cut = raw.search(/[?#]/);
    if (cut !== -1) raw = raw.slice(0, cut);

    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* mantém o valor original */
    }

    if (raw.startsWith("///")) raw = raw.slice(3);
    else if (raw.startsWith("//")) raw = raw.slice(2);
    if (/^\/[A-Za-z]:[\\/]/.test(raw)) raw = raw.slice(1);

    return toFileUrl(path.resolve(rootDir, raw));
  }

  return toFileUrl(defaultDbFile);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
