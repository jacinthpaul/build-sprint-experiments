# Open the app
From C:\Users\Jacinth\build-sprint-app, run `npm run dev`, then open http://127.0.0.1:5173/.
Fill in the five policy details and press Save policy. The family note updates immediately; saving writes to the connected Convex development database.
Return using the same browser and address. Clearing site data removes the private browser key. There is no signup. Family links open a view-only copy of the latest saved policy.

## Checks
`npm run build` checks TypeScript and builds the screen.
`npm test` uses installed Microsoft Edge to check preview, policy-specific guidance, Convex save, reload, updates, phone width and browser isolation. It saves fictitious demo data under a separate test browser key.
`npx convex dev --once` publishes backend functions to the connected development deployment.
The frontend also runs at https://qualified-squirrel-308.convex.site. `npm run deploy` publishes the backend and static app to the existing development deployment so current policies stay in the same database.
## Optional policy details
The servicing branch or agent name and phone, sum assured in rupees, and a personal note are optional. Missing values from older policies stay blank in the form and are hidden in the family note. The personal note appears first; the servicing contact appears inside the existing Contact insurer step.

## Local check links
http://127.0.0.1:5173/#check=new-policy opens the fictional LIC demo with all optional details.
http://127.0.0.1:5173/#check=old-policy opens the DEMO-002 policy saved before the optional fields existed.
These demo selectors work only with the local development server, use existing Convex demo records, and do not replace the normal browser key or expose your own policy.

## PDF, link and email
Download PDF below the family note exports the current preview, including optional details and claim steps, with no edit form. The PDF library and its fonts load only when requested.
Save before using Share as link or Send by email. Anyone with the family link can read the latest saved details but cannot edit them. Turn sharing off immediately disables the old link; sharing again creates a different link.
Send by email prepares a draft link for your existing email app. On the first use, choose Open email draft after preparation. Add recipients and send from your email app; this app does not send messages itself.
Local and hosted editor addresses have separate browser keys. Continue editing an existing local policy at the original localhost address; its generated family link works on the hosted site. No policies were migrated or shared automatically.

Verified locally and on the hosted site: PDF download, view-only sharing in a separate browser, hidden owner key, live saved updates, revocation and link rotation. Email-draft subject and link checked without opening an email app or sending an email.
