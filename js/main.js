'use strict';

/* ════════════════════════════════════════════════
   TRASTES — Luthería de Autor · main.js
   1 · Tema visual (dark / light / system)
   2 · Navegación mobile
   3 · Hero fade-up inicial
   4 · Intersection Observer — reveal sections
   5 · Configurador interactivo de precio y SVG
   6 · Hotspots de anatomía acústica
   7 · Carrusel de testimonios
   8 · Timeline activado por scroll
   9 · Newsletter
════════════════════════════════════════════════ */

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ════════════════════════════════════════════════
   1 · TEMA VISUAL
════════════════════════════════════════════════ */
function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'system') {
    const sys = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    html.setAttribute('data-theme', sys);
  } else {
    html.setAttribute('data-theme', theme);
  }
}

function initTheme() {
  const saved = localStorage.getItem('trastes-theme') || 'system';
  applyTheme(saved);

  qsa('.theme-btn').forEach(btn => {
    const t = btn.dataset.theme;
    btn.setAttribute('aria-pressed', t === saved ? 'true' : 'false');
    btn.classList.toggle('active', t === saved);

    btn.addEventListener('click', () => {
      localStorage.setItem('trastes-theme', t);
      applyTheme(t);
      qsa('.theme-btn').forEach(b => {
        const active = b.dataset.theme === t;
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
        b.classList.toggle('active', active);
      });
    });
  });

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (localStorage.getItem('trastes-theme') === 'system') applyTheme('system');
  });
}

initTheme();


/* ════════════════════════════════════════════════
   2 · NAVEGACIÓN MOBILE
════════════════════════════════════════════════ */
const navToggle = qs('.nav-toggle');
const navLinks  = qs('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Cierra al hacer clic en un link
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Cierra al hacer clic fuera
  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ════════════════════════════════════════════════
   3 · HERO FADE-UP INICIAL
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      qsa('.animate-fade-up').forEach(el => el.classList.add('is-visible'));
    });
  });
});


/* ════════════════════════════════════════════════
   4 · INTERSECTION OBSERVER — REVEAL SECTIONS
════════════════════════════════════════════════ */
const revealOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealIO.unobserve(entry.target);
  });
}, revealOpts);

qsa('.reveal-section').forEach(el => revealIO.observe(el));

// Reveal items con stagger
const revealItemIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const items = entry.target.querySelectorAll('.reveal-item');
    items.forEach((item, i) => {
      setTimeout(() => item.classList.add('is-visible'), i * 120);
    });
    revealItemIO.unobserve(entry.target);
  });
}, revealOpts);

qsa('.garantias, .manifiesto').forEach(el => revealItemIO.observe(el));


/* ════════════════════════════════════════════════
   5 · CONFIGURADOR INTERACTIVO
════════════════════════════════════════════════ */
const BASE_PRICE = 2499;
const state = { dex: 0, strings: 0, body: 0, neck: 0, frets: 0 };

const priceEl   = qs('#total-price');
const bodyEl    = qs('#guitar-render');
const neckEl    = qs('#guitar-neck');
const fretsEls  = qsa('#guitar-render line[stroke]').filter(l => l.parentElement?.classList.contains('guitar-neck') === false ? false : true);
const labelBody = qs('#label-body-wood');
const labelNeck = qs('#label-neck-wood');
const labelFret = qs('#label-frets-type');

function updatePrice() {
  const total = BASE_PRICE + state.strings + state.body + state.neck + state.frets;
  if (!priceEl) return;
  priceEl.classList.add('updating');
  setTimeout(() => {
    priceEl.textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    priceEl.classList.remove('updating');
  }, 180);
}

function updateGuitarBody(color) {
  if (!bodyEl) return;
  bodyEl.style.setProperty('--guitar-body-color', color);
}

function updateGuitarNeck(color) {
  if (!bodyEl) return;
  bodyEl.style.setProperty('--guitar-neck-color', color);
}

