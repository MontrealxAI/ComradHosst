// ---- Falcon XL shared product data, illustrations, and cart logic ----
// Loaded on every page so the catalog and cart stay consistent site-wide.

const ORDER_API_URL = "https://comradhosst.onrender.com/api/order";

const VIALS = [
  {
    id:'bpc157', name:'BPC-157', dose:'Vial', price:330, accent:'#c9a227', lines:['BPC-157'],
    tagline:'Recovery & repair support',
    benefits:['Supports tissue repair & recovery','Supports gut lining health','Supports joint & tendon comfort'],
    pills:['Recovery','Gut Health','Joints'],
  },
  {
    id:'cjcipa', name:'CJC-1295 + Ipamorelin', dose:'Blend vial', price:330, accent:'#b08d2c', lines:['CJC-1295','+ IPAMORELIN'],
    tagline:'Growth hormone & recovery blend',
    benefits:['Supports natural growth hormone release','Supports lean muscle & recovery','Supports deeper sleep quality'],
    pills:['Muscle','Sleep','Recovery'],
  },
  {
    id:'reta30', name:'Retatrutide 30mg', dose:'30 mg vial', price:682, accent:'#d4b23a', lines:['RETATRUTIDE','30MG'],
    tagline:'Weight & metabolism support',
    benefits:['Supports weight management','Supports metabolic health','Supports appetite regulation'],
    pills:['Weight Loss','Metabolism','Appetite'],
  },
  {
    id:'ghkcu', name:'GHK-Cu', dose:'300 mg vial', price:363, accent:'#b97a4c', lines:['GHK-CU'],
    tagline:'Skin & collagen support',
    benefits:['Supports skin firmness & collagen','Supports visible signs of aging','Supports wound healing'],
    pills:['Skin','Anti-Aging','Collagen'],
  },
];

const PENS = VIALS.map(v => {
  const penListPrice = Math.round(v.price * 1.35);
  return {
    ...v,
    id: v.id + '-pen',
    name: v.name + ' Pen',
    dose: v.dose.replace('vial', 'pen').replace('Vial', 'Pen'),
    price: penListPrice,
    preorderPrice: Math.round(penListPrice * 0.9),
    isPen: true,
  };
});

const ALL_PRODUCTS = [...VIALS, ...PENS];

function getProductById(id){
  return ALL_PRODUCTS.find(p => p.id === id);
}

