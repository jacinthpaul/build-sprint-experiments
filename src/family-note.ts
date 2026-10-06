import {savedContact,type Policy} from './policy';

export const familyIntro = 'You don’t have to figure out where to start. Here’s the policy and what to do next.';
export const familyCaution = 'These are general starting steps, not confirmation of cover or a payout. Confirm the current process, contact details and requirements with the insurer. Sharing does not change the nominee.';

// The web note and its downloadable copy use the same saved facts and starting steps.
export function familyNote(p:Policy){
 const facts=[
  ...(p.insurer?[['Insurer',p.insurer]]:[]),
  ['Insurance type',p.policyType],['Policy number',p.policyNumber],
  ...(p.nominee?[['Recorded nominee',p.nominee]]:[]),
  ['Coverage end date',p.endDate||'Not recorded — check the policy'],
  ['Where the hard or soft copy is kept',p.paperLocation||'Not recorded'],
  ['Coverage amount',p.sumAssured?new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2,minimumFractionDigits:0}).format(Number(p.sumAssured)):'Not recorded'],
 ];
 const contact=savedContact(p);
 const steps=[
  {title:'Find the policy papers',paragraphs:[p.paperLocation?`They’re kept at: ${p.paperLocation}.`:'The location has not been recorded. Look for the policy in saved files, email or paper records.','Check the policy for the insurer’s name, cover and exclusions. If you cannot find it, ask the insurer how to get a copy.']},
  {title:p.insurer?`Contact ${p.insurer}`:'Contact the insurer',paragraphs:[contact?`Saved agent or customer care details: ${contact}`:'No agent or customer care details have been saved. Use the contact printed on the policy or the insurer’s official website.',`Quote policy number ${p.policyNumber}. Explain what happened and ask how to notify a claim, which form and documents are needed, and what deadlines apply. Confirm the contact through the insurer before sending personal documents.`]},
  {title:'Confirm who can claim and gather documents',paragraphs:[...(p.nominee?[`Nominee recorded here: ${p.nominee}.`]:[]),'Ask the insurer to confirm who can submit this claim and give you the document checklist for this policy and situation. Confirm any missing information before submitting.']},
  {title:'Submit the claim and keep a record',paragraphs:['Follow the insurer’s instructions. Keep copies of what you send, the claim reference number and the acknowledgement. Ask how to track the claim and when to follow up.']},
 ];
 return {facts,steps,contact};
}
