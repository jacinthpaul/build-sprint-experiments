import React,{useState} from 'react';
import type {Policy} from './policy';
import {downloadFamilyPdf} from './family-pdf';
import {Notice} from './common';

export function SharingChoices({policy,onPrivateLink,busy=false,children}:{policy:Policy;onPrivateLink?:()=>void;busy?:boolean;children?:React.ReactNode}){
 const [downloading,setDownloading]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 async function download(){setDownloading(true);setError('');try{await downloadFamilyPdf(policy);setStatus('Policy PDF prepared for download.');}catch{setError('The PDF could not be prepared. Try again.');}finally{setDownloading(false);}}
 return <section className="sharing-choices">
  <Notice error={error} status={status}/>
  <section className="download-choice"><h2>Download</h2>
  <button className={children?'secondary':'primary'} disabled={downloading||busy} onClick={download}>{downloading?'Preparing PDF…':'Download PDF'}</button>
  <p className="muted download-hint">Keep a copy or send it to your family. A downloaded copy will not update when you edit the policy.</p>
  </section>
  <section className="link-choice"><h2>Private link</h2>{children||<><p className="muted">Save this policy to create its unique link. Only family accounts you give access to can open it; you can remove access later.</p><button className="text-button" disabled={busy} onClick={onPrivateLink}>{busy?'Saving…':'Create private link'}</button></>}</section>
 </section>;
}
