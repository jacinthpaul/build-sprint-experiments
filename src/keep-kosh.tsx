import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { message, Notice } from './common';

export function KeepKosh() {
  const mine = useQuery(api.keepKosh.mine, {});
  const tap = useMutation(api.keepKosh.tap);
  const [busy, setBusy] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [error, setError] = useState('');
  async function keep() {
    setBusy(true); setError('');
    try { await tap({}); setRecorded(true); }
    catch (e) { setError(message(e, 'Your request wasn’t saved. Please try again.')); }
    finally { setBusy(false); }
  }
  return <section className="action-row"><div>
    <button type="button" className="text-button" disabled={busy} onClick={keep}>Keep Kosh for ₹99/year</button>
    <Notice error={error} status={recorded || mine ? 'Thank you. Jacinth will send you a payment link on WhatsApp.' : ''}/>
  </div></section>;
}
