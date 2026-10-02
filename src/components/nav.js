/**
 * Shared Minimalist Light Navbar Component & Active Link Handler
 */

export function initNavigation(activePage = 'home') {
  // Highlight active nav link
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    const page = link.getAttribute('data-nav-link');
    if (page === activePage) {
      link.classList.remove('text-stone-500', 'text-stone-600', 'text-stone-700', 'hover:text-black', 'hover:text-stone-950');
      link.classList.add('text-stone-950', 'font-bold', 'border-b-2', 'border-stone-900');
    } else {
      link.classList.remove('text-stone-950', 'text-black', 'font-bold', 'border-b-2', 'border-stone-900', 'border-bronze-500');
      link.classList.add('text-stone-600', 'hover:text-stone-950', 'font-medium');
    }
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuDrawer.classList.remove('translate-x-full');
      mobileMenuDrawer.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileMenuClose && mobileMenuDrawer) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenuDrawer.classList.remove('translate-x-0');
      mobileMenuDrawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    });
  }
}
