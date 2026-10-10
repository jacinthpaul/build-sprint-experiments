import { useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { message, Notice } from './common';

export function KeepKosh({ onSignIn }: { onSignIn?: () => void }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const mine = useQuery(api.keepKosh.mine, isAuthenticated ? {} : 'skip');
  const tap = useMutation(api.keepKosh.tap);
  const [busy, setBusy] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [error, setError] = useState('');
  async function keep() {
    if (!isAuthenticated) { onSignIn?.(); return; }
    setBusy(true); setError('');
    try { await tap({}); setRecorded(true); }
    catch (e) { setError(message(e, 'Your request wasn’t saved. Please try again.')); }
    finally { setBusy(false); }
  }
  return <section className="action-row keep-kosh" aria-label="Keep Kosh"><div>
    <button type="button" className="text-button" disabled={busy || isLoading || (!isAuthenticated && !onSignIn)} onClick={keep}>Keep Kosh for ₹99/year</button>
    {!isAuthenticated && <p className="muted">Sign in, then tap to request a payment link. No payment is taken now.</p>}
    <Notice error={error} status={isAuthenticated && (recorded || mine) ? 'Thank you. Jacinth will send you a payment link on WhatsApp.' : ''}/>
  </div></section>;
}
