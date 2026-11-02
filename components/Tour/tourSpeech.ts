/** Locale → BCP 47 tag the voice should speak. */
const SPEECH_LANG: Record<string, string> = { ko: "ko-KR", en: "en-US" };

/** Natural-sounding voices, best first. Local (on-device) voices also report
 *  word boundaries, which the captions follow; Google's network voices don't. */
const PREFERRED = [/(premium|enhanced)/i, /(Yuna|Sora|Siri|Samantha|Ava|Allison|Zoe|Susan|Natural)/i, /Google/i];

/** macOS novelty voices that sit at the top of the English list. */
const NOVELTY =
  /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Junior|Ralph|Fred|Kathy|Deranged|Hysterical|Pipe Organ)\b/i;

/** The line being spoken. Chrome garbage-collects an utterance nothing holds
 *  on to, and its `end` event goes with it — so keep it referenced. */
let speaking: SpeechSynthesisUtterance | null = null;

export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Best installed voice for a locale, or `undefined` to let the browser pick. */
function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
  const lang = SPEECH_LANG[locale] ?? locale;
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace("_", "-").startsWith(lang) && !NOVELTY.test(v.name));
  for (const re of PREFERRED) {
    const hit = voices.find((v) => re.test(v.name) && v.localService) ?? voices.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return voices.find((v) => v.localService) ?? voices[0];
}

/**
 * Browsers only let speech start from a user gesture. Speaking a silent line
 * from the click itself unlocks it for the rest of the tour (iOS needs this).
 */
export function unlockSpeech() {
  if (!speechSupported()) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  speaking = u;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(u);
}

export function stopSpeech() {
  speaking = null;
  if (speechSupported()) window.speechSynthesis.cancel();
}

/**
 * Speaks `text`, reporting how far it has got (a character index) through
 * `onProgress`, and resolves when it ends.
 *
 * `estimateMs` is how long the line should take. Voices that don't report word
 * boundaries are tracked by elapsed time against it; with no usable voice at
 * all the line is held for that long so captions keep their pace; and an
 * engine that never fires `end` is given up on well after it.
 */
export function speak(
  text: string,
  locale: string,
  estimateMs: number,
  onProgress: (charIndex: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const lastWord = text.trimEnd().search(/\S+$/);
    let start = performance.now();
    let boundaries = false;
    let settled = false;
    const tick = window.setInterval(() => {
      if (!boundaries) onProgress(Math.min(text.length, ((performance.now() - start) / estimateMs) * text.length));
    }, 80);
    let tail = 0;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (speaking === u) speaking = null;
      window.clearTimeout(guard);
      window.clearTimeout(tail);
      window.clearInterval(tick);
      onProgress(text.length);
      resolve();
    };
    // Ended suspiciously early → there was no real voice; hold for the estimate.
    const ended = () => {
      const elapsed = performance.now() - start;
      if (elapsed < estimateMs * 0.3) window.setTimeout(finish, estimateMs - elapsed);
      else finish();
    };
    const guard = window.setTimeout(finish, speechSupported() ? estimateMs * 2.5 + 2000 : estimateMs);
    if (!speechSupported()) return;

    speaking = u;
    u.lang = SPEECH_LANG[locale] ?? locale;
    const voice = pickVoice(locale);
    if (voice) u.voice = voice;
    u.onstart = () => {
      start = performance.now();
    };
    u.onboundary = (e) => {
      if (e.name !== "word") return;
      boundaries = true;
      onProgress(e.charIndex);
      // Some engines drop `end`; once the last word is under way, don't wait
      // much longer than it takes to say it.
      if (e.charIndex >= lastWord) {
        window.clearTimeout(tail);
        tail = window.setTimeout(finish, (text.length - lastWord) * (estimateMs / text.length) * 1.5 + 1200);
      }
    };
    u.onend = ended;
    u.onerror = ended;
    window.speechSynthesis.resume(); // Chrome can be left paused after a cancel
    window.speechSynthesis.speak(u);
  });
}
