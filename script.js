// ─── PRODUCT DATA ───
const products = [
  { id: 1, name: "Sienna Classic Tote", brand: "BagBuzz Original", price: 189, oldPrice: 249, image: "images/bag-tote.png", category: "tote", badge: "new", rating: 5 },
  { id: 2, name: "Noir Chain Crossbody", brand: "BagBuzz Luxe", price: 145, oldPrice: null, image: "images/bag-crossbody.png", category: "crossbody", badge: "hot", rating: 5 },
  { id: 3, name: "Urban Explorer Backpack", brand: "BagBuzz Active", price: 165, oldPrice: 210, image: "images/bag-backpack.png", category: "backpack", badge: "sale", rating: 4 },
  { id: 4, name: "Aurora Evening Clutch", brand: "BagBuzz Luxe", price: 120, oldPrice: null, image: "images/bag-clutch.png", category: "clutch", badge: "new", rating: 5 },
  { id: 5, name: "Voyager Weekender Duffle", brand: "BagBuzz Travel", price: 275, oldPrice: 340, image: "images/bag-duffle.png", category: "duffle", badge: "sale", rating: 5 },
  { id: 6, name: "Heritage Buckle Satchel", brand: "BagBuzz Classic", price: 198, oldPrice: null, image: "images/bag-satchel.png", category: "satchel", badge: "hot", rating: 4 },
  { id: 7, name: "Cognac Leather Tote", brand: "BagBuzz Original", price: 215, oldPrice: 280, image: "images/bag-tote.png", category: "tote", badge: "sale", rating: 5 },
  { id: 8, name: "Midnight Crossbody Sling", brand: "BagBuzz Luxe", price: 135, oldPrice: null, image: "images/bag-crossbody.png", category: "crossbody", badge: null, rating: 4 },
  { id: 9, name: "Summit Trail Backpack", brand: "BagBuzz Active", price: 155, oldPrice: null, image: "images/bag-backpack.png", category: "backpack", badge: "new", rating: 5 },
  { id: 10, name: "Crystal Gala Clutch", brand: "BagBuzz Luxe", price: 98, oldPrice: 130, image: "images/bag-clutch.png", category: "clutch", badge: "sale", rating: 4 },
  { id: 11, name: "Sahara Travel Duffle", brand: "BagBuzz Travel", price: 295, oldPrice: null, image: "images/bag-duffle.png", category: "duffle", badge: "hot", rating: 5 },
  { id: 12, name: "Windsor Leather Satchel", brand: "BagBuzz Classic", price: 225, oldPrice: 290, image: "images/bag-satchel.png", category: "satchel", badge: "new", rating: 5 },
];

// ─── CART STATE ───
let cart = JSON.parse(localStorage.getItem("bagbuzz-cart")) || [];

// ─── DOM ELEMENTS ───
const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartItemCount = document.getElementById("cartItemCount");
const cartTotal = document.getElementById("cartTotal");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const backToTop = document.getElementById("backToTop");
const navbar = document.getElementById("navbar");

// ─── RENDER PRODUCTS ───
function renderProducts(filter = "all") {
  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);
  productsGrid.innerHTML = filtered.map(p => `
    <div class="product-card" data-category="${p.category}">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge}</span>` : ""}
        <div class="product-actions">
          <button onclick="addToCart(${p.id})" title="Add to Bag"><i class="fas fa-shopping-bag"></i></button>
          <button onclick="toggleWishlist(this)" title="Wishlist"><i class="far fa-heart"></i></button>
          <button title="Quick View"><i class="fas fa-eye"></i></button>
        </div>
      </div>
      <div class="product-info">
        <div class="brand">${p.brand}</div>
        <h3>${p.name}</h3>
        <div class="price">
          $${p.price}
          ${p.oldPrice ? `<span class="old-price">$${p.oldPrice}</span>` : ""}
        </div>
        <div class="rating">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)}</div>
      </div>
    </div>
  `).join("");
}

// ─── FILTER BUTTONS ───
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

// ─── CATEGORY CARDS CLICK ───
document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    const cat = card.dataset.category;
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.filter === cat);
      });
      renderProducts(cat);
    }, 500);
  });
});

// ─── CART FUNCTIONS ───
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(id); return; }
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("bagbuzz-cart", JSON.stringify(cart));
}

function renderCart() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = count;
  cartItemCount.textContent = `(${count})`;
  cartTotal.textContent = `$${total.toFixed(2)}`;

  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="price">$${item.price}</div>
        <div class="cart-item-qty">
          <button onclick="updateQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join("");
}

function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// ─── WISHLIST TOGGLE ───
function toggleWishlist(btn) {
  const icon = btn.querySelector("i");
  icon.classList.toggle("far");
  icon.classList.toggle("fas");
  icon.style.color = icon.classList.contains("fas") ? "#e74c3c" : "";
}

// ─── HAMBURGER MENU ───
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("mobile-open");
});

// ─── SMOOTH SCROLL NAV ───
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navLinks.classList.remove("mobile-open");
    document.querySelectorAll(".nav-links a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const target = document.querySelector(link.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// ─── NAVBAR SCROLL EFFECT ───
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
  backToTop.classList.toggle("visible", window.scrollY > 500);
});

// ─── BACK TO TOP ───
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.15 });
reveals.forEach(el => revealObserver.observe(el));

// ─── HERO PARTICLES ───
const particlesContainer = document.getElementById("particles");
for (let i = 0; i < 30; i++) {
  const span = document.createElement("span");
  span.style.left = Math.random() * 100 + "%";
  span.style.top = Math.random() * 100 + "%";
  span.style.animationDelay = Math.random() * 6 + "s";
  span.style.animationDuration = (4 + Math.random() * 4) + "s";
  particlesContainer.appendChild(span);
}

// ─── NEWSLETTER FORM ───
document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.target.querySelector("input");
  input.value = "";
  alert("🎉 Welcome to the BagBuzz Club! Check your inbox for exclusive perks.");
});

// ─── ACTIVE NAV ON SCROLL ───
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.getAttribute("id");
  });
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
});

// ─── INIT ───
renderProducts();
renderCart();
