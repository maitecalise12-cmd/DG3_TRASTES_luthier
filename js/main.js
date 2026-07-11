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
   1 · TEMA VISUAL — siempre oscuro
   La estética de la marca es negro; nunca modo claro.
════════════════════════════════════════════════ */
document.documentElement.setAttribute('data-theme', 'dark');
localStorage.setItem('trastes-theme', 'dark');


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

qsa('.garantias, .manifiesto, .versus, .cursos, .curso-modulos, .curso-incluye').forEach(el => revealItemIO.observe(el));


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
const swapImg   = qs('#guitar-swap');
const neckTint  = qs('#guitar-neck-tint');

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
    if (group === 'body') {
      if (btn.dataset.color) updateGuitarBody(btn.dataset.color);
      if (labelBody && btn.dataset.bodyLabel) labelBody.textContent = btn.dataset.bodyLabel;
      if (swapImg && btn.dataset.photo) {
        swapImg.src = btn.dataset.photo;
        swapImg.alt = 'Guitarra con cuerpo de ' + (btn.dataset.bodyLabel || '');
      }
    }
    if (group === 'neck' && btn.dataset.neckColor) {
      updateGuitarNeck(btn.dataset.neckColor);
      if (labelNeck && btn.dataset.neckLabel) labelNeck.textContent = btn.dataset.neckLabel;
      if (neckTint) neckTint.style.background = btn.dataset.neckColor;
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
        if (first.dataset.photo && swapImg) swapImg.src = first.dataset.photo;
        if (first.dataset.neckLabel && labelNeck) labelNeck.textContent = first.dataset.neckLabel;
        if (first.dataset.neckColor && neckTint) neckTint.style.background = first.dataset.neckColor;
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

// Ubica la ficha ARRIBA del punto, dentro de los límites del contenedor
function positionInfo(infoEl, spot) {
  const container = spot.closest('.blueprint-container');
  if (!container) return;
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const cx = spot.offsetLeft + spot.offsetWidth / 2;
  const iw = infoEl.offsetWidth;
  const ih = infoEl.offsetHeight;
  const gap = 22;

  // Centrada horizontalmente sobre el punto
  let left = cx - iw / 2;
  // Por encima del punto; si no entra arriba, la pone abajo
  let top = spot.offsetTop - gap - ih;
  if (top < 8) top = spot.offsetTop + spot.offsetHeight + gap;

  left = Math.max(8, Math.min(cw - iw - 8, left));
  top  = Math.max(8, Math.min(ch - ih - 8, top));

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
   6.5 · FLIP-CARDS DE MADERAS
════════════════════════════════════════════════ */
const MADERA_ATTRS = ['Graves', 'Agudos', 'Proyección', 'Resonancia'];
const maderaCards = qsa('.madera-card');
maderaCards.forEach(card => {
  const flip = () => {
    const willOpen = !card.classList.contains('flipped');
    // Cierra todas, así solo una queda dada vuelta a la vez
    maderaCards.forEach(c => c.classList.remove('flipped'));
    if (willOpen) card.classList.add('flipped');
  };
  card.addEventListener('click', flip);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });

  const frontImg = card.querySelector('.madera-card-front img');
  const back = card.querySelector('.madera-card-back');
  const inner = card.querySelector('.madera-card-inner');
  const name = card.dataset.name || '';
  const ratings = (card.dataset.ratings || '').split(',').map(n => parseInt(n, 10) || 0);

  // Dorso: la misma imagen (silueta), tintada de rojo, como fondo
  if (frontImg && back && !back.querySelector('.madera-back-fill')) {
    const fill = document.createElement('img');
    fill.className = 'madera-back-fill';
    fill.src = frontImg.getAttribute('src');
    fill.alt = '';
    fill.setAttribute('aria-hidden', 'true');
    back.prepend(fill);
  }
  // Dorso: rating de estrellas (sin nombre)
  if (back && !back.querySelector('.madera-ratings')) {
    const wrap = document.createElement('div');
    wrap.className = 'madera-ratings';
    MADERA_ATTRS.forEach((attr, i) => {
      const row = document.createElement('div');
      row.className = 'mr-row';
      const lab = document.createElement('span');
      lab.className = 'mr-label';
      lab.textContent = attr;
      const stars = document.createElement('span');
      stars.className = 'mr-stars';
      const v = ratings[i] || 0;
      for (let s = 0; s < 5; s++) {
        const star = document.createElement('i');
        star.className = s < v ? 'on' : 'off';
        star.textContent = '★';
        stars.appendChild(star);
      }
      row.appendChild(lab);
      row.appendChild(stars);
      wrap.appendChild(row);
    });
    back.appendChild(wrap);
  }
  // Nombre debajo de la card
  if (inner && name && !card.querySelector('.madera-name')) {
    const nm = document.createElement('span');
    nm.className = 'madera-name';
    nm.textContent = name;
    card.appendChild(nm);
  }
});

