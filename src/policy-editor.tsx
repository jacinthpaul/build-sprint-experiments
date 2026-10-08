import React, {useEffect, useRef, useState} from 'react';
import {useQuery} from 'convex/react';
import {api} from '../convex/_generated/api';
import type {Id} from '../convex/_generated/dataModel';
import {blankPolicy, policyTypes, savedContact, type Policy} from './policy';
import {Back, Loading, Notice, go} from './common';
import {PolicyPreview} from './policy-preview';
import './policy-editor.css';
import { contactPhone, essentialErrors, type EssentialPolicy } from '../shared/contact';

export function PolicyEditor({initial, id, onReview, onSave, onBack, onDraft, busy}: {
 initial: Policy; id?: Id<'insurancePolicies'>; onReview: (p:Policy)=>void;
 onSave: (p:Policy, id:Id<'insurancePolicies'>)=>Promise<void>;
 onBack: ()=>void; onDraft: (p:Policy)=>void; busy: boolean;
}) {
 const stored = useQuery(api.insurance.get, id ? {id} : 'skip');
 const [p, setP] = useState(initial);
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EssentialPolicy | 'sumAssured', string>>>({});
 const [mobileView, setMobileView] = useState<'details'|'preview'>('details');
 const [activeField, setActiveField] = useState('');
 const hydrated = useRef(false);
 useEffect(() => {
  if (id && stored && !hydrated.current) {
   const clean = blankPolicy();
   for (const key of Object.keys(clean) as (keyof Policy)[]) {
    (clean as unknown as Record<string,unknown>)[key] = stored[key] ?? clean[key];
   }
   clean.claimContact = savedContact(stored);
   clean.claimContactName = stored.claimContactName ?? stored.guides.find(g => g.contactName)?.contactName ?? '';
   const oldPhone = stored.claimContactPhone ?? stored.guides.find(g => g.contactPhone)?.contactPhone ?? '';
   clean.claimContactPhone = contactPhone(oldPhone)?.number ?? '';
   setP(clean); hydrated.current = true;
  }
 }, [id, stored]);
 useEffect(() => { if (!id) onDraft(p); }, [p, id, onDraft]);
 const change = (key:keyof Policy, value:string) => { setP(p=>({...p, [key]:value})); setFieldErrors(errors=>({...errors,[key]:undefined})); };
 async function submit(event:React.FormEvent) {
  event.preventDefault(); setError('');
  const errors: typeof fieldErrors = essentialErrors(p);
  if (p.sumAssured && (!Number.isFinite(Number(p.sumAssured)) || Number(p.sumAssured)<=0 || Number(p.sumAssured)>1e12)) {
   errors.sumAssured = 'Enter a positive coverage amount.';
  }
  setFieldErrors(errors);
  if (Object.keys(errors).length) {
   setError(Object.values(errors)[0]!); setMobileView('details');
   document.getElementById('field-' + Object.keys(errors)[0])?.focus(); return;
  }
  const checked = {...p, insurer:p.insurer.trim(), claimContactName:p.claimContactName!.trim(), claimContactPhone:contactPhone(p.claimContactPhone!)!.number};
  if (id) await onSave(checked,id); else onReview(checked);
 }
 if (id && stored===undefined) return <Loading>Loading your policy…</Loading>;
 if (id && stored===null) return <><h1>This policy isn’t available.</h1><Back onClick={()=>go('policies')}>Back to policies</Back></>;
 return <>
  <Back onClick={onBack}/><h1>{id?'Edit policy':'Add a policy'}</h1>
  <p className="muted">Your family needs the company, policy number and a contact. Add the other details when you have them.</p>
  <Notice error={error}/>
  <div className="policy-editor-views" aria-label="Policy entry views">
   <button type="button" aria-pressed={mobileView==='details'} aria-controls="policy-editor-form" onClick={()=>setMobileView('details')}>Policy details</button>
   <button type="button" aria-pressed={mobileView==='preview'} aria-controls="family-policy-preview" onClick={()=>setMobileView('preview')}>Family preview</button>
  </div>
  <div className="policy-editor-layout" data-mobile-view={mobileView}>
  <form className="policy-entry-form" id="policy-editor-form" noValidate onSubmit={submit} onFocusCapture={event=>setActiveField(event.target.getAttribute('aria-label')||'')}><fieldset disabled={busy}>
   <section className="form-section"><h2>Policy details</h2>
    <label>Insurance type<select aria-label="Insurance type" value={p.policyType} onChange={e=>change('policyType',e.target.value)}>{policyTypes.map(type=><option key={type}>{type}</option>)}</select></label>
    <label>Insurance company (required)<input id="field-insurer" aria-label="Insurance company" value={p.insurer} required maxLength={100} aria-invalid={!!fieldErrors.insurer} aria-describedby={fieldErrors.insurer?'error-insurer':undefined} onChange={e=>change('insurer',e.target.value)}/>{fieldErrors.insurer&&<span className="field-error" id="error-insurer">{fieldErrors.insurer}</span>}</label>
    <label>Policy number (required)<input id="field-policyNumber" aria-label="Policy number" value={p.policyNumber} required maxLength={4000} aria-invalid={!!fieldErrors.policyNumber} aria-describedby={fieldErrors.policyNumber?'error-policyNumber':undefined} onChange={e=>change('policyNumber',e.target.value)}/>{fieldErrors.policyNumber&&<span className="field-error" id="error-policyNumber">{fieldErrors.policyNumber}</span>}</label>
    <label>Coverage end date (optional)<input aria-label="Coverage end date" type="date" value={p.endDate} onChange={e=>change('endDate',e.target.value)}/></label>
    <label>Where the hard or soft copy is kept (optional)<input aria-label="Where the hard or soft copy is kept" value={p.paperLocation} maxLength={4000} aria-describedby="document-location-hint" onChange={e=>change('paperLocation',e.target.value)}/><span className="hint" id="document-location-hint">For example: bedroom cupboard, Gmail, or a shared folder.</span></label>
    <label>Coverage amount (₹) (optional)<input id="field-sumAssured" aria-label="Coverage amount (₹)" type="number" min="0.01" max="1000000000000" step="0.01" value={p.sumAssured} aria-invalid={!!fieldErrors.sumAssured} onChange={e=>change('sumAssured',e.target.value)}/>{fieldErrors.sumAssured&&<span className="field-error">{fieldErrors.sumAssured}</span>}</label>
   </section>
   <section className="form-section"><h2>Claim contact</h2>
    {id && p.claimContact && !stored?.claimContactName && <p className="preserve muted">Earlier saved contact: {p.claimContact}. Check it and enter the name and phone separately below.</p>}
    <label>Contact name (required)<input id="field-claimContactName" aria-label="Contact name" required maxLength={200} value={p.claimContactName||''} aria-invalid={!!fieldErrors.claimContactName} aria-describedby="contact-name-hint error-contact-name" onChange={e=>change('claimContactName',e.target.value)}/><span className="hint" id="contact-name-hint">The agent’s name or the customer care team.</span>{fieldErrors.claimContactName&&<span className="field-error" id="error-contact-name">{fieldErrors.claimContactName}</span>}</label>
    <label>Contact phone number (required)<input id="field-claimContactPhone" aria-label="Contact phone number" type="tel" inputMode="tel" required maxLength={64} value={p.claimContactPhone||''} aria-invalid={!!fieldErrors.claimContactPhone} aria-describedby="contact-phone-hint error-contact-phone" onChange={e=>change('claimContactPhone',e.target.value)}/><span className="hint" id="contact-phone-hint">Use the area code for landlines. For a number outside India, include + and the country code. Kosh checks the format; confirm the number with the insurer.</span>{fieldErrors.claimContactPhone&&<span className="field-error" id="error-contact-phone">{fieldErrors.claimContactPhone}</span>}</label>
   </section>
   <div className="action-row"><button className="primary" type="submit">{busy?'Saving…':id?'Save changes':'Share policy'}</button><span className="muted">{id?'Your other saved details will be kept.':'Choose a PDF download or a private link next.'}</span></div>
  </fieldset></form>
  <PolicyPreview policy={p} activeField={activeField} onDetails={()=>setMobileView('details')}/>
  </div>
 </>;
}