// ---- Illustrations ----
function vialSVG(accent, lines){
  const id = accent.replace('#','') + lines.join('').replace(/[^a-zA-Z0-9]/g,'');
  const lineCount = lines.length;
  const startY = 106 - (lineCount - 1) * 7;
  const textLines = lines.map((ln, i) =>
    `<text x="60" y="${startY + i * 14}" font-family="Oswald, sans-serif" font-size="10" font-weight="600" fill="${accent}" text-anchor="middle" letter-spacing="0.4">${ln}</text>`
  ).join('');
  const crimpTicks = [-11,-7.3,-3.6,0,3.6,7.3,11].map(dx =>
    `<line x1="${60+dx}" y1="24" x2="${60+dx}" y2="32" stroke="#00000030" stroke-width="0.8"/>`
  ).join('');

  return `
  <svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="glass-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="10%" stop-color="#e4e4e4" stop-opacity="0.55"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.28"/>
        <stop offset="90%" stop-color="#e4e4e4" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="cap-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="60%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="#5f4a12"/>
      </linearGradient>
      <linearGradient id="foil-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="50%" stop-color="#fff6da"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="181" rx="27" ry="5.5" fill="#000000" opacity="0.12"/>
    <ellipse cx="60" cy="8" rx="13" ry="4" fill="url(#foil-${id})"/>
    <rect x="47" y="8" width="26" height="20" rx="3" fill="url(#cap-${id})" stroke="#00000022"/>
    <ellipse cx="60" cy="28" rx="15" ry="4.2" fill="${accent}"/>
    ${crimpTicks}
    <rect x="52" y="28" width="16" height="12" fill="#dcdcdc" stroke="#bbb" stroke-width="0.5"/>
    <path d="M52,38 C52,50 30,49 26,60 L94,60 C90,49 68,50 68,38 Z"
          fill="url(#glass-${id})" stroke="#c9c9c9" stroke-width="1.1"/>
    <rect x="26" y="60" width="68" height="108" rx="13" fill="url(#glass-${id})" stroke="#c9c9c9" stroke-width="1.2"/>
    <path d="M28,144 Q60,140 92,144 L92,158 Q60,162 28,158 Z" fill="${accent}" opacity="0.14"/>
    <rect x="32" y="90" width="56" height="58" rx="5" fill="#0d0d0d" opacity="0.94" stroke="${accent}" stroke-opacity="0.35" stroke-width="0.8"/>
    <rect x="32" y="90" width="56" height="5" fill="${accent}"/>
    ${textLines}
    <line x1="40" y1="${startY + lineCount*14 - 2}" x2="80" y2="${startY + lineCount*14 - 2}" stroke="${accent}" stroke-width="0.7" opacity="0.5"/>
    <text x="60" y="142" font-family="Inter, sans-serif" font-size="6.5" fill="#999" text-anchor="middle" letter-spacing="1.2">FALCON XL</text>
    <rect x="31" y="64" width="7" height="98" rx="3.5" fill="#ffffff" opacity="0.6"/>
    <ellipse cx="60" cy="16" rx="7" ry="2" fill="#ffffff" opacity="0.35"/>
  </svg>`;
}

function penSVG(accent, lines){
  const id = 'pen' + accent.replace('#','') + lines.join('').replace(/[^a-zA-Z0-9]/g,'');
  const lineCount = lines.length;
  const startY = 120 - (lineCount - 1) * 6;
  const textLines = lines.map((ln, i) =>
    `<text x="55" y="${startY + i * 12}" font-family="Oswald, sans-serif" font-size="8.5" font-weight="600" fill="${accent}" text-anchor="middle" letter-spacing="0.4">${ln}</text>`
  ).join('');
  const doseMatch = lines[lines.length-1] && lines[lines.length-1].match(/\d+MG/);
  const doseLabel = doseMatch ? doseMatch[0] : 'DOSE';

  return `
  <svg viewBox="0 0 110 170" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pbody-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f4f4f4"/>
        <stop offset="18%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#e2e2e2"/>
        <stop offset="82%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f4f4f4"/>
      </linearGradient>
      <linearGradient id="pcap-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="#5f4a12"/>
      </linearGradient>
      <linearGradient id="pgrip-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2a2a2a"/>
        <stop offset="50%" stop-color="#454545"/>
        <stop offset="100%" stop-color="#2a2a2a"/>
      </linearGradient>
    </defs>
    <polygon points="55,4 61,20 49,20" fill="${accent}"/>
    <rect x="49" y="20" width="12" height="14" fill="url(#pcap-${id})"/>
    <rect x="40" y="34" width="30" height="26" rx="5" fill="url(#pcap-${id})" stroke="#00000022"/>
    <rect x="40" y="56" width="30" height="6" fill="${accent}" opacity="0.9"/>
    <rect x="37" y="62" width="36" height="10" rx="3" fill="url(#pgrip-${id})"/>
    <rect x="42" y="76" width="26" height="14" rx="2" fill="#eaf6ee" stroke="#bcd" stroke-width="0.6"/>
    <text x="55" y="86" font-family="Oswald" font-size="7" fill="#3f7a4f" text-anchor="middle" font-weight="700">${doseLabel}</text>
    <rect x="34" y="90" width="42" height="66" rx="8" fill="url(#pbody-${id})" stroke="#c9c9c9" stroke-width="1.2"/>
    <rect x="34" y="108" width="42" height="34" fill="#0d0d0d" opacity="0.92"/>
    <rect x="34" y="108" width="42" height="4" fill="${accent}"/>
    ${textLines}
    <rect x="42" y="156" width="26" height="10" rx="4" fill="url(#pgrip-${id})"/>
    <rect x="46" y="164" width="18" height="5" rx="2" fill="#1a1a1a"/>
    <rect x="38" y="94" width="5" height="58" rx="2.5" fill="#ffffff" opacity="0.8"/>
  </svg>`;
}

