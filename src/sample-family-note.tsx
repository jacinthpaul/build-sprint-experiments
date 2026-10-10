import { Phone } from 'lucide-react';
import { StatusChip } from './status-chip';

export function SampleFamilyNote() {
  return <aside className="sample-family-note family-note" aria-label="Sample of a family policy page">
    <span className="sample-chip">Sample</span>
    <header className="sample-note-header">
      <p className="metadata">Shared with you</p>
      <h2>Health insurance · Example Health Insurance</h2>
      <p className="metadata">Last checked 4 Oct</p>
    </header>
    <section className="first-action">
      <p className="first-action-label">Do this first</p>
      <p>Call the insurer about the hospital claim. Keep the policy number ready.</p>
      <span className="sample-call"><Phone size={20} aria-hidden="true"/>Call insurer</span>
    </section>
    <dl className="sample-documents">
      <div><dt>Hospital bills</dt><dd><StatusChip variant="missing"/></dd></div>
      <div><dt>Patient ID</dt><dd><StatusChip variant="needs-checking"/></dd></div>
      <div><dt>Policy document</dt><dd><StatusChip variant="found"/><span className="metadata">Blue folder</span></dd></div>
    </dl>
  </aside>;
}