function updateFretColor(color) {
  if (!bodyEl) return;
  bodyEl.style.setProperty('--fret-color', color);
}

qsa('.config-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    if (!group) return;

    // Desactivar hermanos del mismo grupo
    qsa(`.config-btn[data-group="${group}"]`).forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    state[group] = parseInt(btn.dataset.value, 10) || 0;

    // Actualizar colores del SVG y etiquetas
    if (group === 'body' && btn.dataset.color) {
      updateGuitarBody(btn.dataset.color);
      if (labelBody && btn.dataset.bodyLabel) labelBody.textContent = btn.dataset.bodyLabel;
    }
    if (group === 'neck' && btn.dataset.neckColor) {
      updateGuitarNeck(btn.dataset.neckColor);
      if (labelNeck && btn.dataset.neckLabel) labelNeck.textContent = btn.dataset.neckLabel;
    }
    if (group === 'frets' && btn.dataset.fretColor) {
      updateFretColor(btn.dataset.fretColor);
      if (labelFret && btn.dataset.fretLabel) labelFret.textContent = btn.dataset.fretLabel;
    }

    updatePrice();
  });
});

// Reset configurador
const resetBtn = qs('#reset-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    Object.keys(state).forEach(k => { state[k] = 0; });

    qsa('.config-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });

    // Activar primeros de cada grupo
    qsa('.config-options').forEach(group => {
      const first = group.querySelector('.config-btn');
      if (first) {
        first.classList.add('active');
        first.setAttribute('aria-pressed', 'true');
        // Aplicar valores por defecto
        if (first.dataset.color) updateGuitarBody(first.dataset.color);
        if (first.dataset.neckColor) updateGuitarNeck(first.dataset.neckColor);
        if (first.dataset.fretColor) updateFretColor(first.dataset.fretColor);
        if (first.dataset.bodyLabel && labelBody) labelBody.textContent = first.dataset.bodyLabel;
        if (first.dataset.neckLabel && labelNeck) labelNeck.textContent = first.dataset.neckLabel;
        if (first.dataset.fretLabel && labelFret) labelFret.textContent = first.dataset.fretLabel;
      }
    });

    updatePrice();
  });
}

// Botón de reserva
const reserveBtn = qs('#reserve-btn');
if (reserveBtn) {
  reserveBtn.addEventListener('click', () => {
    const total = BASE_PRICE + state.strings + state.body + state.neck + state.frets;
    const deposit = (total * 0.2).toLocaleString('en-US', { minimumFractionDigits: 2 });
    alert(`Tu configuración está lista.\n\nTotal: $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\nDepósito inicial (20%): $${deposit}\n\nEl luthier se pondrá en contacto para confirmar disponibilidad de slot.`);
  });
}


/* ════════════════════════════════════════════════
   6 · HOTSPOTS — ANATOMÍA ACÚSTICA
════════════════════════════════════════════════ */
let activeHotspot = null;

// Ubica la ficha al lado del punto, dentro de los límites del contenedor
function positionInfo(infoEl, spot) {
  const container = spot.closest('.blueprint-container');
  if (!container) return;
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const cx = spot.offsetLeft + spot.offsetWidth / 2;
  const cy = spot.offsetTop + spot.offsetHeight / 2;
  const iw = infoEl.offsetWidth;
  const ih = infoEl.offsetHeight;
  const gap = 22;

  let left;
  if (cx + gap + iw <= cw)        left = cx + gap;           // a la derecha del punto
  else if (cx - gap - iw >= 0)    left = cx - gap - iw;      // a la izquierda
  else                            left = (cw - iw) / 2;      // centrada

  let top = cy - ih / 2;                                     // alineada verticalmente
  top = Math.max(8, Math.min(ch - ih - 8, top));
  left = Math.max(8, Math.min(cw - iw - 8, left));

  infoEl.style.left = left + 'px';
  infoEl.style.top  = top + 'px';
}

