import { v } from "convex/values";

export const insuranceType = v.union(...[
  "Life insurance", "Health insurance", "Personal accident insurance", "Motor insurance",
  "Home insurance", "Travel insurance", "Other insurance",
].map((type) => v.literal(type)));
export const claimGuide = v.object({
  situation: v.string(), firstAction: v.string(), contactName: v.string(), contactPhone: v.string(),
  contactSource: v.string(), source: v.string(), instructionsUrl: v.string(),
  deadlines: v.string(), steps: v.string(),
  documents: v.array(v.object({ name: v.string(), available: v.boolean() })),
  checkedOn: v.string(),
});
export const insuranceFields = {
  insurer: v.string(), policyNumber: v.string(), policyType: insuranceType,
  policyOwner: v.string(), insured: v.string(), nominee: v.string(),
  startDate: v.string(), endDate: v.string(), paperLocation: v.string(),
  coverage: v.string(), exclusions: v.string(), coverageSource: v.string(),
  sumAssured: v.string(), personalNote: v.string(), guides: v.array(claimGuide),
  claimContact: v.optional(v.string()),
  claimContactName: v.optional(v.string()), claimContactPhone: v.optional(v.string()),
};
export const insuranceDoc = v.object({
  _id: v.id("insurancePolicies"), _creationTime: v.number(), ownerId: v.id("users"),
  updatedAt: v.number(), ...insuranceFields,
});
