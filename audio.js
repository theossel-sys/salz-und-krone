/* Salz & Krone – Klang: alles im Browser erzeugt (Web Audio), keine Audiodateien.
 * Musik: Bordun (Quinte auf D) + gezupfte Melodie in D-Dorisch + Rahmentrommel.
 * Geräusche: Münzen, Segel, Glocke, Fanfare, Blättern, Meeresrauschen. */
(function (root) {
  'use strict';
  const KEY = 'salz-und-krone-audio';
  let cfg = { music: true, sfx: true };
  try { cfg = Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* privat */ }

  let ctx = null, master, musicBus, sfxBus, noiseBuf, sea = null;
  const music = { on: false, timer: null, next: 0, step: 0, phrase: [], drone: null, mood: 'game' };

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
    // ein Hall aus Rauschen für etwas Raum
    const verb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.22;
    musicBus.connect(verb); verb.connect(wet); wet.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return true;
  }
  // der erste Fingertipp schaltet den Klang frei (Browser-Regel)
  function unlock() {
    if (!init()) return;
    if (cfg.music && !music.on) startMusic(music.mood);
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(t => root.addEventListener(t, unlock, { capture: true }));

  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  // ---------- Bausteine ----------
  function pluck(t, note, vel, dur, bus) {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o1.type = 'triangle'; o2.type = 'sine';
    o1.frequency.value = midi(note); o2.frequency.value = midi(note + 12) * 1.002;
    f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(700, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const g2 = ctx.createGain(); g2.gain.value = 0.35;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(f); f.connect(bus || musicBus);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function drum(t, vel) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 140; f.Q.value = 1.2;
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.2);
    og.gain.setValueAtTime(vel * 0.9, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    s.connect(f); f.connect(g); g.connect(musicBus); o.connect(og); og.connect(musicBus);
    s.start(t, Math.random()); s.stop(t + 0.3); o.start(t); o.stop(t + 0.3);
  }
  function startDrone() {
    const g = ctx.createGain(), f = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 0.7;
    lfo.frequency.value = 0.07; lg.gain.value = 160; lfo.connect(lg); lg.connect(f.frequency);
    g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 3);
    const oscs = [38, 45, 50].map((n, i) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = (i - 1) * 4;
      o.connect(f); o.start(); return o;
    });
    f.connect(g); g.connect(musicBus); lfo.start();
    return { stop() { const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5); oscs.concat([lfo]).forEach(o => o.stop(t + 1.6)); } };
  }

  // ---------- Musik: kleine Phrasen in D-Dorisch, die sich wiederholen und abwandeln ----------
  const SCALE = [62, 64, 65, 67, 69, 71, 72, 74, 76, 77];   // D E F G A H C D E F
  function newPhrase() {
    const p = []; let i = 4 + Math.floor(Math.random() * 3);
    for (let k = 0; k < 8; k++) {
      i = Math.max(0, Math.min(SCALE.length - 1, i + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      p.push(Math.random() < 0.18 ? null : SCALE[i]);
    }
    p[7] = Math.random() < 0.5 ? 62 : 69;                     // Ende auf Grundton oder Quinte
    return p;
  }
  function schedule() {
    const beat = music.mood === 'intro' ? 0.62 : 0.5;          // Sekunden je Achtel
    while (music.next < ctx.currentTime + 0.4) {
      const st = music.step, inBar = st % 8;
      if (st % 32 === 0 && (st / 32) % 2 === 0) music.phrase = newPhrase();
      const n = music.phrase[inBar];
      const rest = music.mood === 'intro' && st % 64 >= 48;
      if (n && !rest) {
        pluck(music.next, n, inBar === 0 ? 0.16 : 0.11, 1.4);
        if (inBar % 4 === 0 && Math.random() < 0.6) pluck(music.next, n - 12, 0.07, 1.8);
      }
      if (music.mood !== 'intro' && (inBar === 0 || inBar === 5)) drum(music.next, inBar === 0 ? 0.32 : 0.18);
      music.next += beat; music.step++;
    }
  }
  function startMusic(mood) {
    music.mood = mood || music.mood;
    if (!ctx || !cfg.music || music.on) return;
    music.on = true; music.step = 0; music.next = ctx.currentTime + 0.3; music.phrase = newPhrase();
    music.drone = startDrone();
    music.timer = setInterval(schedule, 120);
  }
  function stopMusic() {
    if (!music.on) return;
    music.on = false; clearInterval(music.timer);
    if (music.drone) music.drone.stop();
  }

  // ---------- Meeresrauschen ----------
  function startSea() {
    if (!ctx || sea || !cfg.sfx) return;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 520;
    g.gain.value = 0.07; lfo.frequency.value = 0.11; lg.gain.value = 0.06; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); lfo.start();
    sea = { stop() { const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 1.2); s.stop(t + 1.3); lfo.stop(t + 1.3); } };
  }
  function stopSea() { if (sea) { sea.stop(); sea = null; } }

  // ---------- Geräusche ----------
  function ping(t, f, v, d) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + d + 0.05);
  }
  function whoosh(t, d, from, to, v) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t, Math.random()); s.stop(t + d + 0.05);
  }
  const SFX = {
    coin() { const t = ctx.currentTime; ping(t, 2350, 0.12, 0.18); ping(t + 0.06, 3130, 0.09, 0.25); },
    sell() { const t = ctx.currentTime; [0, 0.05, 0.1].forEach((d, i) => ping(t + d, 1980 + i * 340, 0.09, 0.22)); },
    sail() { const t = ctx.currentTime; whoosh(t, 1.1, 300, 1800, 0.25); ping(t + 0.2, 523, 0.05, 0.6); },
    page() { whoosh(ctx.currentTime, 0.25, 2500, 6000, 0.12); },
    error() { const t = ctx.currentTime; ping(t, 180, 0.15, 0.25); ping(t + 0.12, 150, 0.12, 0.3); },
    bell() {
      const t = ctx.currentTime;
      [[392, 0.18, 4], [392 * 2.01, 0.08, 3], [392 * 2.76, 0.06, 2.4], [392 * 5.4, 0.03, 1.4]].forEach(([f, v, d]) => ping(t, f, v, d));
    },
    fanfare() {
      const t = ctx.currentTime;
      [[0, 62], [0.18, 66], [0.36, 69], [0.6, 74]].forEach(([d, n]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = midi(n); f.type = 'lowpass'; f.frequency.value = 1800;
        const len = d === 0.6 ? 1.2 : 0.22;
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.12, t + d + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + d + len);
        o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t + d); o.stop(t + d + len + 0.05);
      });
    },
    build() { const t = ctx.currentTime; [0, 0.16, 0.32].forEach(d => { whoosh(t + d, 0.09, 900, 400, 0.3); ping(t + d, 140, 0.18, 0.12); }); },
    turn() { const t = ctx.currentTime; ping(t, 659, 0.06, 0.5); ping(t + 0.1, 880, 0.05, 0.6); },
  };

  function play(name) {
    if (!cfg.sfx || !ctx || ctx.state !== 'running' || !SFX[name]) return;
    try { SFX[name](); } catch (e) { /* egal */ }
  }
  function saveCfg() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* privat */ } }

  root.AUDIO = {
    get music() { return cfg.music; }, get sfx() { return cfg.sfx; },
    play, startSea, stopSea,
    mood(m) { music.mood = m; if (music.on) { stopMusic(); startMusic(m); } },
    setMusic(on) { cfg.music = on; saveCfg(); if (on) { init(); startMusic(); } else stopMusic(); },
    setSfx(on) { cfg.sfx = on; saveCfg(); if (!on) stopSea(); },
  };
})(typeof window !== 'undefined' ? window : globalThis);
