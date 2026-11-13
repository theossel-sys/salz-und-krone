/* Salz & Krone – Oberfläche */
(function () {
  'use strict';
  const SK = window.SK;
  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal');
  const $toast = document.getElementById('toast');
  const SAVE_KEY = 'salz-und-krone-v1';
  const fmt = SK.fmt;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let S = null;                 // Spielstand
  const ui = { tab: 'karte', city: null, holder: null, send: null, shown: -1 };

  // ---------- Speichern ----------
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* privat */ } }
  function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* egal */ } }

  // ---------- kleine Helfer ----------
  const me = () => S.players[S.cur];
  function toast(t) {
    $toast.textContent = t; $toast.hidden = false;
    $toast.classList.toggle('up', !!(typeof tut !== 'undefined' && tut.on));
    clearTimeout(toast.t); toast.t = setTimeout(() => { $toast.hidden = true; }, 2600);
  }
  function modal(html, onClick) {
    $modal.innerHTML = `<div class="sheet">${html}</div>`;
    $modal.hidden = false;
    $modal.onclick = e => {
      const b = e.target.closest('[data-m]');
      if (b) onClick(b.dataset.m, b);
    };
  }
  function closeModal() { $modal.hidden = true; $modal.innerHTML = ''; $modal.onclick = null; }
  const seal = (pl, size) => `<div class="arms">${ART.arms(pl.name, pl.color, size || 40)}</div>`;
  const goodChip = (g, n) => `<span class="chip">${SK.G[g].icon} ${n}</span>`;
  const cargoChips = goods => {
    const c = SK.GOODS.filter(g => goods[g.id] > 0).map(g => goodChip(g.id, goods[g.id]));
    return c.length ? c.join('') : '<span class="muted small">leer</span>';
  };
  const shipSvg = (color, w, type) => ART.ship(type || 'kogge', color, w || 40);
  function holderLabel(pl, h) {
    if (h.kind === 'ship') { const sh = pl.ships.find(x => x.id === h.id); return `${SK.SHIPS[sh.type].name} „${esc(sh.name)}“`; }
    return h.city === pl.home ? 'Heimatlager' : 'Kontor';
  }
  const presentIn = (pl, city) => !!pl.kontore[city] || pl.ships.some(sh => sh.at === city);

  // ---------- Szene: Meer, Sonne, segelnde Kogge ----------
  function scene(dawn) {
    return `<div class="scene"><svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dawn ? '#2b3550' : '#1d2438'}"/><stop offset=".55" stop-color="${dawn ? '#c9755a' : '#6b4a52'}"/><stop offset=".7" stop-color="${dawn ? '#f1c27a' : '#a8735e'}"/></linearGradient>
        <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b6b7e"/><stop offset="1" stop-color="#14232e"/></linearGradient>
        <radialGradient id="sunG"><stop offset="0" stop-color="#fff2c4"/><stop offset=".4" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>
        <pattern id="sw" width="120" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 Q30 4 60 15 T120 15" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"/></pattern>
        <pattern id="sw2" width="200" height="50" patternUnits="userSpaceOnUse"><path d="M0 25 Q50 10 100 25 T200 25" fill="none" stroke="#ffd9a0" stroke-opacity=".12" stroke-width="3"/></pattern>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)"/>
      <g class="sun"><circle cx="1050" cy="560" r="260" fill="url(#sunG)"/><circle cx="1050" cy="560" r="70" fill="#ffe7a8"/></g>
      <path d="M0,560 L120,540 L260,548 L380,530 L520,552 L640,548 L760,560 Z" fill="#3a3346" opacity=".7"/>
      <rect y="560" width="1600" height="340" fill="url(#deep)"/>
      <ellipse cx="1050" cy="700" rx="190" ry="150" fill="url(#sunG)" opacity=".28"/>
      <g class="w2"><rect x="-200" y="560" width="2000" height="400" fill="url(#sw2)"/></g>
      <g class="w1"><rect x="-120" y="580" width="1900" height="400" fill="url(#sw)"/></g>
      <g class="cog" style="${phase(46)}"><g transform="translate(0,452)"><g class="bobber">
        <path d="M70 20 L70 150" stroke="#2a1d12" stroke-width="6"/>
        <path d="M76 26 Q160 70 76 140 Z" fill="#efe2c2" stroke="#3b2412" stroke-width="3"/>
        <path d="M76 60 Q118 80 76 104" fill="none" stroke="#b3261e" stroke-width="10"/>
        <path d="M66 18 L66 6 L92 12 Z" fill="#b3261e"/>
        <path d="M0 150 L150 150 L128 196 L22 196 Z" fill="#3b2412"/><path d="M8 162 L142 162" stroke="#6b4523" stroke-width="5"/>
        <rect x="4" y="132" width="26" height="20" fill="#3b2412"/><rect x="122" y="128" width="30" height="24" fill="#3b2412"/>
      </g></g></g>
      <g class="gulls" stroke="#1d2438" stroke-width="3" fill="none" opacity=".7"><path d="M0,0 q10,-10 20,0 q10,-10 20,0"/><path d="M60,26 q8,-8 16,0 q8,-8 16,0"/></g>
    </svg></div>`;
  }

  // ---------- Intro ----------
  function intro(done) {
    const lines = STORY.INTRO.slice();
    let i = 0, finished = false;
    AUDIO.mood('intro'); AUDIO.startSea();
    const box = document.createElement('div');
    box.className = 'intro';
    box.innerHTML = scene(true) + `<button class="btn sm skip">Überspringen ▸▸</button><div class="text"></div><div class="hint">Tippen zum Weiterlesen</div>`;
    document.body.appendChild(box);
    const text = box.querySelector('.text');
    const finish = () => {
      if (finished) return; finished = true;
      clearTimeout(timer);
      AUDIO.stopSea(); AUDIO.mood('game');
      box.remove(); done();
    };
    let timer;
    const show = () => {
      clearTimeout(timer);
      if (i < lines.length) {
        text.innerHTML = `<p>${esc(lines[i++])}</p>`;
        timer = setTimeout(show, 5200);
      } else if (i === lines.length) {
        i++; text.innerHTML = '';
        box.querySelector('.hint').textContent = 'Tippen, um zu beginnen';
        const tc = document.createElement('div'); tc.className = 'titlecard'; tc.innerHTML = '<h1>Salz &amp; Krone</h1>';
        box.appendChild(tc); AUDIO.play('bell');
        timer = setTimeout(finish, 5000);
      } else finish();
    };
    box.addEventListener('click', e => { if (e.target.closest('.skip')) finish(); else show(); });
    setTimeout(show, 900);
  }

  // ---------- Titelbild / Neues Spiel ----------
  const setup = {
    years: 15,
    players: [
      { name: 'Hinrich', ai: false, home: 'luebeck' },
      { name: 'Margarete', ai: true, home: 'bruegge' },
      { name: 'Wulf', ai: true, home: 'danzig' },
      { name: '', ai: true, home: '', off: true },
    ],
  };
  function title() {
    const saved = loadSave();
    const rows = setup.players.map((p, i) => `
      <div class="pl-row">
        <div class="seal" style="background:${['#b3261e', '#1f5fa8', '#2e7d32', '#8e44ad'][i]};${p.off ? 'opacity:.3' : ''}">${i + 1}</div>
        <input type="text" data-name="${i}" value="${esc(p.name)}" placeholder="${p.off ? 'frei' : 'Name'}" maxlength="16" ${p.off ? 'disabled' : ''}>
        <select data-kind="${i}">
          <option value="h" ${!p.off && !p.ai ? 'selected' : ''}>Mensch</option>
          <option value="k" ${!p.off && p.ai ? 'selected' : ''}>Computer</option>
          ${i > 0 ? `<option value="x" ${p.off ? 'selected' : ''}>– frei –</option>` : ''}
        </select>
      </div>`).join('');
    $app.innerHTML = `
      <div class="title">${scene(false)}<div class="title-dim"></div>
        <h1>Salz &amp; Krone</h1>
        <div class="sub">Handle mit Salz und Hering zwischen Brügge und Reval, kaufe Land, baue dein Lehen aus – und steige vom Krämer zum Reichsfürsten auf.</div>
        ${saved && !saved.over ? `<button class="btn primary" data-t="cont">Spiel fortsetzen – ${SK.SEASONS[saved.round % 4]} ${SK.START_YEAR + Math.floor(saved.round / 4)}</button>` : ''}
        <div class="sheet">
          <h2>Neues Spiel</h2>
          ${rows}
          <h3>Spieldauer</h3>
          <div class="seg">${[10, 15, 25].map(y => `<button data-years="${y}" class="${setup.years === y ? 'on' : ''}">${y} Jahre</button>`).join('')}</div>
          <p class="muted small">Gewonnen hat, wer zuerst Reichsfürst wird – oder am Ende den höchsten Rang und das größte Vermögen hat. Mehrere Menschen spielen abwechselnd am selben Gerät.</p>
          <div class="actions" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="row"><button class="btn sm" data-t="help">📖 Anleitung</button><button class="btn sm" data-t="music">${AUDIO.music ? '🎵 Musik an' : '🔇 Musik aus'}</button></span>
            <button class="btn primary" data-t="start">Spiel beginnen</button></div>
        </div>
      </div>`;
    $app.querySelectorAll('[data-name]').forEach(el => { el.oninput = () => { setup.players[+el.dataset.name].name = el.value; }; });
    $app.querySelectorAll('[data-kind]').forEach(el => {
      el.onchange = () => {
        const p = setup.players[+el.dataset.kind];
        p.off = el.value === 'x'; p.ai = el.value === 'k';
        if (!p.off && !p.name) p.name = ['Hinrich', 'Margarete', 'Wulf', 'Gesche'][+el.dataset.kind];
        title();
      };
    });
    $app.onclick = e => {
      const y = e.target.closest('[data-years]');
      if (y) { setup.years = +y.dataset.years; title(); return; }
      const t = e.target.closest('[data-t]');
      if (!t) return;
      if (t.dataset.t === 'music') { AUDIO.setMusic(!AUDIO.music); title(); return; }
      if (t.dataset.t === 'help') { handbook(); return; }
      if (t.dataset.t === 'cont') { S = saved; ui.shown = -1; startTurn(); }
      if (t.dataset.t === 'start') {
        const players = setup.players.filter(p => !p.off).map(p => ({ name: p.name.trim() || 'Namenlos', ai: p.ai, home: p.home }));
        if (!players.some(p => !p.ai)) { toast('Mindestens ein Mensch muss mitspielen.'); return; }
        S = SK.newGame({ players, years: setup.years });
        ui.shown = -1;
        save();
        intro(startTurn);
      }
    };
  }

  // ---------- Zugablauf ----------
  function humans() { return S.players.filter(p => !p.ai).length; }

  function startTurn() {
    $app.onclick = null;
    // Computergegner ziehen sofort
    let guard = 0;
    while (!S.over && me().ai && guard++ < 50) {
      SK.aiTurn(S, me());
      SK.endTurn(S);
    }
    save();
    if (S.over) { gameOver(); return; }
    const pl = me();
    ui.tab = 'karte'; ui.city = pl.home; ui.holder = null; ui.send = null;
    const key = S.round * 10 + S.cur;
    const go = () => {
      ui.shown = key;
      const msgs = SK.beginTurn(S, pl);
      if (S.over) { save(); gameOver(); return; }
      render();
      news(pl, msgs);
    };
    if (humans() > 1 && ui.shown !== key) {
      $app.innerHTML = `<div class="title">${seal(pl, 72)}<h1 style="font-size:34px">${esc(pl.name)}</h1>
        <div class="sub">${SK.seasonName(S)} ${SK.year(S)} – ${SK.RANKS[pl.rank].name} aus ${SK.C[pl.home].name}</div>
        <button class="btn primary" id="go">Ich bin bereit</button></div>`;
      document.getElementById('go').onclick = go;
    } else if (ui.shown !== key) go();
    else render();
  }

  const ICONS = {
    kerze: '<svg viewBox="0 0 30 30"><path d="M12 12h6v15h-6z" fill="#f6e7c8"/><path d="M15 3c3 4 3 7 0 8-3-1-3-4 0-8z" fill="#ffd27a"/></svg>',
    rolle: '<svg viewBox="0 0 30 30"><rect x="6" y="7" width="18" height="16" rx="3" fill="#f6e7c8"/><path d="M10 12h10M10 16h10M10 20h6" stroke="#8e1f15" stroke-width="1.5"/></svg>',
    schiff: '<svg viewBox="0 0 30 30"><path d="M15 4v16" stroke="#f6e7c8" stroke-width="2"/><path d="M16 5q8 6 0 13z" fill="#f6e7c8"/><path d="M4 20h22l-4 6H8z" fill="#f6e7c8"/></svg>',
    muenze: '<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" fill="#ffd27a"/><circle cx="15" cy="15" r="6.5" fill="none" stroke="#8e5f10" stroke-width="1.5"/></svg>',
    aehre: '<svg viewBox="0 0 30 30"><path d="M15 27V6" stroke="#f6e7c8" stroke-width="2"/><g fill="#ffd27a"><ellipse cx="11" cy="10" rx="3" ry="5"/><ellipse cx="19" cy="10" rx="3" ry="5"/><ellipse cx="11" cy="18" rx="3" ry="5"/><ellipse cx="19" cy="18" rx="3" ry="5"/></g></svg>',
    krone: '<svg viewBox="0 0 30 30"><path d="M5 22l-1-13 6 5 5-8 5 8 6-5-1 13z" fill="#ffd27a" stroke="#8e5f10"/><rect x="5" y="22" width="20" height="3" fill="#ffd27a"/></svg>',
    feder: '<svg viewBox="0 0 30 30"><path d="M24 4C12 6 8 14 7 24l3-3c6 0 11-6 14-17z" fill="#f6e7c8"/><path d="M7 24L18 11" stroke="#8e1f15" stroke-width="1.2"/></svg>',
  };
  function letter(card, onDone) {
    const lines = (Array.isArray(card.text) ? card.text : [card.text]).filter(Boolean);
    const body = lines.map((t, i) => `<p class="${t.startsWith('—') ? 'sig' : ''}">${esc(t)}</p>`).join('');
    AUDIO.play(card.icon === 'krone' ? 'fanfare' : 'page');
    if (card.icon === 'krone') setTimeout(() => AUDIO.play('bell'), 900);
    modal(`<div class="letter-in"><div class="head"><div class="wax">${ICONS[card.icon] || ICONS.feder}</div><h2>${esc(card.title)}</h2></div>
      ${body}${card.sign ? `<p class="goal">${esc(card.sign)}</p>` : ''}
      <div class="actions"><button class="btn primary" data-m="ok">Weiter</button></div></div>`, () => { closeModal(); onDone(); });
    $modal.querySelector('.sheet').classList.add('letter');
  }
  function news(pl, msgs) {
    const queue = [];
    // Story zuerst
    (pl.story || []).splice(0).forEach(key => {
      if (key === 'jahr') queue.push(next => letter(STORY.yearLetter(S, pl), next));
      else if (STORY.BEATS[key]) {
        const b = STORY.BEATS[key];
        queue.push(next => letter({ icon: b.icon, title: b.title, text: b.text(S, pl), sign: b.sign }, next));
      }
    });
    const ev = (pl.events || []);
    const otherLog = S.log.filter(l => l.r === S.round && l.p !== pl.id && l.p >= 0).slice(-6);
    const items = msgs.map(m => `<p><b>👑 ${esc(m)}</b></p>`).concat(ev.map(m => `<p>${esc(m)}</p>`));
    const inc = pl.lastIncome ? `<p class="muted small">Steuern +${fmt(pl.lastIncome.tax)} · Unterhalt −${fmt(pl.lastIncome.cost)} Gold</p>` : '';
    const others = otherLog.length ? `<h3>Aus dem Reich</h3>${otherLog.map(l => `<p class="small">${esc(l.t)}</p>`).join('')}` : '';
    if (items.length || others) queue.push(next => modal(`<h2>${SK.seasonName(S)} ${SK.year(S)}</h2>${items.join('')}${inc}${others}
      <div class="actions"><button class="btn primary" data-m="ok">Weiter</button></div>`, () => { closeModal(); next(); }));
    if (pl.offer) queue.push(next => {
      const o = pl.offer;
      AUDIO.play('page');
      modal(`<div class="head row"><span style="font-size:30px">📜</span><h2>Ein Bote des Rates von ${SK.C[o.city].name}</h2></div>
        <p><i>„Ratsherr ${esc(o.giver)} lässt ausrichten: Die Stadt braucht <b>${o.qty} Last ${SK.G[o.good].icon} ${SK.G[o.good].name}</b> bis zum ${SK.SEASONS[(o.deadline) % 4]} ${SK.START_YEAR + Math.floor(o.deadline / 4)}. Der Rat zahlt <b>${fmt(o.reward)} Gulden</b> – und vergisst es nicht.“</i></p>
        <p class="small muted">Ansehen +${o.rep} bei Erfolg, −3 wenn du die Frist versäumst. Ein Auftrag zur Zeit.</p>
        <div class="actions"><button class="btn" data-m="no">Ablehnen</button><button class="btn primary" data-m="yes">Annehmen</button></div>`,
      m => { if (m === 'yes') { SK.acceptQuest(S, pl); AUDIO.play('coin'); } else SK.declineQuest(S, pl); closeModal(); save(); render(); next(); });
      $modal.querySelector('.sheet').classList.add('letter');
    });
    if (S.round === 0 && !tut.on) queue.push(next => tutOffer(next));
    if (pl.annualDue) queue.push(() => annualDialog(pl));
    const run = () => { const f = queue.shift(); if (f) f(run); };
    run();
  }

  function annualDialog(pl) {
    const home = pl.kontore[pl.home];
    const need = Math.ceil(pl.pop * SK.GRAIN_PER_HEAD);
    let ration = Math.min(home.getreide, need), tax = pl.tax;
    const draw = () => {
      const r = ration / Math.max(1, need);
      const mood = r >= 1.15 ? 'Das Volk jubelt – Zuzug wahrscheinlich.' : r >= 1 ? 'Alle werden satt.' : r >= 0.8 ? 'Knapp – einige murren.' : 'Hunger! Menschen sterben oder fliehen.';
      modal(`<h2>Jahresabschluss ${SK.year(S)}</h2>
        <div class="stat"><span>Ernte dieses Jahr</span><b>${fmt(pl.harvest)} Last</b></div>
        <div class="stat"><span>Getreide im Heimatlager</span><b>${fmt(home.getreide)} Last</b></div>
        <div class="stat"><span>Untertanen</span><b>${fmt(pl.pop)}</b></div>
        <div class="stat"><span>Bedarf fürs Jahr</span><b>${fmt(need)} Last</b></div>
        <h3>Getreide ans Volk verteilen: ${fmt(ration)} Last (${Math.round(r * 100)} %)</h3>
        <input type="range" min="0" max="${home.getreide}" value="${ration}" data-r="ration">
        <p class="small ${r < 0.8 ? 'dear' : r >= 1 ? 'cheap' : ''}">${mood}</p>
        ${home.getreide < need ? `<p class="small muted">Zu wenig Getreide? Kaufe im Heimatlager (Markt) welches dazu, bevor du bestätigst.</p>` : ''}
        <h3>Steuersatz: ${tax} %</h3>
        <input type="range" min="0" max="50" value="${tax}" data-r="tax">
        <p class="small muted">${tax > 30 ? 'Hohe Steuern kosten Ansehen und vertreiben Leute.' : tax <= 15 ? 'Milde Steuern ziehen Siedler an.' : 'Ein üblicher Satz.'}</p>
        <div class="actions"><button class="btn" data-m="markt">Erst zum Markt</button><button class="btn primary" data-m="ok">Bestätigen</button></div>`,
      act => {
        if (act === 'markt') { closeModal(); ui.tab = 'markt'; ui.city = pl.home; ui.holder = { kind: 'kontor', city: pl.home }; render(); toast('Danach im Lehen „Jahresabschluss“ antippen.'); return; }
        if (act === 'ok') {
          SK.setTax(pl, tax);
          const res = SK.annual(S, pl, ration);
          closeModal(); save(); render();
          toast(res.diff >= 0 ? `Dein Volk wächst um ${fmt(res.diff)} auf ${fmt(res.pop)}.` : `Dein Volk schrumpft um ${fmt(-res.diff)} auf ${fmt(res.pop)}.`);
        }
      });
      $modal.querySelectorAll('[data-r]').forEach(el => {
        el.oninput = () => {
          if (el.dataset.r === 'ration') ration = +el.value; else tax = +el.value;
          const keep = el.dataset.r; draw();
          const again = $modal.querySelector(`[data-r="${keep}"]`); if (again) again.focus();
        };
      });
    };
    draw();
  }

  function endTurn() {
    const pl = me();
    AUDIO.play('turn');
    if (pl.annualDue) { annualDialog(pl); toast('Erst den Jahresabschluss erledigen.'); return; }
    const moving = pl.ships.filter(sh => sh.at && !SK.isFrozen(S, sh.at)).length;
    const doEnd = () => { closeModal(); SK.endTurn(S); save(); startTurn(); };
    if (moving && pl.ships.every(sh => sh.at)) {
      modal(`<h2>Zug beenden?</h2><p>Alle deine Schiffe liegen noch im Hafen. Wirklich weiter?</p>
        <div class="actions"><button class="btn" data-m="no">Zurück</button><button class="btn primary" data-m="yes">Zug beenden</button></div>`,
      a => { if (a === 'yes') doEnd(); else closeModal(); });
    } else doEnd();
  }

  function gameOver() {
    AUDIO.play('fanfare');
    const ranked = S.players.slice().sort((a, b) => SK.score(S, b) - SK.score(S, a));
    clearSave();
    $app.onclick = null;
    $app.innerHTML = `<div class="title">${scene(true)}<div class="title-dim"></div><h1 style="font-size:40px">${esc(S.players[S.winner].name)} siegt!</h1>
      <div class="sub">${esc(STORY.epilogue(S, S.players.find(p => !p.ai && p.id === S.winner) || S.players.find(p => !p.ai) || S.players[S.winner]))}</div>
      <div class="sheet"><table><tr><th>#</th><th>Name</th><th>Rang</th><th class="num">Vermögen</th></tr>
      ${ranked.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${SK.RANKS[p.rank].name}</td><td class="num">${fmt(SK.worth(S, p))}</td></tr>`).join('')}
      </table></div><button class="btn primary" id="again">Neues Spiel</button></div>`;
    document.getElementById('again').onclick = title;
  }

  // ---------- Hauptansicht ----------
  const TABS = [['karte', '🗺️', 'Karte'], ['flotte', '⛵', 'Flotte'], ['markt', '⚖️', 'Markt'], ['lehen', '🏰', 'Lehen'], ['reich', '👑', 'Reich']];
  function render() {
    const pl = me();
    const body = { karte: viewMap, flotte: viewFleet, markt: viewMarket, lehen: viewFief, reich: viewRealm }[ui.tab](pl);
    $app.innerHTML = `
      <header class="top">${seal(pl)}
        <div class="who"><b>${esc(pl.name)}</b><small>${SK.RANKS[pl.rank].name} · ${SK.seasonName(S)} ${SK.year(S)}</small></div>
        <div class="gold">${fmt(pl.gold)} 🪙<small>Ansehen ${pl.ansehen}</small></div>
        <button class="iconbtn help" data-a="help" aria-label="Spielanleitung">?</button>
        <button class="iconbtn" data-a="music" aria-label="Musik">${AUDIO.music ? '🎵' : '🔇'}</button>
        <button class="endturn" data-a="end">Zug ▸</button>
      </header>
      <main>${body}</main>
      <nav class="tabs">${TABS.map(t => `<button data-tab="${t[0]}" class="${ui.tab === t[0] ? 'on' : ''}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
    $app.onclick = onClick;
    $app.querySelectorAll('[data-range]').forEach(el => { el.onchange = () => onRange(el); });
    if (tut.on) setTimeout(tutUpdate, 0);
  }

  // ---------- Karte ----------
  const LAND = [
    // Skandinavien
    'M60,0 L720,0 L700,60 L650,110 L612,170 L600,228 L566,262 L520,300 L470,328 L428,300 L392,252 L330,222 L262,206 L200,194 L150,166 L112,128 L84,70 Z',
    // Finnland
    'M760,0 L1000,0 L1000,176 L920,170 L850,150 L790,110 L770,60 Z',
    // Festland mit Jütland und Baltikum
    'M0,640 L0,582 L90,556 L180,526 L262,502 L330,482 L346,420 L340,352 L360,312 L396,306 L410,350 L416,410 L452,440 L520,446 L600,436 L662,416 L720,380 L758,330 L776,280 L800,232 L860,206 L1000,200 L1000,640 Z',
    // Gotland, Öland, Seeland, Bornholm
    'M606,280 L638,268 L652,318 L628,352 L604,322 Z',
    'M556,330 L566,328 L572,372 L560,392 L552,360 Z',
    'M432,372 L460,364 L470,396 L446,410 L428,396 Z',
    'M520,398 L534,394 L538,408 L524,412 Z',
  ];
  // Animationen laufen über Neuzeichnen hinweg weiter: Phase aus der Uhr
  const phase = sec => `animation-delay:-${((performance.now() / 1000) % sec).toFixed(2)}s`;
  // weicher Pfad durch Punkte
  function smooth(pts) {
    if (pts.length === 2) {
      const [a, b] = pts, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
      const k = 0.12;                       // leichte Kurve
      return `M${a[0]},${a[1]} Q${mx - dy * k},${my + dx * k} ${b[0]},${b[1]}`;
    }
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
      d += ` Q${pts[i][0]},${pts[i][1]} ${i === pts.length - 2 ? pts[i + 1][0] + ',' + pts[i + 1][1] : m[0] + ',' + m[1]}`;
    }
    return d;
  }
  function along(pts, f) {                 // Punkt bei Anteil f der Strecke
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
    let want = total * f;
    for (let i = 0; i < seg.length; i++) {
      if (want <= seg[i]) { const t = want / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t, pts[i + 1][0] - pts[i][0]]; }
      want -= seg[i];
    }
    const n = pts.length - 1; return [pts[n][0], pts[n][1], pts[n][0] - pts[n - 1][0]];
  }
  const shipOnMap = (color, x, y, dx, type) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><g class="bob" style="${phase(3.2)}"><g transform="scale(${dx < 0 ? -1 : 1},1) translate(-17,-28)">${shipSvg(color, 34, type)}</g></g></g>`;

  const biggest = (pl, city) => { const t = pl.ships.filter(sh => sh.at === city).map(sh => sh.type); return t.includes('holk') ? 'holk' : t.includes('kogge') ? 'kogge' : 'schnigge'; };
  function viewMap(pl) {
    const sel = ui.city && SK.C[ui.city];
    const sending = ui.send && pl.ships.find(x => x.id === ui.send);
    const winter = SK.season(S) === 3;
    let svg = `<svg class="map ${sending ? 'sending' : ''}" viewBox="0 0 1000 640" role="img" aria-label="Seekarte">
      <defs>
        <radialGradient id="sea" cx="45%" cy="45%" r="75%"><stop offset="0" stop-color="${winter ? '#a4bfca' : '#8fbccb'}"/><stop offset="1" stop-color="${winter ? '#5f7f8f' : '#3f7590'}"/></radialGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e3bf"/><stop offset="1" stop-color="#d6bd85"/></linearGradient>
        <radialGradient id="glint" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <filter id="sh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1e3a48" flood-opacity=".5"/></filter>
        <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
        <pattern id="waves" width="46" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q11.5 3 23 10 T46 10" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.5"/></pattern>
        <pattern id="waves2" width="70" height="34" patternUnits="userSpaceOnUse"><path d="M0 17 Q17.5 9 35 17 T70 17" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="2"/></pattern>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="8" stroke="#8a6a3a" stroke-opacity=".12" stroke-width="2"/></pattern>
        <clipPath id="landclip">${LAND.map(d => `<path d="${d}"/>`).join('')}</clipPath>
      </defs>
      <rect width="1000" height="640" fill="url(#sea)"/>
      <g class="anim-waves" style="${phase(9)}"><rect x="-70" y="-34" width="1140" height="720" fill="url(#waves2)"/></g>
      <g class="anim-waves2" style="${phase(6)}"><rect x="-46" y="-20" width="1100" height="700" fill="url(#waves)"/></g>
      <g class="anim-glint" style="${phase(14)}"><ellipse cx="300" cy="420" rx="120" ry="40" fill="url(#glint)"/><ellipse cx="680" cy="250" rx="90" ry="30" fill="url(#glint)"/></g>
      ${winter ? '<path d="M560,0 L1000,0 L1000,330 L880,320 L780,240 L640,180 L600,120 Z" fill="#fff" fill-opacity=".45" filter="url(#blur)"/>' : ''}
      <g filter="url(#sh)">${LAND.map(d => `<path d="${d}" fill="url(#land)" stroke="#7d5f33" stroke-width="1.6"/>`).join('')}</g>
      <rect width="1000" height="640" fill="url(#hatch)" clip-path="url(#landclip)"/>
      ${LAND.map(d => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" transform="translate(0,2)" clip-path="url(#landclip)"/>`).join('')}
      <g class="deco" fill="#6d5a37" opacity=".5" font-style="italic">
        <text x="150" y="380" font-size="18" letter-spacing="3">Mare Germanicum</text><text x="650" y="372" font-size="18" letter-spacing="3">Mare Balticum</text>
        <text x="330" y="90" font-size="22" letter-spacing="6">NORWEGEN · SCHWEDEN</text><text x="820" y="560" font-size="18" letter-spacing="4">LIVLAND</text><text x="120" y="610" font-size="16" letter-spacing="4">FLANDERN</text>
      </g>
      <g class="anim-gulls" style="${phase(40)}" stroke="#2b3d46" stroke-opacity=".55" stroke-width="2" fill="none">
        <path d="M0,0 q6,-6 12,0 q6,-6 12,0"/><path d="M30,14 q5,-5 10,0 q5,-5 10,0"/>
      </g>
      <g opacity=".55" transform="translate(150,300)"><path d="M0,0 q20,-26 40,0 q20,-26 40,0" fill="none" stroke="#2f5a6c" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="-4" r="5" fill="#2f5a6c"/><text x="-10" y="28" font-size="12" fill="#2f5a6c" font-style="italic">hic sunt dracones</text></g>`;

    // Seerouten zum Losschicken
    if (sending && sending.at) {
      const from = sending.at, cargoVal = SK.load(sending.cargo) > 0;
      const offers = SK.CITIES.filter(c => c.id !== from).map(c => {
        const frozen = SK.isFrozen(S, c.id) || SK.isFrozen(S, from);
        let value = 0;
        if (cargoVal) SK.GOODS.forEach(g => { if (sending.cargo[g.id]) value += SK.quote(S, c.id, g.id, sending.cargo[g.id], true).sum; });
        return { c, frozen, value, t: SK.travelTime(sending, from, c.id) };
      });
      const best = cargoVal ? offers.filter(o => !o.frozen).sort((a, b) => b.value / b.t - a.value / a.t)[0] : null;
      offers.forEach(o => {
        const d = smooth(SK.route(from, o.c.id));
        svg += `<path d="${d}" class="route ${o.frozen ? 'frozen' : ''} ${o === best ? 'best' : ''}" style="${phase(1.2)}"/>`;
      });
      offers.forEach(o => {
        const w = cargoVal ? 92 : 54, side = o.c.id === 'visby';
        const x = side ? o.c.x + 30 + w / 2 : o.c.x, y = side ? o.c.y : o.c.y - 46;
        svg += `<g class="badge ${o.frozen ? 'frozen' : ''} ${o === best ? 'best' : ''}" data-city="${o.c.id}" transform="translate(${x - w / 2},${y - 15})">
          <rect width="${w}" height="28" rx="14"/><text x="${w / 2}" y="19" text-anchor="middle">${o.frozen ? '❄ vereist' : `⏳${o.t}${cargoVal ? ' · ' + fmt(o.value) : ''}`}</text></g>`;
      });
    }
    // eigener Auftrag
    if (pl.quest) {
      const q = SK.C[pl.quest.city];
      svg += `<g transform="translate(${q.x - 34},${q.y - 6})" class="quest-mark"><circle r="13" fill="#f6e7b8" stroke="#8a6a3a" stroke-width="2"/><text y="5" text-anchor="middle" font-size="15">📜</text></g>`;
    }
    // Schiffe auf See (alle Häuser)
    S.players.forEach(p => p.ships.forEach(sh => {
      if (sh.at) return;
      const pts = SK.route(sh.from || p.home, sh.to), total = SK.travelTime(sh, sh.from || p.home, sh.to);
      const f = Math.min(0.85, Math.max(0.15, 1 - sh.left / (total + 0.5)));
      const [x, y, dx] = along(pts, f);
      if (p === pl) svg += `<path d="${smooth(pts)}" class="myroute" stroke="${p.color}"/>`;
      const fresh = ui.anim && ui.anim.ship === sh.id && performance.now() - ui.anim.t < 400;
      if (fresh) {
        const steps = 12, kp = [];
        for (let i = 0; i <= steps; i++) kp.push(along(pts, f * i / steps));
        const mp = 'M' + kp.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L');
        svg += `<g><g class="bob" style="${phase(3.2)}"><g transform="scale(${dx < 0 ? -1 : 1},1) translate(-17,-28)">${shipSvg(p.color, 34, sh.type)}</g></g>
          <animateMotion dur="1.8s" fill="freeze" path="${mp}" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"/></g>`;
      } else svg += `<g opacity="${p === pl ? 1 : .75}">${shipOnMap(p.color, x, y, dx, sh.type)}</g>`;
    }));
    // Städte
    SK.CITIES.forEach(c => {
      const homeOf = S.players.find(p => p.home === c.id);
      const mine = pl.ships.filter(sh => sh.at === c.id).length;
      const frozen = SK.isFrozen(S, c.id);
      svg += `<g class="city ${ui.city === c.id ? 'sel' : ''}" data-city="${c.id}" transform="translate(${c.x},${c.y})">
        <circle r="36" fill="transparent"/>
        ${ui.city === c.id && !sending ? `<circle r="20" class="pulse" style="${phase(2)}"/>` : ''}
        ${homeOf ? `<g class="flag" style="${phase(2.4)}"><path d="M-2,-34 L-2,-8" stroke="#3b2412" stroke-width="2"/><path d="M-2,-34 Q8,-36 16,-30 Q8,-26 -2,-24 Z" fill="${homeOf.color}" stroke="#3b2412" stroke-width="1"/></g>` : ''}
        <circle r="12" fill="${frozen ? '#e3f1f7' : '#fbf2dc'}" stroke="#3b2412" stroke-width="2.5"/>
        <path d="M-6,4 L-6,-2 L-3,-5 L0,-2 L3,-6 L6,-2 L6,4 Z" fill="${pl.kontore[c.id] ? pl.color : '#7d5f33'}"/>
        <text y="30" text-anchor="middle" font-size="19" fill="#2b1d10" stroke="#f3e6c8" stroke-width="4" paint-order="stroke">${c.name}${frozen ? ' ❄' : ''}</text>
        ${mine && !sending ? `<g transform="translate(26,-12)">${shipOnMap(pl.color, 0, 0, 1, biggest(pl, c.id))}${mine > 1 ? `<text x="14" y="4" font-size="14" fill="#2b1d10" stroke="#f3e6c8" stroke-width="3" paint-order="stroke">×${mine}</text>` : ''}</g>` : ''}
      </g>`;
    });
    // Windrose und Kartusche
    svg += `<g transform="translate(925,565)" class="rose"><circle r="40" fill="#f3e6c8" stroke="#7d5f33" stroke-width="2"/><circle r="31" fill="none" stroke="#7d5f33" stroke-dasharray="2 4"/>
        <path d="M0,-36 L7,0 L0,36 L-7,0 Z" fill="#9e2a1f"/><path d="M-36,0 L0,-7 L36,0 L0,7 Z" fill="#5b4630"/><path d="M-20,-20 L3,-3 L20,20 L-3,3 Z" fill="#c9962b" opacity=".7"/>
        <text y="-44" text-anchor="middle" font-size="14" fill="#5b4630">N</text></g>
      <g transform="translate(786,18)"><rect width="196" height="54" rx="6" fill="#f3e6c8" stroke="#7d5f33" stroke-width="2"/><rect x="5" y="5" width="186" height="44" rx="4" fill="none" stroke="#7d5f33" stroke-opacity=".5"/>
        <text x="98" y="26" text-anchor="middle" font-size="17" fill="#2b1d10">Carta Hanseatica</text><text x="98" y="42" text-anchor="middle" font-size="12" fill="#5b4630" font-style="italic">${SK.seasonName(S)} Anno ${SK.year(S)}</text></g>
    </svg>`;

    let panel = '';
    if (sending) {
      panel = `<div class="banner"><span>⛵ Wähle das Ziel für die „${esc(sending.name)}“${SK.load(sending.cargo) ? ' – die Zahl zeigt den Erlös der Ladung dort' : ''}</span><button class="btn sm" data-a="cancelsend">Abbrechen</button></div>`;
    }
    panel += questCard(pl);
    if (sel) {
      const prices = SK.GOODS.map(g => {
        const p = SK.sellPrice(S, sel.id, g.id), rel = p / g.base;
        return `<span class="chip ${rel < 0.8 ? 'ok' : rel > 1.25 ? 'no' : ''}" title="${g.name}">${g.icon} ${p}</span>`;
      }).join(' ');
      const ships = pl.ships.filter(sh => sh.at === sel.id);
      const owner = S.players.find(p => p.home === sel.id);
      panel += `<div class="sheet"><div class="skyline">${ART.skyline(sel.id, 600, 110)}</div><div class="spread"><h2>${sel.name}${SK.isFrozen(S, sel.id) ? ' – zugefroren' : ''}</h2>
          ${owner ? `<span class="chip">${owner === pl ? 'Deine Heimat' : 'Heimat von ' + esc(owner.name)}</span>` : ''}</div>
        <p class="small muted">Erzeugt: ${sel.p.map(g => SK.G[g].icon + ' ' + SK.G[g].name).join(', ')} · Gefragt: ${sel.d.map(g => SK.G[g].icon + ' ' + SK.G[g].name).join(', ')}</p>
        <div class="row small">${prices}</div>
        <p class="small muted">Verkaufspreise je Last – grün = günstig, rot = teuer.</p>
        <div class="row">
          ${presentIn(pl, sel.id) ? `<button class="btn primary" data-a="tomarket" data-city="${sel.id}">Zum Markt</button>` : ''}
          ${ships.map(sh => `<button class="btn" data-a="send" data-ship="${sh.id}">⛵ „${esc(sh.name)}“ segeln</button>`).join('')}
          ${ships.length && !pl.kontore[sel.id] ? `<button class="btn" data-a="kontor" data-city="${sel.id}">Kontor eröffnen (${fmt(SK.KONTOR_PRICE)})</button>` : ''}
        </div></div>`;
    }
    return `<div class="wide2"><div class="sheet mapwrap">${svg}</div><div>${panel}${legend(pl)}</div></div>`;
  }
  function questCard(pl) {
    const q = pl.quest;
    if (!q) return '';
    const left = q.deadline - S.round + 1;
    return `<div class="sheet quest"><div class="spread"><h2>📜 Auftrag</h2><span class="chip ${left <= 1 ? 'no' : ''}">noch ${left} ${left === 1 ? 'Jahreszeit' : 'Jahreszeiten'}</span></div>
      <p class="small">Ratsherr ${esc(q.giver)} aus <b>${SK.C[q.city].name}</b> erwartet <b>${q.qty} Last ${SK.G[q.good].icon} ${SK.G[q.good].name}</b>.</p>
      <p class="small muted">Lohn: ${fmt(q.reward)} 🪙 und Ansehen +${q.rep}. Abliefern im Markt von ${SK.C[q.city].name}.</p></div>`;
  }
  function legend(pl) {
    const sea = pl.ships.filter(sh => !sh.at);
    return `<div class="sheet small"><h3 style="margin-top:0">Deine Schiffe</h3>
      ${pl.ships.map(sh => `<div class="stat"><span>⛵ ${esc(sh.name)}</span><span class="muted">${sh.at ? 'in ' + SK.C[sh.at].name : `→ ${SK.C[sh.to].name}, noch ${sh.left} ${sh.left === 1 ? 'Jahreszeit' : 'Jahreszeiten'}`}</span></div>`).join('')}
      ${sea.length ? '' : '<p class="muted">Tippe auf eine Stadt, um Preise zu sehen oder ein Schiff loszuschicken.</p>'}</div>`;
  }

  // ---------- Flotte ----------
  function viewFleet(pl) {
    const cards = pl.ships.map(sh => {
      const T = SK.SHIPS[sh.type], used = SK.load(sh.cargo);
      const where = sh.at ? `liegt in ${SK.C[sh.at].name}` : `segelt nach ${SK.C[sh.to].name} · Ankunft in ${sh.left} ${sh.left === 1 ? 'Jahreszeit' : 'Jahreszeiten'}`;
      return `<div class="ship"><div class="pic">${shipSvg(pl.color, 52, sh.type)}</div><div>
        <div class="spread"><b>„${esc(sh.name)}“</b><span class="chip">${T.name}${sh.armed ? ' · ⚔️' : ''}</span></div>
        <div class="small muted">${where}</div>
        <div class="cargo">${cargoChips(sh.cargo)}</div>
        <div class="small muted">${used} / ${T.cap} Last</div><div class="bar"><i style="width:${100 * used / T.cap}%"></i></div>
        ${sh.at ? `<div class="row" style="margin-top:8px">
          <button class="btn sm primary" data-a="tomarket" data-city="${sh.at}" data-ship="${sh.id}">Handeln</button>
          <button class="btn sm" data-a="send" data-ship="${sh.id}">Segeln</button>
          ${!sh.armed ? `<button class="btn sm" data-a="arm" data-ship="${sh.id}">Bewaffnen (${SK.ARM_PRICE})</button>` : ''}
          ${pl.ships.length > 1 && !used ? `<button class="btn sm" data-a="sellship" data-ship="${sh.id}">Verkaufen</button>` : ''}
        </div>` : ''}
      </div></div>`;
    }).join('');
    const shop = Object.keys(SK.SHIPS).map(k => {
      const T = SK.SHIPS[k];
      return `<div class="stat shipshop"><span class="row" style="flex-wrap:nowrap">${shipSvg(pl.color, 56, k)}<span><b>${T.name}</b> <span class="muted small">${T.cap} Last · ${k === 'schnigge' ? 'schnell' : k === 'holk' ? 'langsam, robust' : 'ausgewogen'} · Unterhalt ${T.upkeep}</span></span></span>
        <button class="btn sm" data-a="buyship" data-type="${k}" ${pl.gold < T.price ? 'disabled' : ''}>${fmt(T.price)} 🪙</button></div>`;
    }).join('');
    return `<div class="sheet"><h2>Deine Flotte</h2>${cards}</div>
      <div class="sheet"><h2>Werft in ${SK.C[pl.home].name}</h2>${shop}
        <p class="small muted">Neue Schiffe laufen in deiner Heimatstadt vom Stapel. Bewaffnete Schiffe schrecken Seeräuber ab.</p></div>`;
  }

  // ---------- Markt ----------
  function viewMarket(pl) {
    const cities = SK.CITIES.filter(c => presentIn(pl, c.id));
    if (!cities.length) return `<div class="sheet"><h2>Markt</h2><p>Du hast gerade weder ein Schiff noch ein Kontor in einem Hafen.</p></div>`;
    if (!ui.city || !presentIn(pl, ui.city)) ui.city = cities[0].id;
    const city = ui.city;
    const holders = [];
    if (pl.kontore[city]) holders.push({ kind: 'kontor', city });
    pl.ships.filter(sh => sh.at === city).forEach(sh => holders.push({ kind: 'ship', id: sh.id }));
    if (!ui.holder || !holders.some(h => JSON.stringify(h) === JSON.stringify(ui.holder))) ui.holder = holders[0];
    const h = ui.holder, goods = SK.holderGoods(pl, h), obj = SK.holderObj(pl, h);
    const cap = h.kind === 'ship' ? SK.SHIPS[obj.type].cap : SK.capOf(pl, obj);
    const used = SK.load(goods);
    const other = holders.find(x => JSON.stringify(x) !== JSON.stringify(h));
    const C = SK.C[city];
    const rows = SK.GOODS.map(g => {
      const bp = SK.buyPrice(S, city, g.id), sp = SK.sellPrice(S, city, g.id), rel = sp / g.base;
      const cls = rel < 0.8 ? 'cheap' : rel > 1.25 ? 'dear' : '';
      return `<div class="mrow">
        <div class="good"><span class="ic">${g.icon}</span>${g.name}${C.p.includes(g.id) ? ' <span class="chip ok">Erz.</span>' : ''}${C.d.includes(g.id) ? ' <span class="chip no">gefr.</span>' : ''}</div>
        <div class="num ${cls}">${bp}</div><div class="num ${cls}">${sp}</div><div class="num"><b>${goods[g.id] || '–'}</b></div>
        <div class="trade">
          <button class="btn sm" data-a="sell" data-g="${g.id}" data-q="10" ${goods[g.id] ? '' : 'disabled'}>−10</button>
          <button class="btn sm" data-a="sell" data-g="${g.id}" data-q="1" ${goods[g.id] ? '' : 'disabled'}>−1</button>
          <button class="btn sm" data-a="buy" data-g="${g.id}" data-q="1">+1</button>
          <button class="btn sm" data-a="buy" data-g="${g.id}" data-q="10">+10</button>
          ${other ? `<button class="btn sm" data-a="move" data-g="${g.id}" ${goods[g.id] ? '' : 'disabled'} title="umladen">⇄</button>` : ''}
        </div></div>`;
    }).join('');
    return `${pl.quest ? questCard(pl) : ''}<div class="sheet"><div class="skyline">${ART.skyline(city, 600, 90)}</div>
        <div class="spread"><h2>Markt ${C.name}</h2>
          <select data-range="city">${cities.map(c => `<option value="${c.id}" ${c.id === city ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
        <div class="row" style="margin:6px 0 4px">${holders.map(x => `<button class="btn sm ${JSON.stringify(x) === JSON.stringify(h) ? 'primary' : ''}" data-a="holder" data-h='${JSON.stringify(x)}'>${holderLabel(pl, x)}</button>`).join('')}</div>
        <div class="small muted">${holderLabel(pl, h)}: ${used} / ${cap} Last belegt${other ? ' · ⇄ lädt 10 Last um nach: ' + holderLabel(pl, other) : ''}</div>
        <div class="bar"><i style="width:${100 * used / cap}%"></i></div>
        <div class="mrow head"><div>Ware</div><div class="num">Kauf</div><div class="num">Verk.</div><div class="num">Lager</div><div></div></div>${rows}
        <div class="row" style="margin-top:10px;justify-content:flex-end">
          ${pl.quest && pl.quest.city === city ? `<button class="btn primary" data-a="deliver" ${SK.canDeliver(S, pl, h) ? '' : 'disabled'}>📜 ${pl.quest.qty} ${SK.G[pl.quest.good].name} abliefern (${fmt(pl.quest.reward)} 🪙)</button>` : ''}
          <button class="btn" data-a="sellall" ${used ? '' : 'disabled'}>Alles verkaufen</button>
          ${h.kind === 'ship' && !SK.isFrozen(S, city) ? `<button class="btn primary" data-a="send" data-ship="${h.id}">Lossegeln ▸</button>` : ''}
        </div>
        <p class="small muted">Jeder Kauf treibt den Preis hoch, jeder Verkauf drückt ihn. „Erz.“ = hier erzeugt (billig), „gefr.“ = hier gefragt (teuer).</p>
      </div>`;
  }

  // ---------- Lehen ----------
  function viewFief(pl) {
    const home = pl.kontore[pl.home];
    const need = Math.ceil(pl.pop * SK.GRAIN_PER_HEAD);
    const farmed = Math.min(pl.land, pl.pop * 3);
    const blds = SK.BUILDINGS.map(b => `<div class="stat"><span>${b.icon} <b>${b.name}</b> <span class="small muted">${b.text}</span></span>
      ${pl.buildings[b.id] ? '<span class="chip ok">✓ gebaut</span>' : `<button class="btn sm" data-a="build" data-b="${b.id}" ${pl.gold < b.price ? 'disabled' : ''}>${fmt(b.price)} 🪙</button>`}</div>`).join('');
    const rivals = S.players.filter(p => p !== pl);
    return `<div class="grid2">
      <div class="sheet"><h2>Dein Lehen bei ${SK.C[pl.home].name}</h2>
        <div class="stat"><span>Land</span><b>${fmt(pl.land)} Morgen</b></div>
        <div class="stat"><span>Bestellt</span><b>${fmt(farmed)} Morgen ${farmed < pl.land ? '<span class="small muted">(zu wenig Leute)</span>' : ''}</b></div>
        <div class="stat"><span>Untertanen</span><b>${fmt(pl.pop)}</b></div>
        <div class="stat"><span>Getreide im Lager</span><b>${fmt(home.getreide)} / Bedarf ${fmt(need)} Last</b></div>
        <div class="stat"><span>Steuersatz</span><b>${pl.tax} %</b></div>
        <div class="stat"><span>Steuern je Jahreszeit</span><b>≈ ${fmt(pl.pop * pl.tax / 100 * 1.6 * (pl.buildings.markt ? 1.3 : 1))} 🪙</b></div>
        <div class="stat"><span>Soldaten</span><b>${pl.soldiers}</b></div>
        <div class="stat"><span>Ansehen</span><b>${pl.ansehen} / 100</b></div>
        ${pl.annualDue ? '<div class="row" style="margin-top:10px"><button class="btn primary" data-a="annual">Jahresabschluss</button></div>' : ''}
      </div>
      <div class="sheet"><h2>Land &amp; Leute</h2>
        <div class="stat"><span>Land kaufen <span class="small muted">(${SK.LAND_PRICE} 🪙 je Morgen)</span></span>
          <span class="row"><button class="btn sm" data-a="land" data-n="10">+10</button><button class="btn sm" data-a="land" data-n="50">+50</button></span></div>
        <div class="stat"><span>Soldaten <span class="small muted">(${SK.SOLDIER_PRICE} 🪙, Sold ${SK.SOLDIER_UPKEEP})</span></span>
          <span class="row"><button class="btn sm" data-a="hire" data-n="-5" ${pl.soldiers ? '' : 'disabled'}>−5</button><button class="btn sm" data-a="hire" data-n="5">+5</button><button class="btn sm" data-a="hire" data-n="20">+20</button></span></div>
        <div class="stat"><span>Spenden an Kirche und Arme</span>
          <span class="row"><button class="btn sm" data-a="donate" data-n="200">200</button><button class="btn sm" data-a="donate" data-n="1000">1000</button></span></div>
        <h3>Steuern (gelten ab sofort)</h3>
        <input type="range" min="0" max="50" value="${pl.tax}" data-range="tax">
        <p class="small muted">Jeder Bauer bestellt bis zu 3 Morgen; pro Kopf braucht das Volk ${SK.GRAIN_PER_HEAD} Last Getreide im Jahr. Die Ernte kommt im Herbst.</p>
      </div>
      <div class="sheet"><h2>Bauten</h2>${blds}</div>
      <div class="sheet"><h2>Fehde</h2>
        <p class="small muted">Mit mindestens 10 Soldaten kannst du einem Rivalen die Fehde erklären. Sieg: Land und Gold. Kostet immer Ansehen; Stadtmauern schützen.</p>
        ${rivals.map(r => `<div class="stat"><span>${esc(r.name)} <span class="small muted">${SK.RANKS[r.rank].name} · ${r.soldiers} Soldaten${r.buildings.mauer ? ' · Mauer' : ''}</span></span>
          <button class="btn sm danger" data-a="feud" data-p="${r.id}" ${pl.soldiers < 10 ? 'disabled' : ''}>Fehde</button></div>`).join('')}
      </div></div>`;
  }

  // ---------- Reich ----------
  function viewRealm(pl) {
    const ladder = SK.RANKS.map((R, i) => {
      const done = i <= pl.rank, next = i === pl.rank + 1;
      const req = i ? SK.rankCheck(S, pl, i).map(x => `<span class="chip ${x.ok ? 'ok' : 'no'}">${x.ok ? '✓' : '✗'} ${x.t}</span>`).join(' ') : '';
      return `<li class="${done ? 'done' : ''} ${next ? 'next' : ''}"><div class="n">${i + 1}</div><div><b>${R.name}</b>${i && !done ? `<div class="row small" style="margin-top:4px">${req}</div>` : ''}</div></li>`;
    }).join('');
    const ranked = S.players.slice().sort((a, b) => SK.score(S, b) - SK.score(S, a));
    const table = `<table><tr><th></th><th>Name</th><th>Rang</th><th class="num">Vermögen</th><th class="num">Land</th><th class="num">Volk</th></tr>
      ${ranked.map(p => `<tr><td>${seal(p, 26)}</td><td>${esc(p.name)}${p.ai ? ' <span class="small muted">(KI)</span>' : ''}</td><td>${SK.RANKS[p.rank].name}</td>
        <td class="num">${fmt(SK.worth(S, p))}</td><td class="num">${fmt(p.land)}</td><td class="num">${fmt(p.pop)}</td></tr>`).join('')}</table>`;
    const logs = S.log.slice(-60).reverse().map(l => `<p><span class="when">${SK.SEASONS[l.r % 4].slice(0, 3)}. ${SK.START_YEAR + Math.floor(l.r / 4)}</span>${esc(l.t)}</p>`).join('');
    const left = S.years * 4 - S.round;
    return `<div class="grid2">
      <div class="sheet"><h2>Dein Aufstieg</h2><p class="small muted">Vermögen: ${fmt(SK.worth(S, pl))} 🪙 (Gold, Waren, Schiffe, Land und Bauten)</p><ul class="ladder">${ladder}</ul></div>
      <div><div class="sheet"><h2>Die Häuser des Reiches</h2>${table}<p class="small muted">Noch ${Math.ceil(left / 4)} Jahre bis zum Spielende.</p></div>
      <div class="sheet"><h2>Chronik</h2><div class="log">${logs}</div></div>
      <div class="sheet"><h2>Einstellungen</h2><div class="row">
        <button class="btn" data-a="music">${AUDIO.music ? '🎵 Musik an' : '🔇 Musik aus'}</button>
        <button class="btn" data-a="sfx">${AUDIO.sfx ? '🔔 Geräusche an' : '🔕 Geräusche aus'}</button>
        <button class="btn" data-a="help">📖 Spielanleitung</button>
        <button class="btn" data-a="menu">Hauptmenü</button></div>
        <p class="small muted">Das Spiel wird automatisch gespeichert. Aufträge erfüllt: ${pl.questsDone}.</p></div></div></div>`;
  }

  // ---------- Tutorial (geführt) ----------
  const TUT_KEY = 'salz-und-krone-tutorial';
  const tutDone = () => { try { return localStorage.getItem(TUT_KEY) === '1'; } catch (e) { return false; } };
  const setTutDone = () => { try { localStorage.setItem(TUT_KEY, '1'); } catch (e) { /* privat */ } };
  const tut = { on: false, i: 0, scrolled: -1, round: 0, timer: null };

  function tutShip(pl) { return pl.ships.find(sh => sh.at === pl.home) || pl.ships.find(sh => sh.at) || pl.ships[0]; }
  function tutSteps(pl) {
    const home = SK.C[pl.home], good = SK.G[home.p[0]];
    const iconRow = SK.GOODS.map(g => `${g.icon} ${g.name}`).join(' · ');
    return [
      { title: 'Willkommen, Kaufmann!', text: `In <b>Salz &amp; Krone</b> handelst du mit Waren zwischen zehn Hansestädten, baust mit dem Gewinn dein Lehen aus und steigst Rang um Rang auf – vom <b>Krämer</b> zum <b>Reichsfürsten</b>. Dieses Tutorial zeigt dir in ein paar Schritten alles Wichtige. Du spielst dabei schon richtig mit.` },
      { sel: '.top .gold', title: 'Gold und Ansehen', text: `Hier siehst du dein <b>Gold</b> 🪙 und dein <b>Ansehen</b> (0–100). Gold verdienst du mit Handel und Steuern. Ansehen bekommst du durch erfüllte Aufträge, satte Untertanen, Bauten und Spenden – beides brauchst du für jeden Aufstieg.` },
      { sel: '.top .arms', title: 'Dein Wappen', text: `Jedes Handelshaus hat ein eigenes Wappen. Neben dem Namen stehen dein Rang und die aktuelle <b>Jahreszeit</b>.` },
      { sel: '[data-a=end]', title: 'Eine Runde = eine Jahreszeit', text: `Mit <b>„Zug ▸“</b> beendest du deinen Zug. Wenn alle Häuser gezogen haben, vergeht eine Jahreszeit: Schiffe segeln weiter, Märkte erholen sich, Steuern kommen herein. Vier Jahreszeiten sind ein Jahr; im <b>Herbst</b> ist Ernte, im <b>Winter</b> frieren Stockholm, Riga und Reval zu ❄.` },
      { tab: 'karte', sel: 'svg.map', title: 'Die Seekarte', text: `Die Kreise sind die zehn Hansestädte. Eine <b>Flagge</b> markiert die Heimat eines Hauses – deine ist ${home.name}. Kleine Schiffe zeigen, wo Flotten liegen oder unterwegs sind, 📜 markiert einen Auftrag. Tippe auf eine Stadt, um ihre Preise zu sehen.` },
      { tab: 'karte', sel: '.sheet .row.small', title: 'Die Waren', text: `Neun Waren gibt es: ${iconRow}. Die Zahl ist der Verkaufspreis in dieser Stadt. <b style="color:#3f6b2a">Grün</b> = hier billig (die Stadt erzeugt sie), <b style="color:#9e2a1f">rot</b> = hier teuer (die Stadt braucht sie). Das Geheimnis des Handels: billig kaufen, wo es grün ist – teuer verkaufen, wo es rot ist.` },
      { sel: '[data-tab=markt]', title: 'Auf zum Markt', text: `Öffne den <b>Markt</b> unten in der Leiste.`, done: () => ui.tab === 'markt', action: true },
      { sel: '[data-a=holder]:last-of-type', title: 'Wohin mit der Ware?', text: `Oben wählst du, wohin die gekaufte Ware kommt: ins <b>Heimatlager</b> oder in den Laderaum eines <b>Schiffes</b>. Wähle deine Kogge.`, done: () => ui.holder && ui.holder.kind === 'ship', action: true },
      { sel: `[data-a=buy][data-g=${good.id}][data-q="10"]`, title: `${good.icon} ${good.name} kaufen`, text: `${home.name} erzeugt <b>${good.name}</b> – erkennbar am grünen „Erz.“. Kaufe zweimal <b>+10</b>. Achte darauf, wie der Preis mit jedem Kauf steigt: Große Mengen verteuern die Ware, deshalb lohnt es sich, auf mehreren Märkten zu handeln.`,
        done: () => { const sh = tutShip(pl); return sh && SK.load(sh.cargo) >= 20; }, action: true },
      { sel: '[data-a=send]', title: 'Leinen los!', text: `Jetzt bringen wir die Ladung dorthin, wo man sie braucht. Tippe auf <b>„Lossegeln ▸“</b>.`, done: () => !!ui.send, action: true },
      { sel: 'g.badge.best, g.badge', title: 'Das Ziel wählen', text: `Die gestrichelten Linien sind Seerouten. Jedes Schild zeigt die <b>Reisezeit</b> ⏳ (in Jahreszeiten) und den <b>Erlös</b>, den deine Ladung dort bringen würde. Das <b>goldene</b> Schild ist das lohnendste Ziel. Tippe es an.`,
        done: () => pl.ships.some(sh => !sh.at), action: true },
      { sel: '[data-tab=lehen]', title: 'Dein Lehen', text: `Handel ist nur die halbe Macht. Öffne dein <b>Lehen</b>.`, done: () => ui.tab === 'lehen', action: true },
      { tab: 'lehen', sel: 'main .sheet', title: 'Land, Leute, Getreide', text: `Jeder Bauer bestellt bis zu 3 Morgen Land; jeder Untertan braucht im Jahr ${SK.GRAIN_PER_HEAD} Last Getreide. Im <b>Herbst</b> kommt die Ernte ins Heimatlager, und du entscheidest, wie viel Getreide du verteilst und wie hoch die <b>Steuern</b> sind. Satte Leute und milde Steuern bringen Zuzug – Hunger vertreibt sie.` },
      { tab: 'lehen', sel: 'main .sheet:nth-child(3)', title: 'Bauten', text: `🌀 Mühle (mehr Ernte), 🏚️ Speicher (größeres Lager), 🏪 Markt (mehr Steuern), ⛪ Kirche und 🕍 Dom (Ansehen), 🧱 Stadtmauer (Schutz). Viele Ränge verlangen bestimmte Bauten.` },
      { sel: '[data-tab=reich]', title: 'Das Reich', text: `Öffne zuletzt das <b>Reich</b>.`, done: () => ui.tab === 'reich', action: true },
      { tab: 'reich', sel: '.ladder', title: 'Die Rangleiter', text: `Hier siehst du, was dir für den nächsten Rang fehlt: ✓ erfüllt, ✗ noch offen. Daneben stehen die anderen Häuser und die Chronik. Unter „Einstellungen“ findest du jederzeit die <b>Spielanleitung</b> und kannst dieses Tutorial neu starten.` },
      { sel: '[data-a=end]', title: 'Zug beenden', text: `Dein Schiff ist unterwegs. Beende jetzt deinen Zug mit <b>„Zug ▸“</b> – in der nächsten Jahreszeit erfährst du, wie die Fahrt verlief.`, done: () => S.round > tut.round, action: true },
      { title: 'Gute Fahrt!', text: `Das Wichtigste weißt du jetzt. Verkaufe die Ladung, sobald dein Schiff angekommen ist (Markt → „Alles verkaufen“), kaufe dort, was in anderen Städten rot ist, und investiere in Land und Bauten. Achte auf die Briefe von Mechthild – und auf Aufträge der Stadträte 📜.<br><br>Die <b>Spielanleitung</b> öffnest du jederzeit mit dem <b>?</b> oben.` },
    ];
  }
  function tutStart() {
    tut.on = true; tut.i = 0; tut.scrolled = -1; tut.round = S.round;
    clearInterval(tut.timer); tut.timer = setInterval(tutUpdate, 350);
    tutUpdate();
  }
  function tutEnd() {
    tut.on = false; clearInterval(tut.timer); setTutDone();
    document.querySelectorAll('.tut-spot,.tut-bubble').forEach(e => e.remove());
  }
  function tutOffer(next) {
    if (tutDone() || me().ai) { next(); return; }
    modal(`<div class="head row"><span style="font-size:30px">🧭</span><h2>Erste Fahrt?</h2></div>
      <p>Möchtest du ein kurzes Tutorial? Es führt dich in etwa zwei Minuten durch deine erste Handelsfahrt und erklärt Karte, Markt, Lehen und Ränge.</p>
      <div class="actions"><button class="btn" data-m="no">Ich kenne mich aus</button><button class="btn primary" data-m="yes">Tutorial starten</button></div>`,
    m => { closeModal(); if (m === 'yes') tutStart(); else setTutDone(); next(); });
  }
  function tutUpdate() {
    if (!tut.on || !S) return;
    const pl = me();
    if (pl.ai) return;
    const steps = tutSteps(pl), st = steps[tut.i];
    if (!st) { tutEnd(); return; }
    if (st.done && st.done()) { tut.i++; tut.scrolled = -1; AUDIO.play('page'); tutUpdate(); return; }
    // Ansicht für Info-Schritte selbst einstellen
    if (st.tab && !st.done && ui.tab !== st.tab && $modal.hidden) { ui.tab = st.tab; render(); }
    let spot = document.querySelector('.tut-spot'), bub = document.querySelector('.tut-bubble');
    if (!spot) { spot = document.createElement('div'); spot.className = 'tut-spot'; document.body.appendChild(spot); }
    if (!bub) { bub = document.createElement('div'); bub.className = 'tut-bubble'; document.body.appendChild(bub); bub.onclick = tutClick; }
    const busy = !$modal.hidden;
    spot.hidden = bub.hidden = busy;
    if (busy) return;
    let target = null;
    if (st.sel) for (const s of st.sel.split(',')) { const all = [...document.querySelectorAll(s.trim())].filter(e => e.getBoundingClientRect().width > 0); if (all.length) { target = all[0]; break; } }
    if (target && tut.scrolled !== tut.i) {
      tut.scrolled = tut.i;
      const r0 = target.getBoundingClientRect(), bh = (bub.offsetHeight || 240) + 110;
      // Ziel in den freien Bereich über der Sprechblase holen (große Ziele wie die Karte bleiben, wo sie sind)
      if (r0.height < innerHeight * 0.5 && (r0.top < 70 || r0.bottom > innerHeight - bh)) window.scrollBy({ top: r0.top - innerHeight * 0.22, behavior: 'smooth' });
    }
    let r = null;
    if (target) { r = target.getBoundingClientRect(); const pad = 6; spot.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`; spot.classList.remove('none'); }
    else spot.classList.add('none');
    const html = `<div class="tut-step">${tut.i + 1} / ${steps.length}</div><h3>${st.title}</h3><p>${st.text}</p>
      <div class="tut-actions"><button class="btn sm" data-tut="end">Tutorial beenden</button>
      ${st.action ? '<span class="tut-hint">👉 Tippe auf das Hervorgehobene</span>' : `<button class="btn sm primary" data-tut="next">${tut.i === steps.length - 1 ? 'Los geht’s!' : 'Weiter'}</button>`}</div>`;
    if (bub.dataset.k !== String(tut.i)) { bub.innerHTML = html; bub.dataset.k = String(tut.i); }
    // Sprechblase in die Bildschirmhälfte gegenüber dem Ziel
    const low = r && (r.top + r.height / 2) > innerHeight / 2;
    bub.classList.toggle('at-top', !!low); bub.classList.toggle('at-bottom', !low);
  }
  function tutClick(e) {
    const b = e.target.closest('[data-tut]');
    if (!b) return;
    if (b.dataset.tut === 'end') { tutEnd(); return; }
    tut.i++; tut.scrolled = -1; AUDIO.play('page');
    const bub = document.querySelector('.tut-bubble'); if (bub) bub.dataset.k = '';
    tutUpdate();
  }
  window.addEventListener('resize', () => tutUpdate());
  window.addEventListener('scroll', () => tutUpdate(), { passive: true });

  // ---------- Spielanleitung (zum Nachschlagen) ----------
  function handbook() {
    const goods = SK.GOODS.map(g => {
      const from = SK.CITIES.filter(c => c.p.includes(g.id)).map(c => c.name).join(', ');
      const to = SK.CITIES.filter(c => c.d.includes(g.id)).map(c => c.name).join(', ');
      return `<tr><td class="good"><span class="ic">${g.icon}</span>${g.name}</td><td class="num">${g.base}</td><td class="small"><span class="cheap">${from}</span></td><td class="small"><span class="dear">${to}</span></td></tr>`;
    }).join('');
    const ships = Object.keys(SK.SHIPS).map(k => { const T = SK.SHIPS[k]; return `<div class="stat"><span class="row" style="flex-wrap:nowrap">${shipSvg('#b3261e', 48, k)}<span><b>${T.name}</b><br><span class="small muted">${T.cap} Last · ${fmt(T.price)} Gold · Unterhalt ${T.upkeep} je Jahreszeit</span></span></span></div>`; }).join('');
    const blds = SK.BUILDINGS.map(b => `<div class="stat"><span>${b.icon} <b>${b.name}</b></span><span class="small muted">${b.text} · ${fmt(b.price)} Gold</span></div>`).join('');
    const ranks = SK.RANKS.map((R, i) => {
      const req = [R.worth && `Vermögen ${fmt(R.worth)}`, R.ansehen && `Ansehen ${R.ansehen}`, R.land && `${R.land} Morgen`, R.pop && `${R.pop} Untertanen`, R.soldiers && `${R.soldiers} Soldaten`, ...(R.bld || []).map(b => SK.B[b].name)].filter(Boolean).join(', ');
      return `<div class="stat"><span><b>${i + 1}. ${R.name}</b></span><span class="small muted">${req || 'Start'}</span></div>`;
    }).join('');
    const sections = [
      ['Ziel', `<p>Steige vom Krämer zum <b>Reichsfürsten</b> auf. Wer das zuerst schafft, gewinnt. Sonst gewinnt nach Ablauf der Jahre, wer den höchsten Rang und das größte Vermögen hat.</p>`],
      ['Ablauf einer Runde', `<p>Eine Runde ist eine <b>Jahreszeit</b>. Jedes Haus macht seinen Zug – kaufen, verkaufen, Schiffe losschicken, bauen – und beendet ihn mit <b>„Zug ▸“</b>. Danach vergeht die Jahreszeit: Schiffe segeln weiter, Märkte erholen sich, Steuern und Unterhalt werden verrechnet, Ereignisse geschehen. Die Zugreihenfolge wechselt jede Runde.</p>
        <p>🌱 Frühling: das Wetter des Jahres zeigt sich · ☀️ Sommer · 🍂 Herbst: Ernte und Jahresabschluss · ❄ Winter: Stockholm, Riga und Reval sind vereist, Stürme sind häufiger.</p>`],
      ['Symbole', `<div class="stat"><span>🪙</span><span class="small muted">Gold</span></div><div class="stat"><span>Ansehen</span><span class="small muted">Ruf deines Hauses, 0–100</span></div>
        <div class="stat"><span>⏳ 2</span><span class="small muted">Reisezeit in Jahreszeiten</span></div><div class="stat"><span>❄</span><span class="small muted">Hafen vereist (Winter)</span></div>
        <div class="stat"><span>📜</span><span class="small muted">Auftrag eines Stadtrates</span></div><div class="stat"><span>⚔️</span><span class="small muted">bewaffnetes Schiff – sicherer vor Seeräubern</span></div>
        <div class="stat"><span>Flagge an einer Stadt</span><span class="small muted">Heimat eines Hauses</span></div><div class="stat"><span>farbige Raute in der Stadt</span><span class="small muted">dein Kontor</span></div>
        <div class="stat"><span><span class="chip ok">Erz.</span> / <span class="chip no">gefr.</span></span><span class="small muted">hier erzeugt (billig) / hier gefragt (teuer)</span></div>
        <div class="stat"><span>🎵</span><span class="small muted">Musik an/aus</span></div>`],
      ['Waren', `<p class="small muted">Grundpreis je Last. Grün: wo sie erzeugt wird (billig) · Rot: wo sie gefragt ist (teuer). Jeder Kauf treibt den Preis, jeder Verkauf drückt ihn; über die Jahreszeiten erholen sich die Märkte.</p>
        <div style="overflow-x:auto"><table><tr><th>Ware</th><th class="num">Preis</th><th>billig in</th><th>teuer in</th></tr>${goods}</table></div>`],
      ['Schiffe und Kontore', `${ships}<p class="small">Neue Schiffe laufen in deiner Heimatstadt vom Stapel. Stürme können Ladung kosten oder ein Schiff versenken; Seeräuber lauern vor den Häfen – Bewaffnung (${SK.ARM_PRICE} Gold) hilft. Ein <b>Kontor</b> (${fmt(SK.KONTOR_PRICE)} Gold) in einer fremden Stadt ist ein Lager, in dem du auch ohne Schiff handeln kannst.</p>`],
      ['Lehen', `<p>Land kostet ${SK.LAND_PRICE} Gold je Morgen. Jeder Bauer bestellt bis zu 3 Morgen; jeder Untertan braucht im Jahr ${SK.GRAIN_PER_HEAD} Last Getreide. Im Herbst kommt die Ernte ins Heimatlager; im <b>Jahresabschluss</b> verteilst du Getreide und legst die Steuern fest. Gut versorgt und mild besteuert wächst dein Volk – Hunger und hohe Steuern vertreiben es und kosten Ansehen. Soldaten (${SK.SOLDIER_PRICE} Gold, Sold ${SK.SOLDIER_UPKEEP}) schützen vor Räubern und erlauben Fehden gegen andere Häuser.</p>`],
      ['Bauten', blds],
      ['Ränge', `<p class="small muted">Für jeden Rang müssen alle Bedingungen gleichzeitig erfüllt sein. Vermögen = Gold + Waren + Schiffe + Land + Bauten.</p>${ranks}`],
      ['Aufträge und Ereignisse', `<p>Stadträte bitten um Lieferungen mit Frist. Wer pünktlich liefert, bekommt Gold und Ansehen; wer die Frist verpasst, verliert Ansehen. Dazu kommen Ereignisse wie Seuchen, Räuber, Feuer, Erbschaften und Fürstenbesuche – und die Briefe deiner Großmutter.</p>`],
      ['Tipps', `<p>• Kaufe grün, verkaufe rot – und nicht alles auf einem Markt.<br>• Halte vor dem Herbst genug Getreide bereit.<br>• Ein zweites Schiff verdoppelt die Einnahmen; eine Mühle früh lohnt sich.<br>• Schulden kosten jede Jahreszeit Zinsen und Ansehen.<br>• Plane den Winter: Die östlichen Häfen frieren zu.</p>`],
    ];
    modal(`<div class="spread"><h2>📖 Spielanleitung</h2><button class="btn sm" data-m="ok">Schließen</button></div>
      ${sections.map(([t, b]) => `<details class="hb"><summary>${t}</summary><div>${b}</div></details>`).join('')}
      <div class="actions"><button class="btn" data-m="tut">Tutorial starten</button><button class="btn primary" data-m="ok">Schließen</button></div>`,
    m => { if (m === 'ok') closeModal(); if (m === 'tut') { closeModal(); if (S && !me().ai) { ui.tab = 'karte'; render(); tutStart(); } else toast('Das Tutorial startet im laufenden Spiel.'); } });
    $modal.querySelector('.sheet').classList.add('wide');
    const first = $modal.querySelector('details'); if (first) first.open = true;
  }

  // ---------- Eingaben ----------
  function err(e) { if (e && typeof e === 'string') { toast(e); AUDIO.play('error'); } }
  function onRange(el) {
    const pl = me();
    if (el.dataset.range === 'tax') { SK.setTax(pl, +el.value); save(); render(); toast(`Steuersatz ${pl.tax} %`); }
    if (el.dataset.range === 'city') { ui.city = el.value; ui.holder = null; render(); }
  }
  function onClick(e) {
    const t = e.target.closest('[data-tab],[data-a],[data-city]');
    if (!t) return;
    const pl = me();
    if (t.dataset.tab) { ui.tab = t.dataset.tab; ui.send = ui.tab === 'karte' ? ui.send : null; render(); window.scrollTo(0, 0); return; }
    const a = t.dataset.a;
    if (!a && t.dataset.city) {             // Stadt auf der Karte
      const c = t.dataset.city;
      if (ui.send) { trySail(pl, ui.send, c); return; }
      ui.city = c; render(); return;
    }
    switch (a) {
      case 'end': endTurn(); return;
      case 'tomarket': ui.tab = 'markt'; ui.city = t.dataset.city; ui.holder = t.dataset.ship ? { kind: 'ship', id: t.dataset.ship } : null; break;
      case 'holder': ui.holder = JSON.parse(t.dataset.h); break;
      case 'buy': { const e2 = SK.buy(S, pl, ui.holder, t.dataset.g, +t.dataset.q); err(e2); if (!e2) AUDIO.play('coin'); break; }
      case 'sell': { const e2 = SK.sell(S, pl, ui.holder, t.dataset.g, +t.dataset.q); err(e2); if (!e2) AUDIO.play('sell'); break; }
      case 'sellall': SK.GOODS.forEach(g => { const n = SK.holderGoods(pl, ui.holder)[g.id]; if (n) SK.sell(S, pl, ui.holder, g.id, n); }); AUDIO.play('sell'); break;
      case 'deliver': { const q = pl.quest, e2 = SK.deliverQuest(S, pl, ui.holder); err(e2);
        if (!e2) { AUDIO.play('fanfare'); toast(`Auftrag erfüllt! +${fmt(q.reward)} Gold, Ansehen +${q.rep}.`); } break; }
      case 'music': AUDIO.setMusic(!AUDIO.music); break;
      case 'sfx': AUDIO.setSfx(!AUDIO.sfx); break;
      case 'move': {
        const city = ui.city, hs = [];
        if (pl.kontore[city]) hs.push({ kind: 'kontor', city });
        pl.ships.filter(sh => sh.at === city).forEach(sh => hs.push({ kind: 'ship', id: sh.id }));
        const other = hs.find(x => JSON.stringify(x) !== JSON.stringify(ui.holder));
        err(SK.transfer(pl, ui.holder, other, t.dataset.g, 10)); break;
      }
      case 'send': ui.send = t.dataset.ship; ui.tab = 'karte'; toast('Tippe auf die Zielstadt oder ihr Schild.'); save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
      case 'cancelsend': ui.send = null; break;
      case 'kontor': err(SK.buyKontor(S, pl, t.dataset.city)); break;
      case 'arm': err(SK.arm(S, pl, t.dataset.ship)); break;
      case 'sellship': err(SK.sellShip(S, pl, t.dataset.ship)); break;
      case 'buyship': { const e2 = SK.buyShip(S, pl, t.dataset.type); err(e2); if (!e2) { AUDIO.play('build'); toast('Ein neues Schiff liegt in ' + SK.C[pl.home].name + '.'); } break; }
      case 'build': { const e2 = SK.build(S, pl, t.dataset.b); err(e2); if (!e2) AUDIO.play('build'); break; }
      case 'land': err(SK.buyLand(S, pl, +t.dataset.n)); break;
      case 'hire': err(SK.hire(S, pl, +t.dataset.n)); break;
      case 'donate': { const before = pl.ansehen; err(SK.donate(S, pl, +t.dataset.n)); if (pl.ansehen > before) toast(`Ansehen +${pl.ansehen - before}`); break; }
      case 'annual': annualDialog(pl); return;
      case 'feud': {
        const target = S.players[+t.dataset.p];
        modal(`<h2>Fehde gegen ${esc(target.name)}?</h2><p>Deine ${pl.soldiers} Soldaten gegen ${target.soldiers}${target.buildings.mauer ? ' hinter einer Stadtmauer' : ''}. Eine Fehde kostet dich in jedem Fall Ansehen.</p>
          <div class="actions"><button class="btn" data-m="no">Lieber nicht</button><button class="btn danger" data-m="yes">Angreifen</button></div>`,
        m => {
          closeModal();
          if (m !== 'yes') return;
          const r = SK.feud(S, pl, target.id);
          if (typeof r === 'string') toast(r);
          else toast(r.won ? `Sieg! ${r.land} Morgen und ${fmt(r.gold)} Gold erbeutet.` : 'Deine Truppen wurden zurückgeschlagen.');
          save(); render();
        });
        return;
      }
      case 'menu': save(); if (tut.on) tutEnd(); title(); return;
      case 'help': handbook(); return;
      default: return;
    }
    save(); render();
  }
  function trySail(pl, shipId, city) {
    const sh = pl.ships.find(x => x.id === shipId);
    if (!sh) { ui.send = null; render(); return; }
    if (city === sh.at) { toast('Das Schiff liegt schon dort.'); return; }
    const n = SK.travelTime(sh, sh.at, city);
    const e = SK.sail(S, pl, shipId, city);
    if (e) { toast(e); return; }
    ui.send = null; ui.city = city;
    ui.anim = { ship: shipId, t: performance.now() };
    AUDIO.play('sail');
    save(); render();
    toast(`„${sh.name}“ segelt nach ${SK.C[city].name} – ${n} ${n === 1 ? 'Jahreszeit' : 'Jahreszeiten'}.`);
  }

  title();
})();
