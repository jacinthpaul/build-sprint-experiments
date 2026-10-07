import { Back, go } from './common';
import { FamilyAssistant } from './family-assistant';
import { FamilyDownload, PolicyView } from './policy-views';
import { samplePolicy } from './sample-family';

export function FamilyDemo() {
  return <>
    <Back onClick={() => go('start')}>Kosh home</Back>
    <h1>A sample family page</h1>
    <p className="notice">All policy details on this page are fictional. You can explore the family note and example help without signing in.</p>
    <button className="secondary demo-jump" onClick={() => { const heading=document.getElementById('family-ai-title');heading?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});heading?.focus({preventScroll:true}); }}>Explore sample claim help</button>
    <PolicyView policy={samplePolicy} family sample/>
    <FamilyDownload policy={samplePolicy} sample/>
    <FamilyAssistant demo savedInsurer={samplePolicy.insurer}/>
  </>;
}
