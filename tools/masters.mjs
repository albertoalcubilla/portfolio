// HD desde los masters: assets/video/masters/<proyecto>.(mov|mp4) y masters/reel.mov (descargados de Canva → Subidos).
// Sustituye el "Ver en HD" (films/<proyecto>.mp4) y la versión ligera (films/<proyecto>-sd.mp4) por versiones sacadas del master,
// y genera reel-1080.mp4. Cada archivo HD queda por debajo de 95 MB (GitHub no acepta archivos de más de 100 MB).
// Uso: node tools/masters.mjs   (desde la raíz del proyecto, después de tools/clips.mjs)
import ffmpegPath from 'ffmpeg-static';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

const DIR = 'assets/video/masters';
const CAP_MB = 95;
const ff = (args) => execFileSync(ffmpegPath, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + ' MB';
const duration = (file) => {
  const [, h, m, s] = spawnSync(ffmpegPath, ['-hide_banner', '-i', file]).stderr.toString().match(/Duration: (\d+):(\d+):([\d.]+)/);
  return +h * 3600 + +m * 60 + +s;
};
const masterFor = (name) => ['mov', 'mp4'].map((e) => `${DIR}/${name}.${e}`).find(existsSync);

// Full quality under the cap: a light master is only re-wrapped; a heavy one is re-encoded with its bitrate capped to fit.
function hd(src, out) {
  if (statSync(src).size <= CAP_MB * 1048576) {
    ff(['-i', src, '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
    return;
  }
  const kbps = Math.floor((CAP_MB * 8 * 1024) / duration(src)) - 200;
  ff(['-i', src, '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-maxrate', `${kbps}k`, '-bufsize', `${kbps * 2}k`,
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
}

function sd(src, out) {
  ff(['-i', src, '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
    '-vf', "scale='if(gt(iw,ih),-2,540)':'if(gt(iw,ih),540,-2)'", '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
}

const { projects } = JSON.parse(readFileSync('tools/projects.json', 'utf8'));
for (const p of projects.filter((p) => p.film && p.film.file)) {
  const src = masterFor(p.slug);
  if (!src) continue;
  const base = `assets/web/video/films/${p.slug}`;
  hd(src, `${base}.mp4`);
  sd(src, `${base}-sd.mp4`);
  console.log(p.slug, 'HD', mb(`${base}.mp4`), '· ligero', mb(`${base}-sd.mp4`));
}

const reel = masterFor('reel');
if (reel) {
  hd(reel, 'assets/web/video/reel-1080.mp4');
  console.log('reel HD', mb('assets/web/video/reel-1080.mp4'));
}
