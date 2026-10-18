import { useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { message, Notice } from './common';
import { HeartHandshake } from 'lucide-react';

export function KeepKosh({ onSignIn, card = false }: { onSignIn?: () => void; card?: boolean }) {
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
  return <section className={card ? 'home-action-card keep-kosh' : 'action-row keep-kosh'} aria-label="Keep Kosh"><div>
    <button type="button" className={card ? 'home-card-button' : 'text-button'} aria-label="Keep Kosh for ₹99/year" disabled={busy || isLoading || (!isAuthenticated && !onSignIn)} onClick={keep}>
      {card && <HeartHandshake size={20} aria-hidden="true"/>}<span className={card ? 'home-card-title' : undefined}>Keep Kosh for ₹99/year</span>
      {card && !isAuthenticated && <span className="card-description muted">Sign in, then tap to request a payment link. No payment is taken now.</span>}
    </button>
    {!card && !isAuthenticated && <p className="muted">Sign in, then tap to request a payment link. No payment is taken now.</p>}
    <Notice error={error} status={isAuthenticated && (recorded || mine) ? 'Thank you. Your request for a payment link has been saved. No payment has been taken.' : ''}/>
  </div></section>;
}
