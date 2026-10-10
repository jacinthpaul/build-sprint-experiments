import React,{useState} from 'react';
import {useQuery} from 'convex/react';
import {api} from '../convex/_generated/api';
import type {Id} from '../convex/_generated/dataModel';
import {blankGuide,blankPolicy,policyStatus,policyTitle,validHttps,type Policy} from './policy';
import {Back,Loading,go} from './common';
import {familyNote,familyIntro,familyCaution} from './family-note';
import {downloadFamilyPdf} from './family-pdf';
import {FamilyAssistant} from './family-assistant';
import {contactPhone} from '../shared/contact';
import {BankCoverNotice} from './bank-cover-notice';
import {PolicyReviewReminder} from './policy-review-reminder';
import {KeepKosh} from './keep-kosh';
import {StatusChip,StatusValue} from './status-chip';
import {PolicyIcon} from './policy-icon';
function Fact({label,value}:{label:string;value:string}){return <div className="fact"><dt>{label}</dt><dd><StatusValue value={value.trim()||'Not recorded'}/></dd></div>;}
function Source({value}:{value:string}){return value?<p className="source">Source: {validHttps(value)?<a href={value} target="_blank" rel="noreferrer">{value}</a>:value}</p>:<p><StatusChip variant="needs-checking">Source missing — needs checking.</StatusChip></p>;}
export function PolicyView({policy:p,preview=false,family=false,sample=false,onChange}:{policy:Policy;preview?:boolean;family?:boolean;sample?:boolean;onChange?:()=>void}){
 const note=familyNote(p);const contact=note.contact;
 const candidates=contact.match(/\+?\d[\d ()-]{5,}\d/g)||[];
 const phone=p.claimContactPhone?contactPhone(p.claimContactPhone)?.number:candidates.find(number=>{const count=number.replace(/\D/g,'').length;return count>=7&&count<=15;});
 const earlier=p.guides.filter(g=>g.firstAction||g.steps||g.documents.length||g.deadlines);
 return <>
  <p className="muted note-state">{sample?'Sample policy — fictional details':preview?'Not saved to your account':family?'Shared with you':'Saved policy'}</p>
  {onChange&&<button className="text-button note-edit" onClick={onChange}>Change policy details</button>}
  <article className="family-note" aria-label="For my family">
  <h2 className="note-title">For my family</h2><p className="note-intro">{familyIntro}</p>
  <dl>{note.facts.map(([label,value])=><Fact key={label} label={label} value={value}/>)}</dl>
  <section className="claim-start"><h2>How to start a claim</h2><ol className="claim-steps">
   {note.steps.map((step,index)=><li key={step.title}><h3>{step.title}</h3>{step.paragraphs.map((text,i)=><p className="preserve" key={i}>{text}</p>)}
    {index===1&&family&&phone&&<a className="secondary" href={'tel:'+phone.replace(/[^+0-9]/g,'')}>Call saved contact</a>}
   </li>)}
  </ol></section>
  {(p.insurer||p.insured||p.policyOwner||p.nominee||p.coverage||p.exclusions||p.personalNote||earlier.length>0)&&<details className="earlier-details"><summary>Earlier saved details</summary>
   {p.insurer&&<p>Insurer: {p.insurer}</p>}{p.policyOwner&&<p>Policy owner: {p.policyOwner}</p>}{p.insured&&<p>Who or what is covered: {p.insured}</p>}{p.nominee&&<p>Recorded nominee: {p.nominee}</p>}
   {p.coverage&&<p className="preserve">Coverage: {p.coverage}</p>}{p.exclusions&&<p className="preserve">Exclusions: {p.exclusions}</p>}{(p.coverage||p.exclusions)&&<Source value={p.coverageSource}/>}{p.personalNote&&<p className="personal-note">{p.personalNote}</p>}
   {earlier.map((g,index)=><section key={index}><h3>{g.situation}</h3>{g.firstAction&&<p>{g.firstAction}</p>}{g.steps&&<p className="preserve">{g.steps}</p>}{g.deadlines&&<p>Stated deadlines: {g.deadlines}</p>}{g.documents.length>0&&<ul>{g.documents.map((d,i)=><li key={i}>{d.name} — <StatusChip variant={d.available?'found':'missing'}>{d.available?'Available':'Still needed'}</StatusChip></li>)}</ul>}<Source value={g.source}/>{g.checkedOn&&<p className="muted">Last checked by the owner: {g.checkedOn}</p>}</section>)}
  </details>}
  <p className="disclaimer">{familyCaution}</p>
 </article></>;
}
export function SavedPolicy({id}:{id:Id<'insurancePolicies'>}){const p=useQuery(api.insurance.get,{id});if(p===undefined)return <Loading>Loading your policy…</Loading>;if(!p)return <><h1>This policy isn’t available.</h1><Back onClick={()=>go('policies')}>Back to policies</Back></>;return <><Back onClick={()=>go('policies')}>Back to policies</Back><PolicyView policy={p} onChange={()=>go('add',id)}/><div className="action-row"><button className="primary" onClick={()=>go('share',id)}>Share policy</button><span className="muted">Last saved: {new Date(p.updatedAt).toLocaleDateString('en-IN')}</span></div><PolicyReviewReminder id={id}/><KeepKosh/></>;}
export function PolicyList({onAdd}:{onAdd:()=>void}){const policies=useQuery(api.insurance.list,{});const reminders=useQuery(api.reviewReminders.list,{});return <><Back onClick={()=>go('start')}>Kosh home</Back><h1>Your saved policies</h1><p className="muted">Keep the details together. Check each policy at your pace.</p>{policies===undefined?<Loading/>:!policies.length?<p>No saved policies yet. Start with one.</p>:<ul className="policy-list">{policies.map(p=><li key={p._id}><button className="policy-row" onClick={()=>go('policy',p._id)}><PolicyIcon type={p.policyType}/><span className="policy-summary"><strong>{policyTitle(p)}</strong><span>{p.policyType}{p.insured&&<> · {p.insured}</>}</span><span className="muted">Policy {p.policyNumber}</span></span><span className="row-status">{reminders?.some(r=>r.policyId===p._id&&r.nextReviewAt<=Date.now())?<><StatusChip variant="needs-checking">Review due</StatusChip><StatusChip variant="needs-checking">{policyStatus(p)}</StatusChip></>:<StatusChip variant="needs-checking">{policyStatus(p)}</StatusChip>}<span className="muted">Saved {new Date(p.updatedAt).toLocaleDateString('en-IN')}</span></span></button></li>)}</ul>}<div className="action-row"><button className="primary" onClick={onAdd}>{policies?.length?'Add another policy':'Add a policy'}</button><button className="text-button" onClick={()=>go('family')}>Information shared with me</button></div><KeepKosh/></>;}
export {FamilyList} from './family-list';
export function FamilyGuide({id}:{id:Id<'insurancePolicies'>}){const p=useQuery(api.insurance.sharedGet,{id});if(p===undefined)return <Loading>Opening the shared information…</Loading>;if(!p)return <><h1>This policy isn’t shared with your account.</h1><p>Your access may have been removed, or you may be signed in with a different account.</p><Back onClick={()=>go('family')}>Back to shared policies</Back></>;return <><Back onClick={()=>go('family')}>Back to shared policies</Back><h1>Your shared policy</h1><p className="muted">{policyTitle(p)} · {p.policyType} · Policy {p.policyNumber}</p><FamilyAssistant key={id} policyId={id} savedInsurer={p.insurer}/><PolicyView policy={p} family/><FamilyDownload policy={p}/><BankCoverNotice/></>;}
export function LegacyFamily({token}:{token:string}){const old=useQuery(api.shares.get,{token});if(old===undefined)return <Loading>Opening your earlier family note…</Loading>;if(!old)return <><h1>This family link is unavailable.</h1><p>Ask the policyholder to share access with your own Kosh account.</p></>;const p:Policy={...blankPolicy(),...old,claimContact:undefined,sumAssured:old.sumAssured?String(old.sumAssured):'',personalNote:old.personalNote||'',guides:[{...blankGuide('Confirm with insurer'),firstAction:old.firstAction||'',source:old.guideSource||'',contactName:old.servicingName||'',contactPhone:old.servicingPhone||''}]};return <><p className="muted">Earlier shared note. Ask the policyholder to move it into an account and share access directly with you.</p><PolicyView policy={p} family/><FamilyDownload policy={p}/><BankCoverNotice/></>;}
export function FamilyDownload({policy,sample=false}:{policy:Policy;sample?:boolean}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 return <div className="family-download"><button className="text-button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await downloadFamilyPdf(policy,{sample});}catch{setError('The PDF could not be prepared. Try again.');}finally{setBusy(false);}}}>{busy?'Preparing PDF…':sample?'Download sample PDF':'Download this family note'}</button><p className="muted">A downloaded copy does not update when the policyholder makes changes.</p>{error&&<p role="alert" className="error">{error}</p>}</div>;
}
