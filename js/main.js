/* ═══════════════════════════════════════════════════════════════
   MG.PORTFOLIO — SEGUNDA ITERACIÓN — main.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── SCROLL PROGRESS ──────────────────────────────────────────── */
const scrollProgress = document.createElement('div');
scrollProgress.id = 'scroll-progress';
document.body.prepend(scrollProgress);

/* ── BACK TO TOP ──────────────────────────────────────────────── */
const backTop = document.createElement('button');
backTop.id = 'back-top';
backTop.innerHTML = '&#8679;';
backTop.title = 'Volver arriba';
backTop.setAttribute('aria-label', 'Volver arriba');
document.body.appendChild(backTop);
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── SECTION INDICATOR ────────────────────────────────────────── */
const sections = ['inicio', 'sobre-mi', 'actividades', 'certificados', 'evidencias', 'habilidades', 'contacto'];
const si = document.createElement('nav');
si.id = 'section-indicator';
si.setAttribute('aria-label', 'Indicador de sección');
sections.forEach(id => {
  const dot = document.createElement('a');
  dot.className = 'si-dot';
  dot.href = '#' + id;
  dot.setAttribute('aria-label', id);
  dot.dataset.section = id;
  si.appendChild(dot);
});
document.body.appendChild(si);

/* ── CANVAS BACKGROUND ────────────────────────────────────────── */
const canvas = document.createElement('canvas');
canvas.id = 'bg-canvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

let W, H, particles = [], mouseX = 0, mouseY = 0;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

/* Particles */
class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.opacity = Math.random() * 0.5 + 0.1;
    this.life = 1;
    this.decay = Math.random() * 0.002 + 0.0005;
    this.color = Math.random() > 0.6 ? '#c8ff00' : Math.random() > 0.5 ? '#06b6d4' : '#7c3aed';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    if (this.life <= 0 || this.y < -10) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life * this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

/* Grid lines */
function drawGrid() {
  const scrollY = window.scrollY * 0.1;
  const sz = 60;
  ctx.strokeStyle = 'rgba(200,255,0,0.025)';
  ctx.lineWidth = 0.5;
  const ox = (mouseX * 0.02) % sz;
  const oy = (mouseY * 0.02 + scrollY) % sz;
  ctx.beginPath();
  for (let x = -sz + ox; x < W + sz; x += sz) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  for (let y = -sz + oy; y < H + sz; y += sz) {
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();
}

/* Radial glow near cursor */
function drawGlow() {
  const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 350);
  grd.addColorStop(0, 'rgba(200,255,0,0.04)');
  grd.addColorStop(0.5, 'rgba(59,130,246,0.02)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

/* Shooting stars */
let stars = [];
function maybeShoot() {
  if (Math.random() < 0.003) {
    stars.push({
      x: Math.random() * W,
      y: 0,
      len: Math.random() * 80 + 40,
      speed: Math.random() * 6 + 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      life: 1,
      color: Math.random() > 0.5 ? '#c8ff00' : '#06b6d4'
    });
  }
  stars = stars.filter(s => {
    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.life -= 0.02;
    if (s.life <= 0) return false;
    ctx.save();
    ctx.globalAlpha = s.life * 0.8;
    ctx.strokeStyle = s.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = s.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
    ctx.stroke();
    ctx.restore();
    return true;
  });
}

let raf;
function animateBG() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  drawGlow();
  particles.forEach(p => { p.update(); p.draw(); });
  maybeShoot();
  raf = requestAnimationFrame(animateBG);
}
animateBG();

/* ── CURSOR ───────────────────────────────────────────────────── */
const curDot  = document.getElementById('curDot');
const curRing = document.getElementById('curRing');

let cx = 0, cy = 0, rx = 0, ry = 0;
let trailTimeout;

document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;

  curDot.style.left  = cx + 'px';
  curDot.style.top   = cy + 'px';

  mouseX = cx; mouseY = cy;

  // Spawn trail
  clearTimeout(trailTimeout);
  const trail = document.createElement('div');
  trail.className = 'cur-trail';
  trail.style.left = cx + 'px';
  trail.style.top  = cy + 'px';
  document.body.appendChild(trail);
  trailTimeout = setTimeout(() => trail.remove(), 600);
}, { passive: true });

