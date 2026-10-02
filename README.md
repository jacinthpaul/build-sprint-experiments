# Open the app
From C:\Users\Jacinth\build-sprint-app, run `npm run dev`, then open http://127.0.0.1:5173/.
Fill in the five policy details and press Save policy. The family note updates immediately; saving writes to the connected Convex development database.
Return using the same browser and address. Clearing site data removes the private browser key. There is no signup or family sharing yet.

## Checks
`npm run build` checks TypeScript and builds the screen.
`npm test` uses installed Microsoft Edge to check preview, policy-specific guidance, Convex save, reload, updates, phone width and browser isolation. It saves fictitious demo data under a separate test browser key.
`npx convex dev --once` publishes backend functions to the connected development deployment.
The frontend runs locally; no public deployment has been performed.
