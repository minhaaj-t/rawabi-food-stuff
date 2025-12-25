// products.js — populate logos grid, filtering, and "show more" behaviour
const logos = [
  { name: 'Al Siha', src: '/assets/images/logos/Al-siha.png' },
  { name: 'Abumnarah', src: '/assets/images/logos/Abumnarah.png' },
  { name: 'Amerikan Speciality', src: '/assets/images/logos/Amerikan-Speciality.png' },
  { name: 'Belkis', src: '/assets/images/logos/Belkis.png' },
  { name: 'Prima 1', src: '/assets/images/logos/Prima-1.png' },
  { name: 'Rawabi Fresh', src: '/assets/images/logos/RAWABI-FRESH.png' },
  { name: 'Royal Taj', src: '/assets/images/logos/Royal-taj.png' },
  { name: 'Clean Cat', src: '/assets/images/logos/Clean-cat-png.png' },
  { name: 'Domee', src: '/assets/images/logos/Domee.png' },
  { name: 'Fransko', src: '/assets/images/logos/Fransko.pngA_.png' },
  { name: 'Fresh Fresh', src: '/assets/images/logos/Fresh-fresh-.png' },
  { name: 'Fruitomans', src: '/assets/images/logos/Fruitomans.png' },
  { name: 'Galina Logo', src: '/assets/images/logos/Galina-Logo.png' },
  { name: 'Green Garden', src: '/assets/images/logos/Green-garden.png' },
  { name: 'Hutesa', src: '/assets/images/logos/Hutesa.png' },
  { name: 'JUMBO', src: '/assets/images/logos/JUMBO.png' },
  { name: 'Kerala Kitchen', src: '/assets/images/logos/kerala-kitchen.png' },
  { name: 'MAI QATAR', src: '/assets/images/logos/MAI-QATAR.png' },
  { name: 'Metro', src: '/assets/images/logos/Metro.png' },
  { name: 'Milk Magic', src: '/assets/images/logos/MilkMagic.png' },
  { name: 'MOONI', src: '/assets/images/logos/MOONI.png' },
  { name: 'Mr. Extra', src: '/assets/images/logos/Mr.-Extra.png' },
  { name: 'Parrot', src: '/assets/images/logos/Parrot.png' },
  { name: 'Rawabi Gold', src: '/assets/images/logos/Rawabi-Gold.png' },
  { name: 'Single Spoon', src: '/assets/images/logos/single-Spoon.png' },
  { name: 'SONA MASOORI RICE', src: '/assets/images/logos/SONA-MASOORI-RICE.png' },
  { name: 'Super Excel', src: '/assets/images/logos/Super-excel.png' },
  { name: 'Winn', src: '/assets/images/logos/Winn.png' }
];

