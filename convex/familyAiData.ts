import { getAuthUserId } from "@convex-dev/auth/server";
import { createThread, listMessages } from "@convex-dev/agent";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation, internalQuery, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { insuranceDoc } from "./insuranceFields";

export const source = v.object({ url: v.string(), title: v.string() });
async function allowed(ctx: QueryCtx | MutationCtx, policyId: Id<"insurancePolicies">, userId: Id<"users">) {
  const policy = await ctx.db.get(policyId);
  if (!policy) throw new ConvexError("This policy is no longer available.");
  if (policy.ownerId !== userId && !await ctx.db.query("familyAccess").withIndex("by_policy_recipient", q => q.eq("policyId", policyId).eq("recipientId", userId)).unique()) {
    throw new ConvexError("This policy isn't shared with your account.");
  }
  return policy;
}
export const context = internalQuery({
  args: { policyId: v.id("insurancePolicies"), userId: v.id("users") }, returns: insuranceDoc,
  handler: (ctx, args) => allowed(ctx, args.policyId, args.userId),
});
export const begin = internalMutation({
  args: { policyId: v.id("insurancePolicies"), userId: v.id("users"), requestId: v.string() }, returns: v.string(),
  handler: async (ctx, args) => {
    await allowed(ctx, args.policyId, args.userId);
    const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
    let row = await ctx.db.query("familyAiThreads").withIndex("by_policy_user", q => q.eq("policyId", args.policyId).eq("userId", args.userId)).unique();
    if (row && row.activeUntil > now) throw new ConvexError("Your previous question is still being answered. Please wait.");
    // Limits are on AI only. Policy access stays available when a limit is reached.
    for (const [key, limit] of [[String(args.userId), 20], ["all", 200]] as const) {
      const usage = await ctx.db.query("familyAiUsage").withIndex("by_key_day", q => q.eq("key", key).eq("day", day)).unique();
      if ((usage?.requests ?? 0) >= limit) throw new ConvexError("The daily AI limit has been reached. You can still read the policy and call the saved contact. Try AI again tomorrow.");
      if (usage) await ctx.db.patch(usage._id, { requests: usage.requests + 1 });
      else await ctx.db.insert("familyAiUsage", { key, day, requests: 1 });
    }
    if (!row) {
      const threadId = await createThread(ctx, components.agent, { userId: args.userId, title: "Family insurance help" });
      const id = await ctx.db.insert("familyAiThreads", { policyId: args.policyId, userId: args.userId, threadId, activeUntil: now + 180000, requestId: args.requestId, day, requests: 1 });
      row = (await ctx.db.get(id))!;
    } else await ctx.db.patch(row._id, { activeUntil: now + 180000, requestId: args.requestId, day, requests: row.day === day ? row.requests + 1 : 1 });
    return row.threadId;
  },
});
export const finish = internalMutation({
  args: { policyId: v.id("insurancePolicies"), userId: v.id("users"), requestId: v.string(), messageId: v.optional(v.string()), searched: v.boolean(), sources: v.array(source) }, returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.query("familyAiThreads").withIndex("by_policy_user", q => q.eq("policyId", args.policyId).eq("userId", args.userId)).unique();
    if (!row || row.requestId !== args.requestId) return null;
    await ctx.db.patch(row._id, { activeUntil: 0 });
    if (args.messageId) await ctx.db.insert("familyAiSources", { threadId: row.threadId, messageId: args.messageId, checkedAt: Date.now(), searched: args.searched, sources: args.sources });
    return null;
  },
});
export const messages = query({
  args: { policyId: v.id("insurancePolicies") },
  returns: v.union(v.null(), v.object({ busy: v.boolean(), messages: v.array(v.object({ id: v.string(), role: v.union(v.literal("user"), v.literal("assistant")), text: v.string(), time: v.number(), searched: v.boolean(), checkedAt: v.union(v.number(), v.null()), sources: v.array(source) })) })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    try { await allowed(ctx, args.policyId, userId); } catch { return null; }
    const row = await ctx.db.query("familyAiThreads").withIndex("by_policy_user", q => q.eq("policyId", args.policyId).eq("userId", userId)).unique();
    if (!row) return { busy: false, messages: [] };
    const history = await listMessages(ctx, components.agent, { threadId: row.threadId, paginationOpts: { cursor: null, numItems: 40 }, excludeToolMessages: true, statuses: ["success"] });
    const checks = await ctx.db.query("familyAiSources").withIndex("by_thread", q => q.eq("threadId", row.threadId)).order("desc").take(40);
    const messages = history.page.filter(m => !m.tool && m.text && (m.message?.role === "user" || m.message?.role === "assistant")).reverse().map(m => {
      const check = checks.find(c => c.messageId === m._id);
      const text = m.finishReason === "length" ? `${m.text}\n\nThis answer was cut short. Ask Kosh to continue before relying on it.` : m.text!;
      return { id: m._id, role: m.message!.role as "user" | "assistant", text, time: m._creationTime, searched: check?.searched ?? false, checkedAt: check?.checkedAt ?? null, sources: check?.sources ?? [] };
    });
    return { busy: row.activeUntil > Date.now(), messages };
  },
});
