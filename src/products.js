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
  }
];

const MAX_VISIBLE = 8;

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
  });

  return allBtn;
}

function renderLogos(filter = 'ALL', expanded = false) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  // Add the ALL button as the first item in the grid
  const allBtn = createAllButton();
  grid.appendChild(allBtn);

  const filtered = filter === 'ALL' ? logos : logos.filter(l => l.name === filter);

  const showCount = expanded ? filtered.length : Math.min(filtered.length, MAX_VISIBLE - 1); // -1 because ALL button takes one spot
  filtered.slice(0, showCount).forEach((logo, idx) => {
    const item = document.createElement('div');
    item.className = 'logo-circle';
    item.title = logo.name;
    const img = document.createElement('img');
    img.src = logo.src;
    img.alt = logo.name;
    item.appendChild(img);
    grid.appendChild(item);
  });

  // If there are more items and not expanded, render the "+N" circle
  if (!expanded && filtered.length > MAX_VISIBLE - 1) {
    const more = document.createElement('button');
    more.className = 'logo-circle more-btn';
    more.type = 'button';
    more.innerHTML = `<span class="more-count">+${filtered.length - (MAX_VISIBLE - 1)}</span>`;
    more.addEventListener('click', () => {
      renderLogos(filter, true);
    });
    grid.appendChild(more);
  }
}

function renderProductCards() {
  const grid = document.getElementById('productsCardsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  featuredProducts.forEach((product, index) => {
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

  renderLogos('ALL', false);
  renderProductCards();
});


