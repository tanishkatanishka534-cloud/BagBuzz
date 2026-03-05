/* ===== BagBuzz — Main Script ===== */
(() => {
    'use strict';

    // ── DOM References ──
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const navbar = $('#navbar');
    const hamburger = $('#hamburger');
    const navLinks = $('#navLinks');
    const searchToggle = $('#searchToggle');
    const searchOverlay = $('#searchOverlay');
    const searchClose = $('#searchClose');
    const searchInput = $('#searchInput');
    const cartBtn = $('#cartBtn');
    const cartOverlay = $('#cartOverlay');
    const cartDrawer = $('#cartDrawer');
    const cartClose = $('#cartClose');
    const cartItems = $('#cartItems');
    const cartEmpty = $('#cartEmpty');
    const cartFooter = $('#cartFooter');
    const cartCount = $('#cartCount');
    const cartTotal = $('#cartTotal');
    const productGrid = $('#productGrid');
    const backToTop = $('#backToTop');
    const toastContainer = $('#toastContainer');
    const newsletterForm = $('#newsletterForm');

    // ── State ──
    let cart = JSON.parse(localStorage.getItem('bagbuzz_cart') || '[]');

    // ── Navbar Scroll ──
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 60);
        backToTop.classList.toggle('visible', y > 400);
        lastScroll = y;
    });

    // ── Mobile Menu ──
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ── Active Nav on Scroll ──
    const sections = $$('section[id]');
    window.addEventListener('scroll', () => {
        const y = window.scrollY + 200;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const h = sec.offsetHeight;
            const id = sec.getAttribute('id');
            const link = $(`.nav-link[href="#${id}"]`);
            if (link) link.classList.toggle('active', y >= top && y < top + h);
        });
    });

    // ── Search ──
    searchToggle.addEventListener('click', () => {
        searchOverlay.classList.toggle('active');
        if (searchOverlay.classList.contains('active')) searchInput.focus();
    });
    searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));

    // ── Cart Drawer ──
    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ── Cart Logic ──
    function saveCart() {
        localStorage.setItem('bagbuzz_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Count
        const total = cart.reduce((s, i) => s + i.qty, 0);
        cartCount.textContent = total;
        cartCount.classList.add('bump');
        setTimeout(() => cartCount.classList.remove('bump'), 400);

        // Items
        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartFooter.style.display = 'none';
            // clear item nodes except #cartEmpty
            $$('.cart-item', cartItems).forEach(el => el.remove());
            return;
        }

        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';

        // Rebuild items
        $$('.cart-item', cartItems).forEach(el => el.remove());

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}" /></div>
        <div class="cart-item-details">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">✕</button>
      `;
            cartItems.appendChild(el);
        });

        // Total
        const sum = cart.reduce((s, i) => s + i.price * i.qty, 0);
        cartTotal.textContent = `$${sum.toFixed(2)}`;
    }

    // Delegated events on cart items
    cartItems.addEventListener('click', e => {
        const btn = e.target.closest('[data-id]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'inc') {
            const item = cart.find(i => i.id === id);
            if (item) item.qty++;
        } else if (action === 'dec') {
            const item = cart.find(i => i.id === id);
            if (item) {
                item.qty--;
                if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
            }
        } else if (btn.classList.contains('cart-item-remove')) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
        updateCartUI();
    });

    // Add to cart from product cards
    productGrid.addEventListener('click', e => {
        const btn = e.target.closest('.btn-add-cart');
        if (!btn) return;

        const { id, name, price, img } = btn.dataset;
        const existing = cart.find(i => i.id === id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ id, name, price: parseFloat(price), img, qty: 1 });
        }
        saveCart();
        updateCartUI();
        showToast(`${name} added to cart!`);
    });

    // Wishlist toggle
    productGrid.addEventListener('click', e => {
        const btn = e.target.closest('.product-wishlist');
        if (!btn) return;
        btn.classList.toggle('active');
        const isActive = btn.classList.contains('active');
        showToast(isActive ? 'Added to wishlist ♥' : 'Removed from wishlist');
    });

    // ── Product Filters ──
    const filterBtns = $$('.filter-btn');
    const productCards = $$('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = 'fadeUp .5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ── Toast Notifications ──
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-msg">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }

    // ── Newsletter ──
    newsletterForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = $('#emailInput').value.trim();
        if (email) {
            showToast('Welcome to BagBuzz! 🎉');
            newsletterForm.reset();
        }
    });

    // ── Back to Top ──
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── Scroll Reveal (IntersectionObserver) ──
    const revealElements = $$('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── Counter Animation ──
    const statNumbers = $$('.stat-number[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target) {
        const duration = 1800;
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(ease * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ── Hero Particles ──
    function createParticles() {
        const container = $('#heroParticles');
        if (!container) return;
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
        position:absolute;
        width:${Math.random() * 4 + 1}px;
        height:${Math.random() * 4 + 1}px;
        background:rgba(200,149,108,${Math.random() * 0.3 + 0.05});
        border-radius:50%;
        top:${Math.random() * 100}%;
        left:${Math.random() * 100}%;
        animation:float ${Math.random() * 8 + 6}s ease-in-out infinite;
        animation-delay:${Math.random() * 5}s;
      `;
            container.appendChild(p);
        }
    }

    // Insert floating keyframe
    const style = document.createElement('style');
    style.textContent = `
    @keyframes float {
      0%,100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      25% { transform: translate(${20}px, -${30}px) scale(1.2); opacity: 0.6; }
      50% { transform: translate(-${15}px, -${50}px) scale(0.8); opacity: 0.4; }
      75% { transform: translate(${25}px, -${20}px) scale(1.1); opacity: 0.5; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
    document.head.appendChild(style);

    // ── Checkout Button ──
    document.addEventListener('click', e => {
        if (e.target.closest('.btn-checkout')) {
            showToast('Checkout coming soon! 🛒');
        }
    });

    // ── Init ──
    createParticles();
    updateCartUI();

})();
