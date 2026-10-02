# Product
## Platform
Web.
## Purpose
Help a policyholder leave insurance details and practical claim steps for their family.
## Scope
One screen, one insurance policy: insurer, policy number, policy type, nominee, paper location. Live family preview. Explicit save to Convex. No signup, AI, or other assets.
## Stack
React and Vite chosen by Codex under the user's instruction to decide technical details. Convex database; any hosting must use Convex static hosting.
## Boundaries
No public listing of policies. A random browser-held key identifies the single policy. Losing that key loses access. Claim guidance is general and must be confirmed with the insurer.

Optional details: branch/agent name and phone, sum assured in rupees, short family note. Old records may omit all four database columns; the servicing contact is one user-facing detail split into name and phone. Preserve the existing screen and four claim steps.
