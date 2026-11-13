import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { verifyToken } from '../utils/jwt.js';

async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError(401, "Token não informado");
    }

    const token = authHeader.split(' ')[1];

    let payload;

    try {
        payload = verifyToken(token);
    } catch (err) {
        throw createError(401, "Token inválido ou expirado");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            deletedAt: true
        }
    });

    if (!user || user.deletedAt) {
        throw createError(401, "Conta não encontrada");
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
}

function onlySelf(req, res, next) {
    if (req.user.id !== String(req.params.id)) {
        throw createError(403, "Você só pode alterar os seus próprios dados");
    }

    next();
}

function onlyAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        throw createError(403, "Acesso permitido apenas para administradores");
    }

    next();
}

const requireAdmin = onlyAdmin;

export { authenticate, onlySelf, onlyAdmin, requireAdmin };
