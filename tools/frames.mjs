// Completa la galería de cada proyecto con fotogramas de su propio vídeo (projects.json → frames, en segundos).
// Usa el master (assets/video/masters/<proyecto>.*) si existe, si no el vídeo de Canva (assets/video/films/).
// Los guarda como assets/img/gallery/<proyecto>-<n>.png a continuación de las fotos de Canva; después: optimize.mjs y build.mjs.
// Uso: node tools/frames.mjs   (desde la raíz del proyecto)
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

const { projects } = JSON.parse(readFileSync('tools/projects.json', 'utf8'));
const source = (slug) => [`assets/video/masters/${slug}.mov`, `assets/video/masters/${slug}.mp4`, `assets/video/films/${slug}.mp4`].find(existsSync);

for (const p of projects.filter((p) => p.frames)) {
  const src = source(p.slug);
  if (!src) { console.log('Falta el vídeo de', p.slug); continue; }
  for (const [i, t] of p.frames.entries()) {
    const out = `assets/img/gallery/${p.slug}-${(p.gallery || 0) + i + 1}.png`;
    const tmp = `${out}.tmp.png`;
    execFileSync(ffmpegPath, ['-y', '-loglevel', 'error', '-ss', String(t), '-i', src, '-frames:v', '1', tmp]);
    // Pillarbox/letterbox bars come off here, so the gallery step sees a clean frame.
    const meta = await sharp(tmp).metadata();
    const trimmed = await sharp(tmp).trim({ background: '#000000', threshold: 14 }).toBuffer({ resolveWithObject: true });
    const keep = trimmed.info.width * trimmed.info.height >= 0.6 * meta.width * meta.height;
    await (keep ? sharp(trimmed.data) : sharp(tmp)).png().toFile(out);
    unlinkSync(tmp);
    console.log(out, keep ? `${trimmed.info.width}x${trimmed.info.height}` : `${meta.width}x${meta.height}`);
  }
}
