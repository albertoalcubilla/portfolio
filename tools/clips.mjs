// Corta del reel un clip por proyecto (según tools/projects.json).
// Uso: node tools/clips.mjs   (desde la raíz del proyecto)
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const REEL = 'assets/video/reel.mp4';
const OUT = 'assets/web/video/clips';
mkdirSync(OUT, { recursive: true });

const { projects } = JSON.parse(readFileSync('tools/projects.json', 'utf8'));
const ff = (args) => execFileSync(ffmpegPath, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const kb = (p) => Math.round(statSync(p).size / 1024) + ' KB';

for (const p of projects.filter((p) => p.clip)) {
  const { start, end, loop = start } = p.clip;
  const loopLen = Math.min(5, end - loop);

  // Bucle mudo y ligero para la rejilla.
  const tile = join(OUT, `${p.slug}-loop.mp4`);
  ff(['-ss', String(loop), '-t', String(loopLen), '-i', REEL, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '29',
    '-pix_fmt', 'yuv420p', '-vf', 'scale=640:-2,fps=24', '-movflags', '+faststart', tile]);

  // Fragmento completo con sonido para la página del proyecto, casi sin pérdida respecto al reel.
  const full = join(OUT, `${p.slug}.mp4`);
  ff(['-ss', String(start), '-t', String(end - start), '-i', REEL, '-c:v', 'libx264', '-preset', 'slower', '-crf', '16',
    '-tune', 'film', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', full]);

  // Póster del fragmento.
  const jpg = join(OUT, `${p.slug}.jpg`);
  ff(['-ss', String(loop + 0.4), '-i', REEL, '-frames:v', '1', '-q:v', '3', '-vf', 'scale=1280:-2', jpg]);
  await sharp(jpg).webp({ quality: 88 }).toFile(join(OUT, `${p.slug}.webp`));
  unlinkSync(jpg);

  console.log(p.slug, kb(tile), kb(full));
}

// Fondo de la página de información: un tramo de una película sin rótulos (projects.json → infoLoop).
const { infoLoop } = JSON.parse(readFileSync('tools/projects.json', 'utf8'));
if (infoLoop && existsSync(`assets/video/films/${infoLoop.slug}.mp4`)) {
  const src = `assets/video/films/${infoLoop.slug}.mp4`;
  for (const [w, crf] of [[1280, 26], [640, 29]]) {
    ff(['-ss', String(infoLoop.at), '-t', String(infoLoop.len), '-i', src, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
      '-pix_fmt', 'yuv420p', '-vf', `scale=${w}:-2,fps=24`, '-movflags', '+faststart', `assets/web/video/info-${w}.mp4`]);
  }
  const jpg = 'assets/web/video/info.jpg';
  ff(['-ss', String(infoLoop.at + 0.5), '-i', src, '-frames:v', '1', '-q:v', '2', jpg]);
  await sharp(jpg).webp({ quality: 82 }).toFile('assets/web/video/info.webp');
  unlinkSync(jpg);
  console.log('info loop', kb('assets/web/video/info-1280.mp4'));
}

// Proyectos completos (assets/video/films/<slug>.mp4, descargados con tools/fetch-canva.mjs).
// Ya vienen en H.264 para web: se publican sin recomprimir (sin pérdida), solo con el índice al principio.
const FILMS_OUT = 'assets/web/video/films';
for (const p of projects.filter((p) => p.film && p.film.file)) {
  const src = `assets/video/films/${p.slug}.mp4`;
  if (!existsSync(src)) { console.log('Falta', src); continue; }
  mkdirSync(FILMS_OUT, { recursive: true });
  const out = join(FILMS_OUT, `${p.slug}.mp4`);
  ff(['-i', src, '-c', 'copy', '-movflags', '+faststart', out]);

  // Light version (short side 540 px) that plays on the page; the full-quality file above is the "Ver en HD" link.
  const sd = join(FILMS_OUT, `${p.slug}-sd.mp4`);
  ff(['-i', src, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
    '-vf', "scale='if(gt(iw,ih),-2,540)':'if(gt(iw,ih),540,-2)'", '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', sd]);

  // The film's own poster, free of the reel's burned-in captions.
  const posterJpg = join(FILMS_OUT, `${p.slug}.jpg`);
  ff(['-ss', String(typeof p.film.poster === 'number' ? p.film.poster : 20), '-i', src, '-frames:v', '1', '-q:v', '2', posterJpg]);
  await sharp(posterJpg).webp({ quality: 88 }).toFile(join(FILMS_OUT, `${p.slug}.webp`));
  unlinkSync(posterJpg);

  // Projects that are not in the reel take their grid loop and poster from the film itself.
  if (!p.clip) {
    const at = p.film.loop ?? 8;
    ff(['-ss', String(at), '-t', '5', '-i', src, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '29',
      '-pix_fmt', 'yuv420p', '-vf', `${p.film.crop ? `crop=${p.film.crop},` : ''}scale='if(gt(iw,ih),640,-2)':'if(gt(iw,ih),-2,640)',fps=24`, '-movflags', '+faststart',
      join(OUT, `${p.slug}-loop.mp4`)]);
    const jpg = join(OUT, `${p.slug}.jpg`);
    ff(['-ss', String(at + 0.4), '-i', src, '-frames:v', '1', '-q:v', '3', jpg]);
    await sharp(jpg).webp({ quality: 88 }).toFile(join(OUT, `${p.slug}.webp`));
    unlinkSync(jpg);
  }
  console.log(p.slug, 'proyecto completo', kb(out), 'ligero', kb(sd));
}
