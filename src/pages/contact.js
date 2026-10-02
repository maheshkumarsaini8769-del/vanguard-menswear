import '../style.css';
import { createIcons, icons } from 'lucide';
import { initNavigation } from '../components/nav.js';
import { cart, initCartUI } from '../components/cart.js';
import Lenis from 'lenis';

function initContactPage() {
  initNavigation('contact');
  initCustomCursor();
  initLenis();
  initCartUI();
  initBookingForm();

  createIcons({ icons });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactPage);
} else {
  initContactPage();
}

function initLenis() {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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
    if (e.target.closest('button, a, input, select')) {
      cursor.className = 'cursor-hover';
      cursor.textContent = '';
    } else {
      cursor.className = 'cursor-default';
      cursor.textContent = '';
    }
  });
}

function initBookingForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span>TRANSMITTING DOSSIER...</span>`;

    setTimeout(() => {
      alert("Thank you. Your private salon appointment request has been transmitted to the Vanguard Concierge. A senior tailoring director will reach out within 12 hours.");
      btn.disabled = false;
      btn.innerHTML = originalText;
      form.reset();
    }, 1200);
  });
}
