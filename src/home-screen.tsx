import React from 'react';
import {BankCoverNotice} from './bank-cover-notice';
import {KeepKosh} from './keep-kosh';

export function HomeScreen({onStart,onSaved,onFamily,onDemo,onContinue,hasDraft=false,policyCount=0,loading=false,dueReviews=0}:{onStart:()=>void;onSaved:()=>void;onFamily:()=>void;onDemo:()=>void;onContinue:()=>void;hasDraft?:boolean;policyCount?:number;loading?:boolean;dueReviews?:number}){
 return <div className="home-content">
  <section className="home-hero">
   <h1>Help your family find your insurance and know what to do next.</h1>
   <p className="home-intro">Share your insurance details. When your family needs them, Kosh will offer personalised guidance on what to do next.</p>
   <button className="primary home-primary" disabled={loading} onClick={hasDraft?onContinue:onStart}>{loading?'Loading your policies…':hasDraft?'Continue draft':policyCount?'Add another policy':'Start with one policy'}</button>
   <p className="muted home-start-hint">{hasDraft?'Your unfinished details are kept in this tab until you close or reload it.':policyCount?`${policyCount} ${policyCount===1?'policy saved':'policies saved'}. Add another or open your saved policies below.`:'Start with one policy. Add the others at your pace.'}</p>
   {hasDraft&&<button className="text-button home-demo" onClick={onStart}>Start a new policy</button>}
   <button className="text-button home-demo" onClick={onDemo}>See a sample family page</button>
  </section>
  <div className="home-return">
   <section>
    <button className="text-button" onClick={onSaved} aria-describedby="saved-policies-help">Open my saved policies</button>
    <p id="saved-policies-help" className={dueReviews?'review-due':'muted'}>{dueReviews?`${dueReviews} ${dueReviews===1?'policy review is':'policy reviews are'} due. Open your saved policies to check the details.`:'Keep your policies private and return to them on any device.'}</p>
   </section>
   <section>
    <button className="text-button" onClick={onFamily} aria-describedby="shared-information-help">Open information shared with me</button>
    <p id="shared-information-help" className="muted">Use this when someone has shared their insurance with you. Open their policy, ask Kosh for help, or speak your question.</p>
   </section>
   <KeepKosh onSignIn={onSaved}/>
  </div>
  <aside className="home-note-preview" aria-label="Preview of a family note">
   <h2>For my family</h2>
   <p>Your policy details, with Kosh to guide you.</p>
   <ul>
    <li>Insurance details</li>
    <li>Where the policy copy is kept</li>
    <li>Who to contact</li>
    <li>Personalised explanations and current claim guidance</li>
    <li>Voice help, translation and escalation drafts</li>
   </ul>
   <p className="muted home-preview-caption">Preview of a family note</p>
  </aside>
  <BankCoverNotice/>
 </div>;
}
