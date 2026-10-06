import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { insuranceFields } from "./insuranceFields";
export const policyType = v.union(v.literal("Life insurance"), v.literal("Health insurance"), v.literal("Personal accident insurance"), v.literal("Motor insurance"), v.literal("Other insurance"));
export const optionalFields = { firstAction: v.optional(v.string()), guideSource: v.optional(v.string()), servicingName: v.optional(v.string()), servicingPhone: v.optional(v.string()), sumAssured: v.optional(v.number()), personalNote: v.optional(v.string()) };
export const policyFields = { insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string(), ...optionalFields };
export default defineSchema({
 ...authTables,
 insurancePolicies: defineTable({ ownerId: v.id("users"), updatedAt: v.number(), ...insuranceFields }).index("by_owner", ["ownerId"]),
 familyAccess: defineTable({ policyId: v.id("insurancePolicies"), ownerId: v.id("users"), recipientId: v.id("users"), recipientName: v.string() })
  .index("by_policy", ["policyId"]).index("by_recipient", ["recipientId"]).index("by_policy_recipient", ["policyId", "recipientId"]),
 legacyImports: defineTable({ browserKey: v.string(), ownerId: v.id("users"), policyId: v.id("insurancePolicies") }).index("by_key", ["browserKey"]),
 shares: defineTable({ token: v.string(), policyId: v.id("policies") }).index("by_token", ["token"]).index("by_policy", ["policyId"]),
 policies: defineTable({ browserKey: v.string(), insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string(), ...optionalFields }).index("by_browser_key", ["browserKey"]),
});
