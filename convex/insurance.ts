import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { insuranceFields, insuranceDoc } from "./insuranceFields";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { contactPhone, essentialErrors } from "../shared/contact";

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function validInstructionsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}

async function user(ctx: QueryCtx | MutationCtx) {
  const id = await getAuthUserId(ctx);
  if (!id) throw new ConvexError("Sign in to open your policies.");
  return id;
}
async function owned(ctx: QueryCtx | MutationCtx, id: Id<"insurancePolicies">) {
  const ownerId = await user(ctx);
  const policy = await ctx.db.get(id);
  if (!policy || policy.ownerId !== ownerId) throw new ConvexError("This policy isn’t available to your account.");
  return policy;
}
export const account = query({ args: {}, returns: v.union(v.null(), v.object({ id: v.id("users"), email: v.string() })), handler: async ctx => {
  const id = await getAuthUserId(ctx);
  if (!id) return null;
  const row = await ctx.db.get(id);
  return row ? { id, email: row.email ?? "" } : null;
} });
export const list = query({ args: {}, returns: v.array(insuranceDoc), handler: async ctx => {
  const ownerId = await user(ctx);
  return ctx.db.query("insurancePolicies").withIndex("by_owner", q => q.eq("ownerId", ownerId)).order("desc").take(100);
} });
export const get = query({ args: { id: v.id("insurancePolicies") }, returns: v.union(v.null(), insuranceDoc), handler: async (ctx, { id }) => {
  const ownerId = await user(ctx);
  const policy = await ctx.db.get(id);
  return policy?.ownerId === ownerId ? policy : null;
} });
export const save = mutation({ args: { id: v.optional(v.id("insurancePolicies")), ...insuranceFields }, returns: v.id("insurancePolicies"), handler: async (ctx, args) => {
  const ownerId = await user(ctx);
  const { id, ...fields } = args;
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string") {
      if (value.length > 4000) throw new ConvexError("Keep each detail under 4,000 characters.");
      (fields as Record<string, unknown>)[key] = value.trim();
    }
  }
  const essentialError = Object.values(essentialErrors(fields))[0];
  if (essentialError) throw new ConvexError(essentialError);
  fields.claimContactPhone = contactPhone(fields.claimContactPhone!)!.number;
  if ([fields.startDate, fields.endDate].some(date => date && !validDate(date))) throw new ConvexError("Check the coverage dates against your policy.");
  if (fields.startDate && fields.endDate && fields.endDate < fields.startDate) throw new ConvexError("The end date must be after the start date.");
  if (fields.sumAssured && (!Number.isFinite(Number(fields.sumAssured)) || Number(fields.sumAssured) <= 0 || Number(fields.sumAssured) > 1e12)) throw new ConvexError("Enter a positive coverage amount.");
  if (!fields.guides.length || fields.guides.length > 20) throw new ConvexError("Use between 1 and 20 claim situations per policy.");
  const seen = new Set<string>();
  for (const guide of fields.guides) {
    const situation = guide.situation.trim().toLowerCase();
    if (!situation || seen.has(situation)) throw new ConvexError("Give each claim situation a different name.");
    seen.add(situation);
    if (guide.documents.length > 40 || Object.values(guide).some(val => typeof val === "string" && val.length > 4000)) throw new ConvexError("Keep claim guidance and document lists shorter.");
    if (guide.documents.some(doc => !doc.name.trim() || doc.name.length > 500)) throw new ConvexError("Give each required document a name.");
    if (guide.contactPhone && !/^[+()\d\s.-]{6,30}$/.test(guide.contactPhone)) throw new ConvexError("Check the claim contact phone number.");
    if (guide.instructionsUrl && !validInstructionsUrl(guide.instructionsUrl)) throw new ConvexError("Use a full https link for insurer instructions without a password or username.");
    if (guide.checkedOn && (!validDate(guide.checkedOn) || guide.checkedOn > new Date().toISOString().slice(0,10))) throw new ConvexError("Use a valid past or current date for your source check.");
  }
  if (id) await owned(ctx, id);
  const rows = await ctx.db.query("insurancePolicies").withIndex("by_owner", q => q.eq("ownerId", ownerId)).take(101);
  if (!id && rows.length >= 100) throw new ConvexError("You can keep up to 100 policies in this version.");
  if (rows.some(p => p._id !== id && p.policyType === fields.policyType && p.insurer.toLowerCase() === fields.insurer.toLowerCase() && p.policyNumber.toLowerCase() === fields.policyNumber.toLowerCase())) throw new ConvexError("This policy is already saved. Open it to update its details.");
  const data = { ...fields, ownerId, updatedAt: Date.now() };
  if (id) { await ctx.db.patch(id, data); return id; }
  return ctx.db.insert("insurancePolicies", data);
} });
export const access = query({ args: { id: v.id("insurancePolicies") }, returns: v.array(v.object({ _id: v.id("familyAccess"), recipientName: v.string(), recipientId: v.id("users") })), handler: async (ctx, { id }) => {
  await owned(ctx, id);
  const rows = await ctx.db.query("familyAccess").withIndex("by_policy", q => q.eq("policyId", id)).take(50);
  return rows.map(({ _id, recipientName, recipientId }) => ({ _id, recipientName, recipientId }));
} });
export const giveAccess = mutation({ args: { id: v.id("insurancePolicies"), recipientCode: v.string(), recipientName: v.string() }, returns: v.null(), handler: async (ctx, args) => {
  const policy = await owned(ctx, args.id);
  const recipientId = ctx.db.normalizeId("users", args.recipientCode.trim());
  if (!recipientId || recipientId === policy.ownerId || !await ctx.db.get(recipientId)) throw new ConvexError("Check the family access code with your recipient.");
  if (!args.recipientName.trim() || args.recipientName.length > 200) throw new ConvexError("Add the name of the person receiving access.");
  const existing = await ctx.db.query("familyAccess").withIndex("by_policy_recipient", q => q.eq("policyId", args.id).eq("recipientId", recipientId)).unique();
  if (existing) throw new ConvexError("This person already has access.");
  const rows = await ctx.db.query("familyAccess").withIndex("by_policy", q => q.eq("policyId", args.id)).take(50);
  if (rows.length >= 50) throw new ConvexError("This policy already has 50 recipients.");
  await ctx.db.insert("familyAccess", { policyId: args.id, ownerId: policy.ownerId, recipientId, recipientName: args.recipientName.trim() });
  return null;
} });
export const removeAccess = mutation({ args: { id: v.id("familyAccess") }, returns: v.null(), handler: async (ctx, { id }) => {
  const ownerId = await user(ctx);
  const row = await ctx.db.get(id);
  if (!row || row.ownerId !== ownerId) throw new ConvexError("This access cannot be changed by your account.");
  await ctx.db.delete(id);
  return null;
} });
export const sharedList = query({ args: {}, returns: v.array(insuranceDoc), handler: async ctx => {
  const recipientId = await user(ctx);
  const rows = await ctx.db.query("familyAccess").withIndex("by_recipient", q => q.eq("recipientId", recipientId)).take(100);
  const policies = await Promise.all(rows.map(row => ctx.db.get(row.policyId)));
  return policies.filter(p => p !== null);
} });
export const sharedGet = query({ args: { id: v.id("insurancePolicies") }, returns: v.union(v.null(), insuranceDoc), handler: async (ctx, { id }) => {
  const recipientId = await user(ctx);
  const policy = await ctx.db.get(id);
  if (policy?.ownerId === recipientId) return policy;
  const access = await ctx.db.query("familyAccess").withIndex("by_policy_recipient", q => q.eq("policyId", id).eq("recipientId", recipientId)).unique();
  return access ? policy : null;
} });
export const importLegacy = mutation({ args: { browserKey: v.string() }, returns: v.union(v.null(), v.id("insurancePolicies")), handler: async (ctx, { browserKey }) => {
  const ownerId = await user(ctx);
  if (!/^[0-9a-f]{64}$/.test(browserKey)) return null;
  const existing = await ctx.db.query("legacyImports").withIndex("by_key", q => q.eq("browserKey", browserKey)).unique();
  if (existing) return existing.ownerId === ownerId ? existing.policyId : null;
  const old = await ctx.db.query("policies").withIndex("by_browser_key", q => q.eq("browserKey", browserKey)).unique();
  if (!old) return null;
  const policyId = await ctx.db.insert("insurancePolicies", {
    ownerId, updatedAt: Date.now(), insurer: old.insurer, policyNumber: old.policyNumber, policyType: old.policyType,
    nominee: old.nominee, paperLocation: old.paperLocation, sumAssured: old.sumAssured ? String(old.sumAssured) : "",
    personalNote: old.personalNote ?? "", policyOwner: "", insured: "", startDate: "", endDate: "",
    coverage: "", exclusions: "", coverageSource: "",
    guides: [{ situation: "Confirm with insurer", firstAction: old.firstAction ?? "", source: old.guideSource ?? "",
      contactName: old.servicingName ?? "", contactPhone: old.servicingPhone ?? "", contactSource: "", instructionsUrl: "",
      deadlines: "", steps: "", documents: [], checkedOn: "" }],
  });
  await ctx.db.insert("legacyImports", { browserKey, ownerId, policyId });
  const oldShares = await ctx.db.query("shares").withIndex("by_policy", q => q.eq("policyId", old._id)).take(50);
  for (const share of oldShares) await ctx.db.delete(share._id);
  return policyId;
} });
