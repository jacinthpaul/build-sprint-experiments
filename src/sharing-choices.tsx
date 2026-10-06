import React,{useState} from 'react';
import type {Policy} from './policy';
import {downloadFamilyPdf,policyEmailHref,policyShareText} from './family-pdf';
import {Notice} from './common';

export function SharingChoices({policy,onPrivateLink,busy=false,privateLink,children}:{policy:Policy;onPrivateLink?:()=>void;busy?:boolean;privateLink?:string;children?:React.ReactNode}){
 const [method,setMethod]=useState('link');const [downloading,setDownloading]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 async function download(){setDownloading(true);setError('');try{await downloadFamilyPdf(policy);setStatus('Policy PDF prepared for download.');}catch{setError('The PDF could not be prepared. Try again.');}finally{setDownloading(false);}}
 return <section className="sharing-choices">
  <label>How would you like to share?<select aria-label="How would you like to share?" value={method} onChange={e=>{setMethod(e.target.value);setError('');setStatus('');}}><option value="link">Private link</option><option value="download">Download PDF</option><option value="email">Email</option></select></label>
  <Notice error={error} status={status}/>
  {method==='download'&&<><p className="muted">Keep a copy or send it to your family. A downloaded copy will not update when you edit the policy.</p><button className="primary" disabled={downloading} onClick={download}>{downloading?'Preparing PDF…':'Download policy'}</button></>}
  {method==='email'&&<><p className="muted">Opens your email app with the policy details{privateLink?' and private link':''}. Choose the recipient, review the message, and send it yourself.</p><a className="primary" href={policyEmailHref(policy,privateLink)}>Open email draft</a><button className="text-button" onClick={async()=>{try{await navigator.clipboard.writeText(policyShareText(policy,privateLink));setStatus('Email text copied. Paste it into your email app.');}catch{setStatus('Copy the email text below.');}}}>Copy email text</button><details className="email-fallback"><summary>View email text</summary><pre>{policyShareText(policy,privateLink)}</pre></details></>}
  {method==='link'&&(children||<><p className="muted">Save this policy to create its unique link. Only family accounts you give access to can open it; you can remove access later.</p><button className="primary" disabled={busy} onClick={onPrivateLink}>{busy?'Saving…':'Create private link'}</button></>)}
 </section>;
}
