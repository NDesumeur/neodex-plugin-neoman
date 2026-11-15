// Neo-Man : NeoMe parcourt un labyrinthe, mange toutes les notes de musique et évite quatre petits fantômes.
// Jeu NeoDex en pixel art : NeoMe et les bonus viennent de NeoBestiary Studio, les fantômes sont dessinés à la main plus bas. Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Neo-Man</span><span class="hint">Flèches ou ZQSD : tourner · ou glisser le doigt · P : pause</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="nmCanvas" width="760" height="888" role="img" aria-label="Neo-Man"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="nmStats"></div></div>
      <div class="row"><button class="btn main" id="nmNew">NOUVELLE PARTIE</button><button class="btn" id="nmFs">PLEIN ÉCRAN</button></div>
      <div class="hint">NeoMe danse dans le labyrinthe : mange toutes les notes pour passer au niveau suivant. Quatre petits fantômes la poursuivent, chacun à sa façon : Prune la traque, Menthe lui coupe la route, Miel la prend à revers et Groseille rôde. Les disques font fuir les fantômes quelques secondes : c'est le moment de les attraper. Des objets du Studio apparaissent sous la crypte, et une vie de plus t'attend à 10 000 points. Tous les 3 niveaux, un nouveau labyrinthe : Disco, Cristal, Jardin puis Braise.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:1 1 360px;min-width:min(100%,320px);position:relative}
.gameBox canvas{width:min(100%,max(280px,calc((100vh - 170px) * 760 / 888)));height:auto;aspect-ratio:760/888;image-rendering:pixelated;touch-action:none}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 760 / 888))}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}


