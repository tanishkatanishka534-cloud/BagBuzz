// ── Product Data ──
const products = [
  { id:1, name:"Scarlet Stiletto", brand:"SlayStep", price:189, original:249, category:"stilettos", badge:"new", rating:4.8, reviews:124, image:"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop" },
  { id:2, name:"Midnight Mule", brand:"SlayStep", price:139, original:null, category:"mules", badge:null, rating:4.6, reviews:89, image:"https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&h=800&fit=crop" },
  { id:3, name:"Golden Hour Pump", brand:"Luxe Line", price:219, original:299, category:"pumps", badge:"sale", rating:4.9, reviews:203, image:"https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600&h=800&fit=crop" },
  { id:4, name:"Noir Ankle Strap", brand:"SlayStep", price:169, original:null, category:"stilettos", badge:null, rating:4.7, reviews:156, image:"https://images.unsplash.com/photo-1518049362265-d5ef880be2a5?w=600&h=800&fit=crop" },
  { id:5, name:"Champagne Dream", brand:"Luxe Line", price:259, original:null, category:"pumps", badge:"hot", rating:5.0, reviews:312, image:"https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=800&fit=crop" },
  { id:6, name:"Rose Velvet Slide", brand:"SlayStep", price:149, original:199, category:"mules", badge:"sale", rating:4.5, reviews:67, image:"https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=800&fit=crop" },
  { id:7, name:"Crystal Strappy", brand:"Luxe Line", price:289, original:null, category:"stilettos", badge:"new", rating:4.9, reviews:178, image:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop" },
  { id:8, name:"Blush Platform", brand:"SlayStep", price:179, original:239, category:"platforms", badge:"sale", rating:4.6, reviews:95, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop" },
];

let cart = [];
let currentSlide = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderProducts("all");
  initNavbar();
  initFilters();
  initTestimonials();
  initRevealAnimations();
  initBackToTop();
  initCart();
  initMobileMenu();
  initNewsletter();
});

function renderProducts(filter) {
  const grid = document.getElementById("productsGrid");
  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);
  grid.innerHTML = "";
  filtered.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card reveal";
    card.style.transitionDelay = `${i * 0.08}s`;
    let badgeHTML = "";
    if (p.badge) {
      const cls = p.badge === "new" ? "badge-new" : p.badge === "sale" ? "badge-sale" : "badge-hot";
      badgeHTML = `<span class="product-badge ${cls}">${p.badge}</span>`;
    }
    const stars = "★".repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? "½" : "");
    card.innerHTML = `
      ${badgeHTML}
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-actions">
          <button onclick="addToWishlist(${p.id})" title="Wishlist">♡</button>
          <button onclick="addToCart(${p.id})" title="Add to Cart">🛒</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          <span class="current">$${p.price}</span>
          ${p.original ? `<span class="original">$${p.original}</span>` : ""}
        </div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="count">(${p.reviews})</span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  setTimeout(() => {
    document.querySelectorAll(".products-grid .reveal").forEach(el => el.classList.add("active"));
  }, 100);
}

function initNavbar() {
  window.addEventListener("scroll", () => {
    document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 60);
  });
}

function initFilters() {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderProducts(tab.dataset.filter);
    });
  });
}

function initTestimonials() {
  document.querySelectorAll(".slider-dots button").forEach((dot, i) => {
    dot.addEventListener("click", () => goToSlide(i));
  });
  setInterval(() => goToSlide((currentSlide + 1) % 3), 5000);
}

function goToSlide(index) {
  currentSlide = index;
  document.querySelector(".testimonial-track").style.transform = `translateX(-${index * 100}%)`;
  document.querySelectorAll(".slider-dots button").forEach((d, i) => d.classList.toggle("active", i === index));
}

function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 500));
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initCart() {
  document.getElementById("cartBtn").addEventListener("click", toggleCart);
  document.getElementById("cartClose").addEventListener("click", toggleCart);
  document.getElementById("cartOverlay").addEventListener("click", toggleCart);
}

function toggleCart() {
  document.getElementById("cartOverlay").classList.toggle("open");
  document.getElementById("cartSidebar").classList.toggle("open");
  document.body.style.overflow = document.getElementById("cartSidebar").classList.contains("open") ? "hidden" : "";
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  updateCartUI();
  showToast(`${product.name} added to bag ✓`);
  toggleCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById("cartCount");
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  countEl.textContent = count;
  countEl.style.display = count > 0 ? "flex" : "none";
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="empty-icon">👠</div><p>Your bag is empty</p></div>`;
  } else {
    itemsEl.innerHTML = cart.map(c => `
      <div class="cart-item">
        <img src="${c.image}" alt="${c.name}">
        <div class="cart-item-info">
          <h4>${c.name}</h4>
          <p>Qty: ${c.qty}</p>
          <div class="cart-item-price">$${c.price * c.qty}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${c.id})">✕</button>
      </div>`).join("");
  }
  totalEl.textContent = `$${total}`;
}

function addToWishlist(id) {
  showToast(`${products.find(p => p.id === id).name} added to wishlist ♡`);
}

function showToast(msg) {
  let toast = document.getElementById("toastEl");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastEl";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger.addEventListener("click", () => navLinks.classList.toggle("mobile-open"));
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("mobile-open")));
}

function initNewsletter() {
  document.getElementById("newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Thank you for subscribing! 💌");
    e.target.reset();
  });
}