function animateCursor() {
  rx += (cx - rx) * 0.14;
  ry += (cy - ry) * 0.14;
  curRing.style.left = rx + 'px';
  curRing.style.top  = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* Cursor reactions */
const interactBtns = document.querySelectorAll('a, button, [role="button"]');
const interactImgs = document.querySelectorAll('img, .eg-item, .cert-img-wrap');
const interactText = document.querySelectorAll('p, li');

interactBtns.forEach(el => {
  el.addEventListener('mouseenter', () => curRing.classList.add('on-btn'));
  el.addEventListener('mouseleave', () => curRing.classList.remove('on-btn'));
});
interactImgs.forEach(el => {
  el.addEventListener('mouseenter', () => curRing.classList.add('on-img'));
  el.addEventListener('mouseleave', () => curRing.classList.remove('on-img'));
});
interactText.forEach(el => {
  el.addEventListener('mouseenter', () => curRing.classList.add('on-text'));
  el.addEventListener('mouseleave', () => curRing.classList.remove('on-text'));
});

/* ── HEADER SCROLL ───────────────────────────────────────────── */
const header = document.getElementById('header');
let lastScroll = 0;

function onScroll() {
  const y = window.scrollY;

  /* scroll progress bar */
  const total = document.body.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (y / total * 100) + '%';

  /* header sticky */
  if (y > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  /* back to top */
  if (y > 400) {
    backTop.classList.add('visible');
  } else {
    backTop.classList.remove('visible');
  }

  /* section indicator active */
  document.querySelectorAll('section[id], div[id]').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const dot = si.querySelector('[data-section="' + sec.id + '"]');
    if (!dot) return;
    if (rect.top < H * 0.5 && rect.bottom > H * 0.3) {
      si.querySelectorAll('.si-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    }
  });

  /* nav link active */
  document.querySelectorAll('section[id]').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < 120 && rect.bottom > 0) {
      document.querySelectorAll('.nl').forEach(n => n.classList.remove('active'));
      const a = document.querySelector(`.nl[href="#${sec.id}"]`);
      if (a) a.classList.add('active');
    }
  });

  lastScroll = y;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── BURGER MENU ──────────────────────────────────────────────── */
const burger = document.getElementById('burger');
const mnav   = document.getElementById('mnav');

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  mnav.classList.toggle('open');
  mnav.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open));
});

mnav.querySelectorAll('.mnl').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mnav.classList.remove('open');
    mnav.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ── LIGHTBOX ─────────────────────────────────────────────────── */
const lb      = document.getElementById('lb');
const lbBg    = document.getElementById('lbBg');
const lbClose = document.getElementById('lbClose');
const lbImg   = document.getElementById('lbImg');

function openLB(src, alt) {
  lbImg.src = src;
  lbImg.alt = alt || '';
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 400);
}

document.querySelectorAll('[data-lb-src]').forEach(el => {
  el.addEventListener('click', () => openLB(el.dataset.lbSrc, el.dataset.lbAlt));
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLB(el.dataset.lbSrc, el.dataset.lbAlt); });
});

/* Also gallery items */
document.querySelectorAll('.eg-item[data-lb-src]').forEach(el => {
  el.addEventListener('click', () => openLB(el.dataset.lbSrc, el.dataset.lbAlt));
});

lbBg.addEventListener('click', closeLB);
lbClose.addEventListener('click', closeLB);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