/* Cards de papel rasgado: al tocar, esa card se da vuelta (info en el dorso) y pasa al frente */
const tornCards = qsa('.torn-card');
tornCards.forEach(card => {
  const toggle = () => {
    const wasActive = card.classList.contains('active');
    tornCards.forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    if (!wasActive) {
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');
    }
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});


/* ════════════════════════════════════════════════
   6.6 · GRÁFICO DE CARÁCTER TONAL (60% / 40%)
════════════════════════════════════════════════ */
const tonoBlock = qs('.materia-tono');
if (tonoBlock) {
  const tonoIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      tonoBlock.classList.add('is-visible');

      qsa('.tono-pct', tonoBlock).forEach(el => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1500;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + '%';
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      tonoIO.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  tonoIO.observe(tonoBlock);
}


/* ════════════════════════════════════════════════
   6.7 · DOODLES ROCKEROS — PARALLAX AL SCROLL
════════════════════════════════════════════════ */
const doodleZone = qs('.doodle-zone');
const doodleEls  = qsa('.doodle');
if (doodleZone && doodleEls.length) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = doodleEls.map((el, i) => ({
    el,
    rot:   parseFloat(el.dataset.rot)   || 0,
    drift: parseFloat(el.dataset.speed) || 30,   // amplitud del parallax
    cur: 0, target: 0, base: 0, h: 0,
    wAmp:  4 + (i % 4) * 2,          // giro suave sobre su eje (4–10°)
    wFreq: 0.35 + (i % 3) * 0.12,
    phase: i * 1.3
  }));

  // Posición base de cada doodle dentro de la zona (independiente del transform)
  const measure = () => items.forEach(it => { it.base = it.el.offsetTop; it.h = it.el.offsetHeight; });

  const computeTargets = () => {
    const zoneTop = doodleZone.getBoundingClientRect().top;
    const vh = window.innerHeight;
    items.forEach(it => {
      const center = zoneTop + it.base + it.h / 2;
      const fromCenter = (center - vh / 2) / vh;   // -~1 (arriba) .. ~1 (abajo)
      it.target = fromCenter * -it.drift * 1.6;    // parallax muy suave (flotan/caen levemente)
    });
  };

  if (reduce) {
    items.forEach(it => { it.el.style.transform = `rotate(${it.rot}deg)`; });
  } else {
    const loop = (now) => {
      const t = now / 1000;
      items.forEach(it => {
        it.cur += (it.target - it.cur) * 0.07;                        // interpolación → fluidez
        const wobble = Math.sin(t * it.wFreq + it.phase) * it.wAmp;   // giro sobre su eje
        it.el.style.transform =
          `translate3d(0, ${it.cur.toFixed(1)}px, 0) rotate(${(it.rot + wobble).toFixed(1)}deg)`;
      });
      requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', computeTargets, { passive: true });
    window.addEventListener('resize', () => { measure(); computeTargets(); }, { passive: true });
    measure();
    computeTargets();
    requestAnimationFrame(loop);
  }
}


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
   7.5 · CARRUSEL DE FOTOS — LUTHERÍA (sección VS)
════════════════════════════════════════════════ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

qsa('.vs-carousel').forEach(carousel => {
  const slides = qsa('.vs-slide', carousel);
  if (slides.length < 2 || reduceMotion) return;

  const interval = parseInt(carousel.dataset.interval, 10) || 3200;
  let i = 0;

  setInterval(() => {
    slides[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
  }, interval);
});


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

const timelineItems = qsa('.timeline-item');
timelineItems.forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.12}s`;
  timelineIO.observe(item);

  // Cada nota/título despliega su descripción (acordeón: solo una abierta a la vez)
  const dot = qs('.timeline-dot', item);
  const h3  = qs('.timeline-content h3', item);
  const toggle = () => {
    const willOpen = !item.classList.contains('open');
    // Cerrar todas
    timelineItems.forEach(it => {
      it.classList.remove('open');
      const d = qs('.timeline-dot', it);
      if (d) d.setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('open');
      if (dot) dot.setAttribute('aria-expanded', 'true');
    }
  };
  if (dot) {
    dot.removeAttribute('aria-hidden');
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('aria-expanded', 'false');
    dot.addEventListener('click', toggle);
    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }
  if (h3) h3.addEventListener('click', toggle);
});


/* ════════════════════════════════════════════════
   8.5 · FORMULARIO DE CONTACTO (mailto)
════════════════════════════════════════════════ */
const contactoForm = qs('#contacto-form');
if (contactoForm) {
  const CONTACT_EMAIL = 'taller@trastes.com'; // ← cambiar por el email real
  contactoForm.addEventListener('submit', e => {
    e.preventDefault();
    const nombre  = qs('#c-nombre', contactoForm).value.trim();
    const email   = qs('#c-email', contactoForm).value.trim();
    const mensaje = qs('#c-mensaje', contactoForm).value.trim();
    const note    = qs('#contacto-note', contactoForm);

    if (!nombre || !email || !mensaje) {
      if (note) note.textContent = 'Completá todos los campos para enviar tu mensaje.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (note) note.textContent = 'Ingresá un email válido.';
      return;
    }

    const subject = encodeURIComponent(`Consulta de ${nombre} — Trastes`);
    const body    = encodeURIComponent(`${mensaje}\n\n— ${nombre} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    if (note) note.textContent = 'Abrimos tu correo para que envíes el mensaje. ¡Gracias por escribir!';
  });
}


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


/* ════════════════════════════════════════════════
   11 · Conteo animado de los datos del curso
════════════════════════════════════════════════ */
const datoNums = qsa('.dato-num');
if (datoNums.length) {
  const countUp = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target; // siempre termina en el valor correcto
    };
    requestAnimationFrame(step);
  };

  // Empezar en 0
  datoNums.forEach((el) => { el.textContent = '0'; });

  // Disparar al entrar en pantalla (una vez)
  const datoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        datoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  datoNums.forEach((el) => datoObserver.observe(el));

  // Re-disparar al pasar el mouse por la lista
  const datosList = qs('.curso-datos');
  if (datosList) {
    datosList.addEventListener('mouseenter', () => {
      datoNums.forEach((el) => countUp(el));
    });
  }
}
