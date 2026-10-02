/**
 * Luxury Shopping Bag Drawer Management (Light Theme)
 */

class CartState {
  constructor() {
    let savedItems = null;
    try {
      const stored = localStorage.getItem('vanguard_atelier_bag');
      if (stored) savedItems = JSON.parse(stored);
    } catch (e) {
      savedItems = null;
    }

    this.items = savedItems && savedItems.length > 0 ? savedItems : [
      {
        id: "prod-01",
        name: "Architectural Wool Overcoat",
        price: 1480,
        size: "48",
        color: "Onyx Noir",
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80",
        quantity: 1
      }
    ];
    this.isOpen = false;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    try {
      localStorage.setItem('vanguard_atelier_bag', JSON.stringify(this.items));
    } catch (e) {}
    this.listeners.forEach(fn => fn(this));
  }

  addItem(product, size = "48", color = product.color) {
    const existingIndex = this.items.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: size,
        color: color,
        image: product.image,
        quantity: 1
      });
    }

    this.notify();
    this.open();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.notify();
  }

  updateQuantity(index, delta) {
    const item = this.items[index];
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(index);
    } else {
      this.notify();
    }
  }

  getTotalCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  open() {
    this.isOpen = true;
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    this.isOpen = false;
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    }
  }
}

export const cart = new CartState();

export function initCartUI() {
  const drawerEl = document.getElementById('cart-drawer-items');
  const countBadges = document.querySelectorAll('.cart-count-badge');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const emptyStateEl = document.getElementById('cart-empty-state');
  const footerEl = document.getElementById('cart-footer');

  const render = () => {
    const totalCount = cart.getTotalCount();
    const subtotal = cart.getSubtotal();

    // Update count badges
    countBadges.forEach(badge => {
      badge.textContent = totalCount;
      if (totalCount > 0) {
        badge.classList.remove('scale-0');
        badge.classList.add('scale-100');
      } else {
        badge.classList.add('scale-0');
        badge.classList.remove('scale-100');
      }
    });

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toLocaleString()}`;

    if (cart.items.length === 0) {
      if (drawerEl) drawerEl.innerHTML = '';
      if (emptyStateEl) emptyStateEl.classList.remove('hidden');
      if (footerEl) footerEl.classList.add('opacity-50', 'pointer-events-none');
      return;
    }

    if (emptyStateEl) emptyStateEl.classList.add('hidden');
    if (footerEl) footerEl.classList.remove('opacity-50', 'pointer-events-none');

    if (drawerEl) {
      drawerEl.innerHTML = cart.items.map((item, idx) => `
        <div class="flex gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 transition-colors group">
          <div class="w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-stone-200">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex flex-col flex-1 justify-between">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-serif text-sm tracking-wide text-stone-900 leading-snug line-clamp-1">${item.name}</h4>
                <button data-remove-item="${idx}" class="text-stone-400 hover:text-red-500 transition-colors p-1" title="Remove">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <p class="text-xs text-stone-500 mt-1 font-mono tracking-wider">${item.color} / EU ${item.size}</p>
            </div>

            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center border border-stone-300 rounded-md bg-white overflow-hidden">
                <button data-qty-delta="-1" data-index="${idx}" class="px-2.5 py-0.5 text-xs text-stone-600 hover:bg-stone-100 transition-colors">-</button>
                <span class="px-2.5 text-xs font-mono text-stone-900 font-semibold">${item.quantity}</span>
                <button data-qty-delta="1" data-index="${idx}" class="px-2.5 py-0.5 text-xs text-stone-600 hover:bg-stone-100 transition-colors">+</button>
              </div>
              <span class="text-sm font-mono text-bronze-600 font-semibold">$${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      `).join('');

      // Add listeners to remove buttons
      drawerEl.querySelectorAll('[data-remove-item]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.currentTarget.getAttribute('data-remove-item'));
          cart.removeItem(index);
        });
      });

      // Add listeners to quantity buttons
      drawerEl.querySelectorAll('[data-qty-delta]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.currentTarget.getAttribute('data-index'));
          const delta = parseInt(e.currentTarget.getAttribute('data-qty-delta'));
          cart.updateQuantity(index, delta);
        });
      });
    }
  };

  cart.subscribe(render);
  render();

  // Open/Close triggers
  document.querySelectorAll('[data-open-cart]').forEach(btn => {
    btn.addEventListener('click', () => cart.open());
  });

  document.querySelectorAll('[data-close-cart]').forEach(btn => {
    btn.addEventListener('click', () => cart.close());
  });

  const backdrop = document.getElementById('cart-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => cart.close());
  }

  // Checkout simulation
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const originalText = checkoutBtn.innerHTML;
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = `
        <span class="inline-block animate-spin mr-2">✦</span>
        <span>SECURING ORDER ENCRYPTION...</span>
      `;
      setTimeout(() => {
        alert("Thank you for choosing VANGUARD ATELIER. Your concierge order confirmation and white-glove shipping timeline have been prepared.");
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalText;
        cart.items = [];
        cart.notify();
        cart.close();
      }, 1500);
    });
  }
}
