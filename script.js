const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const toast = document.querySelector('.toast');
const cartCount = document.querySelector('.cart-count');
const cartDialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartView = document.querySelector('#cart-view');
const checkoutView = document.querySelector('#checkout-view');
const checkoutSuccess = document.querySelector('#checkout-success');
const cartStorageKey = 'eleve-bakery-cart-v1';
const phonePatternHint = 'Enter a phone number with 8 to 15 digits.';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('eleve-bakery-cart-v1') || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) => item && typeof item.name === 'string' && Number.isFinite(item.price) && item.price > 0 && Number.isInteger(item.quantity) && item.quantity > 0 && typeof item.key === 'string');
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  } catch {
    showToast('Your browser could not save this order.');
  }
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function makeSummaryRow(item) {
  const row = document.createElement('div');
  row.className = 'summary-row';
  const name = document.createElement('span');
  name.textContent = `${item.name} · ${money.format(item.price)} × ${item.quantity}`;
  const amount = document.createElement('strong');
  amount.textContent = money.format(item.price * item.quantity);
  row.append(name, amount);
  return row;
}

function renderSummary(container) {
  container.replaceChildren(...cart.map(makeSummaryRow));
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = money.format(cartSubtotal());
  cartCount.textContent = itemCount;
  cartCount.setAttribute('aria-label', `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your order`);
  cartItems.replaceChildren(...cart.map((item) => {
    const row = document.createElement('article');
    row.className = 'cart-line';
    const details = document.createElement('div');
    details.className = 'cart-line-details';
    const name = document.createElement('h3');
    name.textContent = item.name;
    const unitPrice = document.createElement('span');
    unitPrice.textContent = `${money.format(item.price)} each`;
    details.append(name, unitPrice);

    const controls = document.createElement('div');
    controls.className = 'cart-line-controls';
    const quantity = document.createElement('div');
    quantity.className = 'quantity-control';
    const decrease = document.createElement('button');
    decrease.type = 'button';
    decrease.dataset.cartAction = 'decrease';
    decrease.dataset.itemKey = item.key;
    decrease.setAttribute('aria-label', `Decrease ${item.name} quantity`);
    decrease.textContent = '−';
    const quantityValue = document.createElement('span');
    quantityValue.textContent = item.quantity;
    const increase = document.createElement('button');
    increase.type = 'button';
    increase.dataset.cartAction = 'increase';
    increase.dataset.itemKey = item.key;
    increase.setAttribute('aria-label', `Increase ${item.name} quantity`);
    increase.textContent = '+';
    quantity.append(decrease, quantityValue, increase);

    const lineTotal = document.createElement('strong');
    lineTotal.className = 'cart-line-total';
    lineTotal.textContent = money.format(item.price * item.quantity);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-remove';
    remove.dataset.cartAction = 'remove';
    remove.dataset.itemKey = item.key;
    remove.setAttribute('aria-label', `Remove ${item.name} from order`);
    remove.textContent = 'Remove';
    controls.append(quantity, lineTotal, remove);
    row.append(details, controls);
    return row;
  }));
  cartEmpty.hidden = cart.length > 0;
  cartItems.hidden = cart.length === 0;
  document.querySelector('#cart-subtotal').textContent = subtotal;
  document.querySelector('#cart-total').textContent = subtotal;
  document.querySelector('#checkout-start').disabled = cart.length === 0;
  document.querySelector('#cart-clear').disabled = cart.length === 0;
}

function showCartView(view) {
  cartView.hidden = view !== 'cart';
  checkoutView.hidden = view !== 'checkout';
  checkoutSuccess.hidden = view !== 'success';
}

function openCart() {
  showCartView('cart');
  if (!cartDialog.open) cartDialog.showModal();
}

function closeCart() {
  if (cartDialog.open) cartDialog.close();
}

