tailwind.config = {
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FFFFFF",
          100: "#F7F6F2", // Main bg
          200: "#ECEAE4", // Card bg
          300: "#DCD8CE",
        },
        dustyrose: {
          400: "#D4AF37",
          500: "#072566", // Primary button
          600: "#051B4D", // Hover button
          700: "#072566",
        },
        charcoal: {
          800: "#072566", // Headings
          600: "#4A505C", // Body text
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
    },
  },
};

// ================= CONFIGURATION DATA =================
const CONFIG = {
  whatsappNumber: "6285878752777",
  storeName: "Raja Kain Grey",
};

// Hanya 2 Kategori / Produk Utama: Grey Twill & Grey Canvas
const PRODUCTS = [
  {
    id: "p1",
    name: "Grey Twill",
    category: "Grey Twill",
    description:
      "Kain grey dengan anyaman twill (garis diagonal khas) yang kuat, padat, dan memiliki jatuh yang rapi. Sangat ideal sebagai bahan dasar proses pencelupan warna (dyeing), printing, maupun pembuatan seragam dan celana berkualitas tinggi.",
    width: "150 cm",
    thickness: ["10 Oz", "11 Oz", "12 Oz", "13 Oz"],
    types: ["Mentah", "Susut Biasa", "Susut Mesin"],
    texture: "Anyaman diagonal rapat, kuat, lembut setelah proses susut",
    recommendation:
      "Celana chino, seragam kerja, jaket, totebag premium, bahan dasar dyeing.",
    colors: ["White", "Grey", "Navy"],
    stockStatus: "Tersedia",
    badge: "Bestseller",
    images: ["./img/KainGreyTwill1.jpeg", "./img/KainGreyTwill2.jpeg"],
  },
  {
    id: "p2",
    name: "Grey Canvas",
    category: "Grey Canvas",
    description:
      "Kain grey canvas dengan konstruksi benang kokoh dan daya tahan tinggi terhadap gesekan. Memiliki tekstur alami yang berkarakter namun tetap fleksibel untuk dijahit, cocok untuk berbagai kebutuhan produksi tas, sepatu, dekorasi, hingga apparel.",
    width: "150 cm",
    thickness: ["10 Oz"],
    types: ["Mentah", "Susut Biasa", "Susut Mesin"],
    texture: "Anyaman polos padat, kokoh, bertekstur natural",
    recommendation:
      "Tas kanvas, totebag, apron, sepatu, sarung bantal sofa, outer.",
    colors: ["White", "Grey", "Navy"],
    stockStatus: "Tersedia",
    badge: "Pilihan Utama",
    images: ["./img/KainGreyCanvas1.jpeg", "./img/KainGreyCanvas2.jpeg"],
  },
];

