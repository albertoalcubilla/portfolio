// Genera todas las páginas HTML de la web a partir de tools/projects.json.
// Uso: node tools/build.mjs   (desde la raíz del proyecto)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const data = JSON.parse(readFileSync('tools/projects.json', 'utf8'));
// GitHub Pages lets browsers keep CSS and JS for 10 minutes; a content hash in the URL makes each change load at once.
const v = (file) => createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8);
const CSS_V = v('styles.css');
const JS_V = v('main.js');
const GAL_DIMS = 'assets/web/img/gallery/dims.json';
const galDims = existsSync(GAL_DIMS) ? JSON.parse(readFileSync(GAL_DIMS, 'utf8')) : {};
const GAL_HD = 'assets/web/img/gallery/hd.json';
const galHd = existsSync(GAL_HD) ? JSON.parse(readFileSync(GAL_HD, 'utf8')) : {};
const projects = data.projects;
// A project gets a tile and a page when it has something to show: a still, a clip from the reel, or both.
const withStill = projects.filter((p) => p.still || p.clip);
const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fullTitle = (p) => (p.by ? `${p.title} (${p.by})` : p.title);
const roleLong = { DoP: 'Dirección de fotografía', Gaffer: 'Gaffer' };
const meta = (p) => `${p.format} · ${p.role} · ${p.year}`;

/* ---------- Shared chrome ---------- */

function head(base, title, description) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${base}assets/web/img/hero-3-1600.webp">
  <link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${base}assets/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}styles.css?v=${CSS_V}">
</head>`;
}

function nav(base, current) {
  const cur = (k) => (k === current ? ' aria-current="page"' : '');
  return `  <header class="nav">
    <a href="${base}index.html" class="nav__name">Alberto Alcubilla</a>
    <a href="${base}trabajos.html"${cur('trabajos')}>Trabajos</a>
    <a href="${base}index.html#formacion">Formación</a>
    <a class="nav__credits" href="${base}index.html#creditos">Créditos</a>
  </header>`;
}

function filterPill(current) {
  const pages = [['trabajos', 'Todo'], ['dop', 'DoP'], ['gaffer', 'Gaffer'], ['rodaje', 'Rodaje']];
  return `  <nav class="filter" aria-label="Filtrar trabajos">
