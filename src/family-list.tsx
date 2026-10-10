import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Back, Loading, go } from './common';
import { policyTitle } from './policy';

export function FamilyList() {
  const policies = useQuery(api.insurance.sharedList, {}), requests = useQuery(api.invitations.pending, {});
  const [selected, setSelected] = useState('');
  return <><Back onClick={() => go('start')}>Kosh home</Back><h1>Information shared with you</h1><p className="muted">Choose the policy you need. Your access is view-only.</p>
    {policies === undefined ? <Loading>Loading shared policies…</Loading> : !policies.length ? <p>No policies have been shared with you yet.</p> : <section className="family-policy-chooser">
      <label>Choose a policy<select aria-label="Choose a policy" value={selected} onChange={e => setSelected(e.target.value)}><option value="">Select a policy</option>{policies.map(p => <option key={p._id} value={p._id}>{policyTitle(p)} — {p.policyNumber}</option>)}</select></label>
      <button className="primary" disabled={!selected} onClick={() => go('guide', selected)}>Open policy</button>
    </section>}
    {!!requests?.length && <section className="access-code"><h2>Waiting for confirmation</h2><p>Your request is saved. Ask the policyholder to confirm your account from Share policy.</p>{requests.map((request, index) => <button className="text-button" key={request.token} onClick={() => go('invite', request.token)}>Open pending invitation {requests.length > 1 ? index + 1 : ''}</button>)}</section>}
    <section className="access-code"><h2>Received an invitation?</h2><p>Open the invitation link your family member sent. Sign in with your own account and request access. They’ll confirm you once; then the policy will appear here.</p></section>
  </>;
}
