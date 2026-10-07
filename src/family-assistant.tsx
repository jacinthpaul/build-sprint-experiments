import { useEffect, useRef, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { recordQuestion } from './voice';
import { message } from './common';

const languageCodes = { English: 'en-IN', Hindi: 'hi-IN', Telugu: 'te-IN', Tamil: 'ta-IN', Malayalam: 'ml-IN', Kannada: 'kn-IN', Marathi: 'mr-IN', Bengali: 'bn-IN' };
type Language = keyof typeof languageCodes;
type Mode = 'next' | 'latest' | 'draft' | 'translate' | 'question';
type Situation = 'Not sure yet' | 'Death' | 'Accident' | 'Hospital treatment' | 'Loss or damage' | 'Travel problem';
export function FamilyAssistant({ policyId, savedInsurer }: { policyId: Id<'insurancePolicies'>; savedInsurer: string }) {
  const ask = useAction(api.familyAi.ask), availability = useAction(api.familyAi.availability), transcribe = useAction(api.familyAi.transcribe);
  const history = useQuery(api.familyAiData.messages, { policyId });
  const [available, setAvailable] = useState<boolean | null>(null), [checking, setChecking] = useState(false);
  const [insurer, setInsurer] = useState(savedInsurer), [country, setCountry] = useState('India');
  const [situation, setSituation] = useState<Situation>('Not sure yet'), [language, setLanguage] = useState<Language>('English');
  const [question, setQuestion] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [copied, setCopied] = useState('');
  const [recording, setRecording] = useState(false), [converting, setConverting] = useState(false), [speaking, setSpeaking] = useState('');
  const recorder = useRef<Awaited<ReturnType<typeof recordQuestion>> | null>(null), mounted = useRef(false);
  const canAsk = available === true && !busy && !history?.busy && !recording && !converting;
  useEffect(() => {
    mounted.current = true;
    availability({ policyId }).then(value => { if (mounted.current) setAvailable(value); }).catch(() => { if (mounted.current) { setAvailable(false); setError('AI availability could not be checked. Try again.'); } });
    return () => { mounted.current = false; recorder.current?.cancel(); window.speechSynthesis?.cancel(); };
  }, [policyId, availability]);
  async function send(mode: Mode, text: string) {
    if (!canAsk || !text.trim()) return;
    setBusy(true); setError(''); setCopied('');
    try {
      const result = await ask({ policyId, question: text.trim(), mode, insurer: insurer.trim(), country: country.trim(), situation, language });
      if (mounted.current) { if (!result.ok) setError(result.message); else setQuestion(''); }
    } catch (e) { if (mounted.current) setError(message(e,'Your question could not be answered. Check your access and try again.')); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function startVoice() {
    if (!canAsk) return;
    setError(''); setRecording(true);
    try {
      recorder.current = await recordQuestion(async audio => {
        if (!mounted.current) return;
        setRecording(false); setConverting(true);
        try {
          const text = await transcribe({ policyId, audio });
          if (mounted.current) setQuestion(text);
        } catch { if (mounted.current) setError('The recording could not be understood. Type your question or try again.'); }
        finally { if (mounted.current) setConverting(false); }
      }, () => { if (mounted.current) { setRecording(false); setError('Recording failed. Type your question instead.'); } });
      if (!mounted.current) recorder.current.cancel();
    } catch { if (mounted.current) { setRecording(false); setError('Microphone access is unavailable. Allow it in your browser settings or type your question.'); } }
  }
  function readAnswer(id: string, text: string) {
    if (!window.speechSynthesis) { setError('Reading aloud is not supported on this device. The full answer is shown above.'); return; }
    window.speechSynthesis.cancel();
    if (speaking === id) { setSpeaking(''); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').replace(/[*#]/g, ''));
    // The answer may be in an earlier selected language, or one requested in the question.
    utterance.lang = /[\u0c00-\u0c7f]/.test(text) ? 'te-IN' : /[\u0b80-\u0bff]/.test(text) ? 'ta-IN' : /[\u0d00-\u0d7f]/.test(text) ? 'ml-IN' : /[\u0c80-\u0cff]/.test(text) ? 'kn-IN' : /[\u0980-\u09ff]/.test(text) ? 'bn-IN' : /[\u0900-\u097f]/.test(text) ? language === 'Marathi' ? 'mr-IN' : 'hi-IN' : 'en-IN';
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(''); utterance.onerror = () => { setSpeaking(''); setError('This voice could not play. Try a voice supported by your device.'); };
    setSpeaking(id); window.speechSynthesis.speak(utterance);
  }
  if (history === null) return null;
  return <section className="family-ai" aria-labelledby="family-ai-title">
    <h2 id="family-ai-title">A little help with what comes next</h2>
    <p>Ask Kosh about this policy, check current claim steps or draft a message to the insurer.</p>
    {available === null && <p role="status" className="muted">Checking AI availability…</p>}
    {available === false && <div className="notice"><p>AI help isn't available yet. Your saved information and contact details are still here.</p><button className="text-button" disabled={checking} onClick={async () => { setChecking(true); setError(''); try { setAvailable(await availability({ policyId })); } catch { setError('Could not connect. Try again.'); } finally { setChecking(false); } }}>{checking ? 'Checking…' : 'Check again'}</button></div>}
    <details className="ai-context" open={!savedInsurer && available === true}>
      <summary>Insurer and claim situation</summary>
      <div className="ai-context-fields">
        <label>Insurer name<input value={insurer} maxLength={100} onChange={e => setInsurer(e.target.value)} placeholder="For example, LIC"/><span className="hint">If you don't know, Kosh will help you find out.</span></label>
        <label>Country where the policy was issued<input value={country} maxLength={60} onChange={e => setCountry(e.target.value)}/></label>
        <label>What happened?<select value={situation} onChange={e => setSituation(e.target.value as Situation)}>{['Not sure yet','Death','Accident','Hospital treatment','Loss or damage','Travel problem'].map(s => <option key={s}>{s}</option>)}</select></label>
      </div>
    </details>
    <label className="ai-language">Answer language<select value={language} onChange={e => setLanguage(e.target.value as Language)}>{Object.keys(languageCodes).map(l => <option key={l}>{l}</option>)}</select></label>
    <div className="ai-starters" aria-label="Ways Kosh can help">
      <button className="secondary" disabled={!canAsk} onClick={() => send('next','Help me take the first step for a claim on this policy.')}>What should I do first?</button>
      <button className="secondary" disabled={!canAsk} onClick={() => send('latest','Check the latest official claim requirements for this policy and show your sources.')}>Check latest claim steps</button>
      <button className="secondary" disabled={!canAsk} onClick={() => send('draft',question.trim() || 'Help me draft an escalation to the insurer. Ask me what you need to know first.')}>Draft an escalation</button>
      <button className="secondary" disabled={!canAsk} onClick={() => send('translate',`Translate your latest answer into ${language}. If there is no answer yet, explain the saved policy details in ${language}. Preserve every name, number, date and uncertainty.`)}>Translate into {language}</button>
    </div>
    <div className="ai-messages" aria-label="Your private conversation">
      {history === undefined ? <p className="muted">Loading your conversation…</p> : history.messages.length === 0 ? <p className="muted">You can start with one question. Only you can see this conversation.</p> : history.messages.map(m => <article className={'ai-message ' + m.role} key={m.id}>
        <h3>{m.role === 'user' ? 'You' : 'Kosh'}</h3><p className="preserve">{m.text}</p>
        {m.role === 'assistant' && <>
          {m.searched && m.checkedAt ? <><p className="source">Web sources checked {new Date(m.checkedAt).toLocaleString('en-IN')}:</p><ol className="ai-sources">{m.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ol></> : <p className="source">No new web sources verified for this answer. Confirm current requirements with the insurer.</p>}
          <div className="ai-answer-tools"><button className="text-button" onClick={() => readAnswer(m.id,m.text)}>{speaking === m.id ? 'Stop reading' : 'Read aloud'}</button><button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(m.text); setCopied(m.id); } catch { setError('Copying is unavailable. Select the answer text to copy it.'); } }}>Copy answer</button>{copied === m.id && <span role="status">Copied.</span>}</div>
        </>}
      </article>)}
    </div>
    {(busy || history?.busy) && <p role="status" className="muted">Kosh is preparing your answer…</p>}
    <label>Your question<textarea rows={3} value={question} maxLength={2000} onChange={e => setQuestion(e.target.value)} placeholder="For example: the insurer hasn't replied. What can I do?"/></label>
    <div className="ai-send"><button className="primary" disabled={!canAsk || !question.trim()} onClick={() => send('question',question)}>Ask Kosh</button>
      <button className="text-button" disabled={!recording && (!canAsk || converting)} onClick={recording ? () => recorder.current?.stop() : startVoice}>{recording ? 'Stop recording' : converting ? 'Turning speech into text…' : 'Speak your question'}</button>
    </div>
    {recording && <p role="status">Recording, up to 30 seconds. Tap Stop recording when you're ready.</p>}
    <p className="muted ai-small">Voice fills in your question so you can check it before sending. Kosh sends the policy and your question to AI through Convex, and saves your conversation for your account. Public searches use the insurer, country and claim situation. Audio is sent for transcription and is not saved in Kosh.</p>
    {error && <p role="alert" className="error">{error}</p>}
    <p className="muted ai-small">Kosh helps you prepare. The insurer confirms coverage and claim requirements. Check any draft before sending it.</p>
  </section>;
}
