// Alberto Alcubilla · interacciones

document.documentElement.classList.add('js');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const wide = () => innerWidth >= 900;

/* ---------- Reel (home): the full reel starts on its own, muted (browsers allow no sound before a click) ---------- */
const reel = document.querySelector('.reel');
if (reel) {
  const video = reel.querySelector('.reel__video');
  const full = () => (wide() ? video.dataset.fullLg : video.dataset.fullSm);
  if (!reduceMotion && !saveData) {
    video.src = full();
    video.play().catch(() => {});
  }
  // "Ver reel con sonido" restarts it from the top with sound and controls.
  reel.querySelector('button.reel__play').addEventListener('click', () => {
    reel.classList.add('is-playing');
    Object.assign(video, { loop: false, muted: false, controls: true, preload: 'auto' });
    if (!video.src) video.src = full();
    video.currentTime = 0;
    video.play().catch(() => {});
    video.focus();
  });
}

/* ---------- Grid ---------- */
const items = [...document.querySelectorAll('.item')];

// Clips loop while they are on screen, like a wall of monitors; they rest on their poster otherwise.
const clips = document.querySelectorAll('.item__video');
if (clips.length && !reduceMotion && !saveData) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { rootMargin: '100px' });
  clips.forEach((v) => io.observe(v));
}

// Images settle into place as they enter (always visible; only the scale moves).
if (!reduceMotion && items.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('is-pending');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((item) => {
    if (item.getBoundingClientRect().top > innerHeight) {
      item.classList.add('is-pending');
      io.observe(item);
    }
  });
}

// The project title rides the cursor over the work.
if (finePointer && items.length) {
  const label = document.createElement('div');
  label.className = 'cursor-title';
  label.setAttribute('aria-hidden', 'true');
  document.body.append(label);
  let x = 0, y = 0, frame = 0;
  const place = () => {
    frame = 0;
    label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  };
  items.forEach((item) => {
    if (item.classList.contains('item--reel')) return;
    item.addEventListener('pointerenter', () => {
      label.textContent = item.dataset.title;
      label.classList.add('is-on');
    });
    item.addEventListener('pointerleave', () => label.classList.remove('is-on'));
  });
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!frame) frame = requestAnimationFrame(place);
  }, { passive: true });
  addEventListener('scroll', () => label.classList.remove('is-on'), { passive: true });
}

/* ---------- Información: footage behind the statement, panels for the longer reads ---------- */
const infoBg = document.querySelector('.infopage__bg video');
if (infoBg) {
  if (!reduceMotion && !saveData) {
    infoBg.src = wide() ? infoBg.dataset.loopLg : infoBg.dataset.loopSm;
    infoBg.play().catch(() => {});
  }
  const panelLinks = [...document.querySelectorAll('[data-info-panel]')];
  const panels = panelLinks.map((link) => document.getElementById(link.dataset.infoPanel)).filter(Boolean);
  const closeAll = () => {
    panels.forEach((panel) => { panel.hidden = true; });
    document.body.classList.remove('is-panel');
  };
  const openPanel = (id) => {
    closeAll();
    const panel = document.getElementById(id);
    if (!panel) return;
    panel.hidden = false;
    document.body.classList.add('is-panel');
  };
  panelLinks.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const id = link.dataset.infoPanel;
    const panel = document.getElementById(id);
    if (panel && !panel.hidden) {
      closeAll();
      history.replaceState(null, '', location.pathname + location.search);
    } else {
      history.pushState(null, '', `#${id}`);
      openPanel(id);
    }
  }));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
      history.replaceState(null, '', location.pathname + location.search);
    }
  });

  // Links from the other pages (index.html#formacion, #creditos) arrive with that panel open.
  const fromHash = panelLinks.find((link) => `#${link.dataset.infoPanel}` === location.hash);
  if (fromHash) openPanel(fromHash.dataset.infoPanel);
}

