/* ═══════════════════════════════════════════════════════════
   MG.PORTFOLIO — main.js
   Magdalena González | Programación II | UTP 2026
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     1. DUAL CURSOR  — dot follows exactly, ring lags behind
  ──────────────────────────────────────────────────────────── */
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');

  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  if (!isTouch && dot && ring) {
    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    const LAG = 0.13;

    // Dot: follows mouse instantly
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    // Ring: lerp to mouse position
    function tickRing() {
      rx += (mx - rx) * LAG;
      ry += (my - ry) * LAG;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tickRing);
    }
    tickRing();

    // Hover effect — ring grows on interactive elements
    const targets = 'a, button, .rcard, .ic, .schip, .tl-link, .photo-frame';
    document.querySelectorAll(targets).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  } else {
    // Touch device — remove cursor elements
    if (dot)  dot.remove();
    if (ring) ring.remove();
    document.body.style.cursor = 'auto';
  }


  /* ──────────────────────────────────────────────────────────
     2. HEADER — style change on scroll
  ──────────────────────────────────────────────────────────── */
  const header = document.getElementById('header');

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();


  /* ──────────────────────────────────────────────────────────
     3. HAMBURGER / MOBILE NAV
  ──────────────────────────────────────────────────────────── */
  const burger = document.getElementById('burger');
  const mnav   = document.getElementById('mnav');

  burger.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open.toString());
    mnav.setAttribute('aria-hidden', (!open).toString());
  });

  document.querySelectorAll('.mnl').forEach(link => {
    link.addEventListener('click', () => {
      mnav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      mnav.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mnav.classList.contains('open')) {
      mnav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      mnav.setAttribute('aria-hidden', 'true');
      burger.focus();
    }
  });


  /* ──────────────────────────────────────────────────────────
     4. SMOOTH SCROLL — offset for fixed header
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ──────────────────────────────────────────────────────────
     5. ACTIVE NAV LINK on scroll
  ──────────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nl');

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(s => secObs.observe(s));


  /* ──────────────────────────────────────────────────────────
     6. SCROLL REVEAL — IntersectionObserver
  ──────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-r, .reveal-l');

  const revObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('vis');
      revObs.unobserve(entry.target); // fire once
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revObs.observe(el));


  /* ──────────────────────────────────────────────────────────
     7. SKILL BARS — animate width on reveal
  ──────────────────────────────────────────────────────────── */
  const sbars = document.querySelectorAll('.sbar[data-pct]');

  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const pct  = entry.target.dataset.pct || '0';
      const fill = entry.target.querySelector('.sbar-fill');
      if (fill) {
        setTimeout(() => { fill.style.width = pct + '%'; }, 280);
      }
      barObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  sbars.forEach(el => barObs.observe(el));


  /* ──────────────────────────────────────────────────────────
     8. 3D TILT — race cards
  ──────────────────────────────────────────────────────────── */
  const TILT = 10; // max degrees

  document.querySelectorAll('[data-tilt]').forEach(card => {
    let animId;

    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        const r  = card.getBoundingClientRect();
        const x  = e.clientX - r.left;
        const y  = e.clientY - r.top;
        const rx = ((y - r.height / 2) / (r.height / 2)) * -TILT;
        const ry = ((x - r.width  / 2) / (r.width  / 2)) *  TILT;
        card.style.transition = 'transform .08s ease, box-shadow .4s, border-color .3s';
        card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animId);
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), box-shadow .4s, border-color .3s';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
  });


  /* ──────────────────────────────────────────────────────────
     9. PARALLAX — hero layers move at different rates
  ──────────────────────────────────────────────────────────── */
  const heroLeft  = document.getElementById('heroLeft');
  const heroRight = document.getElementById('heroRight');
  const heroGrid  = document.querySelector('.hero-bg-grid');
  const heroSlashA = document.querySelector('.hero-slash.ha');
  const heroSlashB = document.querySelector('.hero-slash.hb');
  const photoRoman = document.querySelector('.photo-roman');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroSection = document.getElementById('inicio');

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      if (!heroSection) return;
      const heroH = heroSection.offsetHeight;
      if (sy > heroH * 1.3) return; // skip when far past hero

      if (heroLeft)   heroLeft.style.transform   = `translateY(${sy * 0.18}px)`;
      if (heroRight)  heroRight.style.transform  = `translateY(${sy * 0.12}px)`;
      if (heroGrid)   heroGrid.style.transform   = `translateY(${sy * 0.08}px)`;
      if (heroSlashA) heroSlashA.style.transform = `skewX(-10deg) translateY(${sy * 0.15}px)`;
      if (heroSlashB) heroSlashB.style.transform = `skewX(-10deg) translateY(${sy * 0.1}px)`;
      if (photoRoman) photoRoman.style.transform = `translateY(${sy * 0.25}px)`;
    }, { passive: true });
  }


  /* ──────────────────────────────────────────────────────────
     10. BUTTON RIPPLE microinteraction
  ──────────────────────────────────────────────────────────── */
  const rippleTargets = '.btn-p, .btn-o, .rc-btn, .clink, .h-cta';
  document.querySelectorAll(rippleTargets).forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x    = e.clientX - rect.left - size / 2;
      const y    = e.clientY - rect.top  - size / 2;

      const rip = document.createElement('span');
      Object.assign(rip.style, {
        position:     'absolute',
        left:         x + 'px',
        top:          y + 'px',
        width:        size + 'px',
        height:       size + 'px',
        background:   'rgba(255,255,255,.2)',
        borderRadius: '50%',
        transform:    'scale(0)',
        animation:    'rippleOut .55s linear',
        pointerEvents:'none',
      });

      const pos = getComputedStyle(this).position;
      if (pos === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(rip);
      setTimeout(() => rip.remove(), 580);
    });
  });

  // Inject keyframe once
  const kf = document.createElement('style');
  kf.textContent = '@keyframes rippleOut { to { transform:scale(1); opacity:0; } }';
  document.head.appendChild(kf);


  /* ──────────────────────────────────────────────────────────
     11. TIMELINE DOTS — pop when they enter view
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('.tl-dot').forEach(dot => {
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const d = e.target;
        d.style.transition = 'background .4s, box-shadow .4s, transform .4s var(--ease)';
        d.style.transform  = 'scale(1.5)';
        setTimeout(() => { d.style.transform = 'scale(1)'; }, 380);
        dotObs.unobserve(d);
      });
    }, { threshold: 1.0 });
    dotObs.observe(dot);
  });


  /* ──────────────────────────────────────────────────────────
     12. SPEED LINES — subtle animated offset on scroll
  ──────────────────────────────────────────────────────────── */
  const speedLines = document.querySelectorAll('.sl');
  if (!prefersReducedMotion && speedLines.length) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      speedLines.forEach((sl, i) => {
        const dir   = i % 2 === 0 ? 1 : -1;
        const speed = 0.04 + i * 0.01;
        sl.style.transform = `rotate(-4deg) translateX(${sy * speed * dir}px)`;
      });
    }, { passive: true });
  }


  /* ──────────────────────────────────────────────────────────
     13. FLOATING LABELS — slight parallax on mouse move
  ──────────────────────────────────────────────────────────── */
  const flabels = document.querySelectorAll('.flabel');
  if (!isTouch && flabels.length) {
    document.addEventListener('mousemove', e => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      flabels.forEach((fl, i) => {
        const factor = (i % 2 === 0 ? 1 : -1) * 6;
        fl.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    }, { passive: true });
  }


  /* ──────────────────────────────────────────────────────────
     14. PHOTO HOVER — slight scale + brightness on hover
  ──────────────────────────────────────────────────────────── */
  const photoFrame = document.getElementById('pFrame');
  const photoImg   = photoFrame && photoFrame.querySelector('.photo-img');
  if (photoFrame && photoImg) {
    photoFrame.addEventListener('mouseenter', () => {
      photoImg.style.transform  = 'scale(1.04)';
      photoImg.style.filter     = 'brightness(1.05)';
      photoImg.style.transition = 'transform .6s var(--ease), filter .4s';
    });
    photoFrame.addEventListener('mouseleave', () => {
      photoImg.style.transform = 'scale(1)';
      photoImg.style.filter    = 'brightness(1)';
    });
  }

})();