function addToCart(button) {
  const name = button.dataset.order;
  const price = Number(button.dataset.price);
  if (!name || !Number.isFinite(price) || price <= 0) return;
  const key = `${name}|${price}`;
  const existing = cart.find((item) => item.key === key);
  if (existing) existing.quantity += 1;
  else cart.push({ key, name, price, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${name} added to your order`);
}

function configurePhoneInput(input, hint) {
  function validate() {
    const digits = input.value.replace(/\D/g, '').length;
    const invalid = input.value.length > 0 && (!/^[+()\d\s.-]+$/.test(input.value) || digits < 8 || digits > 15);
    input.setCustomValidity(invalid ? phonePatternHint : '');
    input.setAttribute('aria-invalid', String(invalid));
    if (hint) hint.textContent = invalid ? phonePatternHint : '';
  }
  input.addEventListener('input', validate);
  return validate;
}

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
  button.setAttribute('aria-label', `Add ${button.dataset.order} to your order`);
  button.addEventListener('click', () => addToCart(button));
});

document.querySelectorAll('[data-cart-open]').forEach((button) => button.addEventListener('click', openCart));
document.querySelector('#cart-open').addEventListener('click', openCart);
document.querySelector('#cart-close').addEventListener('click', closeCart);
document.querySelector('#cart-clear').addEventListener('click', () => {
  cart = [];
  saveCart();
  renderCart();
  showToast('Your order bag is clear.');
});
cartItems.addEventListener('click', (event) => {
  const control = event.target.closest('[data-cart-action]');
  if (!control) return;
  const item = cart.find((entry) => entry.key === control.dataset.itemKey);
  if (!item) return;
  if (control.dataset.cartAction === 'increase') item.quantity += 1;
  if (control.dataset.cartAction === 'decrease') item.quantity -= 1;
  if (control.dataset.cartAction === 'remove' || item.quantity <= 0) cart = cart.filter((entry) => entry.key !== item.key);
  saveCart();
  renderCart();
});
cartDialog.addEventListener('click', (event) => {
  if (event.target === cartDialog) closeCart();
  if (event.target.closest('[data-cart-close]')) {
    closeCart();
    document.querySelector('#menu').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
});
renderCart();

document.querySelector('#checkout-start').addEventListener('click', () => {
  if (!cart.length) return;
  renderSummary(document.querySelector('#checkout-items'));
  document.querySelector('#checkout-subtotal').textContent = money.format(cartSubtotal());
  document.querySelector('#checkout-total').textContent = money.format(cartSubtotal());
  showCartView('checkout');
  checkoutForm.elements.name.focus();
});
document.querySelector('#checkout-back').addEventListener('click', () => showCartView('cart'));
document.querySelector('#return-to-menu').addEventListener('click', () => {
  closeCart();
  window.setTimeout(() => document.querySelector('#menu').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }), 0);
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
  if (reducedMotion.matches) return;
  carouselTimer = window.setInterval(() => showSlide(slideIndex + 1), 6000);
}
document.querySelector('#testimonial-prev').addEventListener('click', () => { showSlide(slideIndex - 1); startCarousel(); });
document.querySelector('#testimonial-next').addEventListener('click', () => { showSlide(slideIndex + 1); startCarousel(); });
dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); startCarousel(); }));
document.querySelector('.testimonial-stage').addEventListener('mouseenter', () => window.clearInterval(carouselTimer));
document.querySelector('.testimonial-stage').addEventListener('mouseleave', startCarousel);
startCarousel();

function localDateAfter(days = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const cakeForm = document.querySelector('#order-form');
const cakeDate = document.querySelector('#event-date');
const cakePhone = cakeForm.elements.phone;
const cakePhoneValidate = configurePhoneInput(cakePhone, document.querySelector('#cake-phone-error'));
cakeDate.min = localDateAfter(3);
cakeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  cakePhoneValidate();
  if (!cakeForm.reportValidity()) return;
  const button = cakeForm.querySelector('[type="submit"]');
  const feedback = document.querySelector('#order-feedback');
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending enquiry…';
  feedback.textContent = 'Preparing your enquiry…';
  window.setTimeout(() => {
    feedback.textContent = 'Thank you! Your cake enquiry has been received. Our team will contact you shortly.';
    cakeForm.reset();
    cakeDate.min = localDateAfter(3);
    cakePhoneValidate();
    button.disabled = false;
    button.textContent = originalLabel;
  }, 650);
});

const checkoutForm = document.querySelector('#checkout-form');
const checkoutDate = checkoutForm.elements.date;
const checkoutPhone = checkoutForm.elements.phone;
const checkoutPhoneValidate = configurePhoneInput(checkoutPhone, document.querySelector('#checkout-phone-error'));
checkoutDate.min = localDateAfter();
checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  checkoutPhoneValidate();
  if (!checkoutForm.reportValidity() || !cart.length) return;
  const button = checkoutForm.querySelector('[type="submit"]');
  const feedback = document.querySelector('#checkout-feedback');
  button.disabled = true;
  button.textContent = 'Sending your order…';
  feedback.textContent = 'Preparing your order summary…';
  window.setTimeout(() => {
    const customerName = checkoutForm.elements.name.value.trim();
    const preferredDate = checkoutForm.elements.date.value;
    const instructions = checkoutForm.elements.instructions.value.trim();
    const reference = `ELV-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const total = cartSubtotal();
    renderSummary(document.querySelector('#success-items'));
    document.querySelector('#success-subtotal').textContent = money.format(total);
    document.querySelector('#success-total').textContent = money.format(total);
    document.querySelector('#order-reference').textContent = reference;
    const orderLines = cart.map((item) => `${item.quantity} × ${item.name} (${money.format(item.price * item.quantity)})`).join('\n');
    const message = [`Hello Élevé Bakery, I am ${customerName}.`, `Order reference: ${reference}`, orderLines, `Total: ${money.format(total)}`, `Preferred date: ${preferredDate}`, instructions && `Instructions: ${instructions}`].filter(Boolean).join('\n');
    document.querySelector('#whatsapp-order').href = `https://wa.me/912040000077?text=${encodeURIComponent(message)}`;
    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();
    checkoutDate.min = localDateAfter();
    checkoutPhoneValidate();
    button.disabled = false;
    button.textContent = 'Send order request ↗';
    showCartView('success');
    document.querySelector('#success-title').focus();
  }, 650);
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
function counterText(counter, value) {
  const formatted = counter.dataset.format === '2-digit' ? String(value).padStart(2, '0') : String(value);
  return `${formatted}${counter.dataset.suffix || '+'}`;
}

function animateCounters() {
  if (countersStarted) return;
  countersStarted = true;
  document.querySelectorAll('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count);
    if (reducedMotion.matches) {
      counter.textContent = counterText(counter, target);
      return;
    }
    const start = performance.now();
    const duration = 1250;
    counter.textContent = counterText(counter, 0);
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      counter.textContent = counterText(counter, Math.round(target * eased));
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
    }, { threshold: 0.25 });
    statsObserver.observe(stats);
  }
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
  animateCounters();
}