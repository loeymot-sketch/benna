import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export type AuthUser = {
  sub: string;
  role: string;
  shopId: string | null;
  firstName: string;
  lastName: string;
};

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'unauthorized' });
  }
}

export function requireRole(...roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'forbidden' });
    }
  };
}

export function generateTicketCode(seq: number) {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `LB-${ym}-${String(seq).padStart(4, '0')}`;
}
