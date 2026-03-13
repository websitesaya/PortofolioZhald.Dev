/* ==========================================
   ARIF DEV — PORTFOLIO JAVASCRIPT
   Interactions, Animations & Effects
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // DARK / LIGHT MODE TOGGLE
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    body.classList.add('light-mode');
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // ==========================================
  // 1. CUSTOM CURSOR
  // ==========================================
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactiveEls = document.querySelectorAll('a, button, .filter-btn, .portfolio-card, .service-card, .skill-item, .dot, .slider-btn');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
      cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursorFollower.style.borderColor = 'rgba(255, 107, 43, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorFollower.style.borderColor = 'rgba(255, 107, 43, 0.5)';
    });
  });

  // ==========================================
  // 2. NAVIGATION
  // ==========================================
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ==========================================
  // 3. SCROLL REVEAL ANIMATIONS
  // ==========================================
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-right');

  function triggerReveal() {
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const wh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= wh - 60) {
        el.classList.add('visible');
      }
    });
  }

  triggerReveal();
  window.addEventListener('scroll', triggerReveal, { passive: true });
  setTimeout(triggerReveal, 200);
  setTimeout(triggerReveal, 600);

  // ==========================================
  // 4. COUNTER ANIMATION
  // ==========================================
  const counters = document.querySelectorAll('.stat-number');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        animateCounter(entry.target, target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function animateCounter(el, target) {
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * ease);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  counters.forEach(counter => countObserver.observe(counter));

  // ==========================================
  // 5. PORTFOLIO FILTER
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      portfolioItems.forEach((item, index) => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = '';
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px) scale(0.98)';
          setTimeout(() => {
            item.style.transition = `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s`;
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => { item.style.display = 'none'; }, 350);
        }
      });
    });
  });

  // ==========================================
  // 6. TESTIMONIAL SLIDER
  // ==========================================
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slides = document.querySelectorAll('.testimonial-card');

  let currentSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

  let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
  });

  // ==========================================
  // 7. CONTACT FORM — Web3Forms
  // ==========================================
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.btn-primary');
    const originalHTML = btn.innerHTML;

    // Animasi loading
    btn.innerHTML = '<span>Mengirim...</span>';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        btn.innerHTML = '<span>✓ Pesan Terkirim!</span>';
        btn.style.background = 'linear-gradient(135deg, #27c93f, #00b09b)';
        btn.style.opacity = '1';
        contactForm.reset();
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.style.pointerEvents = '';
        }, 3000);

      } else {
        btn.innerHTML = '<span>✗ Gagal, coba lagi</span>';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        btn.style.opacity = '1';
        btn.style.pointerEvents = '';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
        }, 3000);
      }

    } catch (error) {
      btn.innerHTML = '<span>✗ Gagal, coba lagi</span>';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      btn.style.opacity = '1';
      btn.style.pointerEvents = '';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
      }, 3000);
    }
  });
  // ==========================================
  // 8. SMOOTH SCROLL
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ==========================================
  // 9. PARALLAX BLOBS
  // ==========================================
  const blobs = document.querySelectorAll('.hero-blob');
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 0.4;
      blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });

  // ==========================================
  // 10. TILT EFFECT ON CARDS
  // ==========================================
  const tiltCards = document.querySelectorAll('.service-card, .portfolio-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-8px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  // ==========================================
  // 11. ACTIVE NAV LINK ON SCROLL
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(section => sectionObserver.observe(section));

  // ==========================================
  // 12. HERO CODE CARD ANIMATION
  // ==========================================
  const codeLines = document.querySelectorAll('.code-line');
  codeLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-8px)';
    line.style.transition = `opacity 0.4s ease ${0.5 + i * 0.1}s, transform 0.4s ease ${0.5 + i * 0.1}s`;
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, 100);
  });

  // ==========================================
  // 13. SCROLL PROGRESS BAR
  // ==========================================
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px;
    background: linear-gradient(90deg, #ff6b2b, #ff9500, #ffd700);
    z-index: 9999; width: 0%; pointer-events: none;
    transition: width 0.1s linear;
  `;
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / total * 100) + '%';
  });

  // ==========================================
  // 14. STAGGER PORTFOLIO ITEMS
  // ==========================================
  document.querySelectorAll('.portfolio-item').forEach((card, i) => {
    card.style.setProperty('--delay', `${i * 0.08}s`);
  });

  // ==========================================
  // 15. ANIMASI FOTO PROFIL
  // ==========================================
  const aboutFrame = document.querySelector('.about-image-frame');
  const aboutWrapper = document.querySelector('.about-image-wrapper');

  if (aboutFrame && aboutWrapper) {

    // Inject CSS keyframes
    const photoStyle = document.createElement('style');
    photoStyle.textContent = `
      @keyframes ringRotate {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes glowPulse {
        0%, 100% { opacity: 0.45; transform: scale(1); }
        50%       { opacity: 1;    transform: scale(1.08); }
      }
      @keyframes photoFloat {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-14px); }
      }
      @keyframes shineMove {
        0%   { transform: translateX(-100%) rotate(20deg); }
        100% { transform: translateX(500%) rotate(20deg); }
      }
    `;
    document.head.appendChild(photoStyle);

    // Ring berputar
    const spinRing = document.createElement('div');
    spinRing.style.cssText = `
      position: absolute;
      inset: -6px;
      border-radius: 30px;
      background: conic-gradient(from 0deg, #ff6b2b, #ff9500, #ffd700, #ff3d3d, #ff6b2b);
      z-index: 0;
      animation: ringRotate 4s linear infinite;
      opacity: 0.75;
    `;
    // Lapisan dalam agar hanya border yang terlihat
    const spinRingInner = document.createElement('div');
    spinRingInner.style.cssText = `
      position: absolute;
      inset: 4px;
      border-radius: 24px;
      background: var(--surface);
      z-index: 1;
    `;
    spinRing.appendChild(spinRingInner);

    // Glow berdenyut
    const glowEl = document.createElement('div');
    glowEl.style.cssText = `
      position: absolute;
      inset: -24px;
      border-radius: 44px;
      background: radial-gradient(ellipse, rgba(255,107,43,0.22), transparent 70%);
      z-index: -1;
      animation: glowPulse 2.5s ease-in-out infinite;
      pointer-events: none;
    `;

    // Efek kilap melintas
    const shineWrap = document.createElement('div');
    shineWrap.style.cssText = `
      position: absolute; inset: 0;
      border-radius: 24px; overflow: hidden;
      z-index: 12; pointer-events: none;
    `;
    const shineLine = document.createElement('div');
    shineLine.style.cssText = `
      position: absolute; top: 0; left: 0;
      width: 40px; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
      animation: shineMove 3.5s ease-in-out infinite;
      animation-delay: 1.5s;
    `;
    shineWrap.appendChild(shineLine);

    // Overlay hover
    const hoverOverlay = document.createElement('div');
    hoverOverlay.innerHTML = `
      <span style="font-size:36px;margin-bottom:8px;">👋</span>
      <span style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px;">Halo! Saya Rijal</span>
      <span style="font-size:13px;opacity:0.85;letter-spacing:0.05em;">Junior Web Developer</span>
    `;
    hoverOverlay.style.cssText = `
      position: absolute; inset: 0;
      border-radius: 24px;
      background: linear-gradient(to top, rgba(255,107,43,0.93) 0%, rgba(10,15,26,0.5) 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end;
      padding-bottom: 36px; gap: 4px;
      color: white; opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 13; cursor: none;
    `;

    // Pasang semua ke DOM
    aboutWrapper.style.position = 'relative';
    aboutWrapper.insertBefore(spinRing, aboutFrame);
    aboutWrapper.insertBefore(glowEl, aboutFrame);
    aboutFrame.appendChild(shineWrap);
    aboutFrame.appendChild(hoverOverlay);

    // Float pada frame
    aboutFrame.style.animation = 'photoFloat 4.5s ease-in-out infinite';
    aboutFrame.style.position = 'relative';
    aboutFrame.style.zIndex = '2';

    // Hover: zoom + overlay muncul
    aboutFrame.addEventListener('mouseenter', () => {
      hoverOverlay.style.opacity = '1';
      const media = aboutFrame.querySelector('img, .about-photo, .about-image-placeholder');
      if (media) { media.style.transition = 'transform 0.5s ease'; media.style.transform = 'scale(1.07)'; }
      spinRing.style.animationDuration = '1s';
    });
    aboutFrame.addEventListener('mouseleave', () => {
      hoverOverlay.style.opacity = '0';
      const media = aboutFrame.querySelector('img, .about-photo, .about-image-placeholder');
      if (media) media.style.transform = 'scale(1)';
      spinRing.style.animationDuration = '4s';
    });

    // Kedip ring setiap 6 detik
    setInterval(() => {
      let count = 0;
      const blink = setInterval(() => {
        spinRing.style.opacity = count % 2 === 0 ? '0.1' : '0.75';
        count++;
        if (count >= 4) { clearInterval(blink); spinRing.style.opacity = '0.75'; }
      }, 140);
    }, 6000);

    // Warna ring berganti setiap 5 detik
    const ringColors = [
      'conic-gradient(from 0deg, #ff6b2b, #ff9500, #ffd700, #ff3d3d, #ff6b2b)',
      'conic-gradient(from 0deg, #ffd700, #ff6b2b, #ff3d3d, #ff9500, #ffd700)',
      'conic-gradient(from 0deg, #ff3d3d, #ffd700, #ff9500, #ff6b2b, #ff3d3d)',
      'conic-gradient(from 0deg, #ff9500, #ff3d3d, #ff6b2b, #ffd700, #ff9500)',
    ];
    let ringIdx = 0;
    setInterval(() => {
      ringIdx = (ringIdx + 1) % ringColors.length;
      spinRing.style.transition = 'background 1.2s ease';
      spinRing.style.background = ringColors[ringIdx];
    }, 5000);

  } // end animasi foto

  // ==========================================
  // 16. PAGE LOAD — konten langsung terlihat
  // ==========================================
  // Tidak ada opacity manipulation di sini.
  // Konten langsung tampil tanpa disembunyikan.

});