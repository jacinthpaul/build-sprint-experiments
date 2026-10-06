import React,{useEffect,useState} from 'react';
import {useConvexAuth,useMutation,useQuery} from 'convex/react';
import {useAuthActions} from '@convex-dev/auth/react';
import {api} from '../convex/_generated/api';
import type {Id} from '../convex/_generated/dataModel';
import {Back,Loading,Notice,go,message} from './common';
import {SharingChoices} from './sharing-choices';
import {policyTitle} from './policy';
export function AuthScreen({onReady,onBack,family=false,defaultCreate=false,busy=false}:{onReady:()=>void;onBack:()=>void;family?:boolean;defaultCreate?:boolean;busy?:boolean}){
 const {signIn}=useAuthActions();const {isAuthenticated,isLoading}=useConvexAuth();const [create,setCreate]=useState(defaultCreate);const [pending,setPending]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{if(isAuthenticated&&!isLoading)onReady();},[isAuthenticated,isLoading]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);setError('');const data=new FormData(e.currentTarget);data.set('flow',create?'signUp':'signIn');data.set('email',String(data.get('email')).trim().normalize('NFKC').toLowerCase());try{await signIn('password',data);}catch{setError(create?'The account couldn’t be created. Check your details, or sign in if you already have an account.':'Sign-in didn’t finish. Check your email and password and try again.');}finally{setPending(false);}}
 if(isAuthenticated)return <Loading>{busy?'Saving your policy…':'Opening your information…'}</Loading>;
 return <section className="auth-screen"><Back onClick={onBack}/><h1>{create?'Create your account':'Sign in to Kosh'}</h1><p>{family?'Use your own account to open information shared with you. You won’t need the policyholder’s phone.':'Keep your policies private and return to them on any device.'}</p><Notice error={error}/><form onSubmit={submit}><fieldset disabled={pending||busy}><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Password<input aria-label="Password" name="password" type="password" autoComplete={create?'new-password':'current-password'} required minLength={create?12:1} maxLength={128}/>{create&&<span className="hint">Use at least 12 characters. Keep it in your password manager; email password reset is not available yet.</span>}</label><button className="primary" type="submit">{pending?(create?'Creating your account…':'Signing you in…'):(create?'Create account':'Sign in')}</button></fieldset></form><button className="text-button" onClick={()=>{setCreate(!create);setError('');}}>{create?'Already have an account? Sign in':'New to Kosh? Create account'}</button></section>;
}
export function ShareScreen({id}:{id:Id<'insurancePolicies'>}){
 const p=useQuery(api.insurance.get,{id});const access=useQuery(api.insurance.access,{id});
 const give=useMutation(api.insurance.giveAccess);const remove=useMutation(api.insurance.removeAccess);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 const [confirm,setConfirm]=useState<Id<'familyAccess'>|null>(null);const [name,setName]=useState('');const [code,setCode]=useState('');
 async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');setStatus('');try{await give({id,recipientCode:code,recipientName:name});setStatus(`${name.trim()} can now access this policy.`);setCode('');setName('');}catch(e){setError(message(e,'Access was not created. Check the details and try again.'));}finally{setBusy(false);}}
 async function revoke(accessId:Id<'familyAccess'>,name:string){setBusy(true);setError('');try{await remove({id:accessId});setConfirm(null);setStatus(`Access removed for ${name}.`);}catch(e){setError(message(e,'Access was not removed. Try again.'));}finally{setBusy(false);}}
 if(p===undefined||access===undefined)return <Loading>Loading sharing details…</Loading>;
 if(!p)return <><h1>This policy isn’t available.</h1><Back onClick={()=>go('policies')}>Back to policies</Back></>;
 const link=location.origin+location.pathname+'#screen=guide&id='+id;
 return <>
  <Back onClick={()=>go('policy',id)}>Back to policy</Back><h1>Share policy</h1>
  <p>{policyTitle(p)} · {p.policyNumber}</p><p className="muted">Saved to your account.</p>
  <Notice error={error} status={status}/>
  {!confirm&&<SharingChoices policy={p} privateLink={access.length?link:undefined}>
   <p className="muted">Your policy has a unique private link. Choose the family account that can open it. They can view the details; they cannot edit them.</p>
   <form onSubmit={submit}><fieldset disabled={busy}>
    <label>Recipient name<input aria-label="Recipient name" value={name} onChange={e=>setName(e.target.value)} required maxLength={200}/></label>
    <label>Recipient’s family access code<input aria-label="Recipient’s family access code" value={code} onChange={e=>setCode(e.target.value)} required maxLength={100}/><span className="hint">Ask them to create their own Kosh account, open “Information shared with me,” and send you the code. Check it directly with them.</span></label>
    <button className="primary" type="submit">{busy?'Setting up access…':'Give access'}</button>
   </fieldset></form>
   {access.length>0&&<section className="private-link"><h2>Your private policy link</h2><p className="muted">Only accounts you gave access to can open this link.</p>
    <label>Policy link<input readOnly value={link} onFocus={e=>e.target.select()}/></label>
    <button className="text-button" onClick={async()=>{try{await navigator.clipboard.writeText(link);setStatus('Policy link copied. Send it to your recipient.');}catch{setStatus('Copy the policy link from the field above.');}}}>Copy policy link</button>
   </section>}
  </SharingChoices>}
  <section className="people-access"><h2>People with access</h2>
   {!access.length?<p>No one has access to this policy yet.</p>:<ul className="access-list">{access.map(a=><li key={a._id}><strong>{a.recipientName}</strong>
    {confirm===a._id?<div><p>Remove access for {a.recipientName}? Copies they already kept cannot be erased.</p><button className="primary" disabled={busy} onClick={()=>revoke(a._id,a.recipientName)}>{busy?'Removing access…':'Remove access'}</button><button className="text-button" disabled={busy} onClick={()=>setConfirm(null)}>Keep access</button></div>:<button className="text-button" disabled={busy} onClick={()=>setConfirm(a._id)}>Remove access for {a.recipientName}</button>}
   </li>)}</ul>}
  </section>
 </>;
}