import { getServiceToken } from "convex/server";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const check = internalAction({
  args: {},
  returns: v.object({ available: v.boolean(), reason: v.string() }),
  handler: async () => {
    try {
      await getServiceToken("ai-gateway");
      return { available: true, reason: "AI Gateway access is available." };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "AI Gateway access is unavailable.";
      return { available: false, reason };
    }
  },
});