// Utility: Generate General WA Link
const getGeneralWALink = (message) => {
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedText}`;
};

// Utility: Generate Product Inquiry WA Link
const getProductInquiryLink = (product) => {
  const message = `Halo, saya tertarik dengan produk *${product.name}* (Kategori: ${product.category}).\nSaya ingin menanyakan penawaran harga per meter, variasi yang tersedia, dan informasi stok. Apakah produk ini bisa diorder?`;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
};

// ================= APPLICATION STATE =================
let currentProduct = null;
let selectedColor = "";
let selectedThickness = "";
let selectedType = "";
let inputQuantity = 1;
let currentFilterCategory = "Semua Material";
let currentSortOption = "Terbaru";
let searchQuery = "";
let wishlist =
  JSON.parse(localStorage.getItem("raja_kain_grey_wishlist")) || [];
let toastTimeout = null;

// ================= TOAST HELPER =================
// Custom Toast Helper (Menggantikan alert())
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  const toastMsg = document.getElementById("toast-message");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove("hidden");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

// ================= PRODUCT CARD & RENDERING =================
// UI Generation: Create Product Card HTML
function generateProductCard(product, context = "grid") {
  const isWishlisted = wishlist.includes(product.id);
  const heartIconClass = isWishlisted
    ? "ph-fill ph-heart text-dustyrose-500"
    : "ph ph-heart text-charcoal-400";

  return `
      <div class="group flex flex-col h-full ${context === "grid" ? "bg-white p-4 shadow-sm border border-ivory-200" : ""}">
          <div class="relative overflow-hidden aspect-[4/5] bg-ivory-200 cursor-pointer" onclick="openProductDetail('${product.id}')">
              ${product.badge ? `<span class="absolute top-3 left-3 z-10 bg-ivory-50/90 text-charcoal-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">${product.badge}</span>` : ""}
              
              <!-- Wishlist Button -->
              <button onclick="toggleWishlist(event, '${product.id}')" class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-dustyrose-50 transition-colors" title="Tambah ke Wishlist">
                  <i class="${heartIconClass} text-lg transition-transform active:scale-75"></i>
              </button>
              
              <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <!-- Hover Overlay button -->
              <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <span class="bg-white/90 text-charcoal-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider backdrop-blur-sm shadow-sm">Lihat Detail</span>
              </div>
          </div>
          
          <div class="pt-5 flex flex-col flex-grow text-center">
              <span class="text-xs text-dustyrose-600 uppercase tracking-widest mb-1">${product.category}</span>
              <h4 class="font-serif text-xl text-charcoal-800 mb-2 cursor-pointer hover:text-dustyrose-600 transition-colors" onclick="openProductDetail('${product.id}')">${product.name}</h4>
              
              <!-- Harga fleksibel dialihkan ke WA -->
              <p class="text-xs font-medium text-dustyrose-700 bg-dustyrose-50 py-1 px-3 rounded-full inline-block mx-auto mb-3">Tanyakan Harga & Deal via WA</p>
              
              <div class="mb-4">
                  <p class="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">Pilihan Warna:</p>
                  <div class="flex justify-center gap-1 flex-wrap text-xs text-charcoal-600 font-light">
                      ${product.colors.join(" &bull; ")}
                  </div>
              </div>
              
              <div class="mt-auto pt-4 flex flex-col gap-2">
                  <button onclick="openProductDetail('${product.id}')" class="w-full border border-charcoal-800 text-charcoal-800 py-2 text-xs font-medium tracking-wider uppercase hover:bg-charcoal-800 hover:text-ivory-50 transition-colors">
                      Pilih Spesifikasi
                  </button>
                  <button onclick="window.open('${getProductInquiryLink(product)}', '_blank')" class="w-full bg-[#25D366] text-white py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-[#1ebd5a] transition-colors flex items-center justify-center gap-2">
                      <i class="ph ph-whatsapp-logo text-base"></i> Tanya via WA
                  </button>
              </div>
          </div>
      </div>
  `;
}

// Initialize Render
function initRender() {
  const bestSellerContainer = document.getElementById("bestseller-grid");

  if (bestSellerContainer) bestSellerContainer.innerHTML = "";

  PRODUCTS.forEach((product) => {
    const cardHTML = generateProductCard(product);
    if (bestSellerContainer) {
      bestSellerContainer.insertAdjacentHTML("beforeend", cardHTML);
    }
  });

  updateWishlistUI();
  renderCatalog();
}

// Navigate and Filter directly from Home Category Cards
function navigateAndFilter(category) {
  navigate("catalog");
  setFilter(category);
}

// ================= FILTER, SORT & SEARCH =================
// Filter Function
function setFilter(category) {
  currentFilterCategory = category;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.filter === category) {
      btn.className =
        "filter-btn px-4 py-1.5 border border-charcoal-800 bg-charcoal-800 text-ivory-50 whitespace-nowrap transition-colors";
    } else {
      btn.className =
        "filter-btn px-4 py-1.5 border border-ivory-300 hover:border-charcoal-600 text-charcoal-600 whitespace-nowrap transition-colors";
    }
  });

  renderCatalog();
}

// Sort Function
function setSort(sortValue) {
  currentSortOption = sortValue;
  renderCatalog();
}

// Render Catalog Grid based on Filter & Sort
function renderCatalog() {
  const catalogContainer = document.getElementById("catalog-grid");
  if (!catalogContainer) return;

  catalogContainer.innerHTML = "";

  // 1. Filter
  let filteredProducts = PRODUCTS;
  if (currentFilterCategory !== "Semua Material") {
    filteredProducts = PRODUCTS.filter(
      (p) => p.category === currentFilterCategory,
    );
  }

  // 2. Filter Search Query
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.colors.some((c) => c.toLowerCase().includes(query)) ||
        p.texture.toLowerCase().includes(query),
    );
  }

  // 3. Sort
  let sortedProducts = [...filteredProducts];
  if (currentSortOption === "Terpopuler") {
    sortedProducts.sort((a, b) => {
      if (a.badge === "Bestseller" && b.badge !== "Bestseller") return -1;
      if (a.badge !== "Bestseller" && b.badge === "Bestseller") return 1;
      return 0;
    });
  }

  // 4. Render ke DOM
  if (sortedProducts.length === 0) {
    catalogContainer.innerHTML = `<div class="col-span-full text-center py-16 text-charcoal-600 bg-ivory-50 border border-ivory-200">Tidak ada produk yang cocok dengan pencarian atau filter Anda.</div>`;
  } else {
    sortedProducts.forEach((product) => {
      catalogContainer.insertAdjacentHTML(
        "beforeend",
        generateProductCard(product),
      );
    });
  }
}

// Search Features
function toggleSearch() {
  const overlay = document.getElementById("search-overlay");
  overlay.classList.toggle("hidden");
  if (!overlay.classList.contains("hidden")) {
    document.getElementById("search-input").focus();
  }
}

function handleSearch(event) {
  searchQuery = event.target.value;
  if (searchQuery.trim() !== "") {
    currentFilterCategory = "Semua Material";
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.className =
        btn.dataset.filter === "Semua Material"
          ? "filter-btn px-4 py-1.5 border border-charcoal-800 bg-charcoal-800 text-ivory-50 whitespace-nowrap transition-colors"
          : "filter-btn px-4 py-1.5 border border-ivory-300 hover:border-charcoal-600 text-charcoal-600 whitespace-nowrap transition-colors";
    });
  }

  navigate("catalog");
  renderCatalog();

  if (event.key === "Enter") {
    toggleSearch();
  }
}

// ================= WISHLIST =================
// Wishlist Toggle (Local Storage)
function toggleWishlist(event, productId) {
  event.stopPropagation();

  const index = wishlist.indexOf(productId);
  const icon = event.currentTarget.querySelector("i");

  if (index > -1) {
    wishlist.splice(index, 1);
    icon.className =
      "ph ph-heart text-charcoal-400 text-lg transition-transform active:scale-75";
  } else {
    wishlist.push(productId);
    icon.className =
      "ph-fill ph-heart text-dustyrose-500 text-lg transition-transform active:scale-75";
  }

  localStorage.setItem("raja_kain_grey_wishlist", JSON.stringify(wishlist));
  updateWishlistUI();

  if (!document.getElementById("view-wishlist").classList.contains("hidden")) {
    renderWishlist();
  }
}

function updateWishlistUI() {
  const badge = document.getElementById("wishlist-badge");
  if (badge) {
    if (wishlist.length > 0) {
      badge.textContent = wishlist.length;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }
}

function renderWishlist() {
  const container = document.getElementById("wishlist-grid");
  const emptyState = document.getElementById("empty-wishlist");
  const actionContainer = document.getElementById("wishlist-action");
  if (!container || !emptyState) return;

  container.innerHTML = "";

  // Bersihkan ID wishlist lama yang sudah tidak ada di daftar 2 produk
  wishlist = wishlist.filter((id) => PRODUCTS.some((p) => p.id === id));
  localStorage.setItem("raja_kain_grey_wishlist", JSON.stringify(wishlist));
  updateWishlistUI();

  if (wishlist.length === 0) {
    container.classList.add("hidden");
    emptyState.classList.remove("hidden");
    if (actionContainer) actionContainer.classList.add("hidden");
  } else {
    container.classList.remove("hidden");
    emptyState.classList.add("hidden");
    if (actionContainer) actionContainer.classList.remove("hidden");

    wishlist.forEach((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (product) {
        container.insertAdjacentHTML("beforeend", generateProductCard(product));
      }
    });
  }
}

function orderAllWishlist() {
  if (wishlist.length === 0) return;

  let message =
    "Halo Raja Kain Grey, saya tertarik dengan beberapa produk dari wishlist saya dan ingin berkonsultasi mengenai kesepakatan harga:\n\n";

  wishlist.forEach((id, index) => {
    const p = PRODUCTS.find((prod) => prod.id === id);
    if (p) {
      message += `${index + 1}. *${p.name}* (Kategori: ${p.category})\n`;
    }
  });

  message +=
    "\nMohon info penawaran harga terbaik dan konfirmasi stoknya. Terima kasih.";

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// ================= NAVIGATION & PRODUCT DETAIL =================
// Navigation Function
function navigate(viewId) {
  window.scrollTo(0, 0);
  document.getElementById("view-home").classList.add("hidden");
  document.getElementById("view-catalog").classList.add("hidden");
  document.getElementById("view-product-detail").classList.add("hidden");
  document.getElementById("view-wishlist").classList.add("hidden");

  document.getElementById(`view-${viewId}`).classList.remove("hidden");
  document.getElementById("mobile-menu").classList.add("hidden");

  if (viewId === "wishlist") {
    renderWishlist();
  }
}

// Open Product Detail
function openProductDetail(productId) {
  currentProduct = PRODUCTS.find((p) => p.id === productId);
  if (!currentProduct) return;

  // Reset state
  selectedColor = currentProduct.colors[0];
  selectedThickness = currentProduct.thickness
    ? currentProduct.thickness[0]
    : "";
  selectedType =
    currentProduct.types && currentProduct.types.length > 0
      ? currentProduct.types[0]
      : "";
  inputQuantity = 1;

  renderProductDetail();
  navigate("product-detail");
}

// Update Detail UI State (Form styling)
function updateDetailState() {
  // Update color buttons UI
  const colorBtns = document.querySelectorAll(".color-btn");
  colorBtns.forEach((btn) => {
    if (btn.dataset.color === selectedColor) {
      btn.classList.add("border-charcoal-800", "bg-ivory-200");
      btn.classList.remove("border-gray-200");
    } else {
      btn.classList.remove("border-charcoal-800", "bg-ivory-200");
      btn.classList.add("border-gray-200");
    }
  });

  // Update thickness buttons UI
  const thicknessBtns = document.querySelectorAll(".thickness-btn");
  thicknessBtns.forEach((btn) => {
    if (btn.dataset.thickness === selectedThickness) {
      btn.classList.add("border-charcoal-800", "bg-ivory-200");
      btn.classList.remove("border-gray-200");
    } else {
      btn.classList.remove("border-charcoal-800", "bg-ivory-200");
      btn.classList.add("border-gray-200");
    }
  });

  // Update fabric type buttons UI
  const typeBtns = document.querySelectorAll(".type-btn");
  typeBtns.forEach((btn) => {
    if (btn.dataset.type === selectedType) {
      btn.classList.add("border-charcoal-800", "bg-ivory-200");
      btn.classList.remove("border-gray-200");
    } else {
      btn.classList.remove("border-charcoal-800", "bg-ivory-200");
      btn.classList.add("border-gray-200");
    }
  });

  // Update quantity input
  const qtyInput = document.getElementById("qty-input");
  if (qtyInput) qtyInput.value = inputQuantity;
}

function handleQtyChange(change) {
  let newQty = parseFloat(inputQuantity) + change;
  if (newQty < 0.5) newQty = 0.5;

  inputQuantity = Math.round(newQty * 10) / 10;
  updateDetailState();
}

function handleManualQtyInput(event) {
  let val = parseFloat(event.target.value);
  if (isNaN(val) || val < 0.5) val = 0.5;
  inputQuantity = val;
  updateDetailState();
}

function selectColor(color) {
  selectedColor = color;
  updateDetailState();
}

function selectThickness(thickness) {
  selectedThickness = thickness;
  updateDetailState();
}

function selectType(type) {
  selectedType = type;
  updateDetailState();
}

// Generate specific WA link for detail form (Directly asks for pricing deal)
function generateOrderLink() {
  if (
    !currentProduct ||
    !selectedColor ||
    !selectedThickness ||
    (currentProduct.types && !selectedType) ||
    !inputQuantity
  ) {
    showToast(
      "Mohon lengkapi semua pilihan (warna, ketebalan, tipe kain, dan jumlah meter).",
    );
    return;
  }

  const typeText =
    currentProduct.types && currentProduct.types.length > 0
      ? `\n*Tipe Kain:* ${selectedType}`
      : "";

  const message = `Halo Raja Kain Grey, saya ingin berkonsultasi dan menanyakan penawaran harga untuk spesifikasi kain berikut:

