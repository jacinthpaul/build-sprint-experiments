import React,{useState} from 'react';
import type {Policy} from './policy';
import {downloadFamilyPdf} from './family-pdf';
import {Notice} from './common';

export function SharingChoices({policy,onPrivateLink,busy=false,children}:{policy:Policy;onPrivateLink?:()=>void;busy?:boolean;children?:React.ReactNode}){
 const [method,setMethod]=useState('link');const [downloading,setDownloading]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 async function download(){setDownloading(true);setError('');try{await downloadFamilyPdf(policy);setStatus('Policy PDF prepared for download.');}catch{setError('The PDF could not be prepared. Try again.');}finally{setDownloading(false);}}
 return <section className="sharing-choices">
  <label>How would you like to share?<select aria-label="How would you like to share?" value={method} onChange={e=>{setMethod(e.target.value);setError('');setStatus('');}}><option value="link">Private link</option><option value="download">Download PDF</option></select></label>
  <Notice error={error} status={status}/>
  {method==='download'&&<><p className="muted">Keep a copy or send it to your family. A downloaded copy will not update when you edit the policy.</p><button className="primary" disabled={downloading} onClick={download}>{downloading?'Preparing PDF…':'Download policy'}</button></>}
  {method==='link'&&(children||<><p className="muted">Save this policy to create its unique link. Only family accounts you give access to can open it; you can remove access later.</p><button className="primary" disabled={busy} onClick={onPrivateLink}>{busy?'Saving…':'Create private link'}</button></>)}
 </section>;
}
