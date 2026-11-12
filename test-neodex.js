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
  return l;
};