export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "NEO-MAN", T: {"k": "#0c0a12", "k2": "#16121e", "fill": "#221c2c", "fillOn": "#2e263a", "hl": "#3a3046", "line": "#62566e", "acc": "#ff5ab4", "accL": "#ffd8f0", "accS": "#c03a8a", "accD": "#2a0a1e", "rivet": "#f0f0f8", "btn": "#3a3046", "btnHi": "#62566e", "btnLo": "#16121e", "btnHov": "#443852", "btnHovHi": "#82768e", "text": "#f4f0f8", "muted": "#c0b8cc", "acc2": "#7ee07a", "gold": "#ffd84a", "orange": "#ff8a3a", "red": "#ff4a3a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#100c16", "bgDot": "#221c2c", "bgDot2": "#16121e", "spark": "#2a0a1e", "spark2": "#ff5ab4", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["..kkkkkkkk..", ".kbkkkkkkbk.", "kbkkkkkkkkbk", "kbkwwkkwwkbk", "kbkwwkkwwkbk", "kkkkkkkkkkkk", "kakakkkkakak", "kaaakkkkaaak", "kaaaaaaaaaak", ".kaasaasaak.", "..kaaaaaak..", "...kkkkkk..."],
  icons: [[/^NOUVELLE/, 'play'], [/^RECORDS/, 'crown']] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (v > (b ?? 0)) {  // un score nul n'est jamais un record
    games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };


/* ---------- Neo-Man : un labyrinthe de notes de musique, NeoMe au milieu, quatre petits fantômes à ses trousses.
   Le labyrinthe : # mur, . note, o disque (fait fuir les fantômes), = passage sans note, - porte de la crypte, g crypte, P départ ---------- */
// les planches de NeoMe et des bonus, tirées de NeoBestiary Studio (64 x 64 : 4 directions x 5 images de marche ; les bonus : 4 objets)
const NM_SRC = {"neome": "data:image/png;base64,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", "bonus": "data:image/png;base64,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"};
const NM_MAP0 = [
  '###################',
  '#o.......#.......o#',
  '#.##.###.#.###.##.#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.###.#.###.####',
  '   #.#.......#.#   ',
  '####.#.##-##.#.####',
  '=....=.#ggg#.=....=',
  '####.#.#####.#.####',
  '   #.#.......#.#   ',
  '####.#.#####.#.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
];
// un nouveau labyrinthe tous les 3 niveaux (la crypte, le départ et le bonus restent à la même place) ; chacun a ses couleurs de murs
const NM_MAPS = [
  {name: 'Disco', wall: ['#b05cff', '#5a2a9a', '#1a0f2e'], map: NM_MAP0},
  {name: 'Cristal', wall: ['#5ad8ff', '#1a6a9a', '#0a1a2e'], map: [
    '###################',
    '#o..#.........#..o#',
    '#.#.#.###.###.#.#.#',
    '#.#.............#.#',
    '#.#.##.#.#.#.##.#.#',
    '#......#...#......#',
    '####.#.#####.#.####',
    '=..#.#.......#.#..=',
    '##.#.#.##-##.#.#.##',
    '##.#.#.#ggg#.#.#.##',
    '##.#.#.#####.#.#.##',
    '#....#.......#....#',
    '#.##.#.#####.#.##.#',
    '#.................#',
    '#.##.###.#.###.##.#',
    '#o.#.....P.....#.o#',
    '##.#.#.#####.#.#.##',
    '#....#.......#....#',
    '#.####.##.##.####.#',
    '#.................#',
    '###################',
  ]},
  {name: 'Jardin', wall: ['#6ee07a', '#2a7a3a', '#0c1e10'], map: [
    '###################',
    '#o...............o#',
    '#.###.###.###.###.#',
    '#.#.....#.#.....#.#',
    '#.#.###.#.#.###.#.#',
    '#...#.........#...#',
    '###.#.#######.#.###',
    '  #.#.........#.#  ',
    '###.##.##-##.##.###',
    '=...##.#ggg#.##...=',
    '###.##.#####.##.###',
    '  #.#.........#.#  ',
    '###.#.#.###.#.#.###',
    '#.....#.....#.....#',
    '#.###.#.#.#.#.###.#',
    '#o#.....#P#.....#o#',
    '#.#.###.#.#.###.#.#',
    '#...#.........#...#',
    '#.#.#.###.###.#.#.#',
    '#.................#',
    '###################',
  ]},
  {name: 'Braise', wall: ['#ff8a3a', '#9a3a1a', '#2a0e06'], map: [
    '###################',
    '#o...#.......#...o#',
    '#.##.#.##.##.#.##.#',
    '#.................#',
    '##.#.####.####.#.##',
    '#..#...........#..#',
    '#.##.##.###.##.##.#',
    '#....#.......#....#',
    '###.##.##-##.##.###',
    '=...##.#ggg#.##...=',
    '###.##.#####.##.###',
    '#...#.........#...#',
    '#.#.#.##.#.##.#.#.#',
    '#.#.............#.#',
    '#.###.#.###.#.###.#',
    '#o....#..P..#....o#',
    '###.#.#.###.#.#.###',
    '#...#.........#...#',
    '#.#####.#.#.#####.#',
    '#.................#',
    '###################',
  ]},
];
const nmMazeOf = level => NM_MAPS[Math.floor((level - 1) / 3) % NM_MAPS.length];
let NM_MAP = NM_MAP0, nmMaze = NM_MAPS[0];
const NM = {T: 40, C: 19, R: 21, TOP: 48, DOOR: [9, 7], HOME: [9, 9], START: [9, 15], BONUS: [9, 11]};
NM.W = NM.C * NM.T; NM.H = NM.R * NM.T + NM.TOP;
const NM_DIRS = {L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1]}, NM_BACK = {L: 'R', R: 'L', U: 'D', D: 'U'};
const NM_ROW = {D: 0, L: 1, R: 2, U: 3}, NM_CYCLE = [0, 1, 2, 1, 0, 3, 4, 3];  // planche : lignes bas/gauche/droite/haut, colonnes repos, mi1, pas1, mi2, pas2
const NM_GHOSTS = [
  {name: 'Prune', col: ['#b05cff', '#e0b0ff', '#6a2aa8'], corner: [17, -2], home: [9, 7], wait: 0},
  {name: 'Menthe', col: ['#3ad0a0', '#a8ffe0', '#1a7a5a'], corner: [1, -2], home: [9, 9], wait: 2},
  {name: 'Miel', col: ['#ffb02a', '#ffe8a0', '#b06a10'], corner: [18, 22], home: [8, 9], wait: 6},
  {name: 'Groseille', col: ['#ff4a6a', '#ffb0c0', '#a01a3a'], corner: [0, 22], home: [10, 9], wait: 10},
];
const NM_BONUS = [['Épée de la Connaissance', 100], ['Horloge Brisée', 300], ['Montre du temps perdu', 500], ['Pierre de foudre', 1000]];
const NM_NOTES = [523, 587, 659, 784, 880, 784, 659, 587];  // les notes mangées jouent une petite mélodie
const nmImg = {}; for (const k of ['neome', 'bonus']) { const i = new Image(); i.src = NM_SRC[k]; nmImg[k] = i; }
const nmCell = (c, r) => r < 0 || r >= NM.R ? '#' : NM_MAP[r][(c % NM.C + NM.C) % NM.C];
const nmOpen = (c, r, ghost) => { const ch = nmCell(c, r); return ch !== '#' && ch !== ' ' && (ch !== '-' || ghost) && (ch !== 'g' || ghost); };
// la distance de chaque case à la sortie de la crypte : un fantôme attrapé rentre par le plus court chemin
const nmDoorMap = () => {
  const d = new Map(), q = [NM.DOOR]; d.set(NM.DOOR.join(), 0);
  while (q.length) { const [c, r] = q.shift(); for (const [dx, dy] of Object.values(NM_DIRS)) { const nc = (c + dx + NM.C) % NM.C, nr = r + dy; if (nmOpen(nc, nr, false) && !d.has(nc + ',' + nr)) { d.set(nc + ',' + nr, d.get(c + ',' + r) + 1); q.push([nc, nr]); } } }
  return d;
};
let nmToDoor = nmDoorMap();
function nmUseMaze(m) { if (nmMaze === m) return; nmMaze = m; NM_MAP = m.map; nmToDoor = nmDoorMap(); nmWalls = null; }
// une nouvelle partie garde le même objet : la boucle du jeu (gameLoop) continue de tourner dessus
const renew = (old, o) => { if (!old) return o; for (const k of Object.keys(old)) if (k !== 'raf') delete old[k]; return Object.assign(old, o); };
let nm = null, nmMute = false, nmac = null;
const nms = gstore('neoman', {games: 0, levels: 0, ghosts: 0});
function nmBeep(f, d, type = 'square', slide = 0, vol = .025) { if (nmMute) return; try { nmac ??= new AudioContext(); const o = nmac.createOscillator(), g = nmac.createGain(), t = nmac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(nmac.destination); o.start(t); o.stop(t + d); } catch {} }

