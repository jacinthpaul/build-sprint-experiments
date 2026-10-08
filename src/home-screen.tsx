import React from 'react';

export function HomeScreen({onStart,onSaved,onFamily,onDemo}:{onStart:()=>void;onSaved:()=>void;onFamily:()=>void;onDemo:()=>void}){
 return <div className="home-content">
  <section className="home-hero">
   <h1>Help your family find your insurance and know what to do next.</h1>
   <p className="home-intro">Share your insurance details. When your family needs them, Kosh’s AI will guide them through what to do next.</p>
   <button className="primary home-primary" onClick={onStart}>Start with one policy</button>
   <p className="muted home-start-hint">Start with one policy. Add the others at your pace.</p>
   <button className="text-button home-demo" onClick={onDemo}>See a sample family page</button>
  </section>
  <div className="home-return">
   <section>
    <button className="text-button" onClick={onSaved} aria-describedby="saved-policies-help">Open my saved policies</button>
    <p id="saved-policies-help" className="muted">Keep your policies private and return to them on any device.</p>
   </section>
   <section>
    <button className="text-button" onClick={onFamily} aria-describedby="shared-information-help">Open information shared with me</button>
    <p id="shared-information-help" className="muted">Use this when someone has shared their insurance with you. Open their policy, ask Kosh for help, or speak your question.</p>
   </section>
  </div>
  <aside className="home-note-preview" aria-label="Preview of a family note">
   <h2>For my family</h2>
   <p>Your policy details, with Kosh to guide you.</p>
   <ul>
    <li>Insurance details</li>
    <li>Where the policy copy is kept</li>
    <li>Who to contact</li>
    <li>AI explanations and current claim guidance</li>
    <li>Voice help, translation and escalation drafts</li>
   </ul>
   <p className="muted home-preview-caption">Preview of a family note</p>
  </aside>
 </div>;
}