${pages.map(([k, label]) => `    <a href="${k}.html"${k === current ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}
  </nav>`;
}

function footer(base) {
  return `  <footer class="foot">
    <span>© Alberto Alcubilla 2026</span>
    <a href="mailto:albertoalcu22@gmail.com">albertoalcu22@gmail.com</a>
    <a href="https://www.instagram.com/alberto_alcubilla_/" rel="noopener" target="_blank">Instagram</a>
    <a href="#top">Volver arriba</a>
  </footer>

  <script src="${base}main.js?v=${JS_V}" defer></script>
</body>
</html>
`;
}

/* ---------- Grid ---------- */

// Hung, not tiled: alternating left/right slots with uneven widths and drops (12 columns, rem offsets).
const SLOTS = [
  [1, 8, 0], [9, 13, 9], [2, 7, 6], [8, 13, 14], [1, 6, 7], [8, 11, 4], [2, 8, 5], [9, 13, 12],
  [1, 6, 6], [7, 12, 10], [3, 7, 5], [8, 13, 13], [1, 7, 6], [9, 13, 3], [4, 9, 7],
];

function slot(i, tall) {
  let [a, b, y] = SLOTS[i % SLOTS.length];
  if (tall) b = Math.min(b, a + 3);
  return `--col: ${a} / ${b}; --y: ${i === 0 ? 0 : y}rem`;
}

const srcset = (still, w) => {
  const sizes = [480, 960, 1600, 2400].filter((s) => s < w || (still.startsWith('hero') && s <= w));
  const big = still.startsWith('hero') ? '' : `, assets/web/img/${still}-lg.webp ${w}w`;
  return sizes.map((s) => `assets/web/img/${still}-${s}.webp ${s}w`).join(', ') + big;
};
const imgSrc = (still) => (still.startsWith('hero') ? `assets/web/img/${still}-960.webp` : `assets/web/img/${still}-lg.webp`);

// The tile shows the project's own footage: a loop from its film, else its reel fragment, else a still
// (`tile` names a gallery frame to use instead, for projects whose only footage is the captioned reel).
function projectTile(p, i) {
  const [tw, th] = p.tile ? galDims[p.tile] : [];
  const moving = !p.tile && (p.clip || p.film);
  const ratio = p.tile ? tw / th : p.film ? p.film.tileRatio || p.film.ratio || 16 / 9 : p.clip ? 16 / 9 : p.w / p.h;
  const tall = ratio < 1;
  const media = p.tile
    ? `<img src="assets/web/img/gallery/${p.tile}-hq.webp" width="${tw}" height="${th}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">`
    : moving
    ? `<video class="item__video" muted loop playsinline preload="none" poster="assets/web/video/clips/${p.slug}.webp" data-src="assets/web/video/clips/${p.slug}-loop.mp4" aria-hidden="true"></video>`
    : `<img src="${imgSrc(p.still)}" srcset="${srcset(p.still, p.w)}" sizes="(min-width: 800px) 42vw, 90vw" width="${p.w}" height="${p.h}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">`;
  return `      <a class="item${tall ? ' item--tall' : ''}" href="trabajos/${p.slug}.html" data-title="${esc(fullTitle(p))}" style="${slot(i, tall)}">
        <div class="item__media" style="--ar: ${moving || p.tile ? ratio.toFixed(4) : `${p.w} / ${p.h}`}">
          ${media}
        </div>
        <p class="item__cap"><span>${esc(fullTitle(p))}</span><span>${esc(meta(p))}</span></p>
      </a>`;
}

function onsetTile(o, n, i) {
  return `      <a class="item" href="trabajos/en-rodaje.html#${n + 1}" data-title="En rodaje · ${esc(o.label)}" style="${slot(i, o.h > o.w)}">
        <div class="item__media" style="--ar: ${o.w} / ${o.h}">
          <img src="${imgSrc(o.still)}" srcset="${srcset(o.still, o.w)}" sizes="(min-width: 800px) 42vw, 90vw" width="${o.w}" height="${o.h}" alt="${esc(o.alt)}" loading="lazy" decoding="async">
        </div>
        <p class="item__cap"><span>En rodaje</span><span>${esc(o.label)}</span></p>
      </a>`;
}

const reelTile = `      <figure class="item item--reel" id="reel" data-title="Reel 2024–2026" style="--col: 1 / 8; --y: 0rem">
        <div class="item__media reel">
          <video class="reel__video" muted loop playsinline preload="none"
            poster="assets/web/video/poster.webp"
            data-loop-sm="assets/web/video/loop-640.mp4"
            data-loop-lg="assets/web/video/loop-1280.mp4"
            data-full-sm="assets/web/video/reel-854.mp4"
            data-full-lg="assets/web/video/reel-1280.mp4"
            aria-label="Reel de Alberto Alcubilla"></video>
          <button class="reel__play" type="button">Ver reel con sonido</button>
          <a class="reel__play reel__hd" href="assets/web/video/${existsSync('assets/web/video/reel-1080.mp4') ? 'reel-1080' : 'reel-1280'}.mp4" target="_blank" rel="noopener">Ver en HD</a>
        </div>
        <figcaption class="item__cap"><span>Reel</span><span>2024–2026</span></figcaption>
      </figure>`;

function gridPage(file, current, heading, entries) {
  const tiles = entries.map((e, i) => {
    if (e === 'reel') return reelTile;
    if (e.startsWith('onset:')) { const n = +e.split(':')[1]; return onsetTile(data.onset[n], n, i); }
    return projectTile(bySlug[e], i);
  });
  const html = `${head('', `${heading} · Alberto Alcubilla`,
    'Alberto Alcubilla, Director de Fotografía y Gaffer. Reel, cortometrajes, fashion films, spots y videoclips.')}
<body>
  <a class="skip" href="#trabajos">Saltar al contenido</a>
${nav('', 'trabajos')}

  <main id="top">
    <h1 class="sr">Alberto Alcubilla, Director de Fotografía y Gaffer · ${esc(heading)}</h1>
    <section class="grid" id="trabajos" aria-label="${esc(heading)}">
${tiles.join('\n\n')}
    </section>
  </main>

${filterPill(current)}

${footer('')}`;
  writeFileSync(file, html);
}

/* ---------- Project pages ---------- */

// The full project, when there is one: a Vimeo/YouTube embed or a local MP4 (tools/clips.mjs encodes it).
function filmSlide(p) {
  const f = p.film;
  const r = f.ratio || 16 / 9;
  if (f.vimeo || f.youtube) {
    const src = f.vimeo
      ? `https://player.vimeo.com/video/${encodeURIComponent(f.vimeo)}?dnt=1&title=0&byline=0&portrait=0`
      : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(f.youtube)}?rel=0&modestbranding=1`;
    return `      <figure class="slide slide--film" style="--r: ${r}">
        <iframe src="${src}" title="${esc(p.title)} (proyecto completo)" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </figure>`;
  }
  // The page plays the light version; "Ver en HD" opens the full-quality file (or film.hd, an external link) directly.
  const hd = f.hd || `../assets/web/video/films/${p.slug}.mp4`;
  return `      <figure class="slide slide--video" style="--r: ${r}">
        <video src="../assets/web/video/films/${p.slug}-sd.mp4" poster="../assets/web/${f.poster === 'still' ? `img/${p.still}-hq` : `video/films/${p.slug}`}.webp" playsinline preload="metadata" aria-label="${esc(p.title)}, proyecto completo"></video>
        <button class="slide__play" type="button" aria-label="Reproducir ${esc(p.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>
        <a class="slide__hd" href="${esc(hd)}" target="_blank" rel="noopener">Ver en HD</a>
      </figure>`;
}

function slidesFor(p) {
  const slides = [];
  if (p.film) {
    slides.push(filmSlide(p));
  } else if (p.clip) {
    slides.push(`      <figure class="slide slide--video" style="--r: ${16 / 9}">
        <video src="../assets/web/video/clips/${p.slug}.mp4" poster="../assets/web/video/clips/${p.slug}.webp" playsinline preload="metadata" aria-label="Fragmento de ${esc(p.title)} del reel"></video>
        <button class="slide__play" type="button" aria-label="Reproducir fragmento"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>
      </figure>`);
  }
  // The project's full gallery from the old site; the single grid still when there is none.
  // Canva photos first, then the frames taken from the film (tools/frames.mjs), numbered after them.
  const count = (p.gallery || 0) + (p.frames?.length || 0);
  const gallery = Array.from({ length: count }, (_, i) => `${p.slug}-${i + 1}`).filter((n) => galDims[n]);
  if (gallery.length) {
    gallery.forEach((n, i) => {
      const [w, h] = galDims[n];
      slides.push(`      <figure class="slide" style="--r: ${(w / h).toFixed(4)}">
        <img src="../assets/web/img/gallery/${n}-hq.webp" width="${w}" height="${h}" alt="Fotograma ${i + 1} de ${esc(p.title)}" loading="lazy" decoding="async"${galHd[n] ? ` data-hd="../assets/web/img/gallery/${n}-hd.webp"` : ''}>
      </figure>`);
    });
  } else if (p.still) {
    slides.push(`      <figure class="slide" style="--r: ${(p.w / p.h).toFixed(4)}">
        <img src="../assets/web/img/${p.still}-hq.webp" width="${p.w}" height="${p.h}" alt="Fotograma de ${esc(p.title)}" decoding="async">
      </figure>`);
  }
  return slides;
}

function projectPage({ slug, title, giant, slides, info, next }) {
  mkdirSync('trabajos', { recursive: true });
  const html = `${head('../', `${title} · Alberto Alcubilla`, `${title}. Alberto Alcubilla, Director de Fotografía y Gaffer.`)}
<body class="project">
  <header class="pbar">
    <span class="pbar__count num" aria-live="polite"><span data-count>1</span> / ${slides.length}</span>
    <a class="pbar__close" href="../trabajos.html">Cerrar</a>
  </header>

  <h1 class="ptitle">${esc(giant)}</h1>

  <main class="slides" id="top" tabindex="0" aria-label="Imágenes de ${esc(title)}">
${slides.join('\n')}
  </main>

  <aside class="pinfo" id="info" aria-label="Información del proyecto">
    <div class="pinfo__head">
      <p class="pinfo__title">${esc(title)}</p>
      <button class="pinfo__toggle" type="button" aria-expanded="true" aria-controls="info-body">Minimizar</button>
    </div>
    <div class="pinfo__body" id="info-body">
${info}
      <a class="pinfo__next" href="${next.href}">Siguiente: ${esc(next.title)}</a>
    </div>
  </aside>

  <script src="../main.js?v=${JS_V}" defer></script>
</body>
</html>
`;
  writeFileSync(`trabajos/${slug}.html`, html);
}

const pageOrder = [...withStill.filter((p) => p.cat === 'dop'), ...withStill.filter((p) => p.cat === 'gaffer')];
pageOrder.forEach((p, i) => {
  const n = pageOrder[(i + 1) % pageOrder.length];
  projectPage({
    slug: p.slug,
    title: fullTitle(p),
    giant: p.title,
    slides: slidesFor(p),
    info: `    <p class="pinfo__lede">${esc(p.format)}, ${p.year}.${p.status ? ` ${esc(p.status)}.` : ''}</p>${p.synopsis ? `
    <p class="pinfo__synopsis">${esc(p.synopsis)}</p>` : ''}
    <dl class="pinfo__list">
${(p.credits || [['Cargo', roleLong[p.role]]]).map(([k, v]) => `      <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}${p.film ? '' : p.clip ? `
      <div><dt>Vídeo</dt><dd>Fragmento del reel</dd></div>` : ''}
    </dl>`,
    next: { href: `${n.slug}.html`, title: n.title },
  });
});

