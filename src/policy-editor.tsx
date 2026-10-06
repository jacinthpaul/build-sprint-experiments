import React, {useEffect, useRef, useState} from 'react';
import {useQuery} from 'convex/react';
import {api} from '../convex/_generated/api';
import type {Id} from '../convex/_generated/dataModel';
import {blankPolicy, policyTypes, savedContact, type Policy} from './policy';
import {Back, Loading, Notice, go} from './common';

export function PolicyEditor({initial, id, onReview, onSave, onBack, onDraft, busy}: {
 initial: Policy; id?: Id<'insurancePolicies'>; onReview: (p:Policy)=>void;
 onSave: (p:Policy, id:Id<'insurancePolicies'>)=>Promise<void>;
 onBack: ()=>void; onDraft: (p:Policy)=>void; busy: boolean;
}) {
 const stored = useQuery(api.insurance.get, id ? {id} : 'skip');
 const [p, setP] = useState(initial);
 const [error, setError] = useState('');
 const hydrated = useRef(false);
 useEffect(() => {
  if (id && stored && !hydrated.current) {
   const clean = blankPolicy();
   for (const key of Object.keys(clean) as (keyof Policy)[]) {
    (clean as unknown as Record<string,unknown>)[key] = stored[key] ?? clean[key];
   }
   clean.claimContact = savedContact(stored);
   setP(clean); hydrated.current = true;
  }
 }, [id, stored]);
 useEffect(() => { if (!id) onDraft(p); }, [p, id, onDraft]);
 const change = (key:keyof Policy, value:string) => setP(p=>({...p, [key]:value}));
 async function submit(event:React.FormEvent) {
  event.preventDefault(); setError('');
  if (!p.policyNumber.trim()) { setError('Add the policy number before sharing.'); return; }
  if (p.sumAssured && (!Number.isFinite(Number(p.sumAssured)) || Number(p.sumAssured)<=0 || Number(p.sumAssured)>1e12)) {
   setError('Enter a positive coverage amount.'); return;
  }
  if (id) await onSave(p,id); else onReview(p);
 }
 if (id && stored===undefined) return <Loading>Loading your policy…</Loading>;
 if (id && stored===null) return <><h1>This policy isn’t available.</h1><Back onClick={()=>go('policies')}>Back to policies</Back></>;
 return <>
  <Back onClick={onBack}/><h1>{id?'Edit policy':'Add one policy'}</h1>
  <p className="muted">Keep the essentials together. Add what you know.</p>
  <Notice error={error}/>
  <form onSubmit={submit}><fieldset disabled={busy}>
   <section className="form-section"><h2>Policy details</h2>
    <label>Insurance type<select aria-label="Insurance type" value={p.policyType} onChange={e=>change('policyType',e.target.value)}>{policyTypes.map(type=><option key={type}>{type}</option>)}</select></label>
    <label>Policy number<input aria-label="Policy number" value={p.policyNumber} required maxLength={4000} onChange={e=>change('policyNumber',e.target.value)}/></label>
    <label>Coverage end date<input aria-label="Coverage end date" type="date" value={p.endDate} onChange={e=>change('endDate',e.target.value)}/></label>
    <label>Where the hard or soft copy is kept<input aria-label="Where the hard or soft copy is kept" value={p.paperLocation} maxLength={4000} aria-describedby="document-location-hint" onChange={e=>change('paperLocation',e.target.value)}/><span className="hint" id="document-location-hint">For example: bedroom cupboard, Gmail, or a shared folder.</span></label>
    <label>Coverage amount (₹)<input aria-label="Coverage amount (₹)" type="number" min="0.01" max="1000000000000" step="0.01" value={p.sumAssured} onChange={e=>change('sumAssured',e.target.value)}/></label>
   </section>
   <section className="form-section"><h2>Claim contact</h2>
    <label>Agent number or customer care details<textarea aria-label="Agent number or customer care details" rows={2} maxLength={4000} value={p.claimContact || ''} onChange={e=>change('claimContact',e.target.value)}/></label>
   </section>
   <div className="action-row"><button className="primary" type="submit">{busy?'Saving…':id?'Save changes':'Share policy'}</button><span className="muted">{id?'Your other saved details will be kept.':'Choose a download, an email draft, or a private link next.'}</span></div>
  </fieldset></form>
 </>;
}
