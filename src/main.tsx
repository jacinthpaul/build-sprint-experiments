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
import {InvitationScreen} from './invitation-screen';
import {applyBrowserTheme} from './theme';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-700.css';
import '@fontsource/noto-serif/latin-600.css';
import './style.css';
function App(){
 const [route,setRoute]=useState<Route>(readRoute);const {isAuthenticated,isLoading}=useConvexAuth();const {signOut}=useAuthActions();
 const account=useQuery(api.insurance.account,isAuthenticated?{}:'skip');const save=useMutation(api.insurance.save);const importLegacy=useMutation(api.insurance.importLegacy);
 const ownedPolicies=useQuery(api.insurance.list,isAuthenticated?{}:'skip');
 const reviewReminders=useQuery(api.reviewReminders.list,isAuthenticated?{}:'skip');
 const [draft,setDraft]=useState<Policy>(blankPolicy);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 const [target,setTarget]=useState<Route>({screen:'policies'});const [pendingSave,setPendingSave]=useState(false);const handled=useRef(false);const legacy=useRef(localStorage.getItem('family-policy-key'));
 const [newDraftPrompt,setNewDraftPrompt]=useState(false);
 const savedDraftId=useRef<Id<'insurancePolicies'>|null>(null);
 const hasDraft=Boolean(draft.insurer||draft.policyNumber||draft.endDate||draft.paperLocation||draft.sumAssured||draft.claimContactName||draft.claimContactPhone||draft.policyType!=='Life insurance');
 useEffect(()=>{const update=()=>{setRoute(readRoute());setError('');setStatus('');};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 useEffect(()=>{document.querySelector('main')?.focus();},[route.screen]);
 // Old preview entries should reopen the saved policy after the draft is cleared.
 useEffect(()=>{if(route.screen==='preview'&&!hasDraft&&readRoute().screen==='preview')go(savedDraftId.current?'policy':'start',savedDraftId.current||undefined,true);},[route.screen,hasDraft]);
 const protectedRoute=!['start','add','preview','access','legacy-family','demo'].includes(route.screen)||(route.screen==='add'&&Boolean(route.id));
 function startBlank(){setNewDraftPrompt(false);setDraft(blankPolicy());setPendingSave(false);go('add');}
 function continueDraft(){setNewDraftPrompt(false);go('add');}
 function start(){if(hasDraft){setNewDraftPrompt(true);go('start');}else startBlank();}
 async function persist(){setBusy(true);setError('');try{const id=await save(draft);savedDraftId.current=id;setPendingSave(false);setDraft(blankPolicy());go('share',id,true);}catch(e){setPendingSave(false);go('preview',undefined,true);setTimeout(()=>setError(message(e,'Your policy wasn’t saved. Check your connection and try saving again.')),0);}finally{setBusy(false);}}
 function requestSave(){if(isAuthenticated)void persist();else{setPendingSave(true);setTarget({screen:'preview'});handled.current=false;go('access');}}
 function openAccess(destination:Route){setPendingSave(false);setTarget(destination);handled.current=false;go('access');}
 useEffect(()=>{if(route.screen==='access'&&isAuthenticated&&!isLoading&&!handled.current){handled.current=true;if(pendingSave)void persist();else go(target.screen,target.id,true);}},[route.screen,isAuthenticated,isLoading,pendingSave]);
 async function recover(){if(!legacy.current)return;setBusy(true);setError('');try{const id=await importLegacy({browserKey:legacy.current});if(id){localStorage.removeItem('family-policy-key');legacy.current=null;go('policy',id);setTimeout(()=>setStatus('Earlier policy recovered. Share it with named recipients; its old public link is now off.'),0);}else setError('No earlier policy is available for this account.');}catch(e){setError(message(e,'Your earlier policy couldn’t be recovered. Try again.'));}finally{setBusy(false);}}
 let content:React.ReactNode;
 if((protectedRoute||route.screen==='access')&&isLoading)content=<Loading>Checking your account…</Loading>;
 else if(protectedRoute&&!isAuthenticated)content=<AuthScreen family={route.screen==='family'||route.screen==='guide'||route.screen==='invite'} onReady={()=>go(route.screen,route.id)} onBack={()=>go('start')}/>;
 else if(route.screen==='start')content=newDraftPrompt?<section className="draft-choice"><h1>Start a new policy?</h1><p>This clears the unfinished policy in this tab. Your saved policies will stay as they are.</p><button className="primary" onClick={continueDraft}>Continue draft</button><button className="text-button" onClick={startBlank}>Start blank policy</button></section>:<HomeScreen dueReviews={reviewReminders?.filter(r=>r.nextReviewAt<=Date.now()).length||0} policyCount={ownedPolicies?.length||0} loading={isAuthenticated&&ownedPolicies===undefined} hasDraft={hasDraft} onContinue={continueDraft} onStart={start} onSaved={()=>isAuthenticated?go('policies'):openAccess({screen:'policies'})} onFamily={()=>isAuthenticated?go('family'):openAccess({screen:'family'})} onDemo={()=>go('demo')}/>;
 else if(route.screen==='demo')content=<FamilyDemo/>;
 else if(route.screen==='add')content=<PolicyEditor key={route.id||'draft'} initial={draft} onDraft={setDraft} id={route.id as Id<'insurancePolicies'>|undefined} busy={busy} onBack={()=>go(route.id?'policy':'start',route.id)} onReview={p=>{setDraft(p);go('preview');}} onSave={async(p,id)=>{setBusy(true);setError('');try{await save({...p,id});go('policy',id);setTimeout(()=>setStatus('Changes saved.'),0);}catch(e){setError(message(e,'Your changes weren’t saved. Try again.'));}finally{setBusy(false);}}}/>;
 else if(route.screen==='preview')content=!hasDraft?<Loading>Opening your information…</Loading>:<><Back onClick={()=>go('add')}>Back to details</Back><h1>Share policy</h1><SharingChoices policy={draft} onPrivateLink={requestSave} busy={busy||isLoading}/><PolicyView policy={draft} preview onChange={()=>go('add')}/></>;
 else if(route.screen==='access')content=<AuthScreen family={target.screen==='family'||target.screen==='guide'} defaultCreate={pendingSave} onReady={()=>{}} onBack={()=>{setPendingSave(false);go(pendingSave?'preview':'start');}} busy={busy}/>;
 else if(route.screen==='policies')content=<><PolicyList onAdd={start}/>{legacy.current&&<section className="legacy"><h2>Your earlier policy</h2><p>Move the policy saved in this browser into your account. This turns off its old public link; you can share it with named recipients afterwards.</p><button className="text-button" disabled={busy} onClick={recover}>Recover earlier policy</button></section>}</>;
 else if(route.screen==='policy'&&route.id)content=<SavedPolicy id={route.id as Id<'insurancePolicies'>}/>;
 else if(route.screen==='share'&&route.id)content=<ShareScreen id={route.id as Id<'insurancePolicies'>}/>;
 else if(route.screen==='invite'&&route.id)content=<InvitationScreen token={route.id}/>;
 else if(route.screen==='family')content=<FamilyList/>;
 else if(route.screen==='guide'&&route.id)content=<FamilyGuide id={route.id as Id<'insurancePolicies'>}/>;
 else if(route.screen==='legacy-family')content=<LegacyFamily token={route.id||''}/>;
 else content=<><h1>That page isn’t available.</h1><button className="primary" onClick={()=>go('start')}>Open Kosh</button></>;
 return <div className={route.screen==='start'?'app-shell home-shell':route.screen==='add'?'app-shell editor-shell':'app-shell'}><header className="app-header"><a className="brand" href="#screen=start" aria-label="Kosh home">Kosh<span className="brand-dot" aria-hidden="true"/></a>{isAuthenticated&&<div className="account-nav"><span className="account-email">{account?.email}</span><button className="text-button" onClick={async()=>{await signOut();setDraft(blankPolicy());savedDraftId.current=null;setNewDraftPrompt(false);go('start');}}>Sign out</button></div>}</header><nav className="app-nav" aria-label="Main navigation"><a href="#screen=start" aria-current={route.screen==='start'?'page':undefined}>Home</a>{isAuthenticated&&<><a href="#screen=policies" aria-current={['policies','policy','share'].includes(route.screen)?'page':undefined}>My policies</a><a href="#screen=family" aria-current={['family','guide','invite'].includes(route.screen)?'page':undefined}>Shared with me</a></>}</nav><main tabIndex={-1} className={route.screen==='start'?'start-page':''}><Notice error={error} status={status}/>{content}</main>{(route.screen!=='start'||newDraftPrompt)&&<footer>Prepared by you. Kept for the people you love.</footer>}</div>;
}
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<main><h1>This page couldn’t load.</h1><p>The link may be incomplete, or your connection may be unavailable. Open Kosh to find your saved policies, or try reloading this page.</p><div className="action-row"><button className="primary" onClick={()=>{go('start',undefined,true);this.setState({failed:false});}}>Open Kosh</button><button className="text-button" onClick={()=>location.reload()}>Reload page</button></div></main>:this.props.children;}}
const client=new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
applyBrowserTheme();
createRoot(document.getElementById('root')!).render(<ConvexAuthProvider client={client}><ErrorBoundary><App/></ErrorBoundary></ConvexAuthProvider>);