/* ── INTERSECTION OBSERVER — REVEAL ───────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .reveal-blur').forEach(el => {
  revealObs.observe(el);
});

/* ── SKILLS BARS ──────────────────────────────────────────────── */
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const bar = entry.target;
    const pct = parseInt(bar.dataset.pct) || 0;
    const fill = bar.querySelector('.sbar-fill');
    const num  = bar.querySelector('.sbar-n');

    // Animate fill width
    setTimeout(() => {
      fill.style.width = pct + '%';
    }, 100 + parseFloat(getComputedStyle(bar).getPropertyValue('--di') || '0') * 1000);

    // Animate counter
    let start = 0;
    const duration = 1400;
    const step = () => {
      const elapsed = performance.now() - startTime;
      start = Math.min(Math.round((elapsed / duration) * pct), pct);
      num.textContent = start + '%';
      if (start < pct) requestAnimationFrame(step);
    };
    const delay = 150 + parseFloat(getComputedStyle(bar).getPropertyValue('--di') || '0') * 1000;
    let startTime;
    setTimeout(() => { startTime = performance.now(); requestAnimationFrame(step); }, delay);

    skillObs.unobserve(bar);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.sbar').forEach(b => skillObs.observe(b));

/* ── 3D TILT ON CARDS ─────────────────────────────────────────── */
function initTilt(el) {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top)  / r.height;
    const rx2 = (my - 0.5) * -14;
    const ry2 = (mx - 0.5) *  14;

    el.style.transform = `perspective(900px) rotateX(${rx2}deg) rotateY(${ry2}deg) translateZ(8px)`;
    el.style.setProperty('--mx', (mx * 100) + '%');
    el.style.setProperty('--my', (my * 100) + '%');
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
  });
}

document.querySelectorAll('[data-tilt]').forEach(initTilt);

/* ── PYTHON LOGO PARALLAX ─────────────────────────────────────── */
const pFrame = document.getElementById('pFrame');
if (pFrame) {
  document.addEventListener('mousemove', e => {
    const cx2 = window.innerWidth  / 2;
    const cy2 = window.innerHeight / 2;
    const dx = (e.clientX - cx2) / cx2;
    const dy = (e.clientY - cy2) / cy2;
    const logo = pFrame.querySelector('.python-logo');
    if (logo) {
      logo.style.transform = `translate(${dx * 12}px, ${dy * 12}px)`;
    }
    // Dynamic halo
    pFrame.style.boxShadow = `
      0 0 0 1px rgba(200,255,0,${0.1 + Math.abs(dx) * 0.15}),
      0 0 ${40 + Math.abs(dx) * 40}px rgba(200,255,0,${0.1 + Math.abs(dx) * 0.15}),
      0 0 ${80 + Math.abs(dy) * 60}px rgba(200,255,0,${0.05 + Math.abs(dy) * 0.1}),
      ${dx * 20}px ${dy * 20}px 60px rgba(59,130,246,0.1)
    `;
  }, { passive: true });
}

/* ── ORBIT SYSTEM ─────────────────────────────────────────────── */
(function buildOrbit() {
  const heroRight = document.getElementById('heroRight');
  if (!heroRight) return;

  // Orbit container
  const sys = document.createElement('div');
  sys.className = 'orbit-system';
  heroRight.appendChild(sys);

  // Rings
  [1, 2, 3].forEach(n => {
    const ring = document.createElement('div');
    ring.className = `orbit-ring r${n}`;
    sys.appendChild(ring);
  });

  // Items
  const items = [
    { label: 'HTML',     radius: 220, speed: 12,  angle: 0   },
    { label: 'CSS',      radius: 220, speed: 12,  angle: 60  },
    { label: 'JS',       radius: 220, speed: 12,  angle: 120 },
    { label: 'Flask',    radius: 220, speed: 12,  angle: 180 },
    { label: 'SQLite',   radius: 220, speed: 12,  angle: 240 },
    { label: 'Git',      radius: 220, speed: 12,  angle: 300 },
    { label: 'Docker',   radius: 280, speed: 18,  angle: 30  },
    { label: 'Linux',    radius: 280, speed: 18,  angle: 110 },
    { label: 'Python',   radius: 280, speed: 18,  angle: 200 },
    { label: 'VS Code',  radius: 280, speed: 18,  angle: 290 },
    { label: 'Terminal', radius: 340, speed: 24,  angle: 70  },
  ];

  const orbitEls = items.map(item => {
    const el = document.createElement('div');
    el.className = 'orbit-item';
    el.textContent = item.label;
    sys.appendChild(el);
    return { el, ...item };
  });

  const cx2 = 0, cy2 = 0; // relative to center of heroRight

  function animateOrbits(t) {
    orbitEls.forEach(({ el, radius, speed, angle }) => {
      const a = (angle + t / speed) * (Math.PI / 180);
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
      // fade by depth
      const depth = (Math.sin(a) + 1) / 2;
      el.style.opacity = 0.3 + depth * 0.7;
      el.style.scale = 0.7 + depth * 0.4;
      el.style.zIndex = Math.round(depth * 10);
    });
    requestAnimationFrame(animateOrbits);
  }
  requestAnimationFrame(animateOrbits);
})();