function nmNew() {
  nm = renew(nm, {mode: 'ready', tick: 0, score: 0, lives: 3, level: 1, extra: false, rnd: Math.random, keys: new Set(), g: nm?.g});
  nmLevel();
}
function nmLevel() {
  nmUseMaze(nmMazeOf(nm.level));
  nm.dots = new Set(); nm.power = new Set();
  NM_MAP.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '.') nm.dots.add(c + ',' + r); if (ch === 'o') nm.power.add(c + ',' + r); }));
  nm.total = nm.dots.size + nm.power.size; nm.eaten = 0; nm.bonus = null; nm.bonusN = 0;
  nmPlace();
}
function nmPlace() {  // début de niveau ou après une vie perdue : chacun à sa place
  nm.p = {x: NM.START[0], y: NM.START[1], dir: 'L', want: 'L', step: 0, moving: false};
  nm.ghosts = NM_GHOSTS.map((d, i) => ({i, x: d.home[0], y: d.home[1], dir: i ? 'U' : 'L', state: i ? 'house' : 'roam', release: d.wait * 60, step: 0}));
  nm.fright = 0; nm.combo = 0; nm.t = 0; nm.dying = 0; nm.ready = 120; nm.pop = null;
}
const nmSpeed = () => Math.min(.155, .11 + nm.level * .006);   // en cases par image
const nmFrightTime = () => Math.max(120, 420 - nm.level * 40);
const nmChase = () => { const s = nm.t % (27 * 60); return nm.t > 4 * 27 * 60 || s >= 7 * 60; };  // 7 s de dispersion, 20 s de chasse, puis chasse sans fin
const nmAt = e => Math.abs(e.x - Math.round(e.x)) < 1e-6 && Math.abs(e.y - Math.round(e.y)) < 1e-6;
// avance d'une distance, en s'arrêtant à chaque centre de case pour choisir la suite (choose renvoie la direction, ou null pour s'arrêter)
function nmMove(e, dist, choose) {
  let left = dist, guard = 8;
  while (left > 1e-9 && guard--) {
    if (nmAt(e)) { e.x = Math.round(e.x); e.y = Math.round(e.y); const d = choose(e); if (!d) return false; e.dir = d; }
    const [dx, dy] = NM_DIRS[e.dir], v = dx ? e.x : e.y, s = dx || dy;
    const to = s > 0 ? Math.floor(v + 1e-6) + 1 : Math.ceil(v - 1e-6) - 1, d = Math.min(left, Math.abs(to - v));
    if (dx) e.x += s * d; else e.y += s * d; left -= d;
    if (Math.abs((dx ? e.x : e.y) - to) < 1e-6) { if (dx) e.x = to; else e.y = to; }
    if (e.x < -.5) e.x += NM.C; else if (e.x > NM.C - .5) e.x -= NM.C;  // le passage d'un bord à l'autre
  }
  return true;
}
function nmTarget(g) {
  const d = NM_GHOSTS[g.i], p = nm.p, [px, py] = [Math.round(p.x), Math.round(p.y)], [fx, fy] = NM_DIRS[p.dir];
  if (!nmChase()) return d.corner;
  if (g.i === 0) return [px, py];                                    // Prune : droit sur NeoMe
  if (g.i === 1) return [px + 4 * fx, py + 4 * fy];                  // Menthe : quatre cases devant elle
  if (g.i === 2) { const a = nm.ghosts[0], mx = px + 2 * fx, my = py + 2 * fy; return [2 * mx - Math.round(a.x), 2 * my - Math.round(a.y)]; }  // Miel : de l'autre côté de Prune
  return Math.hypot(g.x - px, g.y - py) > 8 ? [px, py] : d.corner;  // Groseille : approche, puis s'éloigne
}
function nmGhostChoose(g) {
  const c = Math.round(g.x), r = Math.round(g.y), inHouse = 'g-'.includes(nmCell(c, r));
  const opts = Object.keys(NM_DIRS).filter(k => { const [dx, dy] = NM_DIRS[k]; return nmOpen(c + dx, r + dy, g.state === 'leave' || g.state === 'eaten'); });
  if (g.state === 'eaten') {
    if (c === NM.DOOR[0] && r >= NM.DOOR[1]) { if (r === NM.HOME[1]) { g.state = 'leave'; return 'U'; } return 'D'; }
    return opts.sort((a, b) => (nmToDoor.get((c + NM_DIRS[a][0] + NM.C) % NM.C + ',' + (r + NM_DIRS[a][1])) ?? 99) - (nmToDoor.get((c + NM_DIRS[b][0] + NM.C) % NM.C + ',' + (r + NM_DIRS[b][1])) ?? 99))[0];
  }
  if (g.state === 'leave') {
    if (c === NM.DOOR[0] && r === NM.DOOR[1]) { g.state = 'roam'; return 'L'; }
    if (c !== NM.DOOR[0]) return c < NM.DOOR[0] ? 'R' : 'L';
    return 'U';
  }
  let ok = opts.filter(k => k !== NM_BACK[g.dir] && !(inHouse || nmCell(c + NM_DIRS[k][0], r + NM_DIRS[k][1]) === '-'));
  if (!ok.length) ok = opts;
  if (g.fear) return ok[Math.floor(nm.rnd() * ok.length)];
  const [tx, ty] = nmTarget(g);
  return ok.sort((a, b) => Math.hypot(c + NM_DIRS[a][0] - tx, r + NM_DIRS[a][1] - ty) - Math.hypot(c + NM_DIRS[b][0] - tx, r + NM_DIRS[b][1] - ty))[0];
}
function nmUpdate() {
  if (nm.mode !== 'play') return;
  if (nm.ready > 0) { nm.ready--; return; }
  if (nm.dying) { if (--nm.dying === 0) { if (nm.lives <= 0) nmEnd(); else nmPlace(); } return; }
  if (nm.clear) { if (--nm.clear === 0) { nm.level++; nms.levels++; nmLevel(); } return; }
  nm.t++;
  if (nm.pop && --nm.pop.t <= 0) nm.pop = null;
  // NeoMe : tourne dès que la case le permet, peut faire demi-tour à tout moment
  const p = nm.p, want = [...nm.keys].pop() || p.want;
  p.want = want;
  if (want === NM_BACK[p.dir]) p.dir = want;
  p.moving = nmMove(p, nmSpeed(), e => {
    const c = Math.round(e.x), r = Math.round(e.y), k = c + ',' + r;
    if (nm.dots.delete(k)) { nm.score += 10; nm.eaten++; nmBeep(NM_NOTES[nm.eaten % 8], .07, 'triangle', 0, .02); }
    if (nm.power.delete(k)) { nm.score += 50; nm.eaten++; nm.fright = nmFrightTime(); nm.combo = 0; for (const g of nm.ghosts) if (g.state === 'roam') { g.fear = true; g.dir = NM_BACK[g.dir]; } nmBeep(220, .3, 'square', 880); }
    if ((nm.eaten === 70 || nm.eaten === 170) && !nm.bonus) { nm.bonus = {k: (nm.level - 1) % 4, t: 9 * 60}; }
    if (!nm.dots.size && !nm.power.size) { nm.clear = 120; [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => nmBeep(f, .15, 'triangle'), i * 120)); return null; }
    for (const d of [want, e.dir]) { const [dx, dy] = NM_DIRS[d]; if (nmOpen(c + dx, r + dy, false)) return d; }
    return null;
  });
  if (nm.p.moving) p.step++;
  if (!nm.extra && nm.score >= 10000) { nm.extra = true; nm.lives++; nmBeep(1320, .4, 'triangle', 1760); }
  if (nm.bonus && --nm.bonus.t <= 0) nm.bonus = null;
  if (nm.bonus && Math.hypot(p.x - NM.BONUS[0], p.y - NM.BONUS[1]) < .6) { const [name, pts] = NM_BONUS[nm.bonus.k]; nm.score += pts; nm.pop = {text: pts + ' · ' + name, x: NM.BONUS[0], y: NM.BONUS[1], t: 90}; nm.bonus = null; nmBeep(990, .25, 'triangle', 1980); }
  // les fantômes
  if (nm.fright > 0 && --nm.fright === 0) for (const g of nm.ghosts) g.fear = false;
  for (const g of nm.ghosts) {
    if (g.state === 'house') { if (nm.t >= g.release) g.state = 'leave'; else continue; }
    const tunnel = nmCell(Math.round(g.x), Math.round(g.y)) === '=';
    const sp = g.state === 'eaten' ? .3 : g.fear ? nmSpeed() * .55 : tunnel ? nmSpeed() * .6 : nmSpeed() * (.88 + .02 * Math.min(nm.level, 5));
    nmMove(g, sp, nmGhostChoose); g.step++;
    if (g.state === 'roam' && Math.hypot(g.x - p.x, g.y - p.y) < .6) {
      if (g.fear) {
        g.fear = false; g.state = 'eaten'; const pts = 200 << nm.combo++; nm.score += pts; nms.ghosts++;
        nm.pop = {text: String(pts), x: g.x, y: g.y, t: 60}; nmBeep(1200, .25, 'sawtooth', 300);
      } else { nm.lives--; nm.dying = 100; nmBeep(600, .9, 'sawtooth', 60, .03); return; }
    }
  }
}
function nmEnd() {
  nm.mode = 'over'; nm.dead = 0; nms.games++;
  nm.record = best('neoman', nm.score); best('neoman-level', nm.level); saveGames(); nmInfo();
}

