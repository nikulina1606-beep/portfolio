const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress span');

function updateScrollState() {
  const top = window.scrollY;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const value = available > 0 ? Math.min(1, top / available) : 0;
  header?.classList.toggle('is-scrolled', top > 28);
  if (progress) progress.style.width = `${value * 100}%`;
}

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });

const menuToggle = document.querySelector('.menu-toggle');
const siteNavigation = document.getElementById('main-navigation');
const mobileNavigationQuery = window.matchMedia('(max-width: 800px)');

function setMobileMenu(open) {
  const shouldOpen = Boolean(open && mobileNavigationQuery.matches);
  menuToggle?.classList.toggle('is-open', shouldOpen);
  siteNavigation?.classList.toggle('is-open', shouldOpen);
  menuToggle?.setAttribute('aria-expanded', String(shouldOpen));
  menuToggle?.setAttribute('aria-label', shouldOpen ? 'Закрыть меню' : 'Открыть меню');
  document.body.classList.toggle('mobile-menu-open', shouldOpen);
}

menuToggle?.addEventListener('click', () => {
  setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

siteNavigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMobileMenu(false));
});

document.addEventListener('click', (event) => {
  if (menuToggle?.getAttribute('aria-expanded') !== 'true') return;
  if (!header?.contains(event.target)) setMobileMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuToggle?.getAttribute('aria-expanded') !== 'true') return;
  setMobileMenu(false);
  menuToggle.focus();
});

mobileNavigationQuery.addEventListener?.('change', (event) => {
  if (!event.matches) setMobileMenu(false);
});

const revealSelector = [
  '.about > div', '.stats', '.projects-intro > *', '.case-heading > *', '.case-cover',
  '.case-card', '.scope-intro', '.scope-columns > div', '.process > .mini-label',
  '.process-grid > div', '.decisions-intro', '.decisions-grid > article', '.product-flow > *', '.artifacts-section > *', '.results > *',
  '.gallery-section > *', '.video-section > *', '.proposal > *', '.research-hero > *',
  '.research-layout > div', '.method-section > *', '.method-line > li', '.insights > *',
  '.insight-grid > div', '.quant-section > *', '.research-outcome > *', '.skills > div', '.skills-grid > div',
  '.contact > *'
].join(',');

const revealItems = [...document.querySelectorAll(revealSelector)];
revealItems.forEach((item, index) => {
  item.classList.add('js-reveal');
  if (item.matches('.process-grid > div, .decisions-grid > article, .insight-grid > div, .method-line > li, .skills-grid > div')) {
    item.dataset.revealDelay = String(index % 4);
  }
});

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -7%' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const gallery = document.querySelector('[data-gallery-track]');
const galleryPrev = document.querySelector('[data-gallery-prev]');
const galleryNext = document.querySelector('[data-gallery-next]');

function galleryStep(direction) {
  if (!gallery) return;
  const card = gallery.querySelector('.gallery-item');
  const step = card ? card.getBoundingClientRect().width + 12 : gallery.clientWidth * 0.8;
  gallery.scrollBy({ left: direction * step, behavior: reducedMotion ? 'auto' : 'smooth' });
}

function updateGalleryControls() {
  if (!gallery) return;
  const end = gallery.scrollWidth - gallery.clientWidth;
  if (galleryPrev) galleryPrev.disabled = gallery.scrollLeft < 4;
  if (galleryNext) galleryNext.disabled = gallery.scrollLeft > end - 4;
}

galleryPrev?.addEventListener('click', () => galleryStep(-1));
galleryNext?.addEventListener('click', () => galleryStep(1));
gallery?.addEventListener('scroll', updateGalleryControls, { passive: true });
window.addEventListener('resize', updateGalleryControls);
updateGalleryControls();

const navLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
const navTargets = navLinks
  .map((link) => ({ link, target: document.querySelector(link.getAttribute('href')) }))
  .filter((item) => item.target);

function updateActiveNavigation() {
  const marker = window.scrollY + Math.min(220, window.innerHeight * 0.28);
  let active = navTargets[0];
  navTargets.forEach((item) => {
    if (item.target.offsetTop <= marker) active = item;
  });
  navTargets.forEach((item) => {
    const isActive = item === active;
    item.link.classList.toggle('is-active', isActive);
    if (isActive) item.link.setAttribute('aria-current', 'location');
    else item.link.removeAttribute('aria-current');
  });
}

updateActiveNavigation();
window.addEventListener('scroll', updateActiveNavigation, { passive: true });

const countItems = [...document.querySelectorAll('[data-count]')];

function animateCount(item) {
  if (item.dataset.counted === 'true') return;
  item.dataset.counted = 'true';
  const target = Number(item.dataset.count);
  const prefix = item.dataset.prefix || '';
  const suffix = item.dataset.suffix || '';
  if (reducedMotion || !Number.isFinite(target)) {
    item.textContent = `${prefix}${target}${suffix}`;
    return;
  }
  const duration = 720;
  const start = performance.now();
  const frame = (now) => {
    const progressValue = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    item.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progressValue < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if (!('IntersectionObserver' in window)) {
  countItems.forEach(animateCount);
} else {
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  countItems.forEach((item) => countObserver.observe(item));
}

const dialog = document.getElementById('lightbox');
const dialogImage = document.getElementById('lightboxImage');
const dialogCaption = document.getElementById('lightboxCaption');
const closeButton = document.getElementById('closeLightbox');

document.querySelectorAll('[data-full]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!dialog || !dialogImage) return;
    const source = button.querySelector('img');
    dialogImage.src = button.dataset.full;
    dialogImage.alt = source?.alt ? `Увеличенное изображение: ${source.alt}` : 'Увеличенный материал';
    if (dialogCaption) dialogCaption.textContent = source?.alt || 'Материал из кейса SkinX';
    dialog.showModal();
  });
});

function closeLightbox() {
  if (!dialog?.open) return;
  dialog.close();
}

closeButton?.addEventListener('click', closeLightbox);
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeLightbox();
});
dialog?.addEventListener('close', () => {
  if (dialogImage) dialogImage.removeAttribute('src');
});

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((other) => {
      if (other !== video && !other.paused) other.pause();
    });
  });
});
