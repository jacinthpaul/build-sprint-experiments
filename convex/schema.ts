import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export const policyType = v.union(v.literal("Life insurance"), v.literal("Health insurance"), v.literal("Personal accident insurance"), v.literal("Motor insurance"), v.literal("Other insurance"));
export const optionalFields = { servicingName: v.optional(v.string()), servicingPhone: v.optional(v.string()), sumAssured: v.optional(v.number()), personalNote: v.optional(v.string()) };
export default defineSchema({ policies: defineTable({ browserKey: v.string(), insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string(), ...optionalFields }).index("by_browser_key", ["browserKey"]) });
