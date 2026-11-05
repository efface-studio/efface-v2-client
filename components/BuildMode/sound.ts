/** E major pentatonic across three octaves, low to high. */
const SCALE = [164.8, 185, 207.7, 246.9, 277.2, 329.6, 370, 415.3, 493.9, 554.4, 659.3, 740, 830.6, 987.8];

/**
 * Build mode's sound, synthesized live (no files): a mechanical keyboard for
 * typing, a click per mouse press, and sparse glass-piano notes for boxes —
 * low for big ones, high for small, panned to their cursor. Quiet by design.
 */
export function createSound() {
  let ctx: AudioContext | null = null;
  let out: GainNode | null = null;
  let on = true;
  let lastKey = 0;
  let lastNote = 0;
  let noise: AudioBuffer | null = null;
  let resuming = false;

  const ready = () => {
    if (!on) return null;
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = 0.32;
      out.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    }
    // One wake-up request at a time (a locked context would otherwise pile them up).
    if (ctx.state === "suspended" && !resuming) {
      resuming = true;
      ctx.resume().catch(() => {}).finally(() => (resuming = false));
    }
    return ctx;
  };

  const panner = (c: AudioContext, pan: number) => {
    const p = c.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(out!);
    return p;
  };

  /** A short filtered noise burst over a low thump: a key, or a mouse button. */
  const click = (pan: number, bright: number, thock: number, level: number) => {
    const c = ready();
    if (!c || !noise) return;
    const t = c.currentTime;
    const dest = panner(c, pan);
    const src = c.createBufferSource();
    src.buffer = noise;
    const hp = c.createBiquadFilter();
    hp.type = "bandpass";
    hp.frequency.value = bright;
    hp.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    src.connect(hp).connect(g).connect(dest);
    src.start(t);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(thock, t);
    o.frequency.exponentialRampToValueAtTime(thock * 0.6, t + 0.05);
    const og = c.createGain();
    og.gain.setValueAtTime(level * 0.5, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(og).connect(dest);
    o.start(t);
    o.stop(t + 0.07);
  };

  /** A soft bell: sine plus a quiet octave, long decay. */
  const bell = (freq: number, pan: number, level: number, at = 0) => {
    const c = ready();
    if (!c) return;
    const t = c.currentTime + at;
    const dest = panner(c, pan);
    for (const [mult, amp] of [[1, 1], [2, 0.25], [3.01, 0.08]] as const) {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * mult;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level * amp, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g).connect(dest);
      o.start(t);
      o.stop(t + 1.5);
    }
  };

  return {
    get on() {
      return on;
    },
    set on(v: boolean) {
      on = v;
      if (!v) ctx?.suspend().catch(() => {});
      else ready();
    },
    /** One key: deeper on spaces; at most ~28 a second, so a crowd doesn't roar. */
    key(pan: number, space: boolean) {
      const now = performance.now();
      if (now - lastKey < 36) return;
      lastKey = now;
      click(pan, space ? 1400 : 2600 + Math.random() * 900, space ? 90 : 150, 0.16);
    },
    press(pan: number) {
      click(pan, 1800, 110, 0.22);
    },
    /** A note for a placed box: size picks the octave, x the step; on an eighth-note grid. */
    note(area: number, x: number, pan: number) {
      const now = performance.now();
      if (now - lastNote < 220) return;
      lastNote = now;
      const band = area > 200_000 ? 0 : area > 20_000 ? 4 : 8;
      bell(SCALE[Math.min(SCALE.length - 1, band + Math.round(x * 5))], pan, 0.06);
    },
    swell() {
      const c = ready();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(440, t + 0.9);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(g).connect(out!);
      o.start(t);
      o.stop(t + 1.2);
    },
    arpeggio() {
      [5, 7, 8, 10].forEach((s, i) => bell(SCALE[s], (i - 1.5) / 2, 0.05, i * 0.09));
    },
    chord() {
      [0, 3, 5, 8].forEach((s, i) => bell(SCALE[s], (i - 1.5) / 3, 0.06, i * 0.03));
    },
    close() {
      ctx?.close().catch(() => {});
      ctx = null;
    },
  };
}

export type BuildSound = ReturnType<typeof createSound>;