function productSVG(item){
  return item.isPen ? penSVG(item.accent, item.lines) : vialSVG(item.accent, item.lines);
}

// ---- Cart (persisted so it survives navigating between pages) ----
const CART_KEY = 'falconxl_cart_v1';

function getCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}

function saveCart(cart){
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e){}
}

function addToCart(id, label, unitPrice, isPreorder, btnEl){
  const cart = getCart();
  if(!cart[id]) cart[id] = { label, unitPrice, qty:0, isPreorder };
  cart[id].qty += 1;
  saveCart(cart);
  updateCartCount();
  if(typeof renderCart === 'function') renderCart();
  showToast(`Added ${label} to cart`);

  if(btnEl){
    const original = btnEl.textContent;
    btnEl.textContent = 'Added ✓';
    btnEl.classList.add('added');
    setTimeout(() => {
      btnEl.textContent = original;
      btnEl.classList.remove('added');
    }, 800);
  }
}

function changeQty(id, delta){
  const cart = getCart();
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  updateCartCount();
  if(typeof renderCart === 'function') renderCart();
}

function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
  updateCartCount();
  if(typeof renderCart === 'function') renderCart();
}

function clearCart(){
  saveCart({});
  updateCartCount();
  if(typeof renderCart === 'function') renderCart();
  showToast('Cart cleared');
}

function updateCartCount(){
  const countEl = document.getElementById('cart-count');
  if(!countEl) return;
  const cart = getCart();
  const total = Object.values(cart).reduce((sum, it) => sum + it.qty, 0);
  countEl.textContent = total;
  countEl.classList.toggle('zero', total === 0);
  countEl.classList.remove('pulse');
  void countEl.offsetWidth;
  if(total > 0) countEl.classList.add('pulse');
}

// ---- Toasts ----
function showToast(msg, type){
  let stack = document.getElementById('toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

// ---- Theme ----
function setTheme(dark){
  document.documentElement.classList.toggle('dark', dark);
  const btn = document.getElementById('theme-toggle');
  if(btn) btn.textContent = dark ? '☀️' : '🌙';
  try { localStorage.setItem('falconxl_theme', dark ? 'dark' : 'light'); } catch(e){}
}

function initTheme(){
  let dark = false;
  try { dark = localStorage.getItem('falconxl_theme') === 'dark'; } catch(e){}
  setTheme(dark);
  const btn = document.getElementById('theme-toggle');
  if(btn){
    btn.addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));
  }
}

// ---- Mobile menu ----
function initMobileMenu(){
  const openBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  if(!openBtn || !menu) return;
  openBtn.addEventListener('click', () => menu.classList.add('open'));
  if(closeBtn) closeBtn.addEventListener('click', () => menu.classList.remove('open'));
  menu.addEventListener('click', (e) => { if(e.target === menu) menu.classList.remove('open'); });
}

// ---- Nav active state ----
function markActiveNav(pageName){
  document.querySelectorAll('.nav-link').forEach(link => {
    if(link.dataset.page === pageName) link.classList.add('active');
  });
}

// ---- Cart icon click -> go to checkout ----
function initCartButton(){
  const btn = document.getElementById('cart-btn');
  if(btn) btn.addEventListener('click', () => { window.location.href = 'checkout.html'; });
}

// ---- Run on every page ----
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initCartButton();
  updateCartCount();
});