// Featured products data
const featuredProducts = [
  {
    id: 1,
    title: 'Tomato Paste',
    image: '/public/assets/images/archieves/1.png',
    type: 'Durable Goods',
    quantities: ['800 GM'],
    featured: true
  },
  {
    id: 2,
    title: 'Macroni Fusilli',
    image: '/public/assets/images/archieves/2.png',
    type: 'Durable Goods',
    quantities: ['400 GM'],
    featured: true
  },
  {
    id: 3,
    title: 'Sunflower Oil',
    image: '/public/assets/images/archieves/3.png',
    type: 'Durable Goods',
    quantities: ['770 ML', '1.5 LTR', '1.8 LTR', '3 LTR', '5 LTR'],
    featured: true
  },
  {
    id: 4,
    title: 'Chukku Kappy',
    image: '/public/assets/images/archieves/kerala-kitchen/4.png',
    type: 'Durable Goods',
    quantities: ['150 GM'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 5,
    title: 'Coconut Oil',
    image: '/public/assets/images/archieves/kerala-kitchen/5.png',
    type: 'Durable Goods',
    quantities: ['500 ML', '1 LTR', '2 LTR', '5 LTR'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 6,
    title: 'Appam/ Pathirippodi',
    image: '/public/assets/images/archieves/kerala-kitchen/6.png',
    type: 'Durable Goods',
    quantities: ['1 KG'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 7,
    title: 'Biriyani Masala',
    image: '/public/assets/images/archieves/kerala-kitchen/7.png',
    type: 'Durable Goods',
    quantities: ['100 GM'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 8,
    title: 'Chana Masala',
    image: '/public/assets/images/archieves/kerala-kitchen/8.png',
    type: 'Durable Goods',
    quantities: ['100 GM'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 9,
    title: 'Vegitable Masala',
    image: '/public/assets/images/archieves/kerala-kitchen/9.png',
    type: 'Durable Goods',
    quantities: ['100 GM'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 10,
    title: 'Chat Masala',
    image: '/public/assets/images/archieves/kerala-kitchen/10.png',
    type: 'Durable Goods',
    quantities: ['100 GM'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 11,
    title: 'Rasam Powder',
    image: '/public/assets/images/archieves/kerala-kitchen/11.png',
    type: 'Durable Goods',
    quantities: ['100 GM'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 12,
    title: 'Sambar Masala',
    image: '/public/assets/images/archieves/kerala-kitchen/12.png',
    type: 'Durable Goods',
    quantities: ['200 GM', '1 KG'],
    brand: 'Kerala Kitchen',
    featured: true
  },
  {
    id: 13,
    title: 'Dosa Podi',
    image: '/public/assets/images/archieves/kerala-kitchen/13.png',
    type: 'Durable Goods',
    quantities: ['1 KG'],
    brand: 'Kerala Kitchen',
    featured: true
  }
];

const MAX_VISIBLE = 8;

// Update the browser URL to reflect current brand filter (no reload)
function setURLFilter(filterName) {
  try {
    const url = new URL(window.location.href);
    if (filterName && filterName !== 'ALL') {
      url.searchParams.set('brand', filterName);
    } else {
      url.searchParams.delete('brand');
    }
    history.replaceState(null, '', url.toString());
  } catch (e) {
    // graceful fallback: use hash
    if (filterName && filterName !== 'ALL') {
      window.location.hash = `brand=${encodeURIComponent(filterName)}`;
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
}

function getURLFilter() {
  const params = new URLSearchParams(window.location.search);
  const brand = params.get('brand');
  if (brand) return brand;
  // fallback to hash parsing
  if (window.location.hash) {
    const m = window.location.hash.match(/brand=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

function createAllButton() {
  // Create a single circular "ALL" control styled like logos
  const allBtn = document.createElement('button');
  allBtn.className = 'logo-circle filter-all active';
  allBtn.type = 'button';
  allBtn.innerHTML = '<span class="more-count">ALL</span>';
  allBtn.title = 'Show all logos';

  // Clicking ALL resets to show all logos
  allBtn.addEventListener('click', () => {
    // remove active from any other controls (if present)
    const allButtons = document.querySelectorAll('.logo-circle.filter-all');
    allButtons.forEach(btn => btn.classList.add('active'));
    renderLogos('ALL', false);
    // Show all products
    renderProductCards();
    setURLFilter('ALL');
  });

  return allBtn;
}

function renderLogos(filter = 'ALL', expanded = false) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  // Add the ALL button as the first item in the grid
  const allBtn = createAllButton();
  grid.appendChild(allBtn);

  // Always display the full logos list in the grid; use `filter` only to mark the active brand.
  const displayLogos = logos;

  const showCount = expanded ? displayLogos.length : Math.min(displayLogos.length, MAX_VISIBLE - 1); // -1 because ALL button takes one spot
  displayLogos.slice(0, showCount).forEach((logo, idx) => {
    const item = document.createElement('div');
    item.className = 'logo-circle';
    item.title = logo.name;
    const img = document.createElement('img');
    img.src = logo.src;
    img.alt = logo.name;
    item.appendChild(img);
    // mark active if this matches the current filter
    if (filter !== 'ALL' && logo.name === filter) {
      item.classList.add('active');
    }

    // clicking a logo filters product cards to that brand
    item.addEventListener('click', () => {
      // re-render logos with this item marked active and show its products
      renderLogos(logo.name, false);
      renderProductCards(logo.name);
      setURLFilter(logo.name);
    });
    grid.appendChild(item);
  });

  // If there are more items and not expanded, render the "+N" circle
  if (!expanded && displayLogos.length > MAX_VISIBLE - 1) {
    const more = document.createElement('button');
    more.className = 'logo-circle more-btn';
    more.type = 'button';
    more.innerHTML = `<span class="more-count">+${displayLogos.length - (MAX_VISIBLE - 1)}</span>`;
    more.addEventListener('click', () => {
      renderLogos(filter, true);
    });
    grid.appendChild(more);
  }
}

function renderProductCards(filterBrand = null) {
  const grid = document.getElementById('productsCardsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const toRender = filterBrand
    ? featuredProducts.filter(p => p.brand === filterBrand)
    : featuredProducts;

  toRender.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.title}" class="product-image">
      </div>
      <div class="product-content">
        <h3 class="product-title">${product.title}</h3>
        <span class="product-type">${product.type}</span>
        <div class="product-quantities">
          ${product.quantities.join(', ')}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Remove the separate filter bar since ALL button is now in the grid
  const filterBar = document.querySelector('.logos-filter-bar');
  if (filterBar) {
    filterBar.remove();
  }
  const initialFilter = getURLFilter() || 'ALL';
  renderLogos(initialFilter, false);
  renderProductCards(getURLFilter() || null);
});


