import './style.css';
import { createIcons, icons } from 'lucide';
import { products, lookbookItems, craftsmanshipHotspots } from './data/products.js';
import { initSmoothScrollAndAnimations } from './animations/scroll.js';
import { setupMagnifier } from './components/magnifier.js';
import { cart, initCartUI } from './components/cart.js';
import { initNavigation } from './components/nav.js';
import { gsap } from 'gsap';

// State
let currentCategory = 'all';
let activeHotspotIndex = 0;
let teardownModalMagnifier = null;
let teardownCraftMagnifier = null;

function initApp() {
  initNavigation('home');
  initCustomCursor();
  renderLookbook();
  renderProducts();
  initCategoryFilters();
  initCraftsmanshipSection();
  initQuickViewModal();
  initCartUI();
  initHeroLookSwitcher();
  initSoundAtmosphere();
  initSmoothScrollAndAnimations();

  // Initialize Lucide icons
  createIcons({ icons });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * 1. Luxury Dynamic Custom Cursor (Light Theme)
 */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    return;
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
      } else if (type === 'drag') {
        cursor.className = 'cursor-drag';
        cursor.textContent = 'DRAG';
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

/**
 * 3. Render Horizontal Lookbook Track (Light Theme)
 */
function renderLookbook() {
  const track = document.getElementById('lookbook-track');
  if (!track) return;

  track.innerHTML = lookbookItems.map((item, index) => `
    <div class="lookbook-card relative flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[36vw] h-[75vh] group overflow-hidden rounded-2xl border border-stone-400 bg-stone-900 shadow-md hover:shadow-2xl transition-all" data-cursor="drag">
      <div class="lookbook-card-img absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style="background-image: url('${item.image}')">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>
      
      <!-- Card Badge -->
      <div class="absolute top-6 left-6 z-10">
        <span class="px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-white text-stone-900 font-bold shadow-md border border-stone-300">
          ${item.tag}
        </span>
      </div>

      <div class="absolute top-6 right-6 z-10">
        <span class="text-xs font-mono text-white/90 font-semibold tracking-wider bg-black/40 px-2.5 py-1 rounded-md">0${index + 1} / 05</span>
      </div>

      <!-- Card Details with high contrast -->
      <div class="absolute bottom-0 inset-x-0 p-8 z-10 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        <span class="text-xs font-mono tracking-widest text-amber-300 uppercase mb-1 font-semibold">${item.season}</span>
        <h3 class="font-display-luxury text-2xl md:text-3xl font-normal text-white tracking-wide drop-shadow-md">${item.title}</h3>
        <p class="text-stone-200 text-sm mt-2 max-w-sm font-light leading-relaxed drop-shadow">${item.subtitle}</p>
        
        <div class="mt-6 flex items-center gap-3">
          <a href="/lookbook.html" class="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-white uppercase hover:text-amber-300 font-bold transition-colors">
            <span>EXPLORE RUNWAY</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 4. Render Products Grid (High-Contrast Light Theme)
 */
function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = currentCategory === 'all' 
    ? products 
    : products.filter(p => p.category === currentCategory);

  grid.innerHTML = filtered.map(product => `
    <div class="product-card-container group relative" data-product-id="${product.id}">
      <div class="product-card-inner rounded-2xl bg-white border border-[#cfc9be] overflow-hidden transition-all duration-500 flex flex-col h-full shadow-md hover:shadow-2xl">
        
        <!-- Image Area with Dual Hover Swap & Zoom trigger -->
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

          <!-- Floating Badges -->
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-stone-900 text-white font-bold shadow-md">
              ${product.badge}
            </span>
          </div>

          <!-- Quick View & Zoom Hint Pill -->
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

        <!-- Product Meta & Actions -->
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

  initCard3DTilt();

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

/**
 * 5. Interactive 3D Card Hover Perspective
 */
function initCard3DTilt() {
  const cards = document.querySelectorAll('.product-card-container');
  cards.forEach(card => {
    const inner = card.querySelector('.product-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`;
    });
  });
}

/**
 * 6. Category Tabs
 */
function initCategoryFilters() {
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
      renderProducts();
    });
  });
}

/**
 * 7. Craftsmanship Section (Light Theme)
 */
