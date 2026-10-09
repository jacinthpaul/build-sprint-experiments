import React from 'react';
import { ConvexError } from 'convex/values';
export type Route = {screen:string;id?:string};
export function readRoute():Route {const p=new URLSearchParams(location.hash.slice(1));if(p.has('family'))return{screen:'legacy-family',id:p.get('family')!};return{screen:p.get('screen')||'start',id:p.get('id')||undefined};}
export function go(screen:string,id?:string,replace=false){const p=new URLSearchParams({screen});if(id)p.set('id',id);if(replace)location.replace('#'+p.toString());else location.hash=p.toString();window.scrollTo({top:0});}
export function message(e:unknown,fallback:string){return e instanceof ConvexError&&typeof e.data==='string'?e.data:fallback;}
export function Back({onClick,children='Back'}:{onClick:()=>void;children?:React.ReactNode}){return <button className="text-button back" onClick={onClick}>{children}</button>;}
export function Notice({error='',status=''}:{error?:string;status?:string}){return <>{error&&<div className="error" role="alert">{error}</div>}{status&&<div className="notice" role="status">{status}</div>}</>;}
export function Loading({children='Loading your policies…'}:{children?:React.ReactNode}){return <p className="loading" role="status">{children}</p>;}
