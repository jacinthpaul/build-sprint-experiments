import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ConvexReactClient,useConvexAuth,useMutation,useQuery} from 'convex/react';
import {ConvexAuthProvider,useAuthActions} from '@convex-dev/auth/react';
import {api} from '../convex/_generated/api';
import type {Id} from '../convex/_generated/dataModel';
import {blankPolicy,type Policy} from './policy';
import {Back,Loading,Notice,go,message,readRoute,type Route} from './common';
import {PolicyEditor} from './policy-editor';
import {FamilyGuide,FamilyList,LegacyFamily,PolicyList,PolicyView,SavedPolicy} from './policy-views';
import {AuthScreen,ShareScreen} from './access';
import {SharingChoices} from './sharing-choices';
import {HomeScreen} from './home-screen';
import {FamilyDemo} from './family-demo';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-700.css';
import './style.css';
function App(){
 const [route,setRoute]=useState<Route>(readRoute);const {isAuthenticated,isLoading}=useConvexAuth();const {signOut}=useAuthActions();
 const account=useQuery(api.insurance.account,isAuthenticated?{}:'skip');const save=useMutation(api.insurance.save);const importLegacy=useMutation(api.insurance.importLegacy);
 const [draft,setDraft]=useState<Policy>(blankPolicy);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 const [target,setTarget]=useState<Route>({screen:'policies'});const [pendingSave,setPendingSave]=useState(false);const handled=useRef(false);const legacy=useRef(localStorage.getItem('family-policy-key'));
 useEffect(()=>{const update=()=>{setRoute(readRoute());setError('');setStatus('');};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 useEffect(()=>{document.querySelector('main')?.focus();},[route.screen]);
 const protectedRoute=!['start','add','preview','access','legacy-family','demo'].includes(route.screen)||(route.screen==='add'&&Boolean(route.id));
 function start(){setDraft(blankPolicy());setPendingSave(false);go('add');}
 async function persist(){setBusy(true);setError('');try{const id=await save(draft);setPendingSave(false);go('share',id);}catch(e){setPendingSave(false);go('preview');setTimeout(()=>setError(message(e,'Your policy wasn’t saved. Check your connection and try saving again.')),0);}finally{setBusy(false);}}
 function requestSave(){if(isAuthenticated)void persist();else{setPendingSave(true);setTarget({screen:'preview'});handled.current=false;go('access');}}
 function openAccess(destination:Route){setTarget(destination);handled.current=false;go('access');}
 useEffect(()=>{if(route.screen==='access'&&isAuthenticated&&!isLoading&&!handled.current){handled.current=true;if(pendingSave)void persist();else go(target.screen,target.id);}},[route.screen,isAuthenticated,isLoading,pendingSave]);
 async function recover(){if(!legacy.current)return;setBusy(true);setError('');try{const id=await importLegacy({browserKey:legacy.current});if(id){localStorage.removeItem('family-policy-key');legacy.current=null;go('policy',id);setTimeout(()=>setStatus('Earlier policy recovered. Share it with named recipients; its old public link is now off.'),0);}else setError('No earlier policy is available for this account.');}catch(e){setError(message(e,'Your earlier policy couldn’t be recovered. Try again.'));}finally{setBusy(false);}}
 let content:React.ReactNode;
 if((protectedRoute||route.screen==='access')&&isLoading)content=<Loading>Checking your account…</Loading>;
 else if(protectedRoute&&!isAuthenticated)content=<AuthScreen family={route.screen==='family'||route.screen==='guide'} onReady={()=>go(route.screen,route.id)} onBack={()=>go('start')}/>;
 else if(route.screen==='start')content=<HomeScreen onStart={start} onSaved={()=>isAuthenticated?go('policies'):openAccess({screen:'policies'})} onFamily={()=>isAuthenticated?go('family'):openAccess({screen:'family'})} onDemo={()=>go('demo')}/>;
 else if(route.screen==='demo')content=<FamilyDemo/>;
 else if(route.screen==='add')content=<PolicyEditor key={route.id||'draft'} initial={draft} onDraft={setDraft} id={route.id as Id<'insurancePolicies'>|undefined} busy={busy} onBack={()=>go(route.id?'policy':'start',route.id)} onReview={p=>{setDraft(p);go('preview');}} onSave={async(p,id)=>{setBusy(true);setError('');try{await save({...p,id});go('policy',id);setTimeout(()=>setStatus('Changes saved.'),0);}catch(e){setError(message(e,'Your changes weren’t saved. Try again.'));}finally{setBusy(false);}}}/>;
 else if(route.screen==='preview')content=<><Back onClick={()=>go('add')}>Back to details</Back><h1>Share policy</h1><SharingChoices policy={draft} onPrivateLink={requestSave} busy={busy||isLoading}/><PolicyView policy={draft} preview onChange={()=>go('add')}/></>;
 else if(route.screen==='access')content=<AuthScreen family={target.screen==='family'||target.screen==='guide'} defaultCreate={pendingSave} onReady={()=>{}} onBack={()=>{setPendingSave(false);go(pendingSave?'preview':'start');}} busy={busy}/>;
 else if(route.screen==='policies')content=<><PolicyList onAdd={start}/>{legacy.current&&<section className="legacy"><h2>Your earlier policy</h2><p>Move the policy saved in this browser into your account. This turns off its old public link; you can share it with named recipients afterwards.</p><button className="text-button" disabled={busy} onClick={recover}>Recover earlier policy</button></section>}</>;
 else if(route.screen==='policy'&&route.id)content=<SavedPolicy id={route.id as Id<'insurancePolicies'>}/>;
 else if(route.screen==='share'&&route.id)content=<ShareScreen id={route.id as Id<'insurancePolicies'>}/>;
 else if(route.screen==='family')content=<FamilyList code={account?.id||''}/>;
 else if(route.screen==='guide'&&route.id)content=<FamilyGuide id={route.id as Id<'insurancePolicies'>}/>;
 else if(route.screen==='legacy-family')content=<LegacyFamily token={route.id||''}/>;
 else content=<><h1>That page isn’t available.</h1><button className="primary" onClick={()=>go('start')}>Open Kosh</button></>;
 return <div className={route.screen==='start'?'app-shell home-shell':'app-shell'}><header className="app-header"><a className="brand" href="#screen=start" aria-label="Kosh home">Kosh<span className="brand-dot" aria-hidden="true"/></a>{isAuthenticated&&<div className="account-nav"><span className="account-email">{account?.email}</span><button className="text-button" onClick={async()=>{await signOut();setDraft(blankPolicy());go('start');}}>Sign out</button></div>}</header><main tabIndex={-1} className={route.screen==='start'?'start-page':''}><Notice error={error} status={status}/>{content}</main><footer>Prepared by you. Kept for the people you love.</footer></div>;
}
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<main><h1>This page couldn’t load.</h1><p>Check your connection and try opening it again.</p><button className="primary" onClick={()=>location.reload()}>Reload page</button></main>:this.props.children;}}
const client=new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
createRoot(document.getElementById('root')!).render(<ConvexAuthProvider client={client}><ErrorBoundary><App/></ErrorBoundary></ConvexAuthProvider>);