qsa('.hotspot').forEach(spot => {
  const toggle = () => {
    const targetId = spot.dataset.target;
    const infoEl   = qs(`#${targetId}`);
    if (!infoEl) return;

    const isOpen = !infoEl.hidden;

    // Cerrar todos primero
    qsa('.hotspot-info').forEach(el => el.hidden = true);
    qsa('.hotspot').forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      infoEl.hidden = false;
      positionInfo(infoEl, spot);
      spot.classList.add('active');
      spot.setAttribute('aria-expanded', 'true');
      activeHotspot = spot;
    } else {
      activeHotspot = null;
    }
  };

  spot.addEventListener('click', toggle);
  spot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

// Cerrar con botón X
qsa('.info-close').forEach(btn => {
  btn.addEventListener('click', () => {
    qsa('.hotspot-info').forEach(el => el.hidden = true);
    qsa('.hotspot').forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-expanded', 'false');
    });
    if (activeHotspot) { activeHotspot.focus(); activeHotspot = null; }
  });
});

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    qsa('.hotspot-info').forEach(el => el.hidden = true);
    qsa('.hotspot').forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-expanded', 'false');
    });
  }
});


/* ════════════════════════════════════════════════
   7 · CARRUSEL DE TESTIMONIOS
════════════════════════════════════════════════ */
const track    = qs('#testimonios-track');
const prevBtn  = qs('#track-prev');
const nextBtn  = qs('#track-next');
const dotsWrap = qs('#track-dots');

if (track && prevBtn && nextBtn) {
  const cards = qsa('.testimonio-card', track);
  let current = 0;
  let autoTimer = null;

  // Crear dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'track-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    if (dotsWrap) dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    const cardWidth = cards[0].offsetWidth + 24; // gap 1.5rem ≈ 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    if (dotsWrap) {
      qsa('.track-dot', dotsWrap).forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  prevBtn.addEventListener('click', () => { goTo(current - 1); stopAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); stopAuto(); });

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); stopAuto(); }
  }, { passive: true });

  // Recalcular en resize
  window.addEventListener('resize', () => goTo(current), { passive: true });

  startAuto();
}


/* ════════════════════════════════════════════════
   8 · TIMELINE ACTIVADO POR SCROLL
════════════════════════════════════════════════ */
const timelineIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    timelineIO.unobserve(entry.target);
  });
}, { threshold: 0.25 });

qsa('.timeline-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.12}s`;
  timelineIO.observe(item);
});


/* ════════════════════════════════════════════════
   9 · NEWSLETTER
════════════════════════════════════════════════ */
const newsletterForm    = qs('#newsletter-form');
const newsletterSuccess = qs('#newsletter-success');
const newsletterDismiss = qs('#newsletter-dismiss');
const newsletterError   = qs('#newsletter-error');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();

    const emailInput   = qs('#newsletter-email', newsletterForm);
    const consentInput = qs('#newsletter-consent', newsletterForm);

    // Validación
    if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      if (newsletterError) newsletterError.textContent = 'Por favor ingresá un correo válido.';
      emailInput.focus();
      return;
    }
    if (!consentInput.checked) {
      if (newsletterError) newsletterError.textContent = 'Debes aceptar recibir las alertas para continuar.';
      consentInput.focus();
      return;
    }
    if (newsletterError) newsletterError.textContent = '';

    // Simular envío exitoso
    newsletterForm.querySelector('.newsletter-field').hidden = true;
    newsletterForm.querySelector('.newsletter-consent').hidden = true;
    newsletterForm.querySelector('.newsletter-actions').hidden = true;
    if (newsletterSuccess) newsletterSuccess.hidden = false;
  });
}

if (newsletterDismiss) {
  newsletterDismiss.addEventListener('click', () => {
    const section = newsletterDismiss.closest('.newsletter');
    if (section) section.style.opacity = '0.5';
  });
}
