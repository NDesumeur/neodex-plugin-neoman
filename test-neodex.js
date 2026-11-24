// lancé par le test « local » de NeoDex : la vérification interne du jeu, puis une vraie partie jouée par le joueur automatique
// (il va vers la note la plus proche en évitant les spectres) ; avec NEO_SHOTS, garde des images du jeu
module.exports = async ({ pj, sleep }) => {
  const C = `document.getElementById('nmCanvas')`;
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`${C}.toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'neoman-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await sleep(800);
  const bad = await pj(`${C}.__nmBad`);
  if (bad.length) throw new Error('vérification du jeu : ' + bad.join(', '));
  await pj(`document.getElementById('nmNew').click(), 0`); await sleep(300);
  await pj(`(window.__nmBotT = setInterval(() => ${C}.__nm.bot(), 16), 0)`);
  for (let i = 0; i < 30; i++) { await sleep(500); if (i === 12) await shot('1-partie'); if (/perdu/.test(await pj(`${C}.getAttribute('aria-label')`))) break; }
  await pj(`clearInterval(window.__nmBotT), 0`);
  const l = await pj(`${C}.getAttribute('aria-label')`), m = /score (\d+)/.exec(l);
  if (!m || +m[1] < 300) throw new Error('le joueur automatique devait marquer des points : « ' + l + ' »');
  // les labyrinthes : un nouveau tous les 3 niveaux
  const mazes = [];
  for (const n of [1, 4, 7, 10, 13, 16, 19, 22]) { await pj(`${C}.__nm.level(${n}), 0`); await sleep(150); mazes.push(await pj(`${C}.__nm.maze()`)); if (n > 9 && n < 22) await shot('labyrinthe-' + n); }
  if (mazes.join() !== 'Disco,Cristal,Jardin,Braise,Néon,Océan,Galaxie,Disco') throw new Error('labyrinthes par niveau : ' + mazes.join());
  // le championnat : des dormeurs dans les couloirs, une file derrière un fantôme
  await pj(`document.getElementById('nmChamp').click(), 0`); await sleep(200);
  const ch = await pj(`(() => { const T = ${C}.__nm, nm = T.st; nm.mode = 'play'; nm.ready = 0; for (let i = 0; i < 200; i++) T.update(); const g = nm.ghosts[0]; g.train.push({x: g.x, y: g.y, dir: g.dir}, {x: g.x, y: g.y, dir: g.dir}, {x: g.x, y: g.y, dir: g.dir}); for (let i = 0; i < 40; i++) { nm.p.x = 1; nm.p.y = 19; T.update(); } return nm.champ.sleep.length + ' ' + g.train.length + ' ' + nm.mode; })()`);
  await sleep(100); await shot('championnat'); if (!/^[0-9]+ 3 play/.test(ch) || +ch.split(' ')[0] < 6) throw new Error('championnat : ' + ch);
  await pj(`document.getElementById('nmNew').click(), 0`); await sleep(200);
  // plein écran, et le jeu qui tient dans la fenêtre
  await pj(`document.getElementById('nmFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = ${C}, r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = ${C}.getBoundingClientRect(); let s = 0; for (let e = ${C}.parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(L));
  return l + ' · labyrinthes ' + mazes.slice(0, 7).join(', ') + ' · championnat (' + ch + ')' + ' · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