/* ── SCRAMBLE TEXT ON HERO TITLE ──────────────────────────────── */
(function scrambleHero() {
  const chars = '!<>-_\\/[]{}—=+*^?#0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const els = document.querySelectorAll('.ht');
  els.forEach((el, i) => {
    const original = el.textContent;
    const delay = 0.4 + i * 0.15;
    setTimeout(() => {
      let iter = 0;
      const interval = setInterval(() => {
        el.textContent = original.split('').map((c, j) => {
          if (c === ' ') return ' ';
          if (j < iter) return original[j];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iter >= original.length) clearInterval(interval);
        iter += 0.5;
      }, 40);
    }, delay * 1000);
  });
})();

/* ── TYPING EFFECT IN HERO DESC ───────────────────────────────── */
(function typeHeroDesc() {
  const el = document.querySelector('.h-desc');
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  el.appendChild(cursor);

  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, 25 + Math.random() * 15);
    }
  };
  setTimeout(type, 1500);
})();

/* ── HERO PARALLAX ON SCROLL ──────────────────────────────────── */
const heroLeft  = document.getElementById('heroLeft');
const heroRight2 = document.getElementById('heroRight');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroLeft)  heroLeft.style.transform  = `translateY(${y * 0.08}px)`;
  if (heroRight2) heroRight2.style.transform = `translateY(${y * 0.12}px)`;
}, { passive: true });

/* ── MARQUEE SPEED ON HOVER ───────────────────────────────────── */
const mqTrack = document.querySelector('.mq-track');
if (mqTrack) {
  mqTrack.addEventListener('mouseenter', () => {
    mqTrack.style.animationPlayState = 'paused';
    mqTrack.style.filter = 'blur(0)';
  });
  mqTrack.addEventListener('mouseleave', () => {
    mqTrack.style.animationPlayState = 'running';
  });
}

/* ── IC CARDS MOUSE GLOW ──────────────────────────────────────── */
document.querySelectorAll('.ic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ── BUTTON RIPPLE ────────────────────────────────────────────── */
document.querySelectorAll('.btn-p, .btn-o, .rc-btn, .rc-btn-o, .h-cta').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(r.width, r.height) * 2;
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      left:${e.clientX - r.left - size/2}px;top:${e.clientY - r.top - size/2}px;
      background:rgba(255,255,255,0.25);border-radius:50%;
      transform:scale(0);animation:ripple-expand .6s ease-out forwards;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Ripple keyframe
const rStyle = document.createElement('style');
rStyle.textContent = `@keyframes ripple-expand { to { transform:scale(1); opacity:0; } }`;
document.head.appendChild(rStyle);

/* ── SECTION ENTER ANIMATIONS (staggered) ─────────────────────── */
// Assign different reveal classes for variety
(function assignRevealTypes() {
  const revealMap = [
    { sel: '.about-l .slbl',    cls: 'reveal-left' },
    { sel: '.about-l .stitle',  cls: 'reveal-left' },
    { sel: '.about-r p',        cls: 'reveal-right' },
    { sel: '.ep-head',          cls: 'reveal-scale' },
    { sel: '.foot-in',          cls: 'reveal-blur' },
    { sel: '.contact-big',      cls: 'reveal-scale' },
  ];
  revealMap.forEach(({ sel, cls }) => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains('reveal')) {
        el.classList.add(cls);
        revealObs.observe(el);
      }
    });
  });
})();

