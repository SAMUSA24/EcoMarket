'use strict';

// LA MAYOR PARTE DE ESTAS LINEAS DEL DOCUMENTO SCRIPT.JS NO TIENEN NINGUNA FUNCIONALIDAD, ME HUBIERA GUSTADO
// QUE FUNCIONARA PERO AL NO EMPEZAR DE CERO A REALIZAR LA PAGINA WEB DE ESTA FORMA NO HE TRENIDO TIEMPO.

const CART_KEY = 'ecomarket_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id, name, price, emoji) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) { item.qty += 1; }
  else { cart.push({ id, name, price, emoji, qty: 1 }); }
  saveCart(cart);
  updateCartUI();
  showToast(emoji, name);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartUI();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(id);
  saveCart(cart);
  updateCartUI();
}

function clearCart() {
  if (confirm('¿Vaciar el carrito?')) { saveCart([]); updateCartUI(); }
}
function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });

  const cartItems  = document.getElementById('cart-items');
  const cartEmpty  = document.getElementById('cart-empty');
  const cartFooter = document.getElementById('cart-footer');
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '';
    if (cartEmpty)  cartEmpty.style.display  = 'flex';
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartEmpty)  cartEmpty.style.display  = 'none';
  if (cartFooter) cartFooter.style.display = 'block';

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">€${(item.price * item.qty).toFixed(2)}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)" aria-label="Reducir">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="Aumentar">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Eliminar">✕</button>
    </div>
  `).join('');

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
}

function showToast(emoji, name) {
  document.querySelector('.eco-toast')?.remove();
  const t = document.createElement('div');
  t.className = 'eco-toast';
  t.innerHTML = `<span>${emoji}</span> <strong>${name}</strong> añadido al carrito`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('eco-toast--visible'));
  setTimeout(() => { t.classList.remove('eco-toast--visible'); setTimeout(() => t.remove(), 400); }, 2800);
}
function openCart()  {
  document.getElementById('cart-overlay')?.classList.add('active');
  document.getElementById('cart-panel')?.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateCartUI();
}
function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.getElementById('cart-panel')?.classList.remove('active');
  document.body.style.overflow = '';
}
function initFilters() {
  const btns  = document.querySelectorAll('.boton filtro');
  const cards = document.querySelectorAll('.tarjeta-producto');
  const count = document.getElementById('results-count');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');

      const cat = btn.dataset.category;
      let visible = 0;

      cards.forEach((card, i) => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.animationDelay = `${visible * 0.05}s`;
          card.classList.remove('card-enter');
          setTimeout(() => card.classList.add('card-enter'), 10);
          visible++;
        }
      });

      if (count) count.textContent = visible;
    });
  });
}
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('nav-abierta');
    toggle.setAttribute('aria-expanded', nav.classList.contains('nav-abierta'));
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target))
      nav.classList.remove('nav-abierta');
  });
}
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('es-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initMobileMenu();
  initScrollAnimations();
  if (document.getElementById('products-grid')) initFilters();
  document.querySelectorAll('.cart-trigger').forEach(b => b.addEventListener('click', openCart));
});