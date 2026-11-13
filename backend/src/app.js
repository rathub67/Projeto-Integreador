import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prismaErrorHandler } from './lib/prisma.js';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import newsRouter from './routes/news.js';
import denunciasRouter from './routes/denuncias.js';
import adminRouter from './routes/admin.js';

const here = path.dirname(fileURLToPath(import.meta.url));

const frontendDir = process.env.FRONTEND_DIR
    ? path.resolve(process.env.FRONTEND_DIR)
    : path.resolve(here, '../../frontend/dist');
const frontendIndex = path.join(frontendDir, 'index.html');

const serveFrontend =
    (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === '1') &&
    existsSync(frontendIndex);

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('tiny'));
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

if (serveFrontend) {
    app.use(express.static(frontendDir, {
        index: 'index.html',
        setHeaders(res, filePath) {
            if (path.basename(filePath) === 'index.html') {
                res.setHeader('Cache-Control', 'no-cache');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
}

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/news', newsRouter);
app.use('/api/denuncias', denunciasRouter);
app.use('/api/admin', adminRouter);

if (serveFrontend) {
    // Rotas do React Router (ex.: /denuncias, /noticias) devolvem o index.html.
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path === '/api' || req.path.startsWith('/api/')) return next();
        if (path.extname(req.path)) return next();

        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(frontendIndex);
    });
}

app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada."
    });
});

app.use((err, req, res, next) => {
    const error = prismaErrorHandler(err);
    const statusCode = error.status || err.status || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        error: statusCode >= 500
            ? "Erro interno do servidor."
            : error.message
    });
});

export default app;
