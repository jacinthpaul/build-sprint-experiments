import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export const policyType = v.union(v.literal("Life insurance"), v.literal("Health insurance"), v.literal("Personal accident insurance"), v.literal("Motor insurance"), v.literal("Other insurance"));
export default defineSchema({ policies: defineTable({ browserKey: v.string(), insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string() }).index("by_browser_key", ["browserKey"]) });
