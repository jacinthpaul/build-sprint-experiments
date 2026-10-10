import React from 'react';
import {BankCoverNotice} from './bank-cover-notice';
import {KeepKosh} from './keep-kosh';
import {Folder, Users} from 'lucide-react';
import {SampleFamilyNote} from './sample-family-note';

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
   <section className="home-action-card">
    <button className="home-card-button" onClick={onSaved} aria-label="Open my saved policies" aria-describedby="saved-policies-help"><Folder size={20} aria-hidden="true"/><span className="home-card-title">Open my saved policies</span>
    <span id="saved-policies-help" className={`card-description ${dueReviews?'review-due':'muted'}`}>{dueReviews?`${dueReviews} ${dueReviews===1?'policy review is':'policy reviews are'} due. Open your saved policies to check the details.`:'Keep your policies private and return to them on any device.'}</span></button>
   </section>
   <section className="home-action-card">
    <button className="home-card-button" onClick={onFamily} aria-label="Open information shared with me" aria-describedby="shared-information-help"><Users size={20} aria-hidden="true"/><span className="home-card-title">Open information shared with me</span>
    <span id="shared-information-help" className="card-description muted">Use this when someone has shared their insurance with you. Open their policy, ask Kosh for help, or speak your question.</span></button>
   </section>
   <KeepKosh onSignIn={onSaved} card/>
  </div>
  <SampleFamilyNote/>
  <p className="home-family-line">Prepared by you. Kept for the people you love.</p>
  <BankCoverNotice/>
 </div>;
}
