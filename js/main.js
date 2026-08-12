/* ==========================================================================
   YESHUA CENTRO DE REHABILITACIÓN — main.js
   Preloader · Navegación · Typewriter · Scroll reveal · Contadores ·
   Partículas · Formulario a WhatsApp
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  const loadingScreen = document.getElementById('loading-screen');
  const loaderBarFill = document.querySelector('.loader-bar span');
  const MIN_LOAD_TIME = 2600; // ms — transición deliberadamente lenta e impactante
  const startTime = Date.now();

  if (loaderBarFill) {
    requestAnimationFrame(() => { loaderBarFill.style.width = '100%'; });
  }

  const hidePreloader = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(MIN_LOAD_TIME - elapsed, 0);
    setTimeout(() => {
      document.body.classList.remove('no-scroll');
      loadingScreen.classList.add('loaded');
      document.body.classList.add('page-revealed');
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 1300);
    }, remaining);
  };

  document.body.classList.add('no-scroll');
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 4000); // salvaguarda por si 'load' tarda demasiado

  /* ---------- AÑO EN FOOTER ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- HEADER: estado al hacer scroll ---------- */
  const header = document.getElementById('site-header');
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- NAV: menú móvil ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('no-scroll', isOpen);
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  /* ---------- NAV: resaltar sección activa ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => navObserver.observe(s));
  }

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.setProperty('--stagger', i % 6);
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- TYPEWRITER HERO ---------- */
  const typewriterEl = document.getElementById('typewriter');
  const words = ['Alcoholismo', 'Drogadicción', 'Depresión', 'Neurosis', 'Bulimia', 'Angustia'];
  if (typewriterEl) {
    let wordIndex = 0, charIndex = 0, deleting = false;

    const type = () => {
      const currentWord = words[wordIndex];
      if (!deleting) {
        charIndex++;
        typewriterEl.textContent = currentWord.slice(0, charIndex);
        if (charIndex === currentWord.length) {
          deleting = true;
          setTimeout(type, 1600);
          return;
        }
      } else {
        charIndex--;
        typewriterEl.textContent = currentWord.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(type, deleting ? 45 : 85);
    };
    setTimeout(type, 1200);
  }

  /* ---------- CONTADORES ANIMADOS ---------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTs = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  if (statNumbers.length) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => statObserver.observe(el));
  }

  /* ---------- PARTÍCULAS (canvas, varias secciones) ---------- */
  const particleCanvases = document.querySelectorAll('.particles-canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (particleCanvases.length && !reduceMotion) {
    const palettes = {
      'on-dark': ['rgba(255,170,0,0.55)', 'rgba(255,194,77,0.4)', 'rgba(247,241,245,0.35)'],
      'on-light': ['rgba(123,45,99,0.28)', 'rgba(30,116,197,0.24)', 'rgba(255,170,0,0.35)']
    };

    particleCanvases.forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      const theme = canvas.getAttribute('data-theme') || 'on-dark';
      const palette = palettes[theme] || palettes['on-dark'];
      let particles = [];
      let w, h;

      const resize = () => {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
      };

      const initParticles = () => {
        const count = Math.max(18, Math.floor((w * h) / 30000));
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.4 + 0.6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          color: palette[Math.floor(Math.random() * palette.length)]
        }));
      };

      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
        requestAnimationFrame(draw);
      };

      resize();
      initParticles();
      draw();
      window.addEventListener('resize', () => { resize(); initParticles(); });
    });
  }

  /* ---------- FORMULARIO DE CONTACTO → WHATSAPP ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('#cf-name').value.trim();
      const phone = contactForm.querySelector('#cf-phone').value.trim();
      const message = contactForm.querySelector('#cf-message').value.trim();

      const text =
        `Hola Yeshua Centro de Rehabilitación, mi nombre es ${name}.%0A` +
        `Mi teléfono de contacto es ${phone}.%0A` +
        `${message ? 'Mensaje: ' + message : 'Me gustaría recibir información sobre el proceso de ingreso.'}`;

      window.open(`https://wa.me/522218490474?text=${text}`, '_blank', 'noopener');
      contactForm.reset();
    });
  }

});
