/* ═══════════════════════════════════════════════════════════════
   MG.PORTFOLIO — main.js
   Custom cursor · Header scroll · Mobile nav · Particles
   Tilt cards · Skill bars · Reveal system · Lightbox
   Logo parallax · Skill counters
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── UTIL ──────────────────────────────────────────────────── */
  const q  = (s, ctx = document) => ctx.querySelector(s);
  const qa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ══════════════════════════════════════════════════════════
     1. CUSTOM CURSOR
  ══════════════════════════════════════════════════════════ */
  const dot  = q('#curDot');
  const ring = q('#curRing');
  if (dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * .12;
      ry += (my - ry) * .12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();

    /* Hover class on interactive elements */
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a,button,[data-tilt],[data-lb-src],[role=button],.eg-item,.cert-card'))
        ring.classList.add('hov');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a,button,[data-tilt],[data-lb-src],[role=button],.eg-item,.cert-card'))
        ring.classList.remove('hov');
    });
    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  /* ══════════════════════════════════════════════════════════
     2. HEADER SCROLL STATE
  ══════════════════════════════════════════════════════════ */
  const header = q('#header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════════════════════════════════
     3. MOBILE NAV
  ══════════════════════════════════════════════════════════ */
  const burger = q('#burger');
  const mnav   = q('#mnav');
  if (burger && mnav) {
    const toggle = open => {
      burger.classList.toggle('open', open);
      mnav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      mnav.setAttribute('aria-hidden', !open);
    };
    burger.addEventListener('click', () => toggle(!mnav.classList.contains('open')));
    qa('.mnl').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ══════════════════════════════════════════════════════════
     4. HERO PARTICLE CANVAS
  ══════════════════════════════════════════════════════════ */
  const heroSection = q('.hero');
  if (heroSection) {
    const canvas = document.createElement('canvas');
    canvas.id = 'heroParticles';
    canvas.setAttribute('aria-hidden', 'true');
    heroSection.prepend(canvas);
    const ctx2d = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Orbs — blue and yellow */
    const orbA = document.createElement('div');
    orbA.className = 'hero-orb';
    Object.assign(orbA.style, {
      width:'600px', height:'600px',
      top:'-100px', right:'-100px',
      background:'radial-gradient(circle,rgba(59,130,246,.25),transparent 70%)',
      '--od':'.2s'
    });
    const orbB = document.createElement('div');
    orbB.className = 'hero-orb';
    Object.assign(orbB.style, {
      width:'400px', height:'400px',
      bottom:'0', left:'-60px',
      background:'radial-gradient(circle,rgba(245,197,24,.18),transparent 70%)',
      '--od':'.6s'
    });
    heroSection.append(orbA, orbB);

    /* Floating dot particles */
    const DOTS = 55;
    const dots = Array.from({length: DOTS}, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 1.5 + .4,
      vx: (Math.random() - .5) * .25,
      vy: (Math.random() - .5) * .25,
      a:  Math.random() * .5 + .15,
      // blue or yellow
      color: Math.random() > .6
        ? `rgba(245,197,24,`
        : `rgba(59,130,246,`
    }));

    /* Connection lines */
    const CONNECT_DIST = 100;

    let raf;
    const drawParticles = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        ctx2d.beginPath();
        ctx2d.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx2d.fillStyle = d.color + d.a + ')';
        ctx2d.fill();
      });

      /* lines between close particles */
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < CONNECT_DIST) {
            ctx2d.beginPath();
            ctx2d.moveTo(dots[i].x, dots[i].y);
            ctx2d.lineTo(dots[j].x, dots[j].y);
            const a = (1 - dist / CONNECT_DIST) * .06;
            ctx2d.strokeStyle = `rgba(59,130,246,${a})`;
            ctx2d.lineWidth = .8;
            ctx2d.stroke();
          }
        }
      }
      raf = requestAnimationFrame(drawParticles);
    };
    drawParticles();

    /* Pause when not visible (performance) */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!raf) drawParticles(); }
        else { cancelAnimationFrame(raf); raf = null; }
      });
    });
    io.observe(heroSection);
  }

  /* ══════════════════════════════════════════════════════════
     5. PYTHON LOGO — parallax + particle burst on hover
  ══════════════════════════════════════════════════════════ */
  const pFrame = q('#pFrame');
  if (pFrame) {
    /* Add glow rings */
    for (let i = 1; i <= 3; i++) {
      const r = document.createElement('div');
      r.className = `logo-ring logo-ring-${i}`;
      pFrame.appendChild(r);
    }
    /* Shadow glow */
    const sh = document.createElement('div');
    sh.className = 'logo-shadow';
    pFrame.appendChild(sh);

    /* Mouse parallax on logo frame */
    window.addEventListener('mousemove', e => {
      const rect = pFrame.getBoundingClientRect();
      if (rect.width === 0) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      pFrame.style.transform =
        `perspective(800px) rotateY(${dx * 12}deg) rotateX(${-dy * 8}deg)`;
    });
    window.addEventListener('mouseleave', () => {
      pFrame.style.transform = 'none';
    });

    /* Particle burst on hover */
    let burst = false;
    pFrame.addEventListener('mouseenter', () => {
      if (burst) return; burst = true;
      const PARTICLES = 12;
      for (let i = 0; i < PARTICLES; i++) {
        const p = document.createElement('div');
        p.className = 'logo-particle';
        const angle  = (i / PARTICLES) * Math.PI * 2;
        const radius = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * radius;
        const ty = Math.sin(angle) * radius;
        const color = Math.random() > .5 ? '#3b82f6' : '#f5c518';
        Object.assign(p.style, {
          left: '50%', top: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
          width: (Math.random() * 4 + 2) + 'px',
          height: (Math.random() * 4 + 2) + 'px',
        });
        pFrame.appendChild(p);
        /* Animate outward then fade */
        p.animate([
          { opacity: 1, transform: 'translate(-50%,-50%)' },
          { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)` }
        ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.22,1,.36,1)' })
          .onfinish = () => p.remove();
      }
      setTimeout(() => burst = false, 400);
    });
  }

  /* ══════════════════════════════════════════════════════════
     6. SCROLL REVEAL — IntersectionObserver
  ══════════════════════════════════════════════════════════ */
  const REVEAL_CLASSES = [
    '.reveal', '.reveal-r', '.reveal-scale', '.reveal-blur', '.reveal-rot'
  ];
  const revealEls = qa(REVEAL_CLASSES.join(','));

  /* Assign varied animation classes to different sections */
  const assignRevealVariant = () => {
    qa('.about-r .reveal').forEach(el => el.classList.replace('reveal','reveal-r'));
    qa('.certs .cert-card').forEach(el => el.classList.replace('reveal','reveal-scale'));
    qa('.contact-wrap').forEach(el => el.classList.replace('reveal','reveal-blur'));
    qa('.evid-project').forEach((el, i) => {
      if (i % 2 === 1) el.classList.replace('reveal','reveal-rot');
    });
  };
  assignRevealVariant();

  /* Re-query after re-assignment */
  const allReveal = qa(REVEAL_CLASSES.join(','));
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  allReveal.forEach(el => revealIO.observe(el));

  /* ══════════════════════════════════════════════════════════
     7. CARD TILT — 3-D perspective on mouse move
  ══════════════════════════════════════════════════════════ */
  const tiltCards = qa('[data-tilt]');
  tiltCards.forEach(card => {
    const INTENSITY = 12;
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const rx2 = ((e.clientY - cy) / (r.height / 2)) * -INTENSITY;
      const ry2 = ((e.clientX - cx) / (r.width  / 2)) *  INTENSITY;
      card.style.transform =
        `perspective(700px) rotateX(${rx2}deg) rotateY(${ry2}deg) scale3d(1.02,1.02,1)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      setTimeout(() => card.style.transition = '', 650);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  /* ══════════════════════════════════════════════════════════
     8. SKILL BARS — animate when visible + counter
  ══════════════════════════════════════════════════════════ */
  const sbars = qa('.sbar');
  const skillIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const bar   = e.target;
      const pct   = bar.dataset.pct || '0';
      const fill  = q('.sbar-fill',  bar);
      const numEl = q('.sbar-n',     bar);

      fill.style.width = pct + '%';

      /* Also animate the glow track */
      const track = q('.sbar-track', bar);
      if (track) track.style.setProperty('--gw', pct + '%');

      /* Counter animation */
      if (numEl) {
        const target  = parseInt(pct);
        const dur     = 1400;
        const start   = performance.now();
        const tick = now => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          numEl.textContent = Math.round(ease * target) + '%';
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      skillIO.unobserve(bar);
    });
  }, { threshold: .3 });
  sbars.forEach(b => skillIO.observe(b));

  /* ══════════════════════════════════════════════════════════
     9. LIGHTBOX
  ══════════════════════════════════════════════════════════ */
  const lb      = q('#lb');
  const lbBg    = q('#lbBg');
  const lbClose = q('#lbClose');
  const lbImg   = q('#lbImg');

  const openLb = (src, alt) => {
    if (!lb || !src) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 350);
  };

  if (lb) {
    lbClose?.addEventListener('click', closeLb);
    lbBg?.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
    });
  }

  /* Wire up all lightbox triggers */
  const wireLb = () => {
    qa('[data-lb-src]').forEach(el => {
      el.addEventListener('click', () => openLb(el.dataset.lbSrc, el.dataset.lbAlt));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLb(el.dataset.lbSrc, el.dataset.lbAlt);
        }
      });
    });
  };
  wireLb();

  /* ══════════════════════════════════════════════════════════
     10. IMAGE FALLBACKS
  ══════════════════════════════════════════════════════════ */
  qa('img[data-fb]').forEach(img => {
    img.addEventListener('error', function () {
      this.classList.add('broken');
      const fb = this.parentElement?.querySelector('.rcard-img-fb, .cert-img-fb, .eg-img-fb');
      if (fb) fb.style.opacity = '1';
    });
  });

  /* ══════════════════════════════════════════════════════════
     11. HERO LEFT PARALLAX on scroll
  ══════════════════════════════════════════════════════════ */
  const heroLeft  = q('#heroLeft');
  const heroRight = q('#heroRight');
  if (heroLeft && heroRight) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroLeft.style.transform  = `translateY(${y * .12}px)`;
        heroRight.style.transform = `translateY(${y * .08}px)`;
      }
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     12. RIPPLE effect on buttons
  ══════════════════════════════════════════════════════════ */
  qa('.btn-p, .btn-o, .rc-btn, .rc-btn-o').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      this.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 100) + '%');
      this.style.setProperty('--ry', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

  /* ══════════════════════════════════════════════════════════
     13. ACTIVE NAV LINK on scroll
  ══════════════════════════════════════════════════════════ */
  const sections = qa('section[id]');
  const navLinks = qa('.nl, .mnl');
  const activeIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          const href = a.getAttribute('href')?.slice(1);
          a.classList.toggle('active', href === e.target.id);
        });
      }
    });
  }, { threshold: .4 });
  sections.forEach(s => activeIO.observe(s));

})(); // end IIFE
