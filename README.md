# Kosh

Kosh keeps insurance details in a private account and lets the owner share view-only access with chosen family members.

## Run locally

From `C:\Users\Jacinth\build-sprint-app`, run `npm run dev` and open http://127.0.0.1:5173/.

Enter the insurance company, policy number, contact name and a valid contact phone number. Coverage end date, document location and coverage amount are optional. The family preview updates as you type. Downloading a PDF does not require an account. Creating a private link saves the policy after sign-up or sign-in.

Unfinished details stay in the current tab while navigating the app. Closing or reloading the tab clears an unsaved draft. Saved policies are tied to the account and can be reopened on another device. Email password reset is not available; the sign-up screen asks users to keep their password.

## Share with family

Open a saved policy, choose Share policy, and create an invitation with the recipient's name. Send the invitation link yourself. The recipient signs in with their own account and requests access. The owner checks the email address and approves or declines the request. Opening an invitation alone never grants access.

Invitations expire after seven days. Approved access stays available until the owner removes it. Recipients cannot edit policies or sharing settings. Removing access takes effect on the live page, and an old invitation cannot restore it. Copies someone has already downloaded remain with them.

Local invitation links use localhost. Create links on the hosted app when sending them to someone on another device.

## PDFs, examples and AI

PDFs include the policy facts, general claim starting steps, and any earlier saved notes and claim guidance. A PDF is a copy and does not update after edits. The PDF library and fonts load when downloading.

See a sample family page opens fictional details and prewritten examples, including a Telugu example. It makes no live AI requests. Live AI, translation and voice are available on a policy shared with the signed-in account when the existing Convex AI Gateway is enabled. AI answers are private to each account, and saved policy details remain available when AI is unavailable.

Quarterly review reminders appear inside Kosh when the owner returns; no email is sent. Keep Kosh records a request for a payment link, once per account. It does not take a payment or automatically send a message.

## Check the app

`npm run build` checks TypeScript and builds the frontend.

With the local server running, `npm test` runs browser tests in installed Microsoft Edge. It uses fictional accounts and policy details to check sign-in, draft cancellation, saving, duplicate-save recovery, all seven insurance types, phone layouts, PDF download errors, invitations, approvals, declined requests, access removal, review reminders, Keep Kosh, the public sample and recovery of earlier policies.

After the browser tests, `npm run test:pdf` reads the five downloaded PDFs and checks that saved details and copy notices remain present. This check uses Python with `pypdf` installed.

The live AI test is skipped by default because it uses paid models. To include it and test the hosted app in PowerShell:

```powershell
$env:KOSH_TEST_URL = 'https://qualified-squirrel-308.convex.site'
$env:KOSH_TEST_AI = 'true'
$env:KOSH_TEST_VOICE_WAV = (Resolve-Path 'tests/fixtures/voice-question.wav').Path
npm test
npm run test:pdf
```

The optional voice fixture is a WAV recording saying "Where are the policy documents?". Without that fixture variable, the live AI test checks guidance, translation, drafts and conversation privacy but skips microphone transcription. Device microphone and read-aloud support still depend on the person's browser and available voices.

Screenshots and downloaded PDFs are saved under `verification/` and `.impeccable/review/`. Keep authentication sessions, credentials and generated verification files out of git.

## Publish

The hosted app is https://qualified-squirrel-308.convex.site. Run `npm run deploy` to publish the backend and static app to the existing Convex deployment. Pushing to GitHub does not deploy the app. Deployment keeps existing policies in the same database.
