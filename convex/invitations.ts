import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { action, internalMutation, mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

const unavailable = { status: 'unavailable' as const, policyId: null };
const stateValue = v.object({ status: v.union(v.literal('open'), v.literal('pending'), v.literal('approved'), v.literal('declined'), v.literal('unavailable'), v.literal('owner'), v.literal('signIn')), policyId: v.union(v.id('insurancePolicies'), v.null()) });
async function signedIn(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError('Sign in with your own account to request access.');
  return userId;
}
async function ownerInvitation(ctx: MutationCtx, id: Id<'familyInvitations'>) {
  const userId = await signedIn(ctx), invite = await ctx.db.get(id);
  const policy = invite ? await ctx.db.get(invite.policyId) : null;
  if (!invite || !policy || invite.ownerId !== userId || policy.ownerId !== userId) throw new ConvexError('This invitation is not available to your account.');
  return invite;
}
export const create = action({
  args: { policyId: v.id('insurancePolicies'), recipientName: v.string() }, returns: v.id('familyInvitations'),
  handler: async (ctx, args): Promise<Id<'familyInvitations'>> => {
    const ownerId = await getAuthUserId(ctx);
    if (!ownerId) throw new ConvexError('Sign in to create a family invitation.');
    // Secure randomness runs in an action; permission and storage remain in one mutation.
    const token = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
    return ctx.runMutation(internal.invitations.store, { ...args, ownerId, token });
  },
});
export const store = internalMutation({
  args: { policyId: v.id('insurancePolicies'), recipientName: v.string(), ownerId: v.id('users'), token: v.string() }, returns: v.id('familyInvitations'),
  handler: async (ctx, args) => {
    const policy = await ctx.db.get(args.policyId);
    if (!policy || policy.ownerId !== args.ownerId) throw new ConvexError('This policy is not available to your account.');
    const name = args.recipientName.trim();
    if (!name || name.length > 200) throw new ConvexError('Add the name of the family member you want to invite.');
    const active = await ctx.db.query('familyInvitations').withIndex('by_policy_state_expiry', q => q.eq('policyId', args.policyId).eq('state', 'open').gt('expiresAt', Date.now())).take(50);
    if (active.length >= 50) throw new ConvexError('Cancel an unused invitation before creating another.');
    if (!/^[a-f0-9]{64}$/.test(args.token) || await ctx.db.query('familyInvitations').withIndex('by_token', q => q.eq('token', args.token)).unique()) throw new ConvexError('The invitation could not be created. Try again.');
    return ctx.db.insert('familyInvitations', { policyId: args.policyId, ownerId: args.ownerId, recipientName: name, token: args.token, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, state: 'open' });
  },
});
export const list = query({
  args: { policyId: v.id('insurancePolicies') },
  returns: v.array(v.object({ id: v.id('familyInvitations'), recipientName: v.string(), token: v.string(), expiresAt: v.number(), requests: v.array(v.object({ id: v.id('familyInvitationRequests'), email: v.string() })) })),
  handler: async (ctx, { policyId }) => {
    const ownerId = await signedIn(ctx), policy = await ctx.db.get(policyId);
    if (!policy || policy.ownerId !== ownerId) throw new ConvexError('This policy is not available to your account.');
    const rows = await ctx.db.query('familyInvitations').withIndex('by_policy_state_expiry', q => q.eq('policyId', policyId).eq('state', 'open').gt('expiresAt', Date.now())).take(50);
    return Promise.all(rows.map(async invite => {
      const requests = await ctx.db.query('familyInvitationRequests').withIndex('by_invitation', q => q.eq('invitationId', invite._id)).take(50);
      const pending = await Promise.all(requests.filter(r => r.status === 'pending').map(async r => ({ id: r._id, email: (await ctx.db.get(r.userId))?.email || 'Account email unavailable' })));
      return { id: invite._id, recipientName: invite.recipientName, token: invite.token, expiresAt: invite.expiresAt, requests: pending };
    }));
  },
});
export const state = query({
  args: { token: v.string() }, returns: stateValue,
  handler: async (ctx, { token }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { status: 'signIn' as const, policyId: null };
    if (!/^[a-f0-9]{64}$/.test(token)) return unavailable;
    const invite = await ctx.db.query('familyInvitations').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!invite || !await ctx.db.get(invite.policyId)) return unavailable;
    if (invite.ownerId === userId) return { status: 'owner' as const, policyId: invite.policyId };
    const request = await ctx.db.query('familyInvitationRequests').withIndex('by_invitation_user', q => q.eq('invitationId', invite._id).eq('userId', userId)).unique();
    const access = await ctx.db.query('familyAccess').withIndex('by_policy_recipient', q => q.eq('policyId', invite.policyId).eq('recipientId', userId)).unique();
    if (access) return { status: 'approved' as const, policyId: invite.policyId };
    // A used/cancelled link never recreates access after the owner removes it.
    if (invite.state !== 'open' || invite.expiresAt <= Date.now() || request?.status === 'approved') return unavailable;
    return { status: request?.status || 'open' as const, policyId: null };
  },
});
export const requestAccess = mutation({
  args: { token: v.string() }, returns: v.null(),
  handler: async (ctx, { token }) => {
    const userId = await signedIn(ctx);
    if (!/^[a-f0-9]{64}$/.test(token)) throw new ConvexError('This invitation is unavailable. Ask for a new invitation.');
    const invite = await ctx.db.query('familyInvitations').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!invite || invite.state !== 'open' || invite.expiresAt <= Date.now() || !await ctx.db.get(invite.policyId)) throw new ConvexError('This invitation is unavailable. Ask for a new invitation.');
    if (invite.ownerId === userId) throw new ConvexError('This invitation is for your family member. Send it to them to open with their own account.');
    const old = await ctx.db.query('familyInvitationRequests').withIndex('by_invitation_user', q => q.eq('invitationId', invite._id).eq('userId', userId)).unique();
    if (old?.status === 'pending') return null;
    if (old) throw new ConvexError('This request has already been handled. Ask the policyholder for a new invitation.');
    const requests = await ctx.db.query('familyInvitationRequests').withIndex('by_invitation', q => q.eq('invitationId', invite._id)).take(50);
    if (requests.length >= 50) throw new ConvexError('This invitation cannot accept more requests. Ask for a new invitation.');
    await ctx.db.insert('familyInvitationRequests', { invitationId: invite._id, userId, status: 'pending' });
    return null;
  },
});
export const approve = mutation({
  args: { requestId: v.id('familyInvitationRequests') }, returns: v.null(),
  handler: async (ctx, { requestId }) => {
    const request = await ctx.db.get(requestId);
    if (!request) throw new ConvexError('This request is unavailable.');
    const invite = await ownerInvitation(ctx, request.invitationId);
    if (request.status !== 'pending' || invite.state !== 'open' || invite.expiresAt <= Date.now()) throw new ConvexError('This request is no longer awaiting approval. Create a new invitation if needed.');
    const account = await ctx.db.get(request.userId);
    if (!account || request.userId === invite.ownerId) throw new ConvexError('This family account is unavailable.');
    const old = await ctx.db.query('familyAccess').withIndex('by_policy_recipient', q => q.eq('policyId', invite.policyId).eq('recipientId', request.userId)).unique();
    if (!old) {
      const recipients = await ctx.db.query('familyAccess').withIndex('by_policy', q => q.eq('policyId', invite.policyId)).take(50);
      if (recipients.length >= 50) throw new ConvexError('This policy already has 50 recipients.');
      await ctx.db.insert('familyAccess', { policyId: invite.policyId, ownerId: invite.ownerId, recipientId: request.userId, recipientName: invite.recipientName });
    }
    await ctx.db.patch(requestId, { status: 'approved' });
    await ctx.db.patch(invite._id, { state: 'closed' });
    return null;
  },
});
export const decline = mutation({
  args: { requestId: v.id('familyInvitationRequests') }, returns: v.null(),
  handler: async (ctx, { requestId }) => {
    const request = await ctx.db.get(requestId);
    if (!request) throw new ConvexError('This request is unavailable.');
    const invite = await ownerInvitation(ctx, request.invitationId);
    if (request.status !== 'pending' || invite.state !== 'open') throw new ConvexError('This request has already been handled.');
    await ctx.db.patch(requestId, { status: 'declined' });
    return null;
  },
});
export const cancel = mutation({
  args: { invitationId: v.id('familyInvitations') }, returns: v.null(),
  handler: async (ctx, { invitationId }) => {
    await ownerInvitation(ctx, invitationId);
    await ctx.db.patch(invitationId, { state: 'closed' });
    return null;
  },
});
export const pending = query({
  args: {}, returns: v.array(v.object({ token: v.string() })),
  handler: async ctx => {
    const userId = await signedIn(ctx);
    const requests = await ctx.db.query('familyInvitationRequests').withIndex('by_user_status', q => q.eq('userId', userId).eq('status', 'pending')).take(50);
    const rows = await Promise.all(requests.map(r => ctx.db.get(r.invitationId)));
    return rows.filter(r => r && r.state === 'open' && r.expiresAt > Date.now()).map(r => ({ token: r!.token }));
  },
});
