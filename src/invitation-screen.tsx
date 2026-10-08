import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Back, Loading, Notice, go, message } from './common';

export function InvitationScreen({ token }: { token: string }) {
  const invitation = useQuery(api.invitations.state, { token }), account = useQuery(api.insurance.account, {});
  const request = useMutation(api.invitations.requestAccess);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { if (invitation?.status === 'approved' && invitation.policyId) go('guide', invitation.policyId); }, [invitation?.status, invitation?.policyId]);
  if (!invitation || account === undefined) return <Loading>Opening your invitation…</Loading>;
  if (invitation.status === 'approved') return <Loading>Opening your shared policy…</Loading>;
  if (invitation.status === 'owner') return <><h1>Send this invitation to your family member</h1><p>They need to open it with their own Kosh account. You can then confirm their request from Share policy.</p><button className="primary" onClick={() => go('share', invitation.policyId!)}>Back to sharing</button></>;
  if (invitation.status === 'unavailable' || invitation.status === 'signIn') return <><h1>This invitation is no longer available.</h1><p>It may have expired, been cancelled, or already been used. Ask the policyholder for a new invitation if you still need access.</p><Back onClick={() => go('family')}>Information shared with me</Back></>;
  if (invitation.status === 'declined') return <><h1>Access request declined</h1><p>No policy details have been shared with this account. Check with the policyholder that you used the account they expected.</p><p className="muted">Your account: {account?.email}</p><Back onClick={() => go('family')}>Information shared with me</Back></>;
  if (invitation.status === 'pending') return <><h1>Waiting for confirmation</h1><p>Your request is saved for {account?.email}.</p><p>Let the policyholder know you’ve requested access. They can open Share policy and confirm your account once.</p><p className="muted">No policy details are visible until they approve. You can return to this link; it will open the policy after approval.</p><Back onClick={() => go('family')}>Information shared with me</Back></>;
  return <><h1>Open your family invitation</h1><p>Request access using your own account. The policyholder will confirm you before the policy is shown.</p>
    <p className="muted">Your account: {account?.email}</p><Notice error={error}/>
    <button className="primary" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await request({ token }); } catch (e) { setError(message(e, 'Your request did not finish. Try again.')); } finally { setBusy(false); } }}>{busy ? 'Requesting access…' : 'Request access'}</button>
    <p className="muted invitation-help">After approval, you can return without the policyholder’s phone or help.</p>
  </>;
}
