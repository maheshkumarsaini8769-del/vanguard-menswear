import '../style.css';
import { createIcons, icons } from 'lucide';
import { products } from '../data/products.js';
import { setupMagnifier } from '../components/magnifier.js';
import { cart, initCartUI } from '../components/cart.js';
import { initNavigation } from '../components/nav.js';
import Lenis from 'lenis';

let currentCategory = 'all';
let currentSort = 'featured';
let teardownModalMagnifier = null;

function initCollectionPage() {
  initNavigation('collection');
  initCustomCursor();
  initLenis();
  initCartUI();
  initQuickViewModal();
  renderCatalog();
  initFilters();
  initSort();

  createIcons({ icons });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCollectionPage);
} else {
  initCollectionPage();
}

function initLenis() {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  let mouseX = -100;
  let mouseY = -100;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let hasMoved = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      cursor.style.opacity = '1';
    }
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  cursor.className = 'cursor-default opacity-0';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-cursor]');
    if (target) {
      const type = target.getAttribute('data-cursor');
      if (type === 'zoom') {
        cursor.className = 'cursor-zoom';
        cursor.textContent = 'ZOOM';
      } else if (type === 'view') {
        cursor.className = 'cursor-hover';
        cursor.textContent = '';
      }
    } else if (e.target.closest('button, a, input, select')) {
      cursor.className = 'cursor-hover';
      cursor.textContent = '';
    } else {
      cursor.className = 'cursor-default';
      cursor.textContent = '';
    }
  });
}

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-count');
  if (!grid) return;

  let filtered = currentCategory === 'all' 
    ? [...products] 
    : products.filter(p => p.category === currentCategory);

  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (countEl) {
    countEl.textContent = `${filtered.length.toString().padStart(2, '0')} Pieces`;
  }

  grid.innerHTML = filtered.map(product => `
    <div class="product-card-container group relative" data-product-id="${product.id}">
      <div class="product-card-inner rounded-2xl bg-white border border-[#cfc9be] overflow-hidden transition-all duration-500 flex flex-col h-full shadow-md hover:shadow-2xl">
        
        <div class="relative aspect-[3/4] overflow-hidden bg-stone-200 cursor-pointer" data-cursor="zoom" data-quick-view="${product.id}">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="product-main-img w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-108 group-hover:opacity-0"
          />
          <img 
            src="${product.hoverImage}" 
            alt="${product.name} alternative view" 
            class="product-hover-img absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          />

          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-stone-900 text-white font-bold shadow-md">
              ${product.badge}
            </span>
          </div>

          <div class="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <span class="px-3 py-1.5 rounded-lg bg-stone-950 text-[11px] font-mono text-white border border-stone-700 flex items-center gap-1.5 shadow-xl font-semibold">
              <span class="text-amber-300">✦</span>
              <span>MAGNIFY FABRIC</span>
            </span>
            <span class="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-xl">
              ↗
            </span>
          </div>
        </div>

        <div class="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4 border-t border-stone-200 bg-white">
          <div>
            <div class="flex items-center justify-between gap-2 text-xs font-mono text-stone-600 mb-1">
              <span class="uppercase tracking-wider font-semibold">${product.category}</span>
              <span class="text-stone-950 font-bold text-sm">$${product.price.toLocaleString()}</span>
            </div>
            <h3 class="font-serif text-base sm:text-lg text-stone-900 font-semibold group-hover:text-bronze-600 transition-colors leading-snug">
              ${product.name}
            </h3>
            <p class="text-xs text-stone-600 mt-1 line-clamp-1 font-medium">${product.fabric}</p>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-stone-200">
            <button 
              data-add-to-cart="${product.id}"
              class="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>ADD TO BAG</span>
              <span>+</span>
            </button>
            <button 
              data-quick-view="${product.id}"
              title="Inspect Details"
              class="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 flex items-center justify-center transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-quick-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-quick-view');
      openQuickView(id);
    });
  });

  grid.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-add-to-cart');
      const prod = products.find(p => p.id === id);
      if (prod) {
        cart.addItem(prod);
      }
    });
  });
}

function initFilters() {
  const buttons = document.querySelectorAll('[data-category-filter]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('bg-stone-900', 'text-white', 'border-stone-900');
        b.classList.add('bg-white', 'text-stone-600', 'border-stone-200');
      });
      btn.classList.remove('bg-white', 'text-stone-600', 'border-stone-200');
      btn.classList.add('bg-stone-900', 'text-white', 'border-stone-900');

      currentCategory = btn.getAttribute('data-category-filter');
      renderCatalog();
    });
  });
}

function initSort() {
  const sortSelect = document.getElementById('sort-selector');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog();
    });
  }
}

function initQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  const backdrop = document.getElementById('quick-view-backdrop');
  const closeBtn = document.getElementById('quick-view-close');

  if (!modal || !backdrop || !closeBtn) return;

  const closeModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    document.body.style.overflow = '';
    if (teardownModalMagnifier) {
      teardownModalMagnifier();
      teardownModalMagnifier = null;
    }
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const modalImg = document.getElementById('modal-product-img');
  const modalLens = document.getElementById('modal-magnifier-lens');
  const modalTitle = document.getElementById('modal-product-title');
  const modalPrice = document.getElementById('modal-product-price');
  const modalCategory = document.getElementById('modal-product-category');
  const modalFabric = document.getElementById('modal-product-fabric');
  const modalOrigin = document.getElementById('modal-product-origin');
  const modalDesc = document.getElementById('modal-product-desc');
  const modalDetailsList = document.getElementById('modal-product-details');
  const modalSizesContainer = document.getElementById('modal-product-sizes');
  const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

  let selectedSize = product.sizes[0];

  if (modalTitle) modalTitle.textContent = product.name;
  if (modalPrice) modalPrice.textContent = `$${product.price.toLocaleString()}`;
  if (modalCategory) modalCategory.textContent = product.category.toUpperCase();
  if (modalFabric) modalFabric.textContent = product.fabric;
  if (modalOrigin) modalOrigin.textContent = product.origin;
  if (modalDesc) modalDesc.textContent = product.description;

  if (modalImg) {
    modalImg.src = product.image;
    modalImg.setAttribute('data-zoom', product.zoomImage);
  }

  if (modalDetailsList) {
    modalDetailsList.innerHTML = product.details.map(d => `
      <li class="flex items-start gap-2 text-xs text-stone-600">
        <span class="text-bronze-600 mt-0.5 font-bold">✦</span>
        <span>${d}</span>
      </li>
    `).join('');
  }

  if (modalSizesContainer) {
    modalSizesContainer.innerHTML = product.sizes.map((s, idx) => `
      <button 
        data-size-btn="${s}"
        class="h-10 px-4 rounded-lg font-mono text-xs border transition-all duration-200 ${idx === 0 ? 'bg-stone-900 text-white border-stone-900 font-semibold' : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'}"
      >
        ${s}
      </button>
    `).join('');

    modalSizesContainer.querySelectorAll('[data-size-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        modalSizesContainer.querySelectorAll('[data-size-btn]').forEach(b => {
          b.classList.remove('bg-stone-900', 'text-white', 'border-stone-900', 'font-semibold');
          b.classList.add('bg-stone-50', 'text-stone-700', 'border-stone-200');
        });
        btn.classList.remove('bg-stone-50', 'text-stone-700', 'border-stone-200');
        btn.classList.add('bg-stone-900', 'text-white', 'border-stone-900', 'font-semibold');
        selectedSize = btn.getAttribute('data-size-btn');
      });
    });
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.onclick = () => {
      cart.addItem(product, selectedSize);
      const closeBtn = document.getElementById('quick-view-close');
      if (closeBtn) closeBtn.click();
    };
  }

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  document.body.style.overflow = 'hidden';

  if (teardownModalMagnifier) teardownModalMagnifier();
  teardownModalMagnifier = setupMagnifier(modalImg, modalLens, 2.6);
}
