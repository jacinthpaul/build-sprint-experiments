// Record only after a button press; release the microphone on stop or leaving the page.
export async function recordQuestion(onReady: (audio: string) => void, onError: () => void) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let recorder: MediaRecorder;
  try { recorder = new MediaRecorder(stream); } catch (error) { stream.getTracks().forEach(t => t.stop()); throw error; }
  let cancelled = false;
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  const release = () => stream.getTracks().forEach(t => t.stop());
  const timer = window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 30000);
  recorder.onerror = () => { cancelled = true; clearTimeout(timer); release(); onError(); };
  recorder.onstop = async () => {
    clearTimeout(timer); release();
    if (cancelled) return;
    try { onReady(await asWav(new Blob(chunks, { type: recorder.mimeType }))); } catch { onError(); }
  };
  try { recorder.start(); } catch (error) { clearTimeout(timer); release(); throw error; }
  return {
    stop: () => { if (recorder.state === 'recording') recorder.stop(); },
    cancel: () => { cancelled = true; clearTimeout(timer); release(); if (recorder.state === 'recording') recorder.stop(); },
  };
}
async function asWav(blob: Blob) {
  const audioContext = new AudioContext();
  try {
    const buffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
    if (buffer.duration > 31 || buffer.duration < .15) throw new Error('Use up to 30 seconds of speech.');
    const rate = 16000, frames = Math.floor(buffer.duration * rate);
    const bytes = new ArrayBuffer(44 + frames * 2), view = new DataView(bytes);
    const word = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
    word(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true); word(8, 'WAVE'); word(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    word(36, 'data'); view.setUint32(40, frames * 2, true);
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
    for (let i = 0; i < frames; i++) {
      const start = Math.floor(i * buffer.sampleRate / rate), end = Math.max(start + 1, Math.floor((i + 1) * buffer.sampleRate / rate));
      let sum = 0, count = 0;
      for (const channel of channels) for (let j = start; j < end && j < channel.length; j++) { sum += channel[j]; count++; }
      const sample = Math.max(-1, Math.min(1, sum / Math.max(count, 1)));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    const data = new Uint8Array(bytes); let binary = '';
    for (let i = 0; i < data.length; i += 8192) binary += String.fromCharCode(...data.subarray(i, i + 8192));
    return btoa(binary);
  } finally { await audioContext.close(); }
}