/* ── CERT CARD ENTRY ANIMATIONS ───────────────────────────────── */
(function certEntries() {
  const cards = document.querySelectorAll('.cert-card');
  cards.forEach((c, i) => {
    const animations = ['reveal', 'reveal-left', 'reveal-scale', 'reveal-rotate', 'reveal-blur'];
    const cls = animations[i % animations.length];
    if (!c.classList.contains('reveal')) c.classList.add(cls);
    c.style.setProperty('--di', (i * 0.15) + 's');
    revealObs.observe(c);
  });
})();

/* ── MICRO ANIMATIONS: SECTION LABELS ────────────────────────── */
document.querySelectorAll('.slbl').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.letterSpacing = '.3em';
    el.style.transition = 'letter-spacing .4s';
  });
  el.addEventListener('mouseleave', () => {
    el.style.letterSpacing = '.2em';
  });
});

/* ── FOOTER MICRO INTERACTIONS ────────────────────────────────── */
const footLogo = document.querySelector('.foot-logo');
if (footLogo) {
  footLogo.addEventListener('mouseenter', () => {
    footLogo.style.letterSpacing = '.1em';
    footLogo.style.transition = 'letter-spacing .4s, color .3s';
    footLogo.style.color = '#c8ff00';
  });
  footLogo.addEventListener('mouseleave', () => {
    footLogo.style.letterSpacing = '.06em';
    footLogo.style.color = '';
  });
}

/* ── NUMBER COUNTER ANIMATION ─────────────────────────────────── */
function animateNum(el, target, duration) {
  let start = 0;
  const startTime = performance.now();
  const step = (now) => {
    const t = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.round(t * target);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── CERT CARD KEYBOARD ACCESSIBLE ────────────────────────────── */
document.querySelectorAll('.cert-card[role="button"]').forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      el.click();
    }
  });
});

/* ── SMOOTH SECTION TRANSITIONS (Intersection for Nav) ─────────── */
const sectionNames = {
  'inicio': 'Inicio',
  'sobre-mi': 'Sobre mí',
  'actividades': 'Actividades',
  'certificados': 'Certificados',
  'evidencias': 'Evidencias',
  'habilidades': 'Habilidades',
  'contacto': 'Contacto',
};

/* ── STAR BURST ON PERFECT SCORE ──────────────────────────────── */
(function perfectScoreFX() {
  const perfect = document.querySelector('.rcgrade.perfect');
  if (!perfect) return;
  perfect.addEventListener('mouseenter', () => {
    for (let i = 0; i < 8; i++) {
      const star = document.createElement('div');
      const angle = (i / 8) * 360;
      const dist = 40 + Math.random() * 20;
      star.style.cssText = `
        position:absolute;width:6px;height:6px;background:#22c55e;
        border-radius:50%;pointer-events:none;z-index:10;
        left:50%;top:50%;
        animation:star-burst .6s ease-out forwards;
        --bx:${Math.cos(angle * Math.PI/180) * dist}px;
        --by:${Math.sin(angle * Math.PI/180) * dist}px;
      `;
      perfect.style.position = 'relative';
      perfect.appendChild(star);
      setTimeout(() => star.remove(), 700);
    }
  });
  const bStyle = document.createElement('style');
  bStyle.textContent = `@keyframes star-burst { to { transform:translate(var(--bx),var(--by)) scale(0); opacity:0; } }`;
  document.head.appendChild(bStyle);
})();

/* ── TECH CHIP HOVER ──────────────────────────────────────────── */
document.querySelectorAll('.schip').forEach((chip, i) => {
  chip.addEventListener('mouseenter', () => {
    chip.style.setProperty('border-color', i % 2 === 0 ? 'rgba(200,255,0,.5)' : 'rgba(6,182,212,.5)');
    chip.style.setProperty('color', i % 2 === 0 ? '#c8ff00' : '#06b6d4');
  });
  chip.addEventListener('mouseleave', () => {
    chip.style.removeProperty('border-color');
    chip.style.removeProperty('color');
  });
});

/* ── INIT DONE ────────────────────────────────────────────────── */
console.log('%cMG.PORTFOLIO — SEGUNDA ITERACIÓN 🚀', 'color:#c8ff00;font-size:14px;font-weight:bold;background:#0a0a0f;padding:8px 16px;border-radius:4px;');
