// Optimiza fotos y vídeo de assets/ para la web.
// Uso: node tools/optimize.mjs   (desde la raíz del proyecto)
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC_IMG = 'assets/img';
const OUT_IMG = 'assets/web/img';
const SRC_VID = 'assets/video';
const OUT_VID = 'assets/web/video';
mkdirSync(OUT_IMG, { recursive: true });
mkdirSync(OUT_VID, { recursive: true });

const kb = (p) => Math.round(statSync(p).size / 1024) + ' KB';

// Fotos: WebP en varios anchos (sin ampliar nunca el original).
// Project stills arrive with black bars baked into the edges; behind-the-scenes photos keep their film border.
const KEEP_BORDER = new Set(['hero-1', 'hero-2', 'hero-3', 'alberto', 'reel-poster']);
const dims = {};

for (const file of readdirSync(SRC_IMG, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name)) {
  const { name } = parse(file);
  let src = join(SRC_IMG, file);
  if (name === 'desertoris') {
    // Its dark studio backdrop would be trimmed as if it were a bar; crop only the right/bottom bars.
    src = await sharp(src).extract({ left: 0, top: 0, width: 748, height: 421 }).toBuffer();
  } else if (!KEEP_BORDER.has(name)) {
    src = await sharp(src).trim({ background: '#000000', threshold: 18 }).toBuffer();
  }
  const { width, height } = await sharp(src).metadata();
  dims[name] = `${width}x${height}`;
  const widths = [480, 960, 1600, 2400].filter((w) => w <= width);
  if (!widths.includes(width) && width < 2400) widths.push(width);
  for (const w of widths) {
    // The native-size file keeps a stable name whatever the trimmed width turns out to be.
    const out = join(OUT_IMG, `${name}-${w === width && ![480, 960, 1600, 2400].includes(w) ? 'lg' : w}.webp`);
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .sharpen({ sigma: 0.5 })
      .webp({ quality: w <= 480 ? 72 : 78, effort: 6, smartSubsample: true })
      .toFile(out);
    console.log(out, kb(out));
  }
  // Project pages show the still at its full native size with near-lossless encoding.
  if (!KEEP_BORDER.has(name)) {
    const hq = join(OUT_IMG, `${name}-hq.webp`);
    await sharp(src).webp({ quality: 94, effort: 6, smartSubsample: false }).toFile(hq);
    console.log(hq, kb(hq));
  }
}

// Galerías de proyecto (descargadas con tools/fetch-canva.mjs): sin barras negras, a tamaño nativo y alta calidad.
const SRC_GAL = 'assets/img/gallery';
const OUT_GAL = 'assets/web/img/gallery';
if (existsSync(SRC_GAL)) {
  mkdirSync(OUT_GAL, { recursive: true });
  const galDims = {};
  for (const file of readdirSync(SRC_GAL).sort()) {
    const { name } = parse(file);
    const trimmed = await sharp(join(SRC_GAL, file)).trim({ background: '#000000', threshold: 18 }).toBuffer({ resolveWithObject: true });
    // Very dark frames can lose real picture to the trim; keep the original framing when more than a fifth would go.
    const orig = await sharp(join(SRC_GAL, file)).metadata();
    const keep = trimmed.info.width * trimmed.info.height >= 0.8 * orig.width * orig.height;
    const img = keep ? sharp(trimmed.data) : sharp(join(SRC_GAL, file));
    const { width, height } = keep ? trimmed.info : orig;
    const out = join(OUT_GAL, `${name}-hq.webp`);
    await img.webp({ quality: 92, effort: 6, smartSubsample: false }).toFile(out);
    galDims[name] = [width, height];
    console.log(out, kb(out));
  }
  writeFileSync(join(OUT_GAL, 'dims.json'), JSON.stringify(galDims, null, 1));
}

// Originales a resolución completa para el botón HD del modal: assets/img/gallery-hd/<proyecto>-<n>.(jpg|png|tif|webp),
// con el mismo nombre que la foto de la galería a la que sustituyen.
const SRC_HD = 'assets/img/gallery-hd';
if (existsSync(SRC_HD)) {
  const hdDims = {};
  for (const file of readdirSync(SRC_HD).sort()) {
    const { name } = parse(file);
    const out = join(OUT_GAL, `${name}-hd.webp`);
    const { info } = await sharp(join(SRC_HD, file)).rotate().resize({ width: 3200, height: 3200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 }).toFile(out);
    hdDims[name] = [info.width, info.height];
    console.log(out, kb(out));
  }
  writeFileSync(join(OUT_GAL, 'hd.json'), JSON.stringify(hdDims, null, 1));
}

console.log('DIMS', JSON.stringify(dims));
if (process.argv.includes('--images-only')) process.exit(0);

const ff = (args) => execFileSync(ffmpegPath, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const reel = join(SRC_VID, 'reel.mp4');

// Reel completo: H.264 720p y 1080p-equivalente del original (1280), arranque rápido.
ff(['-i', reel, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-vf', 'scale=1280:-2', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', join(OUT_VID, 'reel-1280.mp4')]);
ff(['-i', reel, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
  '-vf', 'scale=854:-2', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', join(OUT_VID, 'reel-854.mp4')]);

// Bucle mudo de portada: 12 s desde la apertura del reel, sin audio, ligero.
ff(['-ss', '1.8', '-t', '12', '-i', reel, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p',
  '-vf', 'scale=1280:-2,fps=24', '-movflags', '+faststart', join(OUT_VID, 'loop-1280.mp4')]);
ff(['-ss', '1.8', '-t', '12', '-i', reel, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p',
  '-vf', 'scale=640:-2,fps=24', '-movflags', '+faststart', join(OUT_VID, 'loop-640.mp4')]);

// Póster del reel: la silueta entre neones de la apertura, sin rótulos encima.
ff(['-ss', '2', '-i', reel, '-frames:v', '1', '-q:v', '3', join(OUT_VID, 'poster.jpg')]);
await sharp(join(OUT_VID, 'poster.jpg')).webp({ quality: 78 }).toFile(join(OUT_VID, 'poster.webp'));

for (const f of readdirSync(OUT_VID)) console.log(join(OUT_VID, f), kb(join(OUT_VID, f)));
