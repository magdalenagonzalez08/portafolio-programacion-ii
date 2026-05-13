/* ═══════════════════════════════════════════════════════════
   MG.PORTFOLIO — main.js
   Magdalena González | Programación II | UTP 2026
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. DUAL CURSOR  — dot exact / ring lags behind
  ───────────────────────────────────────────────────────── */
  const dot    = document.getElementById('curDot');
  const ring   = document.getElementById('curRing');
  const isTouch = window.matchMedia('(pointer:coarse)').matches;

  if (!isTouch && dot && ring) {
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function tickRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tickRing);
    })();

    // Ring grows on interactive elements
    const hoverSel = 'a, button, .rcard, .ic, .schip, .eg-item, .cert-card, .tl-link';
    document.querySelectorAll(hoverSel).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

    // Code-mode cursor on photo hover
    const pFrame = document.getElementById('pFrame');
    if (pFrame) {
      pFrame.addEventListener('mouseenter', () => {
        ring.classList.remove('hovered');
        ring.classList.add('code-mode');
        dot.style.opacity = '0.4';
      });
      pFrame.addEventListener('mouseleave', () => {
        ring.classList.remove('code-mode');
        dot.style.opacity = '1';
      });
    }

    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });

  } else {
    if (dot)  dot.remove();
    if (ring) ring.remove();
    document.body.style.cursor = 'auto';
  }


  /* ─────────────────────────────────────────────────────────
     2. LIGHTBOX
  ───────────────────────────────────────────────────────── */
  const lb    = document.getElementById('lb');
  const lbBg  = document.getElementById('lbBg');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');

  function openLb(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear after transition to avoid flash
    setTimeout(() => { lbImg.src = ''; }, 350);
  }

  if (lb) {
    lbClose.addEventListener('click', closeLb);
    lbBg.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
    });

    // Trigger on gallery items
    document.querySelectorAll('.eg-item[data-lb]').forEach(item => {
      item.addEventListener('click', () =>
        openLb(item.dataset.lb, item.dataset.lbAlt)
      );
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ')
          openLb(item.dataset.lb, item.dataset.lbAlt);
      });
    });

    // Trigger on certificate cards
    document.querySelectorAll('.cert-card[data-lb]').forEach(card => {
      card.addEventListener('click', () =>
        openLb(card.dataset.lb, card.dataset.lbAlt)
      );
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ')
          openLb(card.dataset.lb, card.dataset.lbAlt);
      });
    });
  }


  /* ─────────────────────────────────────────────────────────
     3. HEADER — style on scroll
  ───────────────────────────────────────────────────────── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });


  /* ─────────────────────────────────────────────────────────
     4. HAMBURGER / MOBILE NAV
  ───────────────────────────────────────────────────────── */
  const burger = document.getElementById('burger');
  const mnav   = document.getElementById('mnav');

  burger.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open.toString());
    mnav.setAttribute('aria-hidden', (!open).toString());
  });
  document.querySelectorAll('.mnl').forEach(l => {
    l.addEventListener('click', () => {
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
      burger.focus();
    }
  });


  /* ─────────────────────────────────────────────────────────
     5. SMOOTH SCROLL with header offset
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      window.scrollTo({
        top: tgt.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8,
        behavior: 'smooth'
      });
    });
  });


  /* ─────────────────────────────────────────────────────────
     6. ACTIVE NAV LINK
  ───────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nl');

  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)
      );
    });
  }, { threshold: 0.35 }).observe.call(
    { observe: el => el },
    ...[] // workaround — use forEach below
  );

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)
      );
    });
  }, { threshold: 0.35 });
  sections.forEach(s => secObs.observe(s));


  /* ─────────────────────────────────────────────────────────
     7. SCROLL REVEAL
  ───────────────────────────────────────────────────────── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      revObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.reveal, .reveal-r, .reveal-l')
    .forEach(el => revObs.observe(el));


  /* ─────────────────────────────────────────────────────────
     8. SKILL BARS — animate on reveal
  ───────────────────────────────────────────────────────── */
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fill = e.target.querySelector('.sbar-fill');
      if (fill) setTimeout(() => { fill.style.width = e.target.dataset.pct + '%'; }, 260);
      barObs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.sbar[data-pct]').forEach(el => barObs.observe(el));


  /* ─────────────────────────────────────────────────────────
     9. 3D TILT — race cards + certificate cards
  ───────────────────────────────────────────────────────── */
  const TILT_DEG = 10;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    let rafId;

    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -TILT_DEG;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  TILT_DEG;
        card.style.transition = 'transform .08s ease, box-shadow .4s, border-color .3s';
        card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), box-shadow .4s, border-color .3s';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
  });


  /* ─────────────────────────────────────────────────────────
     10. PARALLAX — hero layers
  ───────────────────────────────────────────────────────── */
  const heroLeft   = document.getElementById('heroLeft');
  const heroRight  = document.getElementById('heroRight');
  const heroGrid   = document.querySelector('.hero-grid');
  const slashA     = document.querySelector('.hero-slash.a');
  const slashB     = document.querySelector('.hero-slash.b');
  const roman      = document.querySelector('.photo-roman');
  const heroSec    = document.getElementById('inicio');
  const reduced    = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  if (!reduced && heroSec) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      if (sy > heroSec.offsetHeight * 1.3) return;
      if (heroLeft)  heroLeft.style.transform  = `translateY(${sy * .18}px)`;
      if (heroRight) heroRight.style.transform = `translateY(${sy * .12}px)`;
      if (heroGrid)  heroGrid.style.transform  = `translateY(${sy * .08}px)`;
      if (slashA)    slashA.style.transform    = `skewX(-10deg) translateY(${sy * .15}px)`;
      if (slashB)    slashB.style.transform    = `skewX(-10deg) translateY(${sy * .10}px)`;
      if (roman)     roman.style.transform     = `translateY(${sy * .25}px)`;
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     11. SPEED LINES — scroll-driven offset
  ───────────────────────────────────────────────────────── */
  const speedLines = document.querySelectorAll('.sl');
  if (!reduced && speedLines.length) {
    window.addEventListener('scroll', () => {
      speedLines.forEach((sl, i) => {
        const dir   = i % 2 === 0 ? 1 : -1;
        const speed = 0.04 + i * 0.012;
        sl.style.transform = `rotate(-4deg) translateX(${window.scrollY * speed * dir}px)`;
      });
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     12. FLOATING LABELS — parallax on mouse move
  ───────────────────────────────────────────────────────── */
  const flabels = document.querySelectorAll('.flabel');
  if (!isTouch && flabels.length) {
    document.addEventListener('mousemove', e => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      flabels.forEach((fl, i) => {
        const f = (i % 2 === 0 ? 1 : -1) * 6;
        fl.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
      });
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     13. BUTTON RIPPLE
  ───────────────────────────────────────────────────────── */
  const rippleSel = '.btn-p,.btn-o,.rc-btn,.rc-btn-o,.clink,.h-cta,.ep-pdf,.rcard-pdf-pill';
  document.querySelectorAll(rippleSel).forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r    = this.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.5;
      const x    = e.clientX - r.left - size / 2;
      const y    = e.clientY - r.top  - size / 2;
      const rip  = document.createElement('span');
      Object.assign(rip.style, {
        position:'absolute', left:x+'px', top:y+'px',
        width:size+'px', height:size+'px',
        background:'rgba(255,255,255,.2)', borderRadius:'50%',
        transform:'scale(0)', animation:'_rip .55s linear',
        pointerEvents:'none',
      });
      if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(rip);
      setTimeout(() => rip.remove(), 580);
    });
  });

  const kf = document.createElement('style');
  kf.textContent = '@keyframes _rip { to { transform:scale(1); opacity:0; } }';
  document.head.appendChild(kf);


  /* ─────────────────────────────────────────────────────────
     14. MARQUEE — pause on hover (CSS handles, JS reinforces)
  ───────────────────────────────────────────────────────── */
  // Handled in CSS via .mq-bar:hover .mq-track { animation-play-state:paused }


  /* ─────────────────────────────────────────────────────────
     15. GALLERY IMAGE FALLBACK — show label if fails
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.eg-item img').forEach(img => {
    img.addEventListener('error', function () {
      this.closest('.eg-item').classList.add('img-fail');
    });
  });

  document.querySelectorAll('.cert-img').forEach(img => {
    img.addEventListener('error', function () {
      this.closest('.cert-img-wrap').classList.add('img-fail');
    });
  });

  document.querySelectorAll('.rcard-img').forEach(img => {
    img.addEventListener('error', function () {
      this.closest('.rcard-img-wrap').classList.add('img-fail');
    });
  });

})();
