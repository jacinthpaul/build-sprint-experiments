import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { policyType, optionalFields } from "./schema";
const fields = { insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string(), ...optionalFields };
const keyCheck = (key: string) => { if (!/^[0-9a-f]{64}$/.test(key)) throw new Error("Invalid browser key. Reload this page."); };
export const get = query({ args: { browserKey: v.string() }, returns: v.union(v.null(), v.object(fields)), handler: async (ctx, args) => {
 keyCheck(args.browserKey);
 if (await ctx.db.query("legacyImports").withIndex("by_key", q => q.eq("browserKey", args.browserKey)).unique()) return null;
 const row = await ctx.db.query("policies").withIndex("by_browser_key", q => q.eq("browserKey", args.browserKey)).unique();
 if (!row) return null;
 const { _id, _creationTime, browserKey, ...policy } = row;
 return policy;
} });
export const save = mutation({ args: { browserKey: v.string(), ...fields }, returns: v.null(), handler: async (ctx, args) => {
 keyCheck(args.browserKey);
 if (await ctx.db.query("legacyImports").withIndex("by_key", q => q.eq("browserKey", args.browserKey)).unique()) throw new Error("This policy has moved into a Kosh account. Sign in to update it.");
 const data = { ...args, insurer: args.insurer.trim(), policyNumber: args.policyNumber.trim(), nominee: args.nominee.trim(), paperLocation: args.paperLocation.trim(), servicingName: args.servicingName?.trim() || undefined, servicingPhone: args.servicingPhone?.trim() || undefined, personalNote: args.personalNote?.trim() || undefined, sumAssured: args.sumAssured };
 for (const value of [data.insurer, data.policyNumber, data.nominee, data.paperLocation]) if (!value || value.length > 500) throw new Error("Fill in every required field using 500 characters or fewer.");
 for (const value of [data.servicingName, data.servicingPhone, data.personalNote, data.firstAction, data.guideSource]) if (value && value.length > 500) throw new Error("Optional text must be 500 characters or fewer.");
 if (data.sumAssured !== undefined && (!Number.isFinite(data.sumAssured) || data.sumAssured <= 0 || data.sumAssured > 1e12 || Math.abs(data.sumAssured * 100 - Math.round(data.sumAssured * 100)) > 0.01)) throw new Error("Enter a positive rupee amount with up to two decimal places.");
 const row = await ctx.db.query("policies").withIndex("by_browser_key", q => q.eq("browserKey", args.browserKey)).unique();
 if (row) await ctx.db.patch(row._id, data); else await ctx.db.insert("policies", data);
 return null;
} });
