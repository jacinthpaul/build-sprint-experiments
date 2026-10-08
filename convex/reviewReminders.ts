import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { nextQuarterlyReview } from '../shared/review-date';

const reminderValue = v.object({ policyId:v.id('insurancePolicies'), enabled:v.boolean(), nextReviewAt:v.number(), lastReviewedAt:v.union(v.number(),v.null()) });
async function owner(ctx: QueryCtx | MutationCtx, policyId: Id<'insurancePolicies'>) {
 const userId = await getAuthUserId(ctx), policy = await ctx.db.get(policyId);
 if (!userId || !policy || policy.ownerId !== userId) throw new ConvexError('This reminder is not available to your account.');
 return userId;
}
export const get = query({
 args:{policyId:v.id('insurancePolicies')}, returns:v.union(v.null(),reminderValue),
 handler:async(ctx,{policyId})=>{
  await owner(ctx,policyId);
  const row=await ctx.db.query('policyReviewReminders').withIndex('by_policy',q=>q.eq('policyId',policyId)).unique();
  return row?{policyId,enabled:row.enabled,nextReviewAt:row.nextReviewAt,lastReviewedAt:row.lastReviewedAt??null}:null;
 },
});
export const list = query({
 args:{},returns:v.array(reminderValue),handler:async ctx=>{
  const ownerId=await getAuthUserId(ctx);if(!ownerId)throw new ConvexError('Sign in to see your review reminders.');
  const rows=await ctx.db.query('policyReviewReminders').withIndex('by_owner_enabled',q=>q.eq('ownerId',ownerId).eq('enabled',true)).take(100);
  return rows.map(row=>({policyId:row.policyId,enabled:row.enabled,nextReviewAt:row.nextReviewAt,lastReviewedAt:row.lastReviewedAt??null}));
 },
});
export const setEnabled = mutation({
 args:{policyId:v.id('insurancePolicies'),enabled:v.boolean()},returns:v.null(),handler:async(ctx,{policyId,enabled})=>{
  const ownerId=await owner(ctx,policyId);
  const row=await ctx.db.query('policyReviewReminders').withIndex('by_policy',q=>q.eq('policyId',policyId)).unique();
  const nextReviewAt=enabled&&!row?.enabled?nextQuarterlyReview(Date.now()):row?.nextReviewAt??nextQuarterlyReview(Date.now());
  if(row)await ctx.db.patch(row._id,{enabled,nextReviewAt});
  else if(enabled)await ctx.db.insert('policyReviewReminders',{ownerId,policyId,enabled,nextReviewAt});
  return null;
 },
});
export const markReviewed = mutation({
 args:{policyId:v.id('insurancePolicies')},returns:v.null(),handler:async(ctx,{policyId})=>{
  await owner(ctx,policyId);
  const row=await ctx.db.query('policyReviewReminders').withIndex('by_policy',q=>q.eq('policyId',policyId)).unique();
  if(!row?.enabled)throw new ConvexError('Turn on the review reminder before recording a review.');
  const now=Date.now();await ctx.db.patch(row._id,{lastReviewedAt:now,nextReviewAt:nextQuarterlyReview(now)});
  return null;
 },
});
