import '../style.css';
import { createIcons, icons } from 'lucide';
import { lookbookItems } from '../data/products.js';
import { initNavigation } from '../components/nav.js';
import { cart, initCartUI } from '../components/cart.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initLookbookPage() {
  initNavigation('lookbook');
  initCustomCursor();
  initCartUI();
  renderLookbookGrid();
  initLookbookScroll();

  createIcons({ icons });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLookbookPage);
} else {
  initLookbookPage();
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
      } else if (type === 'drag') {
        cursor.className = 'cursor-drag';
        cursor.textContent = 'DRAG';
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

function renderLookbookGrid() {
  const container = document.getElementById('lookbook-editorial-list');
  if (!container) return;

  container.innerHTML = lookbookItems.map((item, idx) => `
    <article class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center border-b border-stone-200 pb-20 mb-20 last:border-0">
      
      <!-- Look Visual with Zoom on Scroll -->
      <div class="lg:col-span-7">
        <div class="zoom-image-container relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[3/4] sm:aspect-[4/5] shadow-sm group" data-cursor="zoom">
          <img 
            src="${item.image}" 
            alt="${item.title}" 
            class="look-zoom-img w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-108"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div class="absolute bottom-6 left-6 z-10">
            <span class="px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-white/90 backdrop-blur-md text-stone-900 font-bold shadow-sm">
              ${item.tag}
            </span>
          </div>
        </div>
      </div>

      <!-- Look Narrative -->
      <div class="lg:col-span-5 flex flex-col justify-center">
        <span class="font-mono text-xs text-bronze-600 tracking-widest uppercase font-semibold mb-2">
          ${item.season}
        </span>
        <h2 class="font-display-luxury text-3xl sm:text-5xl font-light text-stone-900 mb-4 leading-tight">
          ${item.title}
        </h2>
        <p class="text-stone-600 font-light text-base leading-relaxed mb-8">
          ${item.subtitle}
        </p>

        <div class="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3 font-mono text-xs mb-8">
          <div class="flex justify-between border-b border-stone-100 pb-2">
            <span class="text-stone-400">SILHOUETTE:</span>
            <span class="text-stone-900 font-medium">Architectural Hourglass</span>
          </div>
          <div class="flex justify-between border-b border-stone-100 pb-2">
            <span class="text-stone-400">ORIGIN:</span>
            <span class="text-stone-900 font-medium">Biella & Naples Atelier</span>
          </div>
          <div class="flex justify-between">
            <span class="text-stone-400">AVAILABILITY:</span>
            <span class="text-bronze-600 font-semibold">Private Commission / Ready-To-Wear</span>
          </div>
        </div>

        <a href="/collection.html" class="inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-bronze-600 text-white font-mono text-xs font-semibold tracking-widest uppercase transition-all shadow-sm">
          <span>DISCOVER PIECES IN THIS ENSEMBLE</span>
          <span>→</span>
        </a>
      </div>

    </article>
  `).join('');
}

function initLookbookScroll() {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Parallax Zoom on images as they scroll through viewport
  document.querySelectorAll('.look-zoom-img').forEach(img => {
    gsap.fromTo(img, 
      { scale: 1.15 },
      {
        scale: 1.0,
        ease: 'none',
        scrollTrigger: {
          trigger: img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });
}
