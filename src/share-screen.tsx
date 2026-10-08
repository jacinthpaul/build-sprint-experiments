import { useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { Back, Loading, Notice, go, message } from './common';
import { SharingChoices } from './sharing-choices';
import { policyTitle } from './policy';
import './sharing.css';

export function ShareScreen({ id }: { id: Id<'insurancePolicies'> }) {
  const policy = useQuery(api.insurance.get, { id }), access = useQuery(api.insurance.access, { id });
  const invitations = useQuery(api.invitations.list, { policyId: id });
  const create = useAction(api.invitations.create), approve = useMutation(api.invitations.approve), decline = useMutation(api.invitations.decline);
  const cancel = useMutation(api.invitations.cancel), remove = useMutation(api.insurance.removeAccess);
  const [name, setName] = useState(''), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState<Id<'familyAccess'> | null>(null);
  async function run(task: () => Promise<unknown>, success: string) {
    setBusy(true); setError(''); setStatus('');
    try { await task(); setStatus(success); }
    catch (e) { setError(message(e, 'This change did not finish. Try again.')); }
    finally { setBusy(false); }
  }
  async function createInvite(event: React.FormEvent) {
    event.preventDefault();
    await run(async () => { await create({ policyId: id, recipientName: name }); setName(''); }, 'Invitation ready to send.');
  }
  if (policy === undefined || access === undefined || invitations === undefined) return <Loading>Loading sharing details…</Loading>;
  if (!policy) return <><h1>This policy isn’t available.</h1><Back onClick={() => go('policies')}>Back to policies</Back></>;
  const policyLink = location.origin + location.pathname + '#screen=guide&id=' + id;
  const pending = invitations.reduce((n, invitation) => n + invitation.requests.length, 0);
  const createForm = <form className="create-invitation" onSubmit={createInvite}><fieldset disabled={busy}>
    <label>Recipient name<input aria-label="Recipient name" required maxLength={200} value={name} onChange={e => setName(e.target.value)} placeholder="For example, Mounica"/></label>
    <button className={pending || invitations.length ? 'secondary' : 'primary'} type="submit">{busy ? 'Working…' : 'Create family invitation'}</button>
  </fieldset></form>;
  return <>
    <Back onClick={() => go('policy', id)}>Back to policy</Back><h1>Share policy</h1>
    <p>{policyTitle(policy)} · {policy.policyNumber}</p><p className="muted">Saved to your account.</p>
    <Notice error={error} status={status}/>
    {!confirm && <SharingChoices policy={policy}>
      <p>{pending ? 'Confirm the account below. Only the person you approve can see the policy.' : invitations.length ? 'Send the invitation to your family member. Return here to approve their request.' : 'Create an invitation, send it to your family member, then confirm their account once.'}</p>
      {invitations.map(invitation => {
        const link = location.origin + location.pathname + '#screen=invite&id=' + invitation.token;
        return <section className="family-invitation" aria-label={`Invitation for ${invitation.recipientName}`} key={invitation.id}>
          <h3>Invitation for {invitation.recipientName}</h3>
          {invitation.requests.map(request => <article className="invitation-request" aria-label={`Access request from ${request.email}`} key={request.id}>
            <h3>Confirm your family member</h3><p className="request-email">{request.email}</p>
            <p>Check directly with {invitation.recipientName} that this is their account before approving.</p>
            <div className="invitation-actions">
              <button className="primary" disabled={busy} aria-label={`Approve access for ${request.email}`} onClick={() => run(() => approve({ requestId: request.id }), `${invitation.recipientName} can now access this policy.`)}>Approve access</button>
              <button className="text-button" disabled={busy} aria-label={`Decline request from ${request.email}`} onClick={() => run(() => decline({ requestId: request.id }), 'Request declined. No policy details were shared.')}>Decline request</button>
            </div>
          </article>)}
          <label>Invitation link<input aria-label="Invitation link" readOnly value={link} onFocus={e => e.target.select()}/></label>
          <button className={pending ? 'secondary' : 'primary'} disabled={busy} onClick={async () => {
            try { await navigator.clipboard.writeText(link); setStatus('Invitation link copied. Send it to your family member.'); }
            catch { setStatus('Copy the invitation link from the field above.'); }
          }}>Copy invitation link</button>
          <p className="muted invitation-help">Send this link by message or email. It expires {new Date(invitation.expiresAt).toLocaleDateString('en-IN')}. Approved access stays available until you remove it.</p>
          <button className="text-button" disabled={busy} aria-label={`Cancel invitation for ${invitation.recipientName}`} onClick={() => run(() => cancel({ invitationId: invitation.id }), 'Invitation cancelled. Existing approved access is unchanged.')}>Cancel invitation</button>
        </section>;
      })}
      {invitations.length ? <details className="add-family-invitation"><summary>Invite another family member</summary>{createForm}</details> : createForm}
      {access.length > 0 && <section className="private-link"><h3>Your private policy link</h3><p className="muted">Only approved accounts can open this link.</p>
        <label>Policy link<input aria-label="Policy link" readOnly value={policyLink} onFocus={e => e.target.select()}/></label>
        <button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(policyLink); setStatus('Policy link copied. Send it to your recipient.'); } catch { setStatus('Copy the policy link from the field above.'); } }}>Copy policy link</button>
      </section>}
    </SharingChoices>}
    <section className="people-access"><h2>People with access</h2>
      {!access.length ? <p>No one has access to this policy yet.</p> : <ul className="access-list">{access.map(person => <li key={person._id}><strong>{person.recipientName}</strong>
        {confirm === person._id ? <div><p>Remove access for {person.recipientName}? Copies they already kept cannot be erased.</p>
          <button className="primary" disabled={busy} onClick={() => run(async () => { await remove({ id: person._id }); setConfirm(null); }, `Access removed for ${person.recipientName}.`)}>{busy ? 'Removing access…' : 'Remove access'}</button>
          <button className="text-button" disabled={busy} onClick={() => setConfirm(null)}>Keep access</button></div>
          : <button className="text-button" disabled={busy} onClick={() => setConfirm(person._id)}>Remove access for {person.recipientName}</button>}
      </li>)}</ul>}
    </section>
  </>;
}
