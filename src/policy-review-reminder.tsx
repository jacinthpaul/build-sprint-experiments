import {useEffect,useState} from 'react';
import {useMutation,useQuery} from 'convex/react';
import {api} from '../convex/_generated/api';
import type {Id} from '../convex/_generated/dataModel';
import {Notice,message} from './common';

export function PolicyReviewReminder({id}:{id:Id<'insurancePolicies'>}) {
 const reminder=useQuery(api.reviewReminders.get,{policyId:id});
 const setEnabled=useMutation(api.reviewReminders.setEnabled),markReviewed=useMutation(api.reviewReminders.markReviewed);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
 const [checked,setChecked]=useState<boolean|null>(null);
 useEffect(()=>{if(reminder?.enabled===checked)setChecked(null);},[reminder?.enabled,checked]);
 async function run(task:()=>Promise<unknown>,success:string){setBusy(true);setError('');setStatus('');try{await task();setStatus(success);return true;}catch(e){setError(message(e,'The reminder was not updated. Try again.'));return false;}finally{setBusy(false);}}
 return <section className="policy-review-reminder" aria-labelledby="review-reminder-title">
  <h2 id="review-reminder-title">Keep this policy up to date</h2>
  <p>Every three months, check the policy copy, coverage dates and contact details so your family can rely on the latest information.</p>
  <Notice error={error} status={status}/>
  <label className="review-option"><input type="checkbox" checked={checked??!!reminder?.enabled} disabled={busy||reminder===undefined} onChange={async e=>{const enabled=e.target.checked;setChecked(enabled);if(!await run(()=>setEnabled({policyId:id,enabled}),enabled?'Review reminder turned on.':'Review reminder turned off.'))setChecked(null);}}/>Remind me to review every three months</label>
  {reminder?.enabled&&<>
   <p className={reminder.nextReviewAt<=Date.now()?'review-due':undefined}>{reminder.nextReviewAt<=Date.now()?'Review due':'Next review'}: {new Date(reminder.nextReviewAt).toLocaleDateString('en-IN')}</p>
   {reminder.lastReviewedAt&&<p className="muted">Last checked by you: {new Date(reminder.lastReviewedAt).toLocaleDateString('en-IN')}</p>}
   <button className="text-button" disabled={busy} onClick={()=>run(()=>markReviewed({policyId:id}),'Review recorded. Your next reminder is in three months.')}>I’ve checked these details</button>
  </>}
  <p className="muted reminder-delivery">The reminder appears in Kosh when you return. No email is sent.</p>
 </section>;
}
