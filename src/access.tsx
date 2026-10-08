import React,{useEffect,useState} from 'react';
import {useConvexAuth} from 'convex/react';
import {useAuthActions} from '@convex-dev/auth/react';


import {Back,Loading,Notice} from './common';


export function AuthScreen({onReady,onBack,family=false,defaultCreate=false,busy=false}:{onReady:()=>void;onBack:()=>void;family?:boolean;defaultCreate?:boolean;busy?:boolean}){
 const {signIn}=useAuthActions();const {isAuthenticated,isLoading}=useConvexAuth();const [create,setCreate]=useState(defaultCreate);const [pending,setPending]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{if(isAuthenticated&&!isLoading)onReady();},[isAuthenticated,isLoading]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);setError('');const data=new FormData(e.currentTarget);data.set('flow',create?'signUp':'signIn');data.set('email',String(data.get('email')).trim().normalize('NFKC').toLowerCase());try{await signIn('password',data);}catch{setError(create?'The account couldn’t be created. Check your details, or sign in if you already have an account.':'Sign-in didn’t finish. Check your email and password and try again.');}finally{setPending(false);}}
 if(isAuthenticated)return <Loading>{busy?'Saving your policy…':'Opening your information…'}</Loading>;
 return <section className="auth-screen"><Back onClick={onBack}/><h1>{create?'Create your account':'Sign in to Kosh'}</h1><p>{family?'Use your own account to open information shared with you. You won’t need the policyholder’s phone.':'Keep your policies private and return to them on any device.'}</p><Notice error={error}/><form onSubmit={submit}><fieldset disabled={pending||busy}><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Password<input aria-label="Password" name="password" type="password" autoComplete={create?'new-password':'current-password'} required minLength={create?12:1} maxLength={128}/>{create&&<span className="hint">Use at least 12 characters. Keep it in your password manager; email password reset is not available yet.</span>}</label><button className="primary" type="submit">{pending?(create?'Creating your account…':'Signing you in…'):(create?'Create account':'Sign in')}</button></fieldset></form><button className="text-button" onClick={()=>{setCreate(!create);setError('');}}>{create?'Already have an account? Sign in':'New to Kosh? Create account'}</button></section>;
}
export {ShareScreen} from './share-screen';
