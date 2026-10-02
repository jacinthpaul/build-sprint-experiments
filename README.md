# Open the app
From C:\Users\Jacinth\build-sprint-app, run `npm run dev`, then open http://127.0.0.1:5173/.
Fill in the five policy details and press Save policy. The family note updates immediately; saving writes to the connected Convex development database.
Return using the same browser and address. Clearing site data removes the private browser key. There is no signup or family sharing yet.

## Checks
`npm run build` checks TypeScript and builds the screen.
`npm test` uses installed Microsoft Edge to check preview, policy-specific guidance, Convex save, reload, updates, phone width and browser isolation. It saves fictitious demo data under a separate test browser key.
`npx convex dev --once` publishes backend functions to the connected development deployment.
The frontend runs locally; no public deployment has been performed.
## Optional policy details
The servicing branch or agent name and phone, sum assured in rupees, and a personal note are optional. Missing values from older policies stay blank in the form and are hidden in the family note. The personal note appears first; the servicing contact appears inside the existing Contact insurer step.

## Local check links
http://127.0.0.1:5173/#check=new-policy opens the fictional LIC demo with all optional details.
http://127.0.0.1:5173/#check=old-policy opens the DEMO-002 policy saved before the optional fields existed.
These demo selectors work only with the local development server, use existing Convex demo records, and do not replace the normal browser key or expose your own policy.
