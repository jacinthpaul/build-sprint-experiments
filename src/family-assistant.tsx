import { useEffect, useRef, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { recordQuestion } from './voice';
import { message } from './common';
import { exampleFirstStep, exampleEscalation, exampleTelugu } from './sample-family';

const languageCodes = { English: 'en-IN', Hindi: 'hi-IN', Telugu: 'te-IN', Tamil: 'ta-IN', Malayalam: 'ml-IN', Kannada: 'kn-IN', Marathi: 'mr-IN', Bengali: 'bn-IN' };
type Language = keyof typeof languageCodes;
type Mode = 'next' | 'latest' | 'draft' | 'translate' | 'question';
type Situation = 'Not sure yet' | 'Death' | 'Accident' | 'Hospital treatment' | 'Loss or damage' | 'Travel problem';
function HelpIcon({ voice = false }: { voice?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {voice ? <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3M9 22h6"/></> : <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 1v-9.5a8.5 8.5 0 0 1 17 0Z"/><path d="M7 10h9M7 14h6"/></>}
  </svg>;
}
export function FamilyAssistant({ policyId, savedInsurer, demo = false }: { policyId?: Id<'insurancePolicies'>; savedInsurer: string; demo?: boolean }) {
  const ask = useAction(api.familyAi.ask), availability = useAction(api.familyAi.availability), transcribe = useAction(api.familyAi.transcribe);
  const savedHistory = useQuery(api.familyAiData.messages, !demo && policyId ? { policyId } : 'skip');
  const [exampleMessages,setExampleMessages] = useState<{id:string;role:'user'|'assistant';text:string;time:number;searched:boolean;checkedAt:null;sources:[]}[]>([]);
  const history = demo ? {busy:false,messages:exampleMessages} : savedHistory;
  const [available, setAvailable] = useState<boolean | null>(null), [checking, setChecking] = useState(false);
  const [insurer, setInsurer] = useState(savedInsurer), [country, setCountry] = useState('India');
  const [situation, setSituation] = useState<Situation>('Not sure yet'), [language, setLanguage] = useState<Language>('English');
  const [question, setQuestion] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [copied, setCopied] = useState('');
  const [recording, setRecording] = useState(false), [converting, setConverting] = useState(false), [speaking, setSpeaking] = useState('');
  const recorder = useRef<Awaited<ReturnType<typeof recordQuestion>> | null>(null), mounted = useRef(false);
  const reader = useRef<SpeechSynthesisUtterance | null>(null);
  const [expanded, setExpanded] = useState(false), [choosingLanguage, setChoosingLanguage] = useState(false);
  const questionInput = useRef<HTMLTextAreaElement | null>(null), languageInput = useRef<HTMLSelectElement | null>(null);
  const canAsk = (demo || available === true) && !busy && !history?.busy && !recording && !converting;
  useEffect(() => {
    mounted.current = true;
    if (!demo && policyId) availability({ policyId }).then(value => { if (mounted.current) setAvailable(value); }).catch(() => { if (mounted.current) { setAvailable(false); setError('AI availability could not be checked. Try again.'); } });
    return () => { mounted.current = false; recorder.current?.cancel(); reader.current = null; window.speechSynthesis?.cancel(); };
  }, [policyId, demo, availability]);
  useEffect(() => { if (expanded && choosingLanguage) languageInput.current?.focus(); }, [expanded, choosingLanguage]);
  useEffect(() => { if (!demo && history?.messages.length) setExpanded(true); }, [demo, history?.messages.length]);
  async function send(mode: Mode, text: string) {
    if (!canAsk || !text.trim()) return;
    setExpanded(true);
    if (demo) {
      if (!['next','draft','translate'].includes(mode)) return;
      const answer = mode === 'draft' ? exampleEscalation : language === 'Telugu' ? exampleTelugu : exampleFirstStep;
      const time=Date.now();
      setExampleMessages([{id:'sample-question',role:'user',text:mode === 'draft'?'Show me a sample escalation draft.':mode === 'translate'?`Show the first-step example in ${language}.`:'What should I do first?',time,searched:false,checkedAt:null,sources:[]},{id:'sample-answer-'+time,role:'assistant',text:answer,time,searched:false,checkedAt:null,sources:[]}]);
      setCopied('');return;
    }
    if (!policyId) return;
    setBusy(true); setError(''); setCopied('');
    try {
      const result = await ask({ policyId, question: text.trim(), mode, insurer: insurer.trim(), country: country.trim(), situation, language });
      if (mounted.current) { if (!result.ok) setError(result.message); else setQuestion(''); }
    } catch (e) { if (mounted.current) setError(message(e,'Your question could not be answered. Check your access and try again.')); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function startVoice() {
    if (!canAsk || demo || !policyId) return;
    setExpanded(true);
    setError(''); setRecording(true);
    try {
      recorder.current = await recordQuestion(async audio => {
        if (!mounted.current) return;
        setRecording(false); setConverting(true);
        try {
          const text = await transcribe({ policyId, audio });
          if (mounted.current) { setQuestion(text); questionInput.current?.focus(); }
        } catch { if (mounted.current) setError('The recording could not be understood. Type your question or try again.'); }
        finally { if (mounted.current) setConverting(false); }
      }, () => { if (mounted.current) { setRecording(false); setError('Recording failed. Type your question instead.'); } });
      if (!mounted.current) recorder.current.cancel();
    } catch { if (mounted.current) { setRecording(false); setError('Microphone access is unavailable. Allow it in your browser settings or type your question.'); } }
  }
  function readAnswer(id: string, text: string) {
    if (!window.speechSynthesis) { setError('Reading aloud is not supported on this device. The full answer is shown above.'); return; }
    reader.current = null; window.speechSynthesis.cancel(); setError('');
    if (speaking === id) { setSpeaking(''); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').replace(/[*#]/g, ''));
    // The answer may be in an earlier selected language, or one requested in the question.
    utterance.lang = /[\u0c00-\u0c7f]/.test(text) ? 'te-IN' : /[\u0b80-\u0bff]/.test(text) ? 'ta-IN' : /[\u0d00-\u0d7f]/.test(text) ? 'ml-IN' : /[\u0c80-\u0cff]/.test(text) ? 'kn-IN' : /[\u0980-\u09ff]/.test(text) ? 'bn-IN' : /[\u0900-\u097f]/.test(text) ? language === 'Marathi' ? 'mr-IN' : 'hi-IN' : 'en-IN';
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (voice) utterance.voice = voice;
    reader.current = utterance;
    utterance.onend = () => { if (mounted.current && reader.current === utterance) { reader.current = null; setSpeaking(''); } };
    utterance.onerror = event => {
      if (!mounted.current || reader.current !== utterance) return;
      reader.current = null; setSpeaking('');
      if (event.error !== 'canceled' && event.error !== 'interrupted') setError('This voice could not play. Try a voice supported by your device.');
    };
    setSpeaking(id); window.speechSynthesis.speak(utterance);
  }
  if (history === null) return null;
  return <section className="family-ai" aria-labelledby="family-ai-title">
    <h2 id="family-ai-title" tabIndex={-1}>{demo?'Explore example family help':'Kosh will guide you through'}</h2>
    <p>{demo?'These are prewritten examples using fictional details. They are not live AI answers, and no web search is performed.':'Get an AI explanation of this policy, speak a question, or find your next claim step.'}</p>
    <div className="ai-feature-actions">
      <button className="primary ai-feature" aria-label="Ask Kosh" disabled={demo || !canAsk} onClick={() => send('question',question.trim() || 'Explain the saved details of this policy in plain language and help me understand what to do first. Keep missing information clear and do not assume coverage or a payout.')}>
        <HelpIcon/><span><strong>Ask Kosh</strong><span>AI explains your policy and next steps.</span></span>
      </button>
      <button className="secondary ai-feature" aria-label={recording?'Stop recording':converting?'Turning speech into text…':'Speak your question'} disabled={demo || (!recording && (!canAsk || converting))} onClick={recording ? () => recorder.current?.stop() : startVoice}>
        <HelpIcon voice/><span><strong>{recording?'Stop recording':converting?'Transcribing…':'Speak your question'}</strong><span>Voice help. Check the words before sending.</span></span>
      </button>
    </div>
    {recording && <p role="status">Recording, up to 30 seconds. Tap Stop recording when you're ready.</p>}
    <div className="ai-starters" aria-label="Ways Kosh can help">
      <button className="secondary" disabled={!canAsk} onClick={() => send('next','Help me take the first step for a claim on this policy.')}>{demo?'See first-step example':'What should I do first?'}</button>
      <button className="secondary" disabled={demo || !canAsk} onClick={() => send('latest','Check the latest official claim requirements for this policy and show your sources.')}>Check latest claim steps</button>
      <button className="secondary" disabled={!canAsk} onClick={() => send('draft',question.trim() || 'Help me draft an escalation to the insurer. Ask me what you need to know first.')}>{demo?'See sample escalation (English)':'Draft an escalation'}</button>
      <button className="secondary" disabled={!canAsk} onClick={() => { if (demo) void send('translate',`Show the first-step example in ${language}.`); else { setExpanded(true); setChoosingLanguage(true); languageInput.current?.focus(); } }}>{demo?`See ${language} example`:'Translate answer'}</button>
    </div>
    <p className="muted ai-help-hint">{demo?'Voice and live questions are available on your private family page.':'You can also read Kosh’s answers aloud. Your policy details are below.'}</p>
    {demo && <p className="notice">For live AI help, sign in and open a policy shared with your account.</p>}
    {!demo && available === null && <p role="status" className="muted">Checking AI availability…</p>}
    {available === false && <div className="notice"><p>AI help isn't available yet. Your saved information and contact details are still here.</p><button className="text-button" disabled={checking} onClick={async () => { if (!policyId) return; setChecking(true); setError(''); try { setAvailable(await availability({ policyId })); } catch { setError('Could not connect. Try again.'); } finally { setChecking(false); } }}>{checking ? 'Checking…' : 'Check again'}</button></div>}
    {expanded && <div className="ai-conversation-panel">
    {!demo && <details className="ai-context" open={!savedInsurer && available === true}>
      <summary>Insurer and claim situation</summary>
      <div className="ai-context-fields">
        <label>Insurer name<input aria-label="Insurer name" value={insurer} maxLength={100} onChange={e => setInsurer(e.target.value)} placeholder="For example, LIC"/><span className="hint">If you don't know, Kosh will help you find out.</span></label>
        <label>Country where the policy was issued<input aria-label="Country where the policy was issued" value={country} maxLength={60} onChange={e => setCountry(e.target.value)}/></label>
        <label>What happened?<select aria-label="What happened?" value={situation} onChange={e => setSituation(e.target.value as Situation)}>{['Not sure yet','Death','Accident','Hospital treatment','Loss or damage','Travel problem'].map(s => <option key={s}>{s}</option>)}</select></label>
      </div>
    </details>}
    <div className="ai-translation"><label className="ai-language">{demo?'Example language':'Answer language'}<select ref={languageInput} aria-label={demo?'Example language':'Answer language'} value={language} onChange={e => setLanguage(e.target.value as Language)}>{(demo?['English','Telugu']:Object.keys(languageCodes)).map(l => <option key={l}>{l}</option>)}</select></label>
    {!demo && <button className="secondary" disabled={!canAsk} onClick={() => send('translate',`Translate your latest answer into ${language}. If there is no answer yet, explain the saved policy details in ${language}. Preserve every name, number, date and uncertainty.`)}>Translate into {language}</button>}</div>
    <div className="ai-messages" aria-label="Your private conversation">
      {history === undefined ? <p className="muted">Loading your conversation…</p> : history.messages.length === 0 ? <p className="muted">{demo?'Choose an example above to see how family help could look.':'You can start with one question. Only you can see this conversation.'}</p> : history.messages.map(m => <article className={'ai-message ' + m.role} key={m.id}>
        <h3>{m.role === 'user' ? demo?'Example question':'You' : demo?'Prewritten example answer':'Kosh'}</h3><p className="preserve">{m.text}</p>
        {m.role === 'assistant' && <>
          {m.searched && m.checkedAt ? <><p className="source">Web sources checked {new Date(m.checkedAt).toLocaleString('en-IN')}:</p><ol className="ai-sources">{m.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ol></> : <p className="source">{demo?'Sample only. No live web sources have been checked.':'No new web sources verified for this answer. Confirm current requirements with the insurer.'}</p>}
          <div className="ai-answer-tools"><button className="text-button" onClick={() => readAnswer(m.id,m.text)}>{speaking === m.id ? 'Stop reading' : 'Read aloud'}</button><button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(m.text); setCopied(m.id); } catch { setError('Copying is unavailable. Select the answer text to copy it.'); } }}>Copy answer</button>{copied === m.id && <span role="status">Copied.</span>}</div>
        </>}
      </article>)}
    </div>
    {(busy || history?.busy) && <p role="status" className="muted">Kosh is preparing your answer…</p>}
    <label>Your question<textarea ref={questionInput} aria-label="Your question" disabled={demo} rows={3} value={question} maxLength={2000} onChange={e => setQuestion(e.target.value)} placeholder={demo?'Open a policy shared with your account to ask live questions.':"For example: the insurer hasn't replied. What can I do?"}/></label>
    <div className="ai-send"><button className="secondary" disabled={demo || !canAsk || !question.trim()} onClick={() => send('question',question)}>Send question</button></div>
    <p className="muted ai-small">{demo?'This public sample uses no personal data or AI calls. Reading an example aloud uses your device’s available voices.':'Voice fills in your question so you can check it before sending. Kosh sends the policy and your question to AI through Convex, and saves your conversation for your account. Public searches use the insurer, country and claim situation. Audio is sent for transcription and is not saved in Kosh.'}</p>
    </div>}
    {error && <p role="alert" className="error">{error}</p>}
    <p className="muted ai-small">Kosh helps you prepare. The insurer confirms coverage and claim requirements. Check any draft before sending it.</p>
  </section>;
}
