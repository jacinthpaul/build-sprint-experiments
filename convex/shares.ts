import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { policyFields } from "./schema";
const isKey = (key: string) => /^[0-9a-f]{64}$/.test(key);
export const status = query({
 args: { browserKey: v.string() }, returns: v.union(v.null(), v.string()),
 handler: async (ctx, { browserKey }) => {
  if (!isKey(browserKey)) return null;
  const policy = await ctx.db.query("policies").withIndex("by_browser_key", q => q.eq("browserKey", browserKey)).unique();
  if (!policy) return null;
  const share = await ctx.db.query("shares").withIndex("by_policy", q => q.eq("policyId", policy._id)).unique();
  return share?.token ?? null;
 }
});
export const enable = mutation({
 args: { browserKey: v.string(), token: v.string() }, returns: v.string(),
 handler: async (ctx, { browserKey, token }) => {
  if (!isKey(browserKey) || !isKey(token) || browserKey === token) throw new Error("Invalid sharing key.");
  const policy = await ctx.db.query("policies").withIndex("by_browser_key", q => q.eq("browserKey", browserKey)).unique();
  if (!policy) throw new Error("Save your policy before sharing.");
  const existing = await ctx.db.query("shares").withIndex("by_policy", q => q.eq("policyId", policy._id)).unique();
  if (existing) return existing.token;
  const duplicate = await ctx.db.query("shares").withIndex("by_token", q => q.eq("token", token)).unique();
  if (duplicate) throw new Error("Please try sharing again.");
  await ctx.db.insert("shares", { token, policyId: policy._id });
  return token;
 }
});
export const disable = mutation({
 args: { browserKey: v.string() }, returns: v.null(),
 handler: async (ctx, { browserKey }) => {
  if (!isKey(browserKey)) throw new Error("Invalid browser key.");
  const policy = await ctx.db.query("policies").withIndex("by_browser_key", q => q.eq("browserKey", browserKey)).unique();
  if (!policy) throw new Error("Policy not found.");
  const share = await ctx.db.query("shares").withIndex("by_policy", q => q.eq("policyId", policy._id)).unique();
  if (share) await ctx.db.delete(share._id);
  return null;
 }
});
export const get = query({
 args: { token: v.string() }, returns: v.union(v.null(), v.object(policyFields)),
 handler: async (ctx, { token }) => {
  if (!isKey(token)) return null;
  const share = await ctx.db.query("shares").withIndex("by_token", q => q.eq("token", token)).unique();
  if (!share) return null;
  const policy = await ctx.db.get(share.policyId);
  if (!policy) return null;
  const { _id, _creationTime, browserKey, ...details } = policy;
  return details;
 }
});
