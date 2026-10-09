import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';

export const mine = query({
  args: {},
  returns: v.union(v.null(), v.object({ userId: v.id('users'), tappedAt: v.number() })),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const request = await ctx.db.query('keepKoshRequests').withIndex('by_user', q => q.eq('userId', userId)).unique();
    return request ? { userId: request.userId, tappedAt: request.tappedAt } : null;
  },
});

export const tap = mutation({
  args: {}, returns: v.number(),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('Sign in to keep Kosh.');
    const existing = await ctx.db.query('keepKoshRequests').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (existing) return existing.tappedAt;
    const tappedAt = Date.now();
    await ctx.db.insert('keepKoshRequests', { userId, tappedAt });
    // The request and total commit together; concurrent or repeated taps count once.
    const total = await ctx.db.query('keepKoshTotals').withIndex('by_key', q => q.eq('key', 'all')).unique();
    if (total) await ctx.db.patch(total._id, { users: total.users + 1 });
    else await ctx.db.insert('keepKoshTotals', { key: 'all', users: 1 });
    return tappedAt;
  },
});

// Available to the owner through the Convex CLI without exposing user records.
export const count = internalQuery({
  args: {}, returns: v.number(),
  handler: async ctx => {
    const total = await ctx.db.query('keepKoshTotals').withIndex('by_key', q => q.eq('key', 'all')).unique();
    return total?.users ?? 0;
  },
});
