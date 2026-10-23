import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { audit } from '../audit.js';
import { emit } from '../events.js';
import { toActWhere } from '../inbox.js';

const PostTypes = ['HANDOFF','TASK','ABSENCE_NOTE','QUESTION','ANNOUNCEMENT','ALERT','NOTE','SHIFT_HANDOVER'] as const;
const Scopes = ['PRIVATE','DIRECT','ROLE','SHOP','ALL'] as const;
const Urgencies = ['LOW','NORMAL','HIGH','CRITICAL'] as const;
const Emojis = ['THUMBS_UP','CHECK','EYES','QUESTION','ALERT'] as const;

function visibilityFilter(userId: string, role: string, shopId: string | null) {
  return {
    OR: [
      { authorId: userId },
      { scope: 'ALL' },
      { scope: 'DIRECT', recipientUserId: userId },
      { scope: 'ROLE', recipientRole: role },
      ...(shopId ? [{ scope: 'SHOP', recipientShopId: shopId }] : []),
      { scope: 'PRIVATE', authorId: userId },
    ],
  } as any;
}

function canSeePost(
  post: { authorId: string; scope: string; recipientUserId: string | null; recipientRole: string | null; recipientShopId: string | null },
  u: { sub: string; role: string; shopId: string | null },
) {
  if (post.authorId === u.sub || post.scope === 'ALL') return true;
  if (post.scope === 'DIRECT') return post.recipientUserId === u.sub;
  if (post.scope === 'ROLE') return post.recipientRole === u.role;
  if (post.scope === 'SHOP') return !!u.shopId && post.recipientShopId === u.shopId;
  return false; // PRIVATE (auteur seulement)
}

