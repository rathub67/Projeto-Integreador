import { Router } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate, onlySelf, onlyAdmin } from '../middlewares/auth.js';
import { newId, texto, userFilter } from '../utils/helpers.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitize(data) {
    delete data.id;
    delete data.role;
    delete data.deletedAt;
    delete data.createdAt;
    delete data.lastLoginAt;
    delete data.loginCount;
    return data;
}

function lerDados(data) {
    const name = texto(data.name);
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");

    if (name.length < 2 || name.length > 80) {
        throw createError(400, "Informe um nome entre 2 e 80 caracteres.");
    }

    if (!EMAIL_REGEX.test(email) || email.length > 120) {
        throw createError(400, "Informe um e-mail válido.");
    }

    if (password.length < 8 || password.length > 128) {
        throw createError(400, "A senha deve ter entre 8 e 128 caracteres.");
    }

    return { name, email, password };
}

router.get('/', authenticate, onlyAdmin, async (req, res) => {
    const users = await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: userFilter
    });

    res.json(users);
});

router.post('/', async (req, res) => {
    const data = lerDados(sanitize({ ...req.body }));

    const user = await prisma.user.create({
        data: {
            id: newId('usr'),
            name: data.name,
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
            role: "user"
        },
        select: userFilter
    });

    res.status(201).json(user);
});

router.post('/login', async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!EMAIL_REGEX.test(email) || !password) {
        throw createError(400, "Informe e-mail e senha.");
    }

    const encontrado = await prisma.user.findUnique({ where: { email } });
    const senhaOk = encontrado && !encontrado.deletedAt
        && (await bcrypt.compare(password, encontrado.password));

    if (!senhaOk) {
        throw createError(401, "Usuário ou senha incorreto(s)");
    }

    const user = await prisma.user.update({
        where: { id: encontrado.id },
        data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 }
        },
        select: userFilter
    });

    res.json({ user, token: generateToken(user) });
});

router.get('/:id', authenticate, async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: req.params.id, deletedAt: null },
        select: userFilter
    });

    if (req.user.role !== "admin" && req.user.id !== user.id) {
        throw createError(403, "Você só pode ver os seus próprios dados");
    }

    res.json({ user });
});

router.patch('/:id', authenticate, onlySelf, async (req, res) => {
    const data = sanitize({ ...req.body });
    const updates = {};

    if (data.name !== undefined) {
        const name = texto(data.name);

        if (name.length < 2 || name.length > 80) {
            throw createError(400, "Informe um nome entre 2 e 80 caracteres.");
        }

        updates.name = name;
    }

    if (data.email !== undefined) {
        const email = String(data.email || "").trim().toLowerCase();

        if (!EMAIL_REGEX.test(email) || email.length > 120) {
            throw createError(400, "Informe um e-mail válido.");
        }

        updates.email = email;
    }

    if (data.password) {
        const password = String(data.password);

        if (password.length < 8 || password.length > 128) {
            throw createError(400, "A senha deve ter entre 8 e 128 caracteres.");
        }

        updates.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.findUniqueOrThrow({
        where: { id: req.params.id, deletedAt: null }
    });

    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: updates,
        select: userFilter
    });

    res.json({ user });
});

router.delete('/:id', authenticate, onlyAdmin, async (req, res) => {
    if (req.params.id === req.user.id) {
        throw createError(400, "Você não pode excluir a sua própria conta.");
    }

    const target = await prisma.user.findUniqueOrThrow({
        where: { id: req.params.id, deletedAt: null }
    });

    if (target.role === "admin") {
        const admins = await prisma.user.count({
            where: { role: "admin", deletedAt: null }
        });

        if (admins <= 1) {
            throw createError(400, "O sistema precisa de pelo menos um administrador.");
        }
    }

    await prisma.user.update({
        where: { id: target.id },
        data: { deletedAt: new Date() }
    });

    res.status(204).send();
});

export default router;
