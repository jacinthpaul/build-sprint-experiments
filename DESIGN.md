# DESIGN.md

Read this before building or changing any screen. If a choice isn't covered here, ask me instead of guessing.

## 1\. The feeling, in labels

- **Family note:** Left-aligned text in one column, with short paragraphs and clear section headings.
- **First-action block:** The first claim action and checked contact appear together above supporting details.
- **Policy fact rows:** Labels sit beside values on larger screens and above them on phones.
- **Visible gaps:** “Missing” or “Needs checking” sits beside the affected detail.
- **Main button:** One filled button per screen state; secondary actions use underlined text.

## 2\. References, one per component

**Policy summary:** [GOV.UK summary list (https://design-system.service.gov.uk/components/summary-list/)](<https://design-system.service.gov.uk/components/summary-list/>)  
Take: Label-and-value rows, separators, and a nearby “Change” action. Stack labels above values on narrow phones.  
Ignore: Government branding, typography, and page header.

**Document preparation checklist:** [GOV.UK task list (https://design-system.service.gov.uk/components/task-list/)](<https://design-system.service.gov.uk/components/task-list/>)  
Take: Each document has a name and a written status that shows whether it is available or still needed.  
Ignore: Treating the whole claim as complete because the checklist is complete.

**Policy entry form:** [GOV.UK fieldset (https://design-system.service.gov.uk/components/fieldset/)](<https://design-system.service.gov.uk/components/fieldset/>)  
Take: Related questions grouped under a descriptive heading, with labels and short explanations.  
Ignore: Asking every possible question before showing useful information.

**Error guidance:** [GOV.UK error summary (https://design-system.service.gov.uk/components/error-summary/)](<https://design-system.service.gov.uk/components/error-summary/>)  
Take: A clear explanation at the top, links to affected fields, and a specific message beside each field.  
Ignore: Copying its colours or dimensions without fitting Kosh’s design.

**Main button:** Reference to choose before building.
Take: To be agreed from the selected component reference; keep one filled main action per screen state.
Ignore: Unrelated branding and surrounding page content.

**Policy list:** Reference to choose before building.
Take: To be agreed from the selected component reference; keep insurance type, insurer, and who or what is covered easy to compare.
Ignore: Unrelated dashboard features and decorative metrics.

**First-action block:** Reference to choose before building.
Take: To be agreed from the selected component reference; keep the first action and checked contact together above supporting details.
Ignore: Promotional copy and claims of guaranteed outcomes.

**Sharing controls:** Reference to choose before building.
Take: To be agreed from the selected component reference; make the recipient, information shared, and existing access explicit.
Ignore: Social feeds, public sharing, and unrelated collaboration features.

## 3\. Type and colour

**Font:** Noto Sans, loaded with the app, for headings, policy details, forms, guidance, and buttons on every device. Check the loaded font on the family page on a phone before calling it verified.

**Sizes:**

- 32px: Opening headline.
- 24px: Screen titles.
- 20px: Section headings.
- 16px: Body text, field labels, buttons, sources, and status messages.

**Colours:**  
Text `#1C3449` on white `#FFFFFF`; outer page background `#EDF3F8`. Secondary text `#526578`. Accent `#234B70`, with white text, only on the main action. Errors `#B42318`. Borders `#CBD5DF`.

Missing information uses a written label and border rather than colour alone. Links remain underlined.

**Text and shape rules:**

- Body text: 16px with 1.5 line spacing.
- Headings: bold; body text: regular.
- Use spacing and weight before adding another text size.
- Buttons and inputs: 8px corner radius.
- Keep policy numbers readable without cutting off their characters; wrap long values within the phone width.

## 4. Screens

**Preparation flow:** Start → Add policy → Review and preview → Account access if needed → Saved policy details → Share access → Family opens the information.
**Returning owner:** Account access if needed → Saved policies → Saved details → Edit or share.
**Family flow:** Shared link → Account access if needed → Shared guide. Returning family members choose a policy from Family policies → Claim guide.

The trigger happens outside Kosh. Loading, corrections, saving, and confirmations stay on the relevant screen. Each screen has one main action for its current state.

### Start

**For:** Beginning with one policy.
**Top to bottom:** Kosh name; outcome headline; explanation; main button; secondary “Open my saved policies” link.
**Main action:** “Start with one policy.”
**Goes to:** Add policy. The saved-policies link opens Account access if needed, then Saved policies.

**First view:** “Start with one policy. Add the others at your pace.”
**Empty:** Not applicable; this is an introduction.
**Loading:** “Opening your policy form…” Only display when opening takes time.
**Error:** “The form couldn’t open. Try again.” Button: “Try again.”
**Done:** The policy form opens.

### Add or edit policy

**For:** Collecting and correcting the details needed for a family summary.
**Top to bottom:** Back link; title; insurance type; insurer; policy number; owner; who or what is covered; dates; nominee where applicable; coverage and exclusions with sources; document location; claim contact; main button.
**Main action:** New or unsaved policy: “Review policy.” Saved edit: “Save changes.”
**Goes to:** New policy → Review and preview. Saved edit → Saved details after saving succeeds.

Show only relevant fields. Keep unknown details visibly incomplete. Automatic document reading remains a later addition.

**First view:** “Add what you know. You can complete missing details later.”
**Returning:** Show existing details and visible gaps.
**Empty:** Not applicable; a blank form is the normal starting view.
**Loading:** “Preparing your policy summary…” or “Saving your changes…”
**Error:** “Check the highlighted details before continuing,” with specific field guidance. Save failure: “Your changes weren’t saved. Try again.” Button: “Try saving again.” Keep edits available for retry.
**Done:** “Your policy summary is ready to review” or “Changes saved,” after success.
**If an answer is wrong:** Edit the affected field and check the original source. An owner correction is not insurer confirmation.

### Policy review, family preview, and saved policy details

**For:** Checking what the family will read, then saving or sharing it.
**Top to bottom:** Accurate save status; policy title; key facts; coverage and exclusions; claim situation; first action and contact; document checklist; remaining steps; sources; unresolved details; date last checked; Change links; main button.
**Main action:** Unsaved preview: “Save my policy.” Saved details: “Share access.”
**Goes to:** Save → Account access if needed, then this screen in its saved state. Share → Share access. Change → Add or edit policy, or an inline correction of the guide section.

Reuse the layout for preview and saved details. Saved information must not say “Preview — not saved.” A secondary “Back to policies” link returns to Saved policies.

**Empty, first visit:** “Add policy details to create your family summary.” Button: “Add policy details.”
**Empty, coming back:** “This policy isn’t available. Return to your saved policies.” Link: “Back to policies.”
**Loading:** “Preparing the family preview…”, “Loading your policy…”, or “Saving your policy…”
**Error:** “The policy information couldn’t load. Try again.” Button: “Try again.” Save failure: “Your policy wasn’t saved. Try again.” Button: “Try saving again.” Retain entered information for retry; promise retention only when true.
**Done:** “Preview ready. Check the details before saving,” “Policy saved,” or “Changes saved,” matching what succeeded. Missing information remains visible.
**If an answer is wrong:** Use a nearby Change action to correct owner-entered facts or guidance. Show sources and mark unsupported answers “Needs checking.” Keep conflicts visible until checked against a dependable source.

### Account access

**For:** Giving owners and family members their own access to private information.
**Top to bottom:** Context-specific reason for signing in; sign-in method; main button; back link.
**Main action:** “Sign in” or “Create account,” matching the action shown. Only one is the main action in the current state; the other is a secondary link.
**Goes to:** Saving owner → Save the pending policy and return to saved details. Returning owner → Saved policies. Family member → The authorised shared guide or Family policies. Preserve the intended destination through sign-in.

**First view, owner:** “Sign in to save and return to your policies.”
**First view, family:** “Sign in with your own account to open the information shared with you.”
**Empty:** Not applicable; this is a sign-in form.
**Loading:** “Signing you in…” Then “Saving your policy…” only if a save is pending.
**Error:** “Sign-in didn’t finish. Try again.” Button: “Try again.” If sign-in succeeds but saving fails, return to the preview: “You’re signed in, but your policy wasn’t saved. Try saving again.” Access mismatch: “This account doesn’t have access to this policy. Use the account it was shared with.” Action: “Use another account.”
**Done:** “Signed in.” Show “Policy saved” only after saving succeeds. Check authorisation before showing private information.

### Saved policies

**For:** Finding and updating policies across all insurance types.
**Top to bottom:** Title; policy list showing type, insurer, who or what is covered, last-checked date, and missing-information status; main button.
**Main action:** “Add a policy.”
**Goes to:** Add policy. Selecting an existing policy opens the reused saved details screen.

**Empty, first visit:** “No saved policies yet. Start with one.” Button: “Add a policy.”
**Empty, coming back:** “You have no saved policies.” Button: “Add a policy.”
**Loading:** “Loading your policies…”
**Error:** “Your policies couldn’t load. Try again.” Button: “Try again.” A failed load must not look like an empty list.
**Done:** Show the loaded list. Confirm a save only when one actually occurred.

### Share access

**For:** Giving the intended family member access and managing that access.
**Top to bottom:** Selected policy; recipient details; what they can view; recipient check; main button; existing access with secondary Remove access actions.
**Main action:** “Give access.” In a removal confirmation, “Remove access” becomes the main action for that state.
**Goes to:** Confirmation and sharing instructions on this screen. Removal also confirms here; no separate success page.

**First view:** “Choose who should be able to view this policy.”
**Empty, first visit or coming back:** “No one has access to this policy yet.” Keep the recipient form available.
**Loading:** “Setting up access…” or “Removing access…”
**Error:** “Access wasn’t created. Check the recipient details and try again.” Button: “Try again.” Removal failure: “Access wasn’t removed. Try again.” Button: “Try removing again.” Preserve the last confirmed access status.
**Done:** “[Name] can now access this policy” or “Access removed for [Name],” after success.

Show how to share access instructions with the recipient. Never claim delivery or reading without evidence. Sharing does not change the recorded nominee. Removing access prevents future viewing through Kosh; it cannot erase copies already kept.

### Family policies

**For:** Choosing a relevant policy from information shared with me.
**Top to bottom:** Whose information is shared; policy rows showing type, insurer, who or what is covered, dates, and missing-information status; selected policy; main button.
**Main action:** “Open policy.”
**Goes to:** Family policy and claim guide for the selected policy. A direct shared link opens its guide after access checks, without requiring selection again.

**Empty, first visit:** “No policies have been shared with you yet.”
**Empty, coming back:** “No policies are currently shared with you.” Neither message means the family has no insurance.
**Loading:** “Loading the information shared with you…”
**Error:** “Shared policies couldn’t load. Try again.” Button: “Try again.” A connection failure must not imply access was removed.
**Done:** Show the accessible policies and clearly identify the selected policy.

### Family policy and claim guide

**For:** Understanding the first action and supporting steps for one policy and claim situation.
**Top to bottom:** Back-to-policies link; whose policy this is; policy identity; claim situation; first action and contact; documents and their availability; remaining steps; coverage and exclusions; document location; sources; unresolved questions; last-checked date.
**Main action:** Before a situation is chosen: “View claim steps.” With a guide open: “Call [insurer]” if a checked number exists, otherwise “View insurer claim instructions” if a checked official link exists.
**Goes to:** The relevant guide on this screen, then the calling screen or insurer instructions when the contact action is used. Do not invent contact information to fill an empty action.

Keep the first action visible without expanding hidden sections. Family access is view-only; it cannot change owner details or sharing settings.

**Empty:** “No checked guidance is available for this situation yet.” Keep available policy facts and verified contacts visible. If needed: “The claim contact still needs checking.” This does not imply there is no coverage.
**Loading:** “Opening the shared information…” or “Loading claim steps…” Keep already loaded policy context visible only while access remains authorised.
**Error:** Connection failure: “The guide couldn’t load. Try again.” Button: “Try again.” Confirmed removal: “Your access to this policy has been removed.” Link: “Back to shared policies.” Hide protected details and only claim removal when confirmed.
**Done:** Show the first action and guide, keeping uncertainty visible. Loading a guide does not mean a claim was submitted or approved, or that all documents are available.
**If an answer is wrong:** The recipient checks its source and contacts the insurer or preparer through available, checked details. Uncertain instructions remain “Needs checking.” The owner corrects the guide from their policy details screen; a recipient can still use verified contacts without waiting for an owner edit.

## 5\. The first screen’s words

**Copy status:** Draft for me to refine aloud before publishing. The current headline is 13 words; refine it to fewer than ten words while keeping the family outcome clear. Do not replace it automatically.

**Headline:**  
Help your family find your insurance and know what to do next.

**Under it:**  
Prepare one policy at a time, check the claim steps, and share the information with the people who may need it.

**Button:**  
Start with one policy

**Five-second test:** Not run yet. Show the first screen to someone for five seconds, hide it, then ask what Kosh does and what they would tap. Record who was shown it and their actual answers here.

## 6\. Principles

- One main action per screen. Keep it easy to reach on a phone without covering information.
- Start with one policy; allow every insurance type.
- Design for a family member under stress: first action first, supporting detail afterwards.
- Separate policy owner, insured person, nominee, and person with shared access.
- Put sources and uncertainty beside the information they explain.
- Never use “complete,” “covered,” or “ready” to hide missing details or imply claim approval.
- Explain errors and the next action in plain words. Preserve entered details when possible.
- Keep private information out of screens before access is confirmed.
- Use labelled fields, visible keyboard focus, readable contrast, and buttons at least 44px high.
- Use one column on phones, generous spacing, and short paragraphs. No decorative charts, animation, or distressing imagery.
- Check every screen at phone width, including empty, loading, error, and saved states.
- Do not add new fonts, colours, screens, or features without agreement.
- Buttons name the action they perform.
- First-screen words explain the outcome, method, and next action without competing promotional text.
- Every borrowed component follows Kosh’s fonts, colours, and spacing.
- Treat new AI-written screen words as drafts for my review.
- Keep lasting design rules here; remove outdated or conflicting instructions.
