/* Salz & Krone – Grafik per Code: Wappen, Schiffe und Stadtsilhouetten als SVG.
 * Alles wird aus einem Startwert erzeugt (Name, Stadt), ist also für denselben Namen immer gleich. */
(function (root) {
  'use strict';

  // kleiner, fester Zufallsgenerator aus einem Text
  function seeded(text) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return () => {
      h = (h + 0x6D2B79F5) >>> 0;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pickR = (r, a) => a[Math.floor(r() * a.length)];
  let uid = 0;

  // ---------- Wappen ----------
  // Heraldische Farben: Metalle (Gold, Silber) und Farben (Rot, Blau, Grün, Schwarz, Purpur)
  const METALS = ['#e2b23c', '#eeeae0'];
  const TINCT = { '#b3261e': '#b3261e', '#1f5fa8': '#1f5fa8', '#2e7d32': '#2e7d32', '#8e44ad': '#7b3aa0' };
  const DARK = ['#b3261e', '#1f5fa8', '#2e7d32', '#262626', '#7b3aa0'];
  const SHIELD = 'M6,4 H94 V48 C94,80 70,96 50,106 C30,96 6,80 6,48 Z';

  const CHARGES = {
    kogge: c => `<g fill="${c}"><path d="M48 28 V66" stroke="${c}" stroke-width="3"/><path d="M51 30 Q70 46 51 62 Z"/><path d="M26 66 H74 L66 80 H34 Z"/><path d="M47 26 L47 20 L58 23 Z"/></g>`,
    fisch: c => `<g fill="${c}"><path d="M24 56 C36 40 60 40 72 56 C60 72 36 72 24 56 Z"/><path d="M72 56 L84 46 V66 Z"/><circle cx="34" cy="53" r="2.5" fill="#00000055"/></g>`,
    schluessel: c => `<g fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"><circle cx="50" cy="34" r="10"/><path d="M50 44 V82 M50 70 H60 M50 78 H58"/></g>`,
    krone: c => `<g fill="${c}"><path d="M26 66 L22 36 L36 48 L50 30 L64 48 L78 36 L74 66 Z"/><rect x="26" y="68" width="48" height="8"/></g>`,
    turm: c => `<g fill="${c}"><path d="M32 82 V42 H38 V34 H45 V42 H55 V34 H62 V42 H68 V82 Z"/><path d="M45 82 V66 A5 5 0 0 1 55 66 V82 Z" fill="#00000044"/></g>`,
    stern: c => `<path fill="${c}" d="M50 26 L56 46 L77 46 L60 58 L67 78 L50 66 L33 78 L40 58 L23 46 L44 46 Z"/>`,
    anker: c => `<g fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"><circle cx="50" cy="30" r="5"/><path d="M50 35 V80 M36 46 H64 M28 66 C30 78 42 82 50 80 C58 82 70 78 72 66"/></g>`,
    rad: c => `<g fill="none" stroke="${c}" stroke-width="5"><circle cx="50" cy="56" r="20"/><path d="M50 36 V76 M30 56 H70 M36 42 L64 70 M64 42 L36 70"/></g>`,
    aehre: c => `<g fill="${c}"><path d="M49 84 V30" stroke="${c}" stroke-width="3"/><ellipse cx="44" cy="40" rx="5" ry="8"/><ellipse cx="55" cy="40" rx="5" ry="8"/><ellipse cx="44" cy="55" rx="5" ry="8"/><ellipse cx="55" cy="55" rx="5" ry="8"/><ellipse cx="49.5" cy="28" rx="4" ry="7"/></g>`,
  };

  function arms(name, color, size) {
    const r = seeded('wappen:' + name);
    const id = 'a' + (uid++);
    const main = TINCT[color] || pickR(r, DARK);
    const metal = pickR(r, METALS);
    const div = pickR(r, ['ganz', 'gespalten', 'geteilt', 'schraeg', 'geviert', 'balken']);
    const charge = pickR(r, Object.keys(CHARGES));
    let field = '';
    if (div === 'ganz') field = `<rect width="100" height="110" fill="${main}"/>`;
    if (div === 'gespalten') field = `<rect width="100" height="110" fill="${main}"/><rect x="50" width="50" height="110" fill="${metal}"/>`;
    if (div === 'geteilt') field = `<rect width="100" height="110" fill="${metal}"/><rect y="55" width="100" height="55" fill="${main}"/>`;
    if (div === 'schraeg') field = `<rect width="100" height="110" fill="${main}"/><path d="M0 0 L100 110 H100 V0 Z" fill="${metal}"/>`;
    if (div === 'geviert') field = `<rect width="100" height="110" fill="${main}"/><rect x="50" width="50" height="55" fill="${metal}"/><rect y="55" width="50" height="55" fill="${metal}"/>`;
    if (div === 'balken') field = `<rect width="100" height="110" fill="${main}"/><rect y="44" width="100" height="22" fill="${metal}"/>`;
    // Wappenfigur: auf einfarbigem Feld in Metall, sonst mit dunklem Rand für Kontrast
    const solid = div === 'ganz';
    const fig = CHARGES[charge](solid ? metal : '#2a1e14');
    const halo = solid ? '' : CHARGES[charge]('#f4ead3').replace('<g ', '<g opacity=".55" transform="translate(1.5,1.5)" ');
    return `<svg viewBox="0 0 100 110" width="${size || 40}" height="${Math.round((size || 40) * 1.1)}" role="img" aria-label="Wappen von ${name}">
      <defs><clipPath id="${id}"><path d="${SHIELD}"/></clipPath>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>
      <g clip-path="url(#${id})">${field}${solid ? '' : halo}${fig}<rect width="100" height="110" fill="url(#${id}g)"/></g>
      <path d="${SHIELD}" fill="none" stroke="#2a1e14" stroke-width="4"/><path d="${SHIELD}" fill="none" stroke="#e2b23c" stroke-width="1.5" transform="translate(50,55) scale(.9) translate(-50,-55)"/>
    </svg>`;
  }

  // ---------- Schiffe ----------
  // Seitenansicht, nach rechts fahrend; Rumpf Holz, Segel Leinen mit Streifen in Spielerfarbe
  function ship(type, color, size) {
    const s = size || 40;
    const hull = '#5a3a1e', dark = '#2e1d0e', sail = '#f3e8cc', line = '#3b2412';
    let g = '';
    if (type === 'schnigge') {            // klein, flach, ein Mast, langer Rumpf
      g = `<path d="M50 14 V70" stroke="${dark}" stroke-width="3"/>
        <path d="M52 18 Q76 40 52 66 Z" fill="${sail}" stroke="${line}" stroke-width="1.5"/>
        <path d="M52 36 Q63 42 52 50" fill="none" stroke="${color}" stroke-width="6"/>
        <path d="M49 13 L49 6 L62 9 Z" fill="${color}"/>
        <path d="M8 70 H92 Q88 82 76 84 H22 Q12 82 8 70 Z" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <path d="M14 75 H86" stroke="${dark}" stroke-opacity=".5" stroke-width="2"/>`;
    } else if (type === 'holk') {         // groß, rund, zwei Masten, hohe Kastelle
      g = `<path d="M40 6 V66 M70 22 V66" stroke="${dark}" stroke-width="3.2"/>
        <path d="M42 10 Q68 32 42 60 Z" fill="${sail}" stroke="${line}" stroke-width="1.5"/>
        <path d="M42 26 Q56 34 42 44" fill="none" stroke="${color}" stroke-width="7"/>
        <path d="M72 26 Q88 40 72 58 Z" fill="${sail}" stroke="${line}" stroke-width="1.5"/>
        <path d="M39 5 L39 -2 L54 2 Z" fill="${color}"/>
        <path d="M4 60 H96 L90 82 Q50 94 10 82 Z" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <rect x="4" y="50" width="22" height="12" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <rect x="76" y="48" width="22" height="14" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <path d="M10 68 H92 M14 76 H88" stroke="${dark}" stroke-opacity=".5" stroke-width="2"/>
        <circle cx="30" cy="72" r="2" fill="${dark}"/><circle cx="50" cy="73" r="2" fill="${dark}"/><circle cx="70" cy="72" r="2" fill="${dark}"/>`;
    } else {                              // Kogge: ein Mast, gerades Rahsegel, Achterkastell
      g = `<path d="M50 8 V68" stroke="${dark}" stroke-width="3.2"/>
        <path d="M52 12 Q82 38 52 64 Z" fill="${sail}" stroke="${line}" stroke-width="1.5"/>
        <path d="M52 30 Q66 38 52 46" fill="none" stroke="${color}" stroke-width="7"/>
        <path d="M49 7 L49 0 L63 4 Z" fill="${color}"/>
        <path d="M6 66 H94 L84 84 H16 Z" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <rect x="74" y="54" width="22" height="14" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <rect x="6" y="58" width="16" height="10" fill="${hull}" stroke="${dark}" stroke-width="2"/>
        <path d="M12 74 H88" stroke="${dark}" stroke-opacity=".5" stroke-width="2"/>`;
    }
    return `<svg viewBox="0 -4 100 94" width="${s}" height="${Math.round(s * 0.94)}" aria-hidden="true">${g}</svg>`;
  }

  // ---------- Stadtsilhouetten ----------
  // Häuserzeile mit Treppengiebeln, Kirchtürmen, Speichern und Hafenkran; jede Stadt anders
  const LANDMARK = {          // ein paar Wiedererkennungsmerkmale je Stadt
    luebeck: ['doppelturm', 'tor'], hamburg: ['turm', 'kran'], bremen: ['doppelturm', 'kran'], bruegge: ['belfried', 'kran'],
    bergen: ['speicher', 'berg'], stockholm: ['turm', 'berg'], visby: ['mauer', 'turm'], danzig: ['kran', 'turm'],
    riga: ['turm', 'turm'], reval: ['mauer', 'turm'],
  };
  function skyline(cityId, w, h, opts) {
    w = w || 600; h = h || 120;
    const H = 140, W = Math.round(w * H / h);       // feste Proportionen, unabhängig von der Anzeigehöhe
    const r = seeded('stadt:' + cityId);
    const ink = (opts && opts.ink) || '#2a1e14';
    const base = 120;
    let back = '', front = '', marksSvg = '';
    const marks = LANDMARK[cityId] || ['turm'];
    if (marks.includes('berg')) back += `<path d="M0 ${base - 20} Q${W * 0.2} ${base - 95} ${W * 0.45} ${base - 45} T${W} ${base - 60} V${H} H0 Z" fill="${ink}" opacity=".16"/>`;
    // eine Häuserreihe: Treppengiebel oder Satteldach, mit Lücken
    function row(minH, maxH, gapP, light) {
      let x = -10, out = '';
      while (x < W) {
        const hw = 16 + Math.floor(r() * 18), hh = minH + Math.floor(r() * (maxH - minH));
        const top = base - hh, mx = x + hw / 2;
        if (r() < 0.55) {
          const n = 3, sw = hw / (2 * n), sh = 5;
          let d = `M${x} ${base} V${top}`;
          for (let k = 0; k < n; k++) d += ` H${x + sw * (k + 1)} V${top - sh * (k + 1)}`;
          for (let k = n - 1; k >= 0; k--) d += ` H${x + hw - sw * k} V${top - sh * k}`;
          out += `<path d="${d} V${base} Z"/>`;
        } else out += `<path d="M${x} ${base} V${top} L${mx} ${top - hw * 0.5} L${x + hw} ${top} V${base} Z"/>`;
        if (light) for (let k = 0; k < 2; k++) if (r() < 0.45) out += `<rect x="${(x + 4 + r() * (hw - 9)).toFixed(1)}" y="${(top + 5 + r() * (hh - 14)).toFixed(1)}" width="3.5" height="5" fill="#f0c766" opacity=".85"/>`;
        x += hw + (r() < gapP ? 6 + Math.floor(r() * 18) : 1);
      }
      return out;
    }
    back += `<g fill="${ink}" opacity=".38">${row(26, 46, 0.25, false)}</g>`;
    // Wahrzeichen
    const spots = [0.27, 0.68];
    marks.forEach((m, i) => {
      const cx = Math.round(W * spots[i % 2] + (r() - 0.5) * 30);
      if (m === 'turm') marksSvg += `<path d="M${cx - 10} ${base} V${base - 62} H${cx + 10} V${base} Z M${cx - 11} ${base - 62} L${cx} ${base - 104} L${cx + 11} ${base - 62} Z"/><rect x="${cx - 2.5}" y="${base - 52}" width="5" height="9" fill="#f0c766" opacity=".85"/>`;
      if (m === 'doppelturm') [-14, 14].forEach(d => { marksSvg += `<path d="M${cx + d - 8} ${base} V${base - 60} H${cx + d + 8} V${base} Z M${cx + d - 9} ${base - 60} L${cx + d} ${base - 98} L${cx + d + 9} ${base - 60} Z"/>`; });
      if (m === 'belfried') marksSvg += `<path d="M${cx - 12} ${base} V${base - 70} H${cx - 8} V${base - 80} H${cx + 8} V${base - 70} H${cx + 12} V${base} Z M${cx - 6} ${base - 80} V${base - 96} H${cx + 6} V${base - 80} Z"/>`;
      if (m === 'tor') marksSvg += `<path d="M${cx - 26} ${base} V${base - 40} L${cx - 19} ${base - 58} L${cx - 12} ${base - 40} V${base - 44} H${cx + 12} V${base - 40} L${cx + 19} ${base - 58} L${cx + 26} ${base - 40} V${base} H${cx + 7} V${base - 14} A7 7 0 0 0 ${cx - 7} ${base - 14} V${base} Z"/>`;
      if (m === 'kran') marksSvg += `<path d="M${cx - 13} ${base} V${base - 44} H${cx + 13} V${base} Z M${cx - 9} ${base - 44} L${cx} ${base - 56} L${cx + 9} ${base - 44} Z"/><path d="M${cx} ${base - 52} L${cx + 42} ${base - 62} M${cx + 40} ${base - 62} V${base - 30}" stroke="${ink}" stroke-width="2.5" fill="none"/>`;
      if (m === 'speicher') for (let k = 0; k < 4; k++) { const sx = cx - 46 + k * 23; marksSvg += `<path d="M${sx} ${base} V${base - 34} L${sx + 10} ${base - 50} L${sx + 20} ${base - 34} V${base} Z"/><rect x="${sx + 8}" y="${base - 28}" width="4" height="7" fill="#f0c766" opacity=".8"/>`; }
      if (m === 'mauer') back += `<path fill="${ink}" opacity=".55" d="M0 ${base} V${base - 20} ${Array.from({ length: Math.ceil(W / 14) }, (_, k) => `H${k * 14 + 7} V${base - 25} H${k * 14 + 14} V${base - 20}`).join(' ')} V${base} Z"/>`;
    });
    front += `<g fill="${ink}">${marksSvg}${row(12, 28, 0.35, true)}</g>`;
    // Wasser mit Spiegelung
    const water = `<rect y="${base}" width="${W}" height="${H - base}" fill="#2f5a6c" opacity=".55"/>
      <path d="M0 ${base + 7} Q${W / 8} ${base + 3} ${W / 4} ${base + 7} T${W / 2} ${base + 7} T${W * 0.75} ${base + 7} T${W} ${base + 7}" stroke="#f4ead3" stroke-opacity=".45" fill="none" stroke-width="1.5"/>
      <path d="M0 ${base + 14} Q${W / 6} ${base + 11} ${W / 3} ${base + 14} T${W * 0.66} ${base + 14} T${W} ${base + 14}" stroke="#f4ead3" stroke-opacity=".25" fill="none" stroke-width="1.2"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" width="100%" height="${h}" aria-hidden="true">${back}${front}${water}</svg>`;
  }

  root.ART = { arms, ship, skyline };
})(typeof window !== 'undefined' ? window : globalThis);
