const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const toast = document.querySelector('.toast');
const cartCount = document.querySelector('.cart-count');
let orderCount = 0;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function closeMenu() {
  primaryNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation');
  document.body.classList.remove('menu-open');
}

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  primaryNav.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
});

primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });

function updateScrollState() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('.scroll-progress').style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  header.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

const navLinks = [...document.querySelectorAll('.primary-nav a')];
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  navSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('[data-order]').forEach((button) => {
  button.addEventListener('click', () => {
    orderCount += 1;
    cartCount.textContent = orderCount;
    cartCount.setAttribute('aria-label', `${orderCount} ${orderCount === 1 ? 'item' : 'items'} in order`);
    showToast(`${button.dataset.order} added to your order · ₹${button.dataset.price}`);
  });
});

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter-button.active')?.classList.remove('active');
    button.classList.add('active');
    document.querySelectorAll('.filter-button').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
    const selected = button.dataset.filter;
    document.querySelectorAll('.menu-item').forEach((item) => {
      const visible = selected === 'all' || item.dataset.category === selected;
      item.hidden = !visible;
      if (visible) {
        item.style.animation = 'none';
        requestAnimationFrame(() => { item.style.animation = ''; });
      }
    });
  });
});

document.querySelectorAll('.cake-filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.cake-filter.active')?.classList.remove('active');
    button.classList.add('active');
    document.querySelectorAll('.cake-filter').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
    document.querySelectorAll('.cake-card').forEach((card) => { card.hidden = button.dataset.cakeFilter !== 'all' && card.dataset.cake !== button.dataset.cakeFilter; });
  });
});

document.querySelectorAll('[data-details]').forEach((button) => {
  button.addEventListener('click', () => {
    const [name, description] = button.dataset.details.split('|');
    showToast(`${name}: ${description}`);
  });
});

const galleryItems = [...document.querySelectorAll('.gallery-item')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('figcaption');
const lightboxCount = lightbox.querySelector('.lightbox-count');
let galleryIndex = 0;
let lastFocusedElement;

function showGalleryImage(index) {
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const image = galleryItems[galleryIndex].querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = galleryItems[galleryIndex].querySelector('span').textContent;
  lightboxCount.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lastFocusedElement?.focus();
}

galleryItems.forEach((item) => item.addEventListener('click', () => {
  lastFocusedElement = item;
  showGalleryImage(Number(item.dataset.gallery));
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightbox.querySelector('.lightbox-close').focus();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showGalleryImage(galleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(galleryIndex + 1);
});

const slides = [...document.querySelectorAll('.testimonial-slide')];
const dots = [...document.querySelectorAll('.testimonial-dots button')];
let slideIndex = 0;
let carouselTimer;

function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === slideIndex));
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === slideIndex);
    dot.setAttribute('aria-pressed', String(i === slideIndex));
  });
}
function startCarousel() {
  window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => showSlide(slideIndex + 1), 6000);
}
document.querySelector('#testimonial-prev').addEventListener('click', () => { showSlide(slideIndex - 1); startCarousel(); });
document.querySelector('#testimonial-next').addEventListener('click', () => { showSlide(slideIndex + 1); startCarousel(); });
dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); startCarousel(); }));
document.querySelector('.testimonial-stage').addEventListener('mouseenter', () => window.clearInterval(carouselTimer));
document.querySelector('.testimonial-stage').addEventListener('mouseleave', startCarousel);
startCarousel();

const eventDate = document.querySelector('#event-date');
const today = new Date();
eventDate.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const phoneInput = document.querySelector('[name="phone"]');
function validatePhone() {
  const digits = phoneInput.value.replace(/\D/g, '').length;
  phoneInput.setCustomValidity(phoneInput.value && (digits < 8 || digits > 15) ? 'Enter a valid phone number with 8 to 15 digits.' : '');
}
phoneInput.addEventListener('input', validatePhone);

document.querySelector('#order-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.querySelector('#order-feedback');
  validatePhone();
  if (!form.reportValidity()) return;
  feedback.textContent = 'Thank you for choosing Élevé! Your order request has been received. Our team will contact you shortly.';
  form.reset();
  eventDate.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
});

document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.querySelector('#newsletter-feedback');
  if (!form.reportValidity()) return;
  feedback.textContent = 'You’re on the list. A little sweetness is on its way.';
  form.reset();
});

document.querySelector('#year').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.reveal');
const stats = document.querySelector('.stat-row');
let countersStarted = false;
function animateCounters() {
  if (countersStarted) return;
  countersStarted = true;
  document.querySelectorAll('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count);
    const suffix = counter.dataset.suffix || '+';
    const start = performance.now();
    const duration = 1100;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    revealObserver.observe(item);
  });
  if (stats) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.35 });
    statsObserver.observe(stats);
  }
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
  animateCounters();
}