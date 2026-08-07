/* =========================================================
   VIA A MUSA — Landing Page Interactions
   Vanilla JS ES6 — sem dependências externas
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sombra/blur ao rolar + link ativo ---------- */
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('main section[id], main .hero[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const onScroll = () => {
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) currentId = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${currentId}`);
    });

    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  const closeMenu = () => {
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu');
  };
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  };
  hamburger.addEventListener('click', toggleMenu);
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Scroll suave (fallback extra p/ navegadores antigos) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- Scroll Reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealNowIfInView = () => {
    revealEls.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('is-visible');
    });
  };

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), (i % 6) * 90);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // Rede de segurança: se a aba estava em segundo plano (throttling do navegador)
    // ou o observer não disparou por qualquer motivo, revela o que já está visível
    // assim que a página ganha foco novamente — o conteúdo nunca deve ficar oculto.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) revealNowIfInView();
    });
    window.addEventListener('pageshow', revealNowIfInView);
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Segurança extra: garante que nada fique permanentemente invisível.
  window.addEventListener('load', () => setTimeout(revealNowIfInView, 3000));

  /* ---------- Contadores animados ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals > 0
        ? value.toFixed(decimals) + suffix
        : Math.round(value).toLocaleString('pt-BR') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Accordion FAQ ---------- */
  const accordionItems = document.querySelectorAll('.accordion__item');
  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      accordionItems.forEach((other) => {
        const otherTrigger = other.querySelector('.accordion__trigger');
        const otherPanel = other.querySelector('.accordion__panel');
        otherTrigger.setAttribute('aria-expanded', 'false');
        otherPanel.style.maxHeight = null;
      });

      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Slider de depoimentos ---------- */
  const track = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const slides = track ? Array.from(track.children) : [];
  let currentSlide = 0;
  let autoplayTimer = null;

  const goToSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dotsWrap.querySelectorAll('.slider__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  };

  if (track && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      dot.addEventListener('click', () => { goToSlide(i); restartAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    goToSlide(0);

    prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); restartAutoplay(); });
    nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); restartAutoplay(); });

    function restartAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
    }
    restartAutoplay();

    // Swipe touch support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) {
        goToSlide(diff > 0 ? currentSlide - 1 : currentSlide + 1);
        restartAutoplay();
      }
    }, { passive: true });
  }

  /* ---------- Botão voltar ao topo ---------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Newsletter (demo front-end) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (isValid) {
        newsletterMsg.textContent = 'Obrigada por assinar! Em breve você receberá nossas novidades. ✓';
        newsletterForm.reset();
      } else {
        newsletterMsg.textContent = 'Por favor, insira um e-mail válido.';
      }
    });
  }

  /* ---------- Recalcula altura do accordion aberto ao redimensionar ---------- */
  window.addEventListener('resize', () => {
    const openPanel = document.querySelector('.accordion__trigger[aria-expanded="true"]');
    if (openPanel) {
      const panel = openPanel.closest('.accordion__item').querySelector('.accordion__panel');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });

  onScroll();
})();
