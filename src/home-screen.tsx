import React from 'react';

export function HomeScreen({onStart,onSaved,onFamily}:{onStart:()=>void;onSaved:()=>void;onFamily:()=>void}){
 return <div className="home-content">
  <section className="home-hero">
   <h1>Help your family find your insurance and know what to do next.</h1>
   <p className="home-intro">Save the essentials of one policy and share them with your family.</p>
   <button className="primary home-primary" onClick={onStart}>Start with one policy</button>
   <p className="muted home-start-hint">Start with one policy. Add the others at your pace.</p>
  </section>
  <div className="home-return">
   <section>
    <button className="text-button" onClick={onSaved} aria-describedby="saved-policies-help">Open my saved policies</button>
    <p id="saved-policies-help" className="muted">Keep your policies private and return to them on any device.</p>
   </section>
   <section>
    <button className="text-button" onClick={onFamily} aria-describedby="shared-information-help">Open information shared with me</button>
    <p id="shared-information-help" className="muted">Use this when someone has shared their insurance with you. Sign in to your own account to view their policy details and download the family note.</p>
   </section>
  </div>
  <aside className="home-note-preview" aria-label="Preview of a family note">
   <h2>For my family</h2>
   <p>You don’t have to figure out where to start.</p>
   <ul>
    <li>Insurance details</li>
    <li>Where the policy copy is kept</li>
    <li>Who to contact</li>
   </ul>
   <p className="muted home-preview-caption">Preview of a family note</p>
  </aside>
 </div>;
}
