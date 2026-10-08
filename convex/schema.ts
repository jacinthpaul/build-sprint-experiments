import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { insuranceFields } from "./insuranceFields";
export const policyType = v.union(v.literal("Life insurance"), v.literal("Health insurance"), v.literal("Personal accident insurance"), v.literal("Motor insurance"), v.literal("Other insurance"));
export const optionalFields = { firstAction: v.optional(v.string()), guideSource: v.optional(v.string()), servicingName: v.optional(v.string()), servicingPhone: v.optional(v.string()), sumAssured: v.optional(v.number()), personalNote: v.optional(v.string()) };
export const policyFields = { insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string(), ...optionalFields };
export default defineSchema({
 ...authTables,
 familyAiThreads: defineTable({ policyId: v.id("insurancePolicies"), userId: v.id("users"), threadId: v.string(), activeUntil: v.number(), requestId: v.string(), day: v.string(), requests: v.number() }).index("by_policy_user", ["policyId", "userId"]),
 familyAiUsage: defineTable({ key: v.string(), day: v.string(), requests: v.number() }).index("by_key_day", ["key", "day"]),
 familyAiSources: defineTable({ threadId: v.string(), messageId: v.string(), checkedAt: v.number(), searched: v.boolean(), sources: v.array(v.object({ url: v.string(), title: v.string() })) }).index("by_thread", ["threadId"]),
 insurancePolicies: defineTable({ ownerId: v.id("users"), updatedAt: v.number(), ...insuranceFields }).index("by_owner", ["ownerId"]),
 policyReviewReminders: defineTable({ ownerId: v.id("users"), policyId: v.id("insurancePolicies"), enabled: v.boolean(), nextReviewAt: v.number(), lastReviewedAt: v.optional(v.number()) })
  .index("by_policy", ["policyId"]).index("by_owner_enabled", ["ownerId", "enabled"]),
 familyInvitations: defineTable({ policyId: v.id("insurancePolicies"), ownerId: v.id("users"), recipientName: v.string(), token: v.string(), expiresAt: v.number(), state: v.union(v.literal("open"), v.literal("closed")) })
  .index("by_token", ["token"]).index("by_policy_state_expiry", ["policyId", "state", "expiresAt"]),
 familyInvitationRequests: defineTable({ invitationId: v.id("familyInvitations"), userId: v.id("users"), status: v.union(v.literal("pending"), v.literal("approved"), v.literal("declined")) })
  .index("by_invitation", ["invitationId"]).index("by_invitation_user", ["invitationId", "userId"]).index("by_user_status", ["userId", "status"]),
 familyAccess: defineTable({ policyId: v.id("insurancePolicies"), ownerId: v.id("users"), recipientId: v.id("users"), recipientName: v.string() })
  .index("by_policy", ["policyId"]).index("by_recipient", ["recipientId"]).index("by_policy_recipient", ["policyId", "recipientId"]),
 legacyImports: defineTable({ browserKey: v.string(), ownerId: v.id("users"), policyId: v.id("insurancePolicies") }).index("by_key", ["browserKey"]),
 shares: defineTable({ token: v.string(), policyId: v.id("policies") }).index("by_token", ["token"]).index("by_policy", ["policyId"]),
 policies: defineTable({ browserKey: v.string(), insurer: v.string(), policyNumber: v.string(), policyType, nominee: v.string(), paperLocation: v.string(), ...optionalFields }).index("by_browser_key", ["browserKey"]),
});