projectPage({
  slug: 'en-rodaje',
  title: 'En rodaje',
  giant: 'En rodaje',
  slides: data.onset.map((o) => `      <figure class="slide" style="--r: ${(o.w / o.h).toFixed(4)}">
        <img src="../assets/web/img/${o.still}-${o.still.startsWith('hero') ? 2400 : 'lg'}.webp" width="${o.w}" height="${o.h}" alt="${esc(o.alt)}" decoding="async">
      </figure>`),
  info: `    <p class="pinfo__lede">Fotografías de rodaje: Alberto en plató, con el equipo de cámara y la foto fija.</p>`,
  next: { href: `${pageOrder[0].slug}.html`, title: pageOrder[0].title },
});

/* ---------- Grid pages ---------- */

gridPage('trabajos.html', 'trabajos', 'Trabajos', data.homeOrder);
gridPage('dop.html', 'dop', 'Dirección de fotografía', withStill.filter((p) => p.cat === 'dop').map((p) => p.slug));
gridPage('gaffer.html', 'gaffer', 'Gaffer', withStill.filter((p) => p.cat === 'gaffer').map((p) => p.slug));
gridPage('rodaje.html', 'rodaje', 'En rodaje', data.onset.map((_, n) => `onset:${n}`));

/* ---------- Information ---------- */

const credits = [...projects.filter((p) => p.cat === 'dop'), ...projects.filter((p) => p.cat === 'gaffer')]
  .map((p) => `          <li>${p.still || p.clip ? `<a href="trabajos/${p.slug}.html">${esc(fullTitle(p))}</a>` : `<span>${esc(fullTitle(p))}</span>`}<span>${p.role} · ${p.year}</span></li>`)
  .join('\n');

// The home page, one screen like a title card: the statement over his own footage, the three ways in
// along the top (the work, and training and credits opening as panels over the image), contact below.
writeFileSync('index.html', `${head('', 'Alberto Alcubilla · Director de Fotografía', 'Alberto Alcubilla, Director de Fotografía y Gaffer. Trabajos, formación, créditos y contacto.')}
<body class="infopage">
  <div class="infopage__bg" aria-hidden="true">
    <video muted loop playsinline preload="none"
      data-loop-sm="assets/web/video/info-640.mp4" data-loop-lg="assets/web/video/info-1280.mp4"></video>
  </div>

  <a class="skip" href="#top">Saltar al contenido</a>
  <header class="nav">
    <a href="index.html" aria-current="page">Alberto Alcubilla</a>
    <a href="trabajos.html">Trabajos</a>
    <button type="button" data-info-panel="formacion" aria-controls="formacion" aria-expanded="false">Formación</button>
    <button type="button" class="nav__credits" data-info-panel="creditos" aria-controls="creditos" aria-expanded="false">Créditos</button>
  </header>

  <main id="top">
    <div class="istatement">
      <h1><span class="istatement__name">Alberto<br>Alcubilla</span> <span class="istatement__role">Director de Fotografía y Gaffer</span></h1>
      <p class="istatement__line">Mi trayectoria combina la técnica y la creatividad.</p>
    </div>

    <section class="ipanel" id="formacion" hidden aria-labelledby="formacion-t">
      <h2 class="sr" id="formacion-t">Formación</h2>
      <ul class="ipanel__list">
        <li>Grado en Comunicación Audiovisual, UPV</li>
        <li>Grado en Ingeniería de Sistemas de Telecomunicación, Sonido e Imagen, UPV</li>
        <li>Máster en Dirección de Fotografía, TAI</li>
        <li>Certificado ARRI</li>
        <li>Curso intensivo «Gaffer Lab», ECAM</li>
        <li>Prácticas en Aluzine</li>
      </ul>
    </section>

    <section class="ipanel ipanel--credits" id="creditos" hidden aria-labelledby="creditos-t">
      <h2 class="sr" id="creditos-t">Créditos</h2>
      <ul class="ipanel__list">
${credits}
      </ul>
    </section>
  </main>

  <footer class="infopage__foot">
    <a href="mailto:albertoalcu22@gmail.com">albertoalcu22@gmail.com</a>
    <a href="https://www.instagram.com/alberto_alcubilla_/" rel="noopener" target="_blank">Instagram</a>
  </footer>

  <script src="main.js?v=${JS_V}" defer></script>
</body>
</html>
`);

// The old address of the information page now lands on the home page.
writeFileSync('informacion.html', `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Alberto Alcubilla</title>
  <meta http-equiv="refresh" content="0; url=index.html">
  <link rel="canonical" href="index.html">
</head>
<body><a href="index.html">Alberto Alcubilla</a></body>
</html>
`);

console.log('Páginas generadas:', 5 + pageOrder.length + 1);