function initCraftsmanshipSection() {
  const hotspotsContainer = document.getElementById('hotspots-pins-wrapper');
  const previewImg = document.getElementById('craftsmanship-zoom-img');
  const titleEl = document.getElementById('craftsmanship-title');
  const locationEl = document.getElementById('craftsmanship-location');
  const descEl = document.getElementById('craftsmanship-desc');
  const lensEl = document.getElementById('craftsmanship-lens');

  if (!hotspotsContainer || !previewImg) return;

  hotspotsContainer.innerHTML = craftsmanshipHotspots.map((spot, idx) => `
    <button 
      data-hotspot-idx="${idx}"
      class="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2"
      style="left: ${spot.x}%; top: ${spot.y}%;"
      title="${spot.title}"
    >
      <span class="relative flex h-8 w-8 items-center justify-center">
        <span class="hotspot-ring absolute inline-flex h-full w-full rounded-full bg-bronze-500 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-5 w-5 bg-white border-2 border-stone-900 items-center justify-center text-[10px] font-mono font-bold text-stone-900 group-hover:scale-125 transition-transform shadow-md">
          0${idx + 1}
        </span>
      </span>
      <span class="absolute left-10 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-stone-900/95 backdrop-blur-md text-white text-[11px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
        ${spot.title}
      </span>
    </button>
  `).join('');

  const updateHotspot = (index) => {
    activeHotspotIndex = index;
    const spot = craftsmanshipHotspots[index];
    if (!spot) return;

    hotspotsContainer.querySelectorAll('[data-hotspot-idx]').forEach((pin, i) => {
      const ring = pin.querySelector('.hotspot-ring');
      const core = pin.querySelector('.relative.inline-flex');
      if (i === index) {
        ring?.classList.add('bg-bronze-600');
        core?.classList.add('bg-stone-900', 'text-white', 'scale-125');
      } else {
        ring?.classList.remove('bg-bronze-600');
        core?.classList.remove('bg-stone-900', 'text-white', 'scale-125');
      }
    });

    gsap.to([titleEl, locationEl, descEl], {
      opacity: 0,
      y: 8,
      duration: 0.2,
      onComplete: () => {
        if (titleEl) titleEl.textContent = spot.title;
        if (locationEl) locationEl.textContent = spot.location;
        if (descEl) descEl.textContent = spot.desc;

        gsap.to([titleEl, locationEl, descEl], {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04
        });
      }
    });

    gsap.to(previewImg, {
      scale: 1.1,
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        previewImg.src = spot.zoomImg;
        previewImg.setAttribute('data-zoom', spot.zoomImg);
        gsap.to(previewImg, {
          scale: 1.0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
  };

  hotspotsContainer.querySelectorAll('[data-hotspot-idx]').forEach(pin => {
    pin.addEventListener('click', () => {
      const idx = parseInt(pin.getAttribute('data-hotspot-idx'));
      updateHotspot(idx);
    });
  });

  if (teardownCraftMagnifier) teardownCraftMagnifier();
  teardownCraftMagnifier = setupMagnifier(previewImg, lensEl, 2.8);

  updateHotspot(0);
}

/**
 * 8. Quick View Modal with Optical Loupe (Light Theme)
 */
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

/**
 * 9. Hero Header Look Switcher (Light Theme)
 */
function initHeroLookSwitcher() {
  const heroImage = document.getElementById('hero-image');
  const badgeText = document.getElementById('hero-badge-text');
  const originText = document.getElementById('hero-origin-text');
  const subtitle = document.getElementById('hero-subtitle');
  const lookBtns = document.querySelectorAll('.hero-look-btn');

  const heroLooks = [
    {
      image: "/images/hero-menswear.jpg",
      badge: "AUTUMN / WINTER 2026 CAPSULE",
      origin: "ORIGIN: BIELLA & NAPLES",
      subtitle: "THE DIALECTIC OF TAILORING AND MOVEMENT"
    },
    {
      image: "/images/hero-camel-coat.jpg",
      badge: "BRUTALIST ARCHITECTURAL COAT",
      origin: "ORIGIN: FLORENCE & MILAN",
      subtitle: "MONOLITHIC DRAPE & SCULPTED VOLUME"
    },
    {
      image: "/images/hero-tuxedo.jpg",
      badge: "SAVOY EVENING TUXEDO",
      origin: "ORIGIN: NAPLES SARTORIA",
      subtitle: "SUPER 160S WOOL WITH SILK GROSGRAIN"
    },
    {
      image: "/images/hero-shirt-trouser-white.jpg",
      badge: "ATELIER POPLIN SHIRT & PLEATED TROUSERS",
      origin: "ORIGIN: TICINO & BIELLA",
      subtitle: "GIZA COTTON POPLIN & HIGH-TWIST WOOL GABARDINE"
    },
    {
      image: "/images/hero-shirt-trouser-blue.jpg",
      badge: "AZURE SPREAD SHIRT & HIGH-RISE TROUSERS",
      origin: "ORIGIN: NAPLES & FLORENCE",
      subtitle: "BESPOKE TUCKED DRAPE & SARTORIAL CREASES"
    }
  ];

  if (!heroImage || lookBtns.length === 0) return;

  lookBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lookIdx = parseInt(btn.getAttribute('data-hero-look'));
      const look = heroLooks[lookIdx];
      if (!look) return;

      lookBtns.forEach(b => {
        b.classList.remove('border-amber-400', 'bg-amber-400', 'text-black', 'shadow', 'border-stone-900', 'bg-stone-900', 'text-white');
        b.classList.add('border-stone-600', 'bg-stone-800', 'text-white');
      });
      btn.classList.remove('border-stone-600', 'bg-stone-800');
      btn.classList.add('border-amber-400', 'bg-amber-400', 'text-black', 'font-bold', 'shadow');

      gsap.to([badgeText, originText, subtitle], {
        opacity: 0,
        y: -6,
        duration: 0.2,
        onComplete: () => {
          if (badgeText) badgeText.textContent = look.badge;
          if (originText) originText.textContent = look.origin;
          if (subtitle) subtitle.textContent = look.subtitle;

          gsap.to([badgeText, originText, subtitle], {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.04
          });
        }
      });

      gsap.to(heroImage, {
        opacity: 0.3,
        scale: 1.15,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          heroImage.src = look.image;
          gsap.to(heroImage, {
            opacity: 1,
            scale: 1.05,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      });
    });
  });
}

/**
 * 10. Ambient Sound Toggle
 */
function initSoundAtmosphere() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  let audioCtx = null;
  let isPlaying = false;
  let gainNode = null;

  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (!isPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(110, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + 2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();

        isPlaying = true;
        soundIconOn?.classList.remove('hidden');
        soundIconOff?.classList.add('hidden');
        soundBtn.classList.add('text-bronze-600', 'border-bronze-500');
      } catch (err) {
        console.warn("Web Audio not supported", err);
      }
    } else {
      if (gainNode && audioCtx) {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          audioCtx?.close();
          audioCtx = null;
        }, 600);
      }
      isPlaying = false;
      soundIconOn?.classList.add('hidden');
      soundIconOff?.classList.remove('hidden');
      soundBtn.classList.remove('text-bronze-600', 'border-bronze-500');
    }
  });
}
