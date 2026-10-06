/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiAvailability from "../aiAvailability.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as insurance from "../insurance.js";
import type * as insuranceFields from "../insuranceFields.js";
import type * as policies from "../policies.js";
import type * as shares from "../shares.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiAvailability: typeof aiAvailability;
  auth: typeof auth;
  http: typeof http;
  insurance: typeof insurance;
  insuranceFields: typeof insuranceFields;
  policies: typeof policies;
  shares: typeof shares;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
};
