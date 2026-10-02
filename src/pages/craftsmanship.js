import '../style.css';
import { createIcons, icons } from 'lucide';
import { craftsmanshipHotspots } from '../data/products.js';
import { setupMagnifier } from '../components/magnifier.js';
import { initNavigation } from '../components/nav.js';
import { cart, initCartUI } from '../components/cart.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';

let activeHotspotIndex = 0;
let teardownCraftMagnifier = null;

function initCraftsmanshipPage() {
  initNavigation('craftsmanship');
  initCustomCursor();
  initLenis();
  initCartUI();
  initCraftHotspots();

  createIcons({ icons });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCraftsmanshipPage);
} else {
  initCraftsmanshipPage();
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
      }
    } else if (e.target.closest('button, a')) {
      cursor.className = 'cursor-hover';
      cursor.textContent = '';
    } else {
      cursor.className = 'cursor-default';
      cursor.textContent = '';
    }
  });
}

function initCraftHotspots() {
  const hotspotsContainer = document.getElementById('craft-hotspots-pins');
  const previewImg = document.getElementById('craft-zoom-img');
  const titleEl = document.getElementById('craft-title');
  const locationEl = document.getElementById('craft-location');
  const descEl = document.getElementById('craft-desc');
  const lensEl = document.getElementById('craft-lens');

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