/* ---------- Project page: centred slides ---------- */
const track = document.querySelector('.slides');
if (track) {
  const slides = [...track.querySelectorAll('.slide')];
  const count = document.querySelector('[data-count]');
  let index = 0;

  const go = (i, smooth = true) => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides[index].scrollIntoView({ inline: 'center', block: 'nearest', behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  };

  // Start on the slide named in the hash (#2), otherwise the first.
  const start = parseInt(location.hash.slice(1), 10);
  requestAnimationFrame(() => go(Number.isFinite(start) ? start - 1 : 0, false));

  const seen = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      index = slides.indexOf(e.target);
      count.textContent = index + 1;
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((s) => seen.observe(s));

  addEventListener('keydown', (e) => {
    if (document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    if (e.key === 'Escape') document.querySelector('.pbar__close').click();
  });

  // Clicking a video slide that is off to the side brings it to the centre.
  slides.forEach((s, i) => s.addEventListener('click', (e) => {
    if (i !== index && !s.querySelector('img') && !e.target.closest('button')) { e.preventDefault(); go(i); }
  }));

  // Images open full size in a modal; the arrows step through them, Esc or a click on the image closes it.
  const pics = slides.filter((s) => s.querySelector('img'));
  if (pics.length) {
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Imagen ampliada');
    box.innerHTML = `<span class="lightbox__count"></span><button class="lightbox__hd" type="button" aria-pressed="false" hidden>HD</button><button class="lightbox__close" type="button">Cerrar</button><img alt="">${
      pics.length > 1 ? '<button class="lightbox__prev" type="button">Anterior</button><button class="lightbox__next" type="button">Siguiente</button>' : ''}`;
    document.body.append(box);
    const big = box.querySelector('img');
    const hdBtn = box.querySelector('.lightbox__hd');
    // Full-resolution originals load only on request; the choice is remembered.
    let hdOn = false;
    try { hdOn = localStorage.getItem('hd') === '1'; } catch {}
    let at = 0;
    const show = (n) => {
      at = (n + pics.length) % pics.length;
      const img = pics[at].querySelector('img');
      const hd = img.dataset.hd;
      hdBtn.hidden = !hd;
      hdBtn.setAttribute('aria-pressed', String(Boolean(hd && hdOn)));
      big.src = hd && hdOn ? hd : img.currentSrc || img.src;
      big.alt = img.alt;
      box.querySelector('.lightbox__count').textContent = `${at + 1} / ${pics.length}`;
      go(slides.indexOf(pics[at]), false);
    };
    box.tabIndex = -1;
    pics.forEach((s, n) => s.addEventListener('click', () => { show(n); box.showModal(); box.focus(); }));
    box.addEventListener('click', (e) => {
      if (e.target.closest('.lightbox__hd')) {
        hdOn = !hdOn;
        try { localStorage.setItem('hd', hdOn ? '1' : '0'); } catch {}
        show(at);
      } else if (e.target.closest('.lightbox__prev')) show(at - 1);
      else if (e.target.closest('.lightbox__next')) show(at + 1);
      else box.close();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    });
  }

  // Vertical wheel scrolls the strip sideways.
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { track.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });

  track.querySelectorAll('.slide--video').forEach((fig) => {
    const v = fig.querySelector('video');
    fig.querySelector('.slide__play').addEventListener('click', () => {
      fig.classList.add('is-playing');
      v.controls = true;
      v.play().catch(() => {});
    });
  });

  // The project info stays on screen; minimising it is remembered from one project to the next.
  const info = document.getElementById('info');
  const infoBtn = info.querySelector('.pinfo__toggle');
  const setInfo = (open) => {
    info.classList.toggle('is-min', !open);
    infoBtn.setAttribute('aria-expanded', String(open));
    infoBtn.textContent = open ? 'Minimizar' : 'Ver info';
  };
  try { if (localStorage.getItem('pinfo') === 'min') setInfo(false); } catch {}
  infoBtn.addEventListener('click', () => {
    const open = info.classList.contains('is-min');
    setInfo(open);
    try { localStorage.setItem('pinfo', open ? 'open' : 'min'); } catch {}
  });

  // "Cerrar" returns to the grid the visitor came from.
  document.querySelector('.pbar__close').addEventListener('click', (e) => {
    if (document.referrer.startsWith(location.origin) && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}
