/* ════════════════════════════════════════════════════════
   MG.PORTFOLIO — main.js
   Magdalena González — Programación II — UTP 2026
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────
     1. CUSTOM CURSOR — smooth lag-follow + scale on hover
  ──────────────────────────────────────────────────── */
  const cursor = document.getElementById('cursorGlow');

  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    let rafId;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    function tickCursor() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      rafId = requestAnimationFrame(tickCursor);
    }
    tickCursor();

    // Scale on interactive elements
    const hoverTargets = 'a, button, .act-card, .about-card, .skill-chip, .tl-link';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(3.2)';
        cursor.style.opacity   = '0.45';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        cursor.style.opacity   = '1';
      });
    });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  } else {
    // On touch devices: remove cursor element & restore default cursor
    if (cursor) cursor.remove();
    document.body.style.cursor = '';
  }


  /* ────────────────────────────────────────────────────
     2. HEADER — change style on scroll
  ──────────────────────────────────────────────────── */
  const header = document.getElementById('header');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ────────────────────────────────────────────────────
     3. HAMBURGER / MOBILE NAV
  ──────────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open.toString());
    mobileNav.setAttribute('aria-hidden', (!open).toString());
  });

  // Close on link click
  mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });


  /* ────────────────────────────────────────────────────
     4. SMOOTH SCROLL — account for fixed header height
  ──────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ────────────────────────────────────────────────────
     5. SCROLL REVEAL — IntersectionObserver
  ──────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('vis');
      revealObserver.unobserve(entry.target); // fire once
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ────────────────────────────────────────────────────
     6. SKILL BARS — animate width when revealed
  ──────────────────────────────────────────────────── */
  const skillBarEls = document.querySelectorAll('.skill-bar-item');

  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const pct = el.dataset.pct || '0';
      const fill = el.querySelector('.sb-fill');
      if (fill) {
        // Slight delay so the reveal fade plays first
        setTimeout(() => { fill.style.width = pct + '%'; }, 300);
      }
      barObserver.unobserve(el);
    });
  }, { threshold: 0.3 });

  skillBarEls.forEach(el => barObserver.observe(el));


  /* ────────────────────────────────────────────────────
     7. 3D TILT — on activity cards
  ──────────────────────────────────────────────────── */
  const TILT_MAX = 11; // degrees

  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -TILT_MAX;
      const rotY = ((x - cx) / cx) *  TILT_MAX;

      card.style.transition = 'transform .08s ease, box-shadow .4s, border-color .3s';
      card.style.transform  = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.025,1.025,1.025)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), box-shadow .4s, border-color .3s';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
  });


  /* ────────────────────────────────────────────────────
     8. PARALLAX — hero inner layer on scroll
  ──────────────────────────────────────────────────── */
  const heroInner  = document.querySelector('.hero-inner');
  const heroGrid   = document.querySelector('.hero-grid-bg');
  const heroSlash  = document.querySelector('.hero-slash-bg');
  const heroSlash2 = document.querySelector('.hero-slash-bg2');

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isReducedMotion) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      if (sy > window.innerHeight * 1.2) return; // skip if far past hero

      if (heroInner)  heroInner.style.transform  = `translateY(${sy * 0.22}px)`;
      if (heroGrid)   heroGrid.style.transform    = `translateY(${sy * 0.10}px)`;
      if (heroSlash)  heroSlash.style.transform   = `skewX(-9deg) translateY(${sy * 0.14}px)`;
      if (heroSlash2) heroSlash2.style.transform  = `skewX(-9deg) translateY(${sy * 0.08}px)`;
    }, { passive: true });
  }


  /* ────────────────────────────────────────────────────
     9. ACTIVE NAV LINK — highlight as you scroll
  ──────────────────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    });
  }, { threshold: 0.45 });

  sections.forEach(s => sectionObserver.observe(s));


  /* ────────────────────────────────────────────────────
     10. MARQUEE — pause on hover
  ──────────────────────────────────────────────────── */
  const marqueeTrack = document.querySelector('.marquee-track');
  const marqueeBar   = document.querySelector('.marquee-bar');

  if (marqueeTrack && marqueeBar) {
    marqueeBar.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeBar.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }


  /* ────────────────────────────────────────────────────
     11. MICRO-INTERACTIONS — btn ripple on click
  ──────────────────────────────────────────────────── */
  document.querySelectorAll('.btn-primary, .btn-outline, .act-btn, .c-btn, .btn-header').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.4;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position:  'absolute',
        left:      x + 'px',
        top:       y + 'px',
        width:     size + 'px',
        height:    size + 'px',
        background: 'rgba(255,255,255,.22)',
        borderRadius: '50%',
        transform:  'scale(0)',
        animation:  'rippleOut .55s linear',
        pointerEvents: 'none',
      });

      // Ensure relative positioning on the button
      const currentPosition = getComputedStyle(this).position;
      if (currentPosition === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframe once
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes rippleOut {
      to { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);


  /* ────────────────────────────────────────────────────
     12. ABOUT CARDS — stagger reveal via CSS delay
        (already handled by --d custom property in HTML)
  ──────────────────────────────────────────────────── */
  // No additional JS needed — CSS transitions handle it.


  /* ────────────────────────────────────────────────────
     13. TIMELINE DOTS — animate when visible
  ──────────────────────────────────────────────────── */
  document.querySelectorAll('.tl-dot').forEach(dot => {
    const dotObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'background .4s, box-shadow .4s, transform .4s';
          entry.target.style.transform  = 'scale(1.3)';
          setTimeout(() => { entry.target.style.transform = 'scale(1)'; }, 350);
          dotObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 1.0 });
    dotObserver.observe(dot);
  });


  /* ────────────────────────────────────────────────────
     14. KEYBOARD ACCESSIBILITY — close mobile nav on Esc
  ──────────────────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      hamburger.focus();
    }
  });

})();