/* ---------- le dessin : murs violets à double trait, notes de musique, disques qui tournent, et les sprites du Studio ---------- */
var nmWalls = null;  // var : nmUseMaze, plus haut, la remet à zéro
function nmDrawWalls() {
  const c = document.createElement('canvas'); c.width = NM.W; c.height = NM.R * NM.T; const g = c.getContext('2d'), T = NM.T, wall = (x, y) => nmCell(x, y) === '#';
  NM_MAP.forEach((row, r) => [...row].forEach((ch, x) => {
    if (ch === '-') { px(g, '#ff9ad8', x * T, r * T + T / 2 - 3, T, 6); return; }
    if (ch !== '#') return;
    const [lite, mid, dark] = nmMaze.wall;
    px(g, dark, x * T, r * T, T, T);
    // un trait clair sur chaque bord qui donne sur un couloir, un trait sombre juste dedans
    const edges = [[0, -1, 0, 0, T, 4], [0, 1, 0, T - 4, T, 4], [-1, 0, 0, 0, 4, T], [1, 0, T - 4, 0, 4, T]];
    for (const [dx, dy, ox, oy, w, h] of edges) if (!wall(x + dx, r + dy) && !(r + dy < 0 || r + dy >= NM.R)) {
      px(g, lite, x * T + ox, r * T + oy, w, h);
      px(g, mid, x * T + ox + (dx < 0 ? 4 : dx > 0 ? -4 : 0), r * T + oy + (dy < 0 ? 4 : dy > 0 ? -4 : 0), w, h);
    }
  }));
  return c;
}
// les petits fantômes, dessinés à la main (20 x 20, agrandis 2 fois) : k contour, l lumière, b corps, d ombre, w reflet ; 2 images pour le bas qui ondule
const NM_GHOST_HEAD = [".......kkkkkk.......", ".....kkllbbbbkk.....", "....kllwwlbbbbbk....", "...klwwllbbbbbbbk...", "..kllwllbbbbbbbbdk..", "..kllbbbbbbbbbbbdk..", ".kllbbbbbbbbbbbbbdk.", ".klbbbbbbbbbbbbbbdk.", ".klbbbbbbbbbbbbbbdk.", ".klbbbbbbbbbbbbbbdk.", ".klbbbbbbbbbbbbbbdk.", ".klbbbbbbbbbbbbbbdk.", ".klbbbbkbbbbkbbbbdk.", ".kbbbbbbkkkkbbbbbdk.", ".kbbbbbbbbbbbbbbddk.", ".kbbbbbbbbbbbbbbddk.", ".kbbbbbbbbbbbbbbddk."];
const NM_GHOST_FEET = [[".kbbbkbbbbkbbbbkddk.", ".kbbk.kbbk.kbbk.kdk.", "..kk...kk...kk...k.."], [".kbkbbbbkbbbbkbbddk.", ".kk.kbbk.kbbk.kbddk.", ".....kk...kk...kkk.."]];
const NM_GHOST_F = NM_GHOST_FEET.map(f => NM_GHOST_HEAD.concat(f));
const NM_FEAR_COL = ['#2a3aa8', '#5a7ae8', '#141e60'], NM_FLASH_COL = ['#d8d8f0', '#ffffff', '#9090b8'];
const NM_PUPIL = {L: [0, 7], R: [2, 7], U: [1, 5], D: [1, 8]};
const nmGhostCache = new Map();
function nmGhost(col, dir, f, kind) {  // kind : n normal, f effrayé, e les yeux seuls (attrapé, il rentre à la crypte)
  const key = col + dir + f + kind; if (nmGhostCache.has(key)) return nmGhostCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 40; const g = c.getContext('2d'), dot = (color, x, y) => px(g, color, x * 2, y * 2, 2, 2);
  const [b, l, d] = col.split(','), pal = {k: '#120a1e', b, l, d, w: '#ffffff'};
  if (kind !== 'e') NM_GHOST_F[f].forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) dot(pal[ch], x, y); }));
  if (kind === 'f') { for (const ex of [6, 12]) for (const [x, y] of [[0, 8], [1, 8], [0, 9], [1, 9]]) dot('#ffd8f0', ex + x, y); }
  else for (const ex of [4, 11]) {
    for (let y = 5; y <= 9; y++) for (let x = 0; x < 4; x++) if (!((y === 5 || y === 9) && (x === 0 || x === 3))) dot('#ffffff', ex + x, y);
    const [ox, oy] = NM_PUPIL[dir] || NM_PUPIL.L; for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) dot('#1a103c', ex + ox + x, oy + y);
  }
  nmGhostCache.set(key, c); return c;
}
function nmSprite(g, src, e, moving) {
  if (!src || (src.naturalWidth === 0)) return;
  const col = moving ? NM_CYCLE[Math.floor(e.step / 5) % 8] : 0, row = NM_ROW[e.dir] ?? 0;
  const S = 48, x = Math.round(e.x * NM.T + NM.T / 2 - S / 2), y = Math.round(NM.TOP + e.y * NM.T + NM.T / 2 - S * .62);  // NeoMe un peu plus petite que sa planche de 64
  g.drawImage(src, col * 64, row * 64, 64, 64, x, y, S, S);
  if (x < 0) g.drawImage(src, col * 64, row * 64, 64, 64, x + NM.W, y, S, S);  // à cheval sur le passage
  if (x + S > NM.W) g.drawImage(src, col * 64, row * 64, 64, 64, x - NM.W, y, S, S);
}
function nmDraw() {
  const g = nm.g, T = NM.T, W = NM.W; if (!g) return;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07030f'; g.fillRect(0, 0, W, NM.H);
  nmWalls ??= nmDrawWalls(); g.drawImage(nmWalls, 0, NM.TOP);
  // les notes et les disques
  for (const k of nm.dots) { const [c, r] = k.split(',').map(Number), x = c * T + T / 2, y = NM.TOP + r * T + T / 2;
    px(g, '#ffd8f0', x - 3, y + 1, 5, 4); px(g, '#ffd8f0', x + 1, y - 7, 2, 9); px(g, '#ffd8f0', x + 3, y - 7, 3, 2); }
  for (const k of nm.power) { const [c, r] = k.split(',').map(Number), x = c * T + T / 2, y = NM.TOP + r * T + T / 2, on = Math.floor(nm.tick / 12) % 2;
    for (let dy = -12; dy <= 12; dy++) { const w = Math.round(Math.sqrt(156 - dy * dy)), lw = Math.round(Math.sqrt(Math.max(0, 25 - dy * dy)));  // un disque vinyle : bord rose, sillons, étiquette
      px(g, on ? '#ff5ab4' : '#c03a8a', x - w, y + dy, 2 * w, 1); if (Math.abs(dy) < 11) { const w2 = Math.round(Math.sqrt(121 - dy * dy)); px(g, '#1a0f2e', x - w2, y + dy, 2 * w2, 1); }
      if (Math.abs(dy) % 3 === 1 && Math.abs(dy) < 9) px(g, '#3a2a5e', x - Math.round(Math.sqrt(81 - dy * dy)), y + dy, 2 * Math.round(Math.sqrt(81 - dy * dy)), 1);
      if (lw) px(g, on ? '#ffd84a' : '#ff8a3a', x - lw, y + dy, 2 * lw, 1); }
    px(g, '#07030f', x - 1, y - 1, 2, 2); }
  if (nm.bonus && nmImg.bonus.naturalWidth) g.drawImage(nmImg.bonus, nm.bonus.k * 64, 0, 64, 64, NM.BONUS[0] * T + T / 2 - 32, NM.TOP + NM.BONUS[1] * T + T / 2 - 40, 64, 64);
  // les fantômes, puis NeoMe (devant)
  for (const gh of nm.ghosts) {
    if (nm.dying && nm.dying <= 80) continue;
    const col = gh.fear ? (nm.fright < 120 && Math.floor(nm.fright / 10) % 2 ? NM_FLASH_COL : NM_FEAR_COL) : NM_GHOSTS[gh.i].col;
    const im = nmGhost(col.join(), gh.dir, Math.floor(nm.tick / 10) % 2, gh.state === 'eaten' ? 'e' : gh.fear ? 'f' : 'n');
    const x = Math.round(gh.x * T + T / 2 - 20), y = Math.round(NM.TOP + gh.y * T + T / 2 - 22) + (gh.state === 'house' && Math.floor(nm.tick / 20) % 2 ? -2 : 0);
    g.drawImage(im, x, y); if (x < 0) g.drawImage(im, x + W, y); if (x + 40 > W) g.drawImage(im, x - W, y);
  }
  if (!nm.dying || Math.floor(nm.dying / 6) % 2) nmSprite(g, nmImg.neome, nm.p, nm.p.moving && nm.mode === 'play');
  if (nm.pop) pxFont(g, nm.pop.text, nm.pop.x * T + T / 2, NM.TOP + nm.pop.y * T - 14, '#ffd84a', 16, 'center');
  // le bandeau du haut : score, record, niveau, vies
  px(g, '#120a1e', 0, 0, W, NM.TOP - 4);
  pxFont(g, 'SCORE ' + nm.score, 12, 32, '#ffffff', 16);
  pxFont(g, 'RECORD ' + Math.max(nm.score, games.best.neoman || 0), W / 2, 32, '#ffd84a', 16, 'center');
  pxFont(g, 'NIVEAU ' + nm.level, W - 150, 32, '#b8d0ff', 16);
  for (let i = 0; i < nm.lives; i++) { const x = W - 196 - i * 22; px(g, '#ff5ab4', x, 14, 6, 6); px(g, '#ff5ab4', x + 8, 14, 6, 6); px(g, '#ff5ab4', x, 18, 14, 6); px(g, '#ff5ab4', x + 2, 24, 10, 4); px(g, '#ff5ab4', x + 5, 28, 4, 2); }
  const mid = NM.TOP + 12 * T;
  if (nm.mode === 'ready') nmText(g, W, [['NEO-MAN', '#ff5ab4', 24], ['Flèches ou espace pour commencer', '#ffffff', 12]], mid);
  else if (nm.mode === 'pause') nmText(g, W, [['PAUSE', '#ffd84a', 24], ['P pour reprendre', '#ffffff', 12]], mid);
  else if (nm.ready > 0 && nm.mode === 'play') nmText(g, W, [['PRÊTE !', '#ffd84a', 20], ...(nm.level % 3 === 1 ? [['Labyrinthe ' + nmMaze.name, nmMaze.wall[0], 12]] : [])], mid);
  else if (nm.clear) nmText(g, W, [['NIVEAU ' + nm.level + ' FINI !', '#7ee07a', 20]], mid);
  if (nm.mode === 'over') { nm.dead++; nmText(g, W, [['PARTIE FINIE', '#ff4a5a', 24], [nm.score + ' points, niveau ' + nm.level, '#ffffff', 12], [nm.record ? 'NOUVEAU RECORD !' : 'Record ' + (games.best.neoman || 0), '#ffd84a', 12], [nm.dead > 60 ? 'Espace : rejouer' : '', '#b8b0c8', 12]], mid); }
  if (nm.tick % 15 === 0) g.canvas.setAttribute('aria-label', 'Neo-Man : score ' + nm.score + ', niveau ' + nm.level + ', ' + nm.lives + ' vies, ' + (nm.dots.size + nm.power.size) + ' notes restantes' + (nm.fright ? ', fantômes effrayés' : '') + (nm.mode === 'over' ? ', perdu' : '') + '.');
}
function nmText(g, w, lines, y0) {  // lignes centrées en police pixel sur une bande sombre, la hauteur suit la taille du texte
  const ss = lines.map(([, , size]) => PXK.scale(size)), h = ss.reduce((a, b) => a + b * 14, 0);
  g.fillStyle = 'rgba(11,3,28,.82)'; g.fillRect(0, y0 - 14, w, h + 24);
  let y = y0; lines.forEach(([text, color, size], i) => { y += ss[i] * 10; pxFont(g, text, w / 2, y, color, size, 'center'); y += ss[i] * 4; });  // y : la ligne de base du texte
}
function nmInfo() {
  $('nmStats').replaceChildren(...[['Meilleur score', games.best.neoman || 0], ['Plus haut niveau', games.best['neoman-level'] || 0], ['Fantômes attrapés', nms.ghosts], ['Parties', nms.games]].flatMap(([a, c]) => [el('span', '', a), el('b', '', String(c))]));
}
const NM_KEYS = {ArrowLeft: 'L', q: 'L', a: 'L', ArrowRight: 'R', d: 'R', ArrowUp: 'U', z: 'U', w: 'U', ArrowDown: 'D', s: 'D'};
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || !nm || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key;
  if (nm.mode === 'over') { if ((k === ' ' || k === 'Enter') && nm.dead > 60) { e.preventDefault(); nmNew(); nm.mode = 'play'; } return; }
  if (k === 'p' || k === 'P' || k === 'Escape') { if (nm.mode === 'play') nm.mode = 'pause'; else if (nm.mode === 'pause') nm.mode = 'play'; return; }
  if (NM_KEYS[k]) { e.preventDefault(); nm.keys.delete(NM_KEYS[k]); nm.keys.add(NM_KEYS[k]); nm.p.want = NM_KEYS[k]; nm.mode = 'play'; }
  else if ((k === ' ' || k === 'Enter') && nm.mode !== 'play') { e.preventDefault(); nm.mode = 'play'; }
});
document.addEventListener('keyup', e => { if (nm && NM_KEYS[e.key]) nm.keys.delete(NM_KEYS[e.key]); });
{ const cv = $('nmCanvas'); let start = null;  // au doigt ou à la souris : glisser donne la direction, un toucher démarre
  cv.onpointerdown = e => { e.preventDefault(); start = [e.clientX, e.clientY]; if (nm?.mode === 'over' && nm.dead > 60) { nmNew(); nm.mode = 'play'; } else if (nm && nm.mode !== 'play') nm.mode = 'play'; };
  cv.onpointermove = e => { if (!start || !nm) return; const dx = e.clientX - start[0], dy = e.clientY - start[1];
    if (Math.hypot(dx, dy) > 24) { nm.p.want = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'); start = [e.clientX, e.clientY]; } };
  cv.onpointerup = () => { start = null; }; }
$('nmNew').onclick = () => { nmNew(); nm.mode = 'play'; $('nmNew').blur(); };
// le joueur automatique de la vérification : va vers la note la plus proche (chemin le plus court), en évitant les fantômes qui ne fuient pas
function nmBot() {
  const p = nm.p; if (!nmAt(p)) return;
  const c = Math.round(p.x), r = Math.round(p.y), danger = (x, y) => nm.ghosts.some(g => g.state === 'roam' && !g.fear && Math.abs(g.x - x) + Math.abs(g.y - y) < 3);
  const seen = new Map([[c + ',' + r, null]]), q = [[c, r]];
  while (q.length) {
    const [x, y] = q.shift(), k = x + ',' + y;
    if ((nm.dots.has(k) || nm.power.has(k)) && k !== c + ',' + r) { let s = k; while (seen.get(s) && seen.get(s)[0] !== c + ',' + r) s = seen.get(s)[0]; p.want = seen.get(s)[1]; return; }
    for (const [d, [dx, dy]] of Object.entries(NM_DIRS)) { const nx = (x + dx + NM.C) % NM.C, ny = y + dy, nk = nx + ',' + ny; if (!seen.has(nk) && nmOpen(nx, ny, false) && !danger(nx, ny)) { seen.set(nk, [k, d]); q.push([nx, ny]); } }
  }
}
{  // vérification : le labyrinthe est d'un seul tenant et sans cul-de-sac ; le joueur automatique mange des notes ; un fantôme tue ;
   // un disque fait fuir les fantômes et on les attrape ; finir les notes fait passer au niveau 2
  const bad = [], keep = nm, keepS = JSON.stringify(nms), keepB = [games.best.neoman, games.best['neoman-level']];
  nmMute = true;
  for (const m of NM_MAPS) { nmUseMaze(m);
  if (NM_MAP.some(r => r.length !== NM.C) || NM_MAP.length !== NM.R) bad.push('taille du labyrinthe ' + m.name);
  if (NM_MAP[NM.DOOR[1] + 1][NM.DOOR[0]] !== '-' || NM_MAP[NM.HOME[1]][NM.HOME[0]] !== 'g' || NM_MAP[NM.START[1]][NM.START[0]] !== 'P' || !'.='.includes(NM_MAP[NM.BONUS[1]][NM.BONUS[0]])) bad.push('repères ' + m.name);
  const reach = new Set([NM.START.join()]), q = [NM.START];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of Object.values(NM_DIRS)) { const nx = (x + dx + NM.C) % NM.C, ny = y + dy; if (nmOpen(nx, ny, false) && !reach.has(nx + ',' + ny)) { reach.add(nx + ',' + ny); q.push([nx, ny]); } } }
  NM_MAP.forEach((row, r) => [...row].forEach((ch, c) => {
    if ('.o='.includes(ch) && !reach.has(c + ',' + r)) bad.push('case isolée ' + c + ',' + r);
    if ('.o=P'.includes(ch) && Object.values(NM_DIRS).filter(([dx, dy]) => nmOpen(c + dx, r + dy, false)).length < 2) bad.push('cul-de-sac ' + m.name + ' ' + c + ',' + r);
  }));
  if (m.map.join('').split(/[.o]/).length < 150) bad.push('peu de notes ' + m.name); }
  // le niveau 4 change de labyrinthe, et un fantôme attrapé y retrouve la crypte
  nm = null; nmNew(); nm.level = 3; nm.mode = 'play'; nm.ready = 0; nm.dots.clear(); nm.power = new Set([(NM.START[0] - 1) + ',' + NM.START[1]]); nm.p.dir = 'L'; nm.p.want = 'L';
  for (let t = 0; t < 145; t++) nmUpdate();
  if (nm.level !== 4 || NM_MAP !== NM_MAPS[1].map || nm.dots.size < 150) bad.push('le niveau 4 devait changer de labyrinthe');
  nm.ready = 0; for (let t = 0; t < 2500 && nm.mode === 'play' && nm.level === 4; t++) { nmBot(); nmUpdate(); }
  if (nm.eaten < 60) bad.push('joueur auto dans le labyrinthe 2 : ' + nm.eaten + ' notes');
  for (const m of NM_MAPS) { nmUseMaze(m); if (![...nmToDoor.keys()].includes(NM.START.join())) bad.push('crypte hors d\'atteinte ' + m.name); }
  nmUseMaze(NM_MAPS[0]);
  nm = null; nmNew(); nm.rnd = seeded(3); nm.mode = 'play'; nm.ready = 0;
  for (let t = 0; t < 3000 && nm.mode === 'play' && nm.level === 1; t++) { nmBot(); nmUpdate(); }
  if (nm.eaten < 60) bad.push('joueur auto : ' + nm.eaten + ' notes');
  nm = null; nmNew(); nm.mode = 'play'; nm.ready = 0; const g0 = nm.ghosts[0]; g0.x = nm.p.x - .5; g0.y = nm.p.y; g0.dir = 'R'; nm.p.dir = 'L'; nmUpdate();
  if (nm.lives !== 2 || !nm.dying) bad.push('un fantôme ne tue pas');
  nm = null; nmNew(); nm.mode = 'play'; nm.ready = 0; nm.dots.clear(); nm.power = new Set([(NM.START[0] - 1) + ',' + NM.START[1]]); nm.p.dir = 'L'; nm.p.want = 'L';
  for (let t = 0; t < 12; t++) nmUpdate();
  if (!nm.clear) bad.push('dernière note sans fin de niveau');
  for (let t = 0; t < 130; t++) nmUpdate(); if (nm.level !== 2 || nm.dots.size < 100) bad.push('pas de niveau 2');
  nm = null; nmNew(); nm.mode = 'play'; nm.ready = 0; nm.power = new Set([(NM.START[0] - 1) + ',' + NM.START[1]]); nm.p.dir = 'L';
  for (let t = 0; t < 12; t++) nmUpdate();
  if (!nm.ghosts[0].fear) bad.push('le disque n’effraie pas');
  const gf = nm.ghosts[0]; for (const g of nm.ghosts) if (g !== gf) { g.state = 'house'; g.release = 1e9; } gf.x = nm.p.x - .4; gf.y = nm.p.y; gf.dir = 'R'; const sc = nm.score; nmUpdate();
  if (gf.state !== 'eaten' || nm.score < sc + 200 || nm.lives !== 3) bad.push('fantôme effrayé pas attrapé');
  for (let t = 0; t < 600 && gf.state !== 'roam'; t++) { nm.fright = 0; nmUpdate(); }
  if (gf.state !== 'roam') bad.push('le fantôme attrapé ne ressort pas (' + gf.state + ')');
  console.assert(!bad.length, 'neoman', bad);
  nm = keep; Object.assign(nms, JSON.parse(keepS)); for (const [k, v] of [['neoman', keepB[0]], ['neoman-level', keepB[1]]]) { if (v === undefined) delete games.best[k]; else games.best[k] = v; }
  nmMute = false; $('nmCanvas').__nmBad = bad; if (keep) nmUseMaze(nmMazeOf(keep.level));
}
ctx.onOpen(() => {
  if (!nm || !nm.g) { nmNew(); nm.g = $('nmCanvas').getContext('2d'); }
  gameLoop(nm, 'neoman', nmUpdate, nmDraw); nmInfo();
});
$('nmCanvas').__nm = { get st() { return nm; }, bot: nmBot, update: nmUpdate, maze: () => nmMaze.name, level: n => { nm.level = n; nmLevel(); } };
$('nmFs').onclick = () => { $('nmFs').blur(); try { if (document.fullscreenElement) document.exitFullscreen(); else $('nmCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
}