Produk: ${currentProduct.name}
Warna: ${selectedColor}
Ketebalan: ${selectedThickness}${typeText}
Jumlah: ${inputQuantity} meter

Mohon info total harga & kesepakatan penawaran terbaiknya beserta konfirmasi stok. Terima kasih.`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Render Product Detail HTML
function renderProductDetail() {
  const container = document.getElementById("detail-container");
  const p = currentProduct;

  // Generate Color Buttons
  const colorButtonsHTML = p.colors
    .map(
      (color) =>
        `<button class="color-btn border border-gray-200 px-4 py-2 text-sm text-charcoal-600 hover:border-charcoal-400 transition-colors" data-color="${color}" onclick="selectColor('${color}')">${color}</button>`,
    )
    .join("");

  // Generate Thickness Buttons
  const thicknessButtonsHTML = p.thickness
    .map(
      (t) =>
        `<button class="thickness-btn border border-gray-200 px-4 py-2 text-sm text-charcoal-600 hover:border-charcoal-400 transition-colors" data-thickness="${t}" onclick="selectThickness('${t}')">${t}</button>`,
    )
    .join("");

  // Generate Fabric Type Buttons (if available)
  let typeButtonsHTML = "";
  let typeSpecHTML = "";
  let typeFormSectionHTML = "";

  if (p.types && p.types.length > 0) {
    typeButtonsHTML = p.types
      .map(
        (t) =>
          `<button class="type-btn border border-gray-200 px-4 py-2 text-sm text-charcoal-600 hover:border-charcoal-400 transition-colors" data-type="${t}" onclick="selectType('${t}')">${t}</button>`,
      )
      .join("");

    typeSpecHTML = `
      <div>
          <p class="text-gray-400 uppercase tracking-wider text-[11px] mb-1">Pilihan Tipe Kain</p>
          <p class="text-charcoal-800 font-medium">${p.types.join(", ")}</p>
      </div>
      `;

    typeFormSectionHTML = `
      <div class="mb-6">
          <label class="block text-sm font-medium text-charcoal-800 mb-3">3. Pilih Tipe Kain</label>
          <div class="flex flex-wrap gap-2" id="type-selector">
              ${typeButtonsHTML}
          </div>
      </div>
      `;
  }

  // Generate Images
  const imagesHTML = p.images
    .map(
      (img, idx) =>
        `<div class="aspect-[3/4] bg-ivory-200 w-full ${idx === 0 ? "mb-4" : ""}">
          <img src="${img}" alt="${p.name} detail" class="w-full h-full object-cover">
      </div>`,
    )
    .join("");

  container.innerHTML = `
      <!-- Left: Gallery -->
      <div class="w-full lg:w-1/2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-1">
              ${imagesHTML}
          </div>
      </div>

      <!-- Right: Info & Ordering -->
      <div class="w-full lg:w-1/2 lg:sticky lg:top-28">
          <!-- Badges -->
          <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-dustyrose-600 uppercase tracking-widest font-semibold">${p.category}</span>
              ${p.badge ? `<span class="bg-charcoal-800 text-ivory-50 text-[10px] uppercase tracking-widest px-2 py-1">${p.badge}</span>` : ""}
          </div>
          
          <h2 class="font-serif text-3xl md:text-4xl text-charcoal-800 mb-2">${p.name}</h2>
          <p class="text-lg text-dustyrose-600 font-medium mb-6">Penawaran Harga Disesuaikan Variasi (Nego via WA)</p>
          
          <p class="text-charcoal-600 mb-8 font-light leading-relaxed">${p.description}</p>
          
          <!-- Specifications -->
          <div class="border-y border-ivory-300 py-6 mb-8 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                  <p class="text-gray-400 uppercase tracking-wider text-[11px] mb-1">Lebar Kain</p>
                  <p class="text-charcoal-800 font-medium">${p.width}</p>
              </div>
              <div>
                  <p class="text-gray-400 uppercase tracking-wider text-[11px] mb-1">Pilihan Ketebalan</p>
                  <p class="text-charcoal-800 font-medium">${p.thickness.join(", ")}</p>
              </div>
              ${typeSpecHTML}
              <div class="${typeSpecHTML ? "" : "col-span-2"}">
                  <p class="text-gray-400 uppercase tracking-wider text-[11px] mb-1">Karakteristik Tekstur</p>
                  <p class="text-charcoal-800 font-medium">${p.texture}</p>
              </div>
              <div class="col-span-2">
                  <p class="text-gray-400 uppercase tracking-wider text-[11px] mb-1">Rekomendasi Penggunaan</p>
                  <p class="text-charcoal-800 font-medium">${p.recommendation}</p>
              </div>
          </div>

          <!-- Order Form (Non-transactional, Focus on WA Deal) -->
          <div class="bg-white p-6 border border-ivory-200 shadow-sm mb-8">
              <h3 class="font-serif text-lg text-charcoal-800 mb-4 border-b border-ivory-200 pb-2">Siapkan Pesanan & Penawaran WA</h3>
              
              <!-- Color Selection -->
              <div class="mb-6">
                  <label class="block text-sm font-medium text-charcoal-800 mb-3">1. Pilih Warna yang Diminati</label>
                  <div class="flex flex-wrap gap-2" id="color-selector">
                      ${colorButtonsHTML}
                  </div>
              </div>

              <!-- Thickness Selection -->
              <div class="mb-6">
                  <label class="block text-sm font-medium text-charcoal-800 mb-3">2. Pilih Ketebalan</label>
                  <div class="flex flex-wrap gap-2" id="thickness-selector">
                      ${thicknessButtonsHTML}
                  </div>
              </div>

              <!-- Type Selection (Conditional) -->
              ${typeFormSectionHTML}

              <!-- Quantity Selection -->
              <div class="mb-6">
                  <label class="block text-sm font-medium text-charcoal-800 mb-3 flex justify-between">
                      <span>${p.types && p.types.length > 0 ? "4" : "3"}. Tentukan Jumlah (Meter)</span>
                  </label>
                  <div class="flex items-center">
                      <button onclick="handleQtyChange(-0.5)" class="w-10 h-10 border border-gray-300 flex items-center justify-center text-charcoal-600 hover:bg-gray-50 transition-colors">-</button>
                      <input type="number" id="qty-input" value="1" step="0.5" min="0.5" onchange="handleManualQtyInput(event)" class="w-20 h-10 border-y border-gray-300 text-center text-charcoal-800 font-medium focus:outline-none focus:bg-ivory-50 transition-colors">
                      <button onclick="handleQtyChange(0.5)" class="w-10 h-10 border border-gray-300 flex items-center justify-center text-charcoal-600 hover:bg-gray-50 transition-colors">+</button>
                      <span class="ml-4 text-sm text-gray-500">meter (minimal 0.5m)</span>
                  </div>
              </div>

              <!-- Price Deal Note Box -->
              <div class="bg-ivory-100 p-4 mb-6 border border-ivory-200 border-dashed">
                  <p class="text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Info Kesepakatan Harga</p>
                  <p class="text-xs text-charcoal-600 leading-relaxed">Harga per meter bervariasi sesuai tipe susut kain, tingkat ketebalan, dan total kuantitas pemesanan Anda. Klik tombol di bawah untuk mendiskusikan harga terbaik langsung dengan admin kami.</p>
              </div>

              <!-- Main CTA -->
              <button onclick="generateOrderLink()" class="w-full bg-[#25D366] text-white py-4 font-semibold tracking-widest uppercase hover:bg-[#1ebd5a] transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg">
                  <i class="ph ph-whatsapp-logo text-2xl"></i> MINTA PENAWARAN & DEAL VIA WA
              </button>
              
              <div class="mt-4 flex justify-center">
                  <button onclick="window.open('${getProductInquiryLink(p)}', '_blank')" class="text-sm text-charcoal-600 underline hover:text-dustyrose-600 transition-colors">
                      Hanya ingin bertanya ketersediaan stok?
                  </button>
              </div>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-500">
              <i class="ph ph-shield-check text-lg"></i> Komunikasi & negosiasi harga transparan langsung dengan admin toko.
          </div>
      </div>
  `;

  updateDetailState();
}

// ================= INFO MODAL LOGIC =================
const INFO_CONTENT = {
  tentang: {
    title: "Tentang Kami",
    content:
      "Raja Kain Grey merupakan toko penyedia kain grey berkualitas tinggi yang berfokus pada material Grey Twill dan Grey Canvas untuk memenuhi kebutuhan industri fashion, konveksi, garment, maupun kebutuhan pribadi.\n\nKami menyediakan pilihan variasi tipe susut (mentah, susut biasa, susut mesin) serta tingkat ketebalan yang dapat disesuaikan dengan berbagai kebutuhan produksi maupun kreasi Anda.\n\nDengan mengutamakan kualitas anyaman, konsistensi stok, serta pelayanan yang responsif, kami berkomitmen untuk menjadi mitra terpercaya dalam memenuhi kebutuhan kain Anda.",
  },
  faq: {
    title: "FAQ Pemesanan & Penawaran Harga",
    content:
      'T: Bagaimana sistem penetapan harganya?\nJ: Karena tiap variasi (tipe kain mentah/susut, tingkat ketebalan) dan kuantitas meter memiliki nilai yang berbeda, penawaran harga terbaik akan diberikan langsung oleh admin melalui WhatsApp.\n\nT: Bagaimana cara memesan?\nJ: Pilih kain di katalog (Grey Twill atau Grey Canvas), tentukan warna, ketebalan, tipe kain, & jumlah meter, lalu klik "Minta Penawaran & Deal via WA". Sistem akan mengarahkan Anda ke WhatsApp admin kami beserta format rincian pilihan Anda.\n\nT: Apakah saya bisa membeli kain dalam jumlah besar?\nJ: Tentu! Kami melayani pembelian kain dalam jumlah besar (gulungan/roll) untuk kebutuhan konveksi, garment, maupun produksi. Untuk informasi stok dan penawaran harga grosir, silakan hubungi admin kami melalui WhatsApp.',
  },
  pengiriman: {
    title: "Informasi Pengiriman",
    content:
      "Kami melayani pengiriman kain untuk pelanggan dalam kota maupun luar kota. Untuk pelanggan dalam wilayah kota yang sama dengan toko, tersedia layanan pengiriman langsung oleh pihak toko tanpa dikenakan biaya tambahan.\n\nUntuk pengiriman luar kota, kami bekerja sama dengan jasa ekspedisi. Biaya pengiriman sepenuhnya menjadi tanggungan pelanggan dan disesuaikan dengan tarif serta ketentuan ekspedisi yang digunakan.\n\nPengiriman dilakukan setiap hari selama produk tersedia, dengan waktu pengiriman menyesuaikan kesiapan pesanan dan kondisi operasional toko. Sebelum pengiriman, pelanggan dapat mengonfirmasi kembali detail pesanan, alamat tujuan, dan waktu pengiriman melalui admin kami. Pemberian uang tip kepada kurir toko bersifat sukarela dan tidak wajib.\n\nUntuk informasi lebih lanjut mengenai pengiriman, silakan hubungi admin kami melalui WhatsApp.",
  },
  snk: {
    title: "Syarat & Ketentuan",
    content:
      "1. Informasi Produk & Stok:\nFoto di website merupakan representasi produk asli, namun warna kain dapat sedikit berbeda karena faktor pencahayaan dan pengaturan layar perangkat. Harga dapat berubah sewaktu-waktu, sehingga ketersediaan stok dan spesifikasi wajib dikonfirmasi kembali kepada admin sebelum transaksi.\n\n2. Pemesanan & Pengiriman:\nPemesanan dan pembayaran dilakukan langsung melalui admin Raja Kain Grey. Pastikan jenis kain, warna, jumlah, serta alamat penerima sudah benar sebelum pembayaran dikonfirmasi. Pengiriman dalam kota dilayani langsung secara gratis oleh tim kami, sedangkan pengiriman luar kota menggunakan jasa ekspedisi dengan ongkos kirim ditanggung pelanggan.\n\n3. Komplain, Retur & Perubahan Ketentuan:\nHarap periksa kondisi barang segera setelah diterima. Klaim kerusakan atau ketidaksesuaian wajib melampirkan bukti foto/video kepada admin untuk ditinjau, dan retur hanya berlaku atas persetujuan Raja Kain Grey. Ketentuan ini dapat diperbarui sewaktu-waktu sesuai kebutuhan operasional perusahaan.",
  },
};

function openInfoModal(type) {
  const info = INFO_CONTENT[type];
  if (info) {
    document.getElementById("info-modal-title").innerText = info.title;
    document.getElementById("info-modal-content").innerText = info.content;
    document.getElementById("info-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closeInfoModal() {
  document.getElementById("info-modal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// ================= INITIALIZE =================
window.addEventListener("DOMContentLoaded", () => {
  initRender();
});