export default async function postsRoutes(app: FastifyInstance) {
  // Wall (feed) — posts visible to current user
  app.get('/posts/feed', { preHandler: requireAuth }, async (req) => {
    const Q = z.object({ type: z.string().optional(), limit: z.coerce.number().max(100).default(50) });
    const { type, limit } = Q.parse((req as any).query);
    const where: any = {
      ...visibilityFilter(req.user.sub, req.user.role, req.user.shopId),
      parentId: null,
      status: { not: 'ARCHIVED' },
    };
    if (type) where.type = type;
    const posts = await prisma.teamPost.findMany({
      where, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        recipientUser: { select: { id: true, firstName: true, lastName: true } },
        order: { select: { id: true, ticketCode: true, customer: { select: { fullName: true } } } },
        _count: { select: { replies: true, receipts: true, reactions: true } },
      },
    });
    return { posts };
  });

  // Inbox: posts addressed to me, awaiting action
  app.get('/posts/inbox', { preHandler: requireAuth }, async (req) => {
    const me = req.user.sub;
    const [toAct, watching, archive] = await Promise.all([
      prisma.teamPost.findMany({
        where: toActWhere(req.user),
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
        take: 100,
        include: {
          author: { select: { firstName: true, lastName: true } },
          order: { select: { ticketCode: true } },
        },
      }),
      prisma.teamPost.findMany({
        where: { authorId: me, status: { in: ['OPEN','SEEN'] }, parentId: null },
        orderBy: { createdAt: 'desc' }, take: 100,
        include: {
          recipientUser: { select: { firstName: true, lastName: true } },
          order: { select: { ticketCode: true } },
        },
      }),
      prisma.teamPost.findMany({
        where: {
          OR: [{ authorId: me }, { recipientUserId: me }],
          status: { in: ['RESOLVED','ARCHIVED'] }, parentId: null,
        },
        orderBy: { updatedAt: 'desc' }, take: 50,
        include: {
          author: { select: { firstName: true, lastName: true } },
          recipientUser: { select: { firstName: true, lastName: true } },
          order: { select: { ticketCode: true } },
        },
      }),
    ]);
    return { toAct, watching, archive };
  });

  app.get('/posts/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const post = await prisma.teamPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        recipientUser: { select: { id: true, firstName: true, lastName: true } },
        order: { select: { id: true, ticketCode: true, customer: { select: { fullName: true } } } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { firstName: true, lastName: true } } },
        },
        receipts: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { readAt: 'asc' },
        },
        reactions: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        mentions: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    if (!post || !canSeePost(post, req.user)) return reply.code(404).send({ error: 'not_found' });
    // Mark read for current user
    await prisma.postReadReceipt.upsert({
      where: { postId_userId: { postId: id, userId: req.user.sub } },
      update: {},
      create: { postId: id, userId: req.user.sub },
    });
    return { post };
  });

  app.post('/posts', { preHandler: requireAuth }, async (req) => {
    const Body = z.object({
      type: z.enum(PostTypes),
      title: z.string().optional().nullable(),
      body: z.string().min(1),
      scope: z.enum(Scopes).default('ALL'),
      recipientUserId: z.string().nullable().optional(),
      recipientRole: z.string().nullable().optional(),
      recipientShopId: z.string().nullable().optional(),
      orderId: z.string().nullable().optional(),
      urgency: z.enum(Urgencies).default('NORMAL'),
      deadline: z.string().nullable().optional(),
      pinnedUntil: z.string().nullable().optional(),
      parentId: z.string().nullable().optional(),
      mentionedUserIds: z.array(z.string()).default([]),
    });
    const data = Body.parse(req.body);

    const post = await prisma.teamPost.create({
      data: {
        type: data.type,
        title: data.title ?? null,
        body: data.body,
        authorId: req.user.sub,
        scope: data.scope,
        recipientUserId: data.recipientUserId ?? null,
        recipientRole: data.recipientRole ?? null,
        recipientShopId: data.recipientShopId ?? null,
        orderId: data.orderId ?? null,
        urgency: data.urgency,
        deadline: data.deadline ? new Date(data.deadline) : null,
        pinnedUntil: data.pinnedUntil ? new Date(data.pinnedUntil) : null,
        parentId: data.parentId ?? null,
        mentions: { create: data.mentionedUserIds.map((u) => ({ userId: u })) },
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });

    await audit({
      userId: req.user.sub, action: 'POST_CREATED',
      entityType: 'TeamPost', entityId: post.id, payload: { type: data.type, scope: data.scope },
    });
    await emit('post.created', {
      id: post.id, type: post.type, title: post.title, scope: post.scope, urgency: post.urgency,
      authorId: post.authorId, authorName: `${post.author.firstName} ${post.author.lastName}`.trim(),
      recipientUserId: post.recipientUserId, recipientRole: post.recipientRole, recipientShopId: post.recipientShopId,
      orderId: post.orderId,
    });
    return { post };
  });

  app.post('/posts/:id/resolve', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({ comment: z.string().optional() });
    const { comment } = Body.parse(req.body ?? {});
    const post = await prisma.teamPost.findUnique({ where: { id } });
    if (!post || !canSeePost(post, req.user)) return reply.code(404).send({ error: 'not_found' });
    const updated = await prisma.teamPost.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date(), resolvedById: req.user.sub },
    });
    if (comment) {
      await prisma.teamPost.create({
        data: {
          type: 'NOTE', body: comment,
          authorId: req.user.sub, scope: 'ALL',
          parentId: id, urgency: 'NORMAL',
        },
      });
    }
    await audit({
      userId: req.user.sub, action: 'POST_RESOLVED',
      entityType: 'TeamPost', entityId: id,
    });
    await emit('post.resolved', { id });
    return { post: updated };
  });

  app.post('/posts/:id/replies', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({ body: z.string().min(1) });
    const { body } = Body.parse(req.body);
    const parent = await prisma.teamPost.findUnique({ where: { id } });
    if (!parent || !canSeePost(parent, req.user)) return reply.code(404).send({ error: 'not_found' });
    const reply2 = await prisma.teamPost.create({
      data: {
        type: 'NOTE', body,
        authorId: req.user.sub, scope: parent.scope,
        // Une réponse s'adresse à l'autre personne de la conversation (jamais à soi-même)
        recipientUserId: parent.scope === 'DIRECT'
          ? (req.user.sub === parent.authorId ? parent.recipientUserId : parent.authorId)
          : parent.recipientUserId,
        recipientRole: parent.recipientRole,
        recipientShopId: parent.recipientShopId,
        orderId: parent.orderId,
        parentId: id,
      },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
    await emit('post.replied', {
      id, replyId: reply2.id, authorId: req.user.sub, authorName: `${reply2.author.firstName} ${reply2.author.lastName}`.trim(),
      parentAuthorId: parent.authorId, recipientUserId: parent.recipientUserId,
    });
    return { reply: reply2 };
  });

  app.post('/posts/:id/react', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({ emoji: z.enum(Emojis) });
    const { emoji } = Body.parse(req.body);
    const target = await prisma.teamPost.findUnique({ where: { id } });
    if (!target || !canSeePost(target, req.user)) return reply.code(404).send({ error: 'not_found' });
    const r = await prisma.postReaction.upsert({
      where: { postId_userId_emoji: { postId: id, userId: req.user.sub, emoji } },
      update: {},
      create: { postId: id, userId: req.user.sub, emoji },
    });
    await emit('post.reacted', { id, emoji });
    return { reaction: r };
  });

  app.delete('/posts/:id/react/:emoji', { preHandler: requireAuth }, async (req) => {
    const { id, emoji } = req.params as { id: string; emoji: string };
    await prisma.postReaction.deleteMany({ where: { postId: id, userId: req.user.sub, emoji } });
    return { ok: true };
  });
}
