/* ==========================================
   ARIF DEV — PORTFOLIO JAVASCRIPT
   Interactions, Animations & Effects
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Devices with a touch/coarse pointer (phones, tablets) get zero benefit
  // from a custom mouse cursor, hover-tilt or mouse-parallax effects — they
  // only cost CPU/battery and can make scrolling feel heavier. We detect
  // that once up front and simply skip setting those features up at all.
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

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
  // 1. CUSTOM CURSOR (desktop / mouse only)
  // ==========================================
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  if (isCoarsePointer) {
    // No mouse: hide the custom cursor elements and restore the native
    // (invisible-by-default-on-touch) cursor instead of "cursor: none".
    if (cursor) cursor.style.display = 'none';
    if (cursorFollower) cursorFollower.style.display = 'none';
    body.classList.add('no-custom-cursor');
  } else {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    }, { passive: true });

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
  }

  // ==========================================
  // 2. NAVIGATION
  // ==========================================
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

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
  // Kept as a plain array (not a live NodeList) so we can splice out
  // elements as soon as they've been revealed — that way each scroll
  // tick only checks the elements still waiting to appear, instead of
  // re-measuring every single one on every scroll event forever.
  let pendingReveal = Array.from(document.querySelectorAll('.reveal-up, .reveal-right'));

  function triggerReveal() {
    if (!pendingReveal.length) return;
    const wh = window.innerHeight || document.documentElement.clientHeight;
    pendingReveal = pendingReveal.filter(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= wh - 60) {
        el.classList.add('visible');
        return false; // done, drop from the list
      }
      return true; // still waiting
    });
  }

  triggerReveal();
  setTimeout(triggerReveal, 200);
  setTimeout(triggerReveal, 600);

  // ==========================================
  // UNIFIED SCROLL HANDLER (rAF-batched)
  // ==========================================
  // Nav "scrolled" class, reveal-on-scroll and the progress bar all used
  // to run as separate `scroll` listeners, each forcing its own layout
  // read. Batching them into one requestAnimationFrame-gated handler
  // means all the work per scroll gesture happens at most once per
  // rendered frame instead of once per raw scroll event (which can fire
  // dozens of times per frame on some devices/trackpads).
  let scrollTicking = false;
  function onScrollFrame() {
    scrollTicking = false;
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    triggerReveal();
    updateProgressBar();
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });

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
  // Refactored into an init function so it can be re-run after the review
  // cards are (re)loaded from JSONBin — the original version only ever
  // queried the slides once, before any dynamic content existed.
  const track = document.getElementById('testimonialTrack');
  const sliderDotsWrap = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentSlide = 0;
  let totalSlides = 0;
  let autoSlide = null;

  function goToSlide(index) {
    if (!totalSlides) return;
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    sliderDotsWrap.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function initSlider() {
    const slides = track.querySelectorAll('.testimonial-card');
    totalSlides = slides.length;
    currentSlide = 0;

    // Rebuild the dots to match however many cards we actually have.
    sliderDotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      sliderDotsWrap.appendChild(dot);
    }

    track.style.transform = 'translateX(0%)';

    if (autoSlide) clearInterval(autoSlide);
    if (totalSlides > 1) {
      autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  track.addEventListener('mouseenter', () => { if (autoSlide) clearInterval(autoSlide); });
  track.addEventListener('mouseleave', () => {
    if (totalSlides > 1) autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
  });

  initSlider(); // run once now for the fallback cards; re-run again once JSONBin data loads

  // ==========================================
  // 6B. CLIENT REVIEWS — powered by JSONBin.io
  // ==========================================
  // HOW TO SET THIS UP (one-time, ~2 minutes):
  //   1. Create a free account at https://jsonbin.io
  //   2. Create a new bin with this starting content:
  //        { "reviews": [] }
  //   3. Copy the Bin ID and your "X-Master-Key" from the dashboard.
  //   4. Paste them into REVIEWS_CONFIG below.
  // Until this is filled in, the section simply shows the 3 fallback
  // cards above and the review form is disabled with a friendly note.
  const REVIEWS_CONFIG = {
    binId: 'YOUR_JSONBIN_BIN_ID',       // <-- ganti dengan Bin ID Anda
    apiKey: 'YOUR_JSONBIN_X_MASTER_KEY', // <-- ganti dengan X-Master-Key Anda
  };
  const isReviewsConfigured = !REVIEWS_CONFIG.binId.startsWith('YOUR_') && !REVIEWS_CONFIG.apiKey.startsWith('YOUR_');
  const JSONBIN_BASE = `https://api.jsonbin.io/v3/b/${REVIEWS_CONFIG.binId}`;

  const testimonialStatus = document.getElementById('testimonialStatus');
  const toggleReviewFormBtn = document.getElementById('toggleReviewForm');
  const reviewForm = document.getElementById('reviewForm');
  const reviewFormMsg = document.getElementById('reviewFormMsg');
  const reviewSubmitBtn = document.getElementById('reviewSubmitBtn');
  const starRatingWrap = document.getElementById('starRating');
  const reviewRatingInput = document.getElementById('reviewRating');

  function escapeInitials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
    return initials || '★';
  }

  function starsString(rating) {
    const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    return '★★★★★☆☆☆☆☆'.slice(5 - r, 10 - r);
  }

  // Builds a testimonial card using textContent everywhere a reviewer's
  // own words are involved — this is important because these reviews come
  // from a public, unauthenticated source (anyone can submit one). Using
  // innerHTML here would let a malicious submission run script in every
  // visitor's browser (stored XSS). textContent can never do that.
  function buildTestimonialCard(review, { isNew } = {}) {
    const card = document.createElement('div');
    card.className = 'testimonial-card' + (isNew ? ' new-review' : '');

    const quote = document.createElement('div');
    quote.className = 'testi-quote';
    quote.textContent = '"';

    const text = document.createElement('p');
    text.className = 'testi-text';
    text.textContent = review.text;

    const author = document.createElement('div');
    author.className = 'testi-author';

    const avatar = document.createElement('div');
    avatar.className = 'testi-avatar';
    avatar.textContent = escapeInitials(review.name || '');

    const nameWrap = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = review.name || 'Klien';
    const span = document.createElement('span');
    span.textContent = review.role || '';
    nameWrap.appendChild(strong);
    nameWrap.appendChild(span);

    author.appendChild(avatar);
    author.appendChild(nameWrap);

    const stars = document.createElement('div');
    stars.className = 'testi-stars';
    stars.textContent = starsString(review.rating);

    card.appendChild(quote);
    card.appendChild(text);
    card.appendChild(author);
    card.appendChild(stars);
    return card;
  }

  function renderReviews(reviews, { prependNew } = {}) {
    track.innerHTML = '';
    if (!reviews.length) {
      // Nothing submitted yet — keep at least a friendly empty state.
      const empty = document.createElement('div');
      empty.className = 'testimonial-card';
      const text = document.createElement('p');
      text.className = 'testi-text';
      text.textContent = 'Belum ada ulasan. Jadilah yang pertama menulis ulasan!';
      empty.appendChild(text);
      track.appendChild(empty);
    } else {
      reviews.forEach((r, i) => {
        track.appendChild(buildTestimonialCard(r, { isNew: prependNew && i === 0 }));
      });
    }
    initSlider();
  }

  async function loadReviews() {
    if (!isReviewsConfigured) {
      testimonialStatus.textContent = '';
      return;
    }
    try {
      const res = await fetch(`${JSONBIN_BASE}/latest`, {
        headers: {
          'X-Master-Key': REVIEWS_CONFIG.apiKey,
          'X-Bin-Meta': 'false',
        },
      });
      if (!res.ok) throw new Error('Gagal memuat ulasan');
      const data = await res.json();
      const reviews = Array.isArray(data.reviews) ? data.reviews : [];
      reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      testimonialStatus.textContent = '';
      renderReviews(reviews);
    } catch (err) {
      // Keep the fallback cards already in the DOM; just let the visitor know.
      testimonialStatus.textContent = '';
      console.warn('Tidak bisa memuat ulasan dari JSONBin:', err);
    }
  }

  loadReviews();

  // --- Review form UI ---
  if (toggleReviewFormBtn && reviewForm) {
    if (!isReviewsConfigured) {
      toggleReviewFormBtn.disabled = true;
      toggleReviewFormBtn.title = 'Fitur ulasan belum dikonfigurasi (lihat REVIEWS_CONFIG di script.js)';
    }

    toggleReviewFormBtn.addEventListener('click', () => {
      reviewForm.hidden = !reviewForm.hidden;
      toggleReviewFormBtn.textContent = reviewForm.hidden ? '✍️ Tulis Ulasan Anda' : '✕ Tutup Form';
    });

    // Star rating picker
    const starBtns = Array.from(starRatingWrap.querySelectorAll('.star-btn'));
    function paintStars(value) {
      starBtns.forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.value) <= value);
      });
    }
    paintStars(5);
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reviewRatingInput.value = btn.dataset.value;
        paintStars(Number(btn.dataset.value));
      });
      btn.addEventListener('mouseenter', () => paintStars(Number(btn.dataset.value)));
    });
    starRatingWrap.addEventListener('mouseleave', () => paintStars(Number(reviewRatingInput.value)));

    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      reviewFormMsg.textContent = '';
      reviewFormMsg.className = 'review-form-msg';

      // Honeypot — if this hidden field got filled in, it's almost certainly a bot.
      if (reviewForm.website.value) return;

      if (!isReviewsConfigured) {
        reviewFormMsg.textContent = 'Fitur ulasan belum dikonfigurasi oleh pemilik situs.';
        reviewFormMsg.classList.add('error');
        return;
      }

      // Simple client-side throttle so one visitor can't spam the bin.
      const lastSubmit = Number(localStorage.getItem('lastReviewSubmit') || 0);
      if (Date.now() - lastSubmit < 60 * 1000) {
        reviewFormMsg.textContent = 'Anda baru saja mengirim ulasan. Coba lagi sebentar lagi.';
        reviewFormMsg.classList.add('error');
        return;
      }

      const newReview = {
        id: 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        name: reviewForm.reviewName.value.trim().slice(0, 60),
        role: reviewForm.reviewRole.value.trim().slice(0, 60),
        rating: Number(reviewRatingInput.value) || 5,
        text: reviewForm.reviewText.value.trim().slice(0, 400),
        date: new Date().toISOString(),
      };
      if (!newReview.name || !newReview.role || !newReview.text) return;

      reviewSubmitBtn.disabled = true;
      reviewSubmitBtn.style.opacity = '0.7';

      try {
        // Read-modify-write: fetch the latest list, add ours, save it back.
        const getRes = await fetch(`${JSONBIN_BASE}/latest`, {
          headers: { 'X-Master-Key': REVIEWS_CONFIG.apiKey, 'X-Bin-Meta': 'false' },
        });
        const current = getRes.ok ? await getRes.json() : { reviews: [] };
        const reviews = Array.isArray(current.reviews) ? current.reviews : [];
        reviews.unshift(newReview);

        const putRes = await fetch(JSONBIN_BASE, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': REVIEWS_CONFIG.apiKey,
          },
          body: JSON.stringify({ reviews }),
        });
        if (!putRes.ok) throw new Error('Gagal menyimpan ulasan');

        localStorage.setItem('lastReviewSubmit', String(Date.now()));
        renderReviews(reviews, { prependNew: true });
        goToSlide(0);

        reviewFormMsg.textContent = 'Terima kasih! Ulasan Anda sudah tampil.';
        reviewFormMsg.classList.add('success');
        reviewForm.reset();
        paintStars(5);
        reviewRatingInput.value = 5;
        setTimeout(() => {
          reviewForm.hidden = true;
          toggleReviewFormBtn.textContent = '✍️ Tulis Ulasan Anda';
          reviewFormMsg.textContent = '';
        }, 2500);
      } catch (err) {
        reviewFormMsg.textContent = 'Gagal mengirim ulasan. Silakan coba lagi.';
        reviewFormMsg.classList.add('error');
        console.error(err);
      } finally {
        reviewSubmitBtn.disabled = false;
        reviewSubmitBtn.style.opacity = '';
      }
    });
  }

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
  // 9. PARALLAX BLOBS (desktop / mouse only, rAF-throttled)
  // ==========================================
  if (!isCoarsePointer) {
    const blobs = document.querySelectorAll('.hero-blob');
    let blobTicking = false;
    let lastBlobX = 0, lastBlobY = 0;
    window.addEventListener('mousemove', (e) => {
      lastBlobX = (e.clientX / window.innerWidth - 0.5) * 20;
      lastBlobY = (e.clientY / window.innerHeight - 0.5) * 20;
      if (!blobTicking) {
        blobTicking = true;
        requestAnimationFrame(() => {
          blobTicking = false;
          blobs.forEach((blob, i) => {
            const factor = (i + 1) * 0.4;
            blob.style.transform = `translate(${lastBlobX * factor}px, ${lastBlobY * factor}px)`;
          });
        });
      }
    }, { passive: true });
  }

  // ==========================================
  // 10. TILT EFFECT ON CARDS (desktop / mouse only, rAF-throttled)
  // ==========================================
  if (!isCoarsePointer) {
    const tiltCards = document.querySelectorAll('.service-card, .portfolio-card');
    tiltCards.forEach(card => {
      let tiltTicking = false;
      let lastTiltEvent = null;
      card.addEventListener('mousemove', (e) => {
        lastTiltEvent = e;
        if (!tiltTicking) {
          tiltTicking = true;
          requestAnimationFrame(() => {
            tiltTicking = false;
            const rect = card.getBoundingClientRect();
            const x = (lastTiltEvent.clientX - rect.left) / rect.width - 0.5;
            const y = (lastTiltEvent.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-8px) scale(1.01)`;
          });
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

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
  function updateProgressBar() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? window.scrollY / total * 100 : 0) + '%';
  }
  updateProgressBar();

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