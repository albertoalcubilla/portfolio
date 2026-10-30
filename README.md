# Alberto Alcubilla · Director de Fotografía

Web estática (HTML + CSS + JS, sin dependencias) lista para GitHub Pages.

## Páginas

- `index.html`: la portada. Nombre y oficio sobre su propio vídeo, arriba los botones Trabajos, Formación y Créditos (estos dos abren un panel; `index.html#formacion` y `#creditos` llegan con él abierto) y abajo el contacto.
- `trabajos.html`: todos los trabajos (reel, DoP, Gaffer y rodaje).
- `dop.html`, `gaffer.html`, `rodaje.html`: las páginas de la barra de abajo.
- `trabajos/<proyecto>.html`: una página por proyecto, con el vídeo completo y hasta 8 fotos.
- `informacion.html`: solo redirige a la portada (la dirección antigua).

Todas se generan con `tools/build.mjs` a partir de `tools/projects.json`. Para añadir o cambiar un proyecto, edita ese JSON y regenera (ver abajo); no edites los HTML a mano.

## Estructura

- `styles.css`, `main.js`: estilos e interacciones de todas las páginas.
- `assets/web/`: fotos (WebP) y vídeos (MP4 H.264) optimizados; `assets/web/video/clips/` tiene un clip por proyecto cortado del reel.
- `assets/fonts/`: Archivo e Instrument Serif, alojadas en el propio sitio (licencia OFL).
- `assets/img/` y `assets/video/`: originales sin optimizar. Están en `.gitignore` y no se suben.
- `tools/`: scripts para regenerar medios y páginas.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
2. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**, elige `main` y `/ (root)`.
3. En un par de minutos la web estará en `https://<usuario>.github.io/<repositorio>/`.

## Regenerar

```bash
cd tools && npm install && cd ..
```

```bash
node tools/fetch-canva.mjs
```

```bash
node tools/frames.mjs
```

```bash
node tools/optimize.mjs
```

```bash
node tools/clips.mjs
```

```bash
node tools/masters.mjs
```

```bash
node tools/build.mjs
```

`fetch-canva.mjs` descarga los vídeos completos y las galerías de la antigua web de Canva, `frames.mjs` completa cada galería con fotogramas del propio vídeo (segundos en `projects.json` → `frames`), `optimize.mjs` recorta y comprime las fotos y el reel, `clips.mjs` corta un fragmento por proyecto (tiempos `clip.start` / `clip.end` en `projects.json`) y publica cada vídeo completo en dos calidades, `masters.mjs` las rehace desde los masters cuando los hay, y `build.mjs` genera todas las páginas.

## Calidad de vídeo y fotos

- En la página se reproduce la versión ligera (`films/<proyecto>-sd.mp4`, 540p), que carga rápido también con datos móviles.
- El botón **Ver en HD** abre directamente el archivo a calidad completa (`films/<proyecto>.mp4`). Para enlazar a otro sitio (Vimeo, YouTube, Drive), pon la dirección en `projects.json` → `film.hd`.
- Masters: guarda el vídeo original como `assets/video/masters/<proyecto>.mov` (o `.mp4`), y el reel como `masters/reel.mov`, y ejecuta `node tools/masters.mjs`. Ahora mismo hay masters 1080p de Emperatriz, Hot Girl Summer, Habitada, Cuando nadie me ve, Volver a caer y el reel; Desertoris, Paranoia, Ver la luz y Dimension solo están en 720p.
- Fotos en HD: guarda los originales como `assets/img/gallery-hd/<proyecto>-<n>.jpg` (mismo nombre que la foto de la galería) y ejecuta `optimize.mjs` y `build.mjs`. El modal mostrará un botón **HD** en esas fotos.

Cada archivo HD se mantiene por debajo de 95 MB: GitHub no acepta archivos de más de 100 MB y avisará de los que pasan de 50 MB; es normal.
