import { familyIntro, familyNote } from './family-note';
import type { Policy } from './policy';

export function PolicyPreview({ policy, activeField, onDetails }: {
  policy: Policy; activeField: string; onDetails: () => void;
}) {
  const amount = Number(policy.sumAssured);
  const invalidAmount = Boolean(policy.sumAssured) && (!Number.isFinite(amount) || amount <= 0 || amount > 1e12);
  const note = familyNote(invalidAmount ? { ...policy, sumAssured: '' } : policy);
  return <aside className="policy-preview" id="family-policy-preview" aria-labelledby="policy-preview-title">
    <div className="policy-preview-heading">
      <h2 id="policy-preview-title">Family preview</h2>
      <p className="muted">Updates as you type. Check the details before sharing.</p>
    </div>
    <article className="family-note family-note-preview" aria-label="Live family note preview">
      <h2 className="note-title">For my family</h2>
      <p className="note-intro">{familyIntro}</p>
      <dl>{note.facts.map(([label, value]) => {
        const text = label === 'Coverage amount' && invalidAmount ? 'Needs checking' : value.trim() || 'Not recorded';
        return <div className="fact" data-active={Boolean(activeField) && (activeField.startsWith(label) || label === 'Insurer' && activeField === 'Insurance company')} key={label}>
          <dt>{label}</dt><dd className={text.startsWith('Not recorded') || text === 'Needs checking' ? 'missing' : undefined}>{text}</dd>
        </div>;
      })}</dl>
      <section className="preview-contact" data-active={activeField.startsWith('Contact ')}>
        <h3>Who to contact</h3>
        <p className={note.contact.trim() ? 'preserve' : 'missing'}>{note.contact.trim() || 'Not recorded'}</p>
      </section>
      <p className="preview-caution muted">Confirm coverage and claim requirements with the insurer.</p>
    </article>
    <p className="policy-preview-caption muted">Preview of your policy details. With a private link, your family can also ask Kosh for personalised guidance.</p>
    <button className="text-button policy-preview-back" onClick={onDetails}>Back to policy details</button>
  </aside>;
}
