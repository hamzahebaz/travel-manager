/**
 * TourVoyage – Website JS
 * Reads from shared TM data store and renders dynamic content
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function stars(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    i < Math.floor(rating) ? '★' : (i < rating ? '⯨' : '☆')
  ).join('');
}

function formatPrice(price, sym = '€') {
  return `${sym}${Number(price).toLocaleString()}`;
}

function truncate(str, len = 120) {
  return str && str.length > len ? str.slice(0, len).trim() + '...' : str;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showToast(msg, type = 'success') {
  let c = document.getElementById('siteToastContainer');
  if (!c) { c = document.createElement('div'); c.id = 'siteToastContainer'; c.className = 'toast-container'; document.body.appendChild(c); }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type] || icons.success} ${type}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.navbar-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const settings = TM.get('settings');

  // Update branding
  $$('.site-name').forEach(el => el.textContent = settings.siteName || 'TourVoyage');
  $$('.site-phone').forEach(el => el.textContent = settings.phone || '');
  $$('.site-email').forEach(el => el.textContent = settings.email || '');

  // Update dynamic logo
  if (settings.logo) {
    let logoSrc = settings.logo;
    if (logoSrc.startsWith('website/')) {
      logoSrc = logoSrc.substring(8);
    }
    $$('.navbar-brand img, .footer-brand-name img').forEach(img => {
      img.src = logoSrc;
    });
  }

  // Update dynamic favicon
  if (settings.favicon) {
    let fav = document.querySelector('link[rel="icon"]');
    if (!fav) {
      fav = document.createElement('link');
      fav.rel = 'icon';
      fav.type = 'image/png';
      document.head.appendChild(fav);
    }
    let favSrc = settings.favicon;
    if (favSrc.startsWith('website/')) {
      favSrc = favSrc.substring(8);
    }
    fav.href = favSrc;
  }

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
    // Back to top
    const btt = document.querySelector('.back-to-top');
    if (btt) {
      if (window.scrollY > 400) btt.classList.add('visible');
      else btt.classList.remove('visible');
    }
  });

  // Mobile toggle
  toggleBtn?.addEventListener('click', () => mobileMenu?.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && mobileMenu?.classList.contains('open')) {
      mobileMenu.classList.remove('open');
    }
  });

  // Active nav link
  let current = window.location.pathname.split('/').pop() || 'index.html';
  if (current && !current.includes('.')) {
    current = current + '.html';
  }
  $$('.nav-link[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === current) link.classList.add('active');
  });

  // Render menu from data
  const menu = TM.get('menu').filter(m => m.active).sort((a,b) => a.order - b.order);
  $$('.nav-menu-dynamic').forEach(container => {
    container.innerHTML = menu.map(m => `
      <a href="${m.url}" class="nav-link" data-page="${m.url}">${m.label}</a>
    `).join('');
  });
}

// ─── Back to Top ──────────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function initFooter() {
  const s = TM.get('settings');
  $$('.footer-site-name').forEach(el => el.textContent = s.siteName);
  $$('.footer-desc-text').forEach(el => el.textContent = s.tagline);
  $$('.footer-phone').forEach(el => el.textContent = s.phone);
  $$('.footer-email').forEach(el => el.textContent = s.email);
  $$('.footer-address').forEach(el => el.textContent = s.address);

  // Social links
  const socials = { 
    facebook: s.facebook, instagram: s.instagram, twitter: s.twitter, youtube: s.youtube,
    tiktok: s.tiktok, linkedin: s.linkedin, pinterest: s.pinterest
  };
  const icons = { 
    facebook: 'fa-facebook-f', instagram: 'fa-instagram', twitter: 'fa-x-twitter', youtube: 'fa-youtube',
    tiktok: 'fa-tiktok', linkedin: 'fa-linkedin-in', pinterest: 'fa-pinterest-p'
  };
  $$('.footer-socials-dynamic').forEach(container => {
    container.innerHTML = Object.entries(socials)
      .filter(([, url]) => url)
      .map(([name, url]) => `<a href="${url}" target="_blank" class="social-btn" aria-label="${name}"><i class="fa-brands ${icons[name]}"></i></a>`)
      .join('');
  });

  // Dynamic footer menu (Quick Links)
  const footerMenu = TM.get('footerMenu');
  if (footerMenu) {
    const activeFooterMenu = footerMenu.filter(m => m.active).sort((a,b) => a.order - b.order);
    const quickLinksTitle = $$('.footer-col-title').find(el => el.textContent.trim().toLowerCase() === 'quick links');
    if (quickLinksTitle) {
      const quickLinksDiv = quickLinksTitle.nextElementSibling;
      if (quickLinksDiv && quickLinksDiv.classList.contains('footer-links')) {
        quickLinksDiv.innerHTML = activeFooterMenu.map(m => `
          <a href="${m.url}" class="footer-link">${m.label}</a>
        `).join('');
      }
    }
  }
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function initHomePage() {
  if (!document.getElementById('featuredToursGrid')) return;
  const settings = TM.get('settings');

  // Hero tagline
  const tagline = document.getElementById('heroTagline');
  if (tagline) {
    let tagText = settings.tagline || 'With Expert Local Guides';
    const cleanTag = tagText.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const cleanTitle = 'Discover the Magic of Morocco'.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (cleanTag === cleanTitle || cleanTag.includes('discoverthemagicofmorocco')) {
      tagText = 'With Expert Local Guides';
    }
    tagline.textContent = tagText;
  }

  // Hero stats
  const stats = TM.getStats();
  $$('[data-stat]').forEach(el => {
    const key = el.getAttribute('data-stat');
    el.textContent = stats[key] !== undefined ? stats[key].toLocaleString() : '';
  });

  // Featured Tours
  renderFeaturedTours();

  // Featured Destinations
  renderFeaturedDestinations();

  // Testimonials
  renderTestimonials();

  // Hero search
  initHeroSearch();
}

function renderFeaturedTours() {
  const grid = document.getElementById('featuredToursGrid');
  if (!grid) return;
  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';
  const tours = TM.get('tours').filter(t => t.active && t.featured).slice(0, 6);

  if (!tours.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">No featured tours available.</p>'; return; }

  grid.innerHTML = tours.map(t => tourCard(t, sym)).join('');
  initWishlist();
}

function tourCard(t, sym = '€') {
  const discPrice = t.discount ? t.price * (1 - t.discount/100) : null;
  const displayPrice = discPrice ? discPrice : t.price;

  return `
  <div class="tour-card" data-tour-id="${t.id}">
    <div class="tour-card-img">
      <img src="${t.image}" alt="${t.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=600&q=70'" />
      <div class="tour-card-badges">
        <span class="badge badge-cat">${t.category || 'Tour'}</span>
        ${t.discount ? `<span class="badge badge-discount">-${t.discount}%</span>` : ''}
        ${t.featured ? `<span class="badge badge-featured">⭐ Featured</span>` : ''}
      </div>
      <button class="tour-card-wish" data-id="${t.id}" aria-label="Wishlist"><i class="fa-${isWishlisted(t.id) ? 'solid' : 'regular'} fa-heart"></i></button>
    </div>
    <div class="tour-card-body">
      <div class="tour-card-dest"><i class="fa-solid fa-location-dot"></i> ${t.destination}</div>
      <h3 class="tour-card-title">${t.title}</h3>
      <div class="tour-card-meta">
        <span class="tour-meta-item"><i class="fa-solid fa-clock"></i> ${t.duration}</span>
        <span class="tour-meta-item"><i class="fa-solid fa-users"></i> Max ${t.maxPeople || 12}</span>
      </div>
      <div class="tour-card-rating">
        <span class="stars">${stars(t.rating)}</span>
        <span class="rating-val">${t.rating}</span>
        <span class="rating-count">(${t.reviews} reviews)</span>
      </div>
      <div class="tour-card-footer">
        <div>
          <div class="tour-price-from">From</div>
          ${t.discount ? `<div class="tour-price-old">${sym}${t.price}</div>` : ''}
          <div class="tour-price-val">${sym}${Math.round(displayPrice)}<small>/person</small></div>
        </div>
        <a href="tour-detail.html?id=${t.id}" class="btn btn-primary btn-sm">Book Now</a>
      </div>
    </div>
  </div>`;
}

function renderFeaturedDestinations() {
  const grid = document.getElementById('destGrid');
  if (!grid) return;
  const dests = TM.get('destinations').filter(d => d.active && d.featured).slice(0, 5);
  if (!dests.length) return;
  grid.innerHTML = dests.map((d, i) => `
    <div class="dest-card" onclick="location.href='destinations.html'">
      <img src="${d.image}" alt="${d.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=600&q=70'" />
      <div class="dest-card-info">
        <div class="dest-card-name">${d.name}</div>
        <div class="dest-card-count">${d.tours || 0} Tours</div>
      </div>
    </div>
  `).join('');
}

function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const colors = ['#6c63ff','#ec4899','#14b8a6','#10b981','#f59e0b','#3b82f6'];
  const reviews = TM.get('reviews').filter(r => r.approved);
  if (!reviews.length) { track.closest('.testimonials-wrap')?.closest('.section')?.remove(); return; }

  track.innerHTML = reviews.map((r, i) => `
    <div class="testimonial-card">
      <div class="test-stars">${stars(r.rating)}</div>
      <p class="test-text">${r.text}</p>
      <div class="test-author">
        <div class="test-avatar" style="background:${colors[i % colors.length]}">${r.author.charAt(0)}</div>
        <div>
          <div class="test-name">${r.author}</div>
          <div class="test-tour">${r.tourName}</div>
        </div>
      </div>
    </div>
  `).join('');

  // Carousel
  let idx = 0;
  const prev = document.getElementById('testPrev');
  const next = document.getElementById('testNext');
  const cards = track.querySelectorAll('.testimonial-card');
  const cardW = 370;

  function slide() { track.style.transform = `translateX(-${idx * cardW}px)`; }
  prev?.addEventListener('click', () => { idx = Math.max(0, idx - 1); slide(); });
  next?.addEventListener('click', () => { idx = Math.min(cards.length - 1, idx + 1); slide(); });
}

// ─── Hero Search ─────────────────────────────────────────────────────────────
function initHeroSearch() {
  const btn = document.getElementById('heroSearchBtn');
  const input = document.getElementById('heroSearchInput');
  const select = document.getElementById('heroSearchDest');

  // Populate destinations
  if (select) {
    const dests = TM.get('destinations').filter(d => d.active);
    select.innerHTML = `<option value="">All Destinations</option>` +
      dests.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  }

  btn?.addEventListener('click', () => {
    const q = input?.value || '';
    const dest = select?.value || '';
    let url = 'tours.html?';
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (dest) url += `dest=${encodeURIComponent(dest)}`;
    window.location.href = url;
  });

  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn?.click(); });
}

// ─── TOURS PAGE ───────────────────────────────────────────────────────────────
function initToursPage() {
  const grid = document.getElementById('toursGrid');
  if (!grid) return;

  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';
  let allTours = TM.get('tours').filter(t => t.active);
  let filtered = [...allTours];

  // Parse URL params
  const urlQ    = getParam('q') || '';
  const urlDest = getParam('dest') || '';

  // Populate filters
  const searchInput  = document.getElementById('toursSearch');
  const destFilter   = document.getElementById('toursDestFilter');
  const catFilter    = document.getElementById('toursCatFilter');
  const priceFilter  = document.getElementById('toursPriceFilter');
  const sortFilter   = document.getElementById('toursSortFilter');

  if (searchInput && urlQ)   searchInput.value = urlQ;
  if (destFilter && urlDest) destFilter.value  = urlDest;

  // Populate dest options
  if (destFilter) {
    const dests = [...new Set(allTours.map(t => t.destination))];
    destFilter.innerHTML = `<option value="">All Destinations</option>` +
      dests.map(d => `<option value="${d}" ${d === urlDest ? 'selected' : ''}>${d}</option>`).join('');
  }

  function applyFilters() {
    const q     = searchInput?.value.toLowerCase() || '';
    const dest  = destFilter?.value  || '';
    const cat   = catFilter?.value   || '';
    const price = priceFilter?.value || '';
    const sort  = sortFilter?.value  || 'featured';

    filtered = allTours.filter(t => {
      const matchQ    = !q    || t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q);
      const matchDest = !dest || t.destination === dest;
      const matchCat  = !cat  || t.category === cat;
      let matchPrice  = true;
      if (price === 'under100')    matchPrice = t.price < 100;
      if (price === '100-500')     matchPrice = t.price >= 100 && t.price <= 500;
      if (price === 'over500')     matchPrice = t.price > 500;
      return matchQ && matchDest && matchCat && matchPrice;
    });

    if (sort === 'price-asc')    filtered.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc')   filtered.sort((a,b) => b.price - a.price);
    if (sort === 'rating')       filtered.sort((a,b) => b.rating - a.rating);
    if (sort === 'featured')     filtered.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    const countEl = document.getElementById('toursCount');
    if (countEl) countEl.textContent = `${filtered.length} tours found`;

    grid.innerHTML = filtered.length
      ? filtered.map(t => tourCard(t, sym)).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)"><i class="fa-solid fa-compass" style="font-size:2.5rem;margin-bottom:16px;display:block"></i>No tours match your filters.</div>';

    initWishlist();
  }

  [searchInput, destFilter, catFilter, priceFilter, sortFilter].forEach(el =>
    el?.addEventListener('input', applyFilters)
  );

  applyFilters();
}

// ─── TOUR DETAIL PAGE ────────────────────────────────────────────────────────
function initTourDetailPage() {
  if (!document.getElementById('detailContent')) return;

  let tour = null;
  const id = getParam('id');

  if (id) {
    tour = TM.getItem('tours', id);
    // Dynamic history replace to new slug structure if accessed via ID query parameter
    if (tour && tour.slug && window.location.protocol !== 'file:') {
      try {
        window.history.replaceState({}, '', `/tours/${tour.slug}`);
      } catch (e) {
        console.warn('History API replaceState failed', e);
      }
    }
  } else {
    // Attempt to extract slug from pathname (e.g. /tours/circuit-atlas-5-days)
    const path = window.location.pathname;
    const match = path.match(/\/tours\/([^/]+)/);
    if (match && match[1]) {
      const slug = match[1];
      if (slug !== 'index.html' && slug !== 'tours.html' && slug !== 'tour-detail.html') {
        tour = TM.getBySlug('tours', slug);
      }
    }
  }

  if (!tour) {
    document.getElementById('detailContent').innerHTML = '<div style="text-align:center;padding:80px 0;color:var(--text-muted)">Tour not found.</div>';
    return;
  }

  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';

  // Hero
  const heroImg = document.getElementById('detailHeroImg');
  if (heroImg) heroImg.src = tour.bannerImage || tour.image;

  const heroTitle = document.getElementById('detailTitle');
  if (heroTitle) heroTitle.textContent = tour.title;

  const heroTitleH1 = document.getElementById('detailTitleH1');
  if (heroTitleH1) heroTitleH1.textContent = tour.title;

  const heroDest = document.getElementById('detailDest');
  if (heroDest) heroDest.textContent = tour.destination;

  const heroDuration = document.getElementById('detailDuration');
  if (heroDuration) heroDuration.textContent = tour.duration;

  const heroRating = document.getElementById('detailRating');
  if (heroRating) heroRating.innerHTML = `<span class="stars">${stars(tour.rating)}</span> ${tour.rating} (${tour.reviews} reviews)`;

  // Page title and custom SEO elements for this specific tour page
  if (tour.seoTitle) {
    document.title = tour.seoTitle;
  } else {
    document.title = `${tour.title} | ${settings.siteName || 'TourVoyage'}`;
  }

  // Meta Description
  if (tour.seoDesc) {
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = tour.seoDesc;
  }

  // Robots Meta Tag
  if (tour.seoRobots) {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = tour.seoRobots;
  }

  // Content
  const content = document.getElementById('detailContent');
  const discPrice = tour.discount ? tour.price * (1 - tour.discount/100) : null;
  const displayPrice = discPrice ? discPrice : tour.price;

  // Travel Styles and Facilities badges
  let attributesHTML = '';
  if ((tour.travelStyles && tour.travelStyles.length) || (tour.facilities && tour.facilities.length)) {
    attributesHTML = `
      <div class="detail-section" style="padding-bottom:16px">
        ${(tour.travelStyles || []).map(style => `<span style="display:inline-block;background:var(--sand-warm);color:var(--terracotta);padding:4px 12px;border-radius:100px;font-size:0.78rem;font-weight:600;margin-right:8px;margin-bottom:8px"><i class="fa-solid fa-compass"></i> ${style}</span>`).join('')}
        ${(tour.facilities || []).map(fac => `<span style="display:inline-block;background:rgba(20,184,166,0.1);color:var(--teal);padding:4px 12px;border-radius:100px;font-size:0.78rem;font-weight:600;margin-right:8px;margin-bottom:8px"><i class="fa-solid fa-circle-check"></i> ${fac}</span>`).join('')}
      </div>
    `;
  }

  // Advanced Itinerary Timeline with day description and images uploader support
  let itineraryHTML = '';
  if (tour.itineraryDays && tour.itineraryDays.length) {
    itineraryHTML = `
      <div class="detail-section">
        <h3><i class="fa-solid fa-route" style="color:var(--teal);margin-right:8px"></i>Day-by-Day Itinerary</h3>
        <div class="itinerary-timeline" style="display:flex;flex-direction:column;gap:20px;position:relative;padding-left:24px;margin-top:20px">
          <div style="position:absolute;top:10px;bottom:10px;left:7px;width:2px;background:var(--sand-dark)"></div>
          ${tour.itineraryDays.map((day, i) => `
            <div class="timeline-day" style="position:relative">
              <div style="position:absolute;top:4px;left:-24px;width:16px;height:16px;border-radius:50%;background:var(--terracotta);border:3px solid #fff;box-shadow:0 0 0 2px var(--sand-dark)"></div>
              <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:0 4px 15px rgba(0,0,0,0.02)">
                <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                  <h4 style="font-family:var(--font-headings, 'Playfair Display', serif);font-size:1.15rem;font-weight:700;color:var(--coffee-dark);margin:0">${day.title}</h4>
                  <span style="font-size:0.85rem;color:var(--terracotta);font-weight:600">${day.desc}</span>
                </div>
                <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin-bottom:12px">${day.content}</p>
                ${day.image ? `
                  <div style="width:100%;max-height:280px;border-radius:8px;overflow:hidden;margin-top:10px">
                     <img src="${day.image}" style="width:100%;height:100%;object-fit:cover" alt="${day.title}" />
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    // Fallback to original layout
    itineraryHTML = `
      <div class="detail-section">
        <h3><i class="fa-solid fa-route" style="color:var(--teal);margin-right:8px"></i>Itinerary</h3>
        <div class="itinerary-list">
          ${(tour.itinerary || []).map((item, i) => `
            <div class="itinerary-item">
              <div class="itinerary-day">${i+1}</div>
              <div class="itinerary-text">${item}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // YouTube embed video frame
  let videoHTML = '';
  if (tour.youtubeUrl) {
    let embedUrl = tour.youtubeUrl;
    if (embedUrl.includes('watch?v=')) {
      embedUrl = embedUrl.replace('watch?v=', 'embed/');
    } else if (embedUrl.includes('youtu.be/')) {
      embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    videoHTML = `
      <div class="detail-section">
        <h3><i class="fa-solid fa-video" style="color:var(--teal);margin-right:8px"></i>Tour Video Preview</h3>
        <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);background:#000">
          <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  // FAQ accordion list
  let faqsHTML = '';
  if (tour.faqs && tour.faqs.length) {
    faqsHTML = `
      <div class="detail-section">
        <h3><i class="fa-solid fa-question-circle" style="color:var(--teal);margin-right:8px"></i>Frequently Asked Questions</h3>
        <div class="faqs-accordion" style="display:flex;flex-direction:column;gap:12px">
          ${tour.faqs.map((faq, i) => `
            <div class="faq-item" style="border:1px solid var(--border);border-radius:8px;overflow:hidden">
              <button onclick="toggleFaqAccordion(this)" style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:var(--cream);border:none;font-weight:600;color:var(--coffee-dark);cursor:pointer;text-align:left">
                <span>${faq.q}</span>
                <i class="fa-solid fa-chevron-down" style="transition:transform 0.3s ease"></i>
              </button>
              <div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease-out, padding 0.3s ease-out;padding:0 20px;font-size:0.88rem;color:var(--text-secondary);line-height:1.6;background:#fff">
                <div style="padding:12px 0">${faq.a}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  content.innerHTML = `
    ${attributesHTML}

    <!-- Description -->
    <div class="detail-section">
      <h3><i class="fa-solid fa-circle-info" style="color:var(--teal);margin-right:8px"></i>About This Tour</h3>
      <p style="font-size:0.92rem;color:var(--text-secondary);line-height:1.8">${tour.description}</p>
    </div>

    ${videoHTML}
    ${itineraryHTML}

    <!-- Included / Excluded -->
    <div class="detail-section">
      <h3><i class="fa-solid fa-list-check" style="color:var(--teal);margin-right:8px"></i>What's Included</h3>
      <div class="included-grid">
        ${(tour.included || []).map(item => `<div class="included-item"><i class="fa-solid fa-check"></i> ${item}</div>`).join('')}
        ${(tour.excluded || []).map(item => `<div class="included-item excluded-item"><i class="fa-solid fa-xmark"></i> ${item}</div>`).join('')}
      </div>
    </div>

    ${faqsHTML}
  `;

  // Booking card
  const bookingCard = document.getElementById('bookingCard');
  if (bookingCard) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + (tour.minAdvanceDays || 0));
    const minDateString = minDate.toISOString().split('T')[0];

    let advanceNoticeHTML = '';
    if (tour.minAdvanceDays) {
      advanceNoticeHTML = `<div style="font-size:0.75rem;color:var(--terracotta);background:var(--sand-warm);padding:6px 12px;border-radius:6px;margin-top:8px;font-weight:500"><i class="fa-solid fa-circle-info"></i> Réserver au moins ${tour.minAdvanceDays} jours à l'avance</div>`;
    }

    const initialPeople = tour.minPeople || 1;
    const initialTotal = Math.round(displayPrice) * initialPeople;

    bookingCard.innerHTML = `
      <div class="booking-card-price">
        <div class="booking-price-label">Price per person</div>
        ${tour.discount ? `<div style="font-size:0.85rem;color:var(--text-muted);text-decoration:line-through">${sym}${tour.price}</div>` : ''}
        <div class="booking-price-val">${sym}${Math.round(displayPrice)}<small>/person</small></div>
        ${tour.discount ? `<div style="font-size:0.78rem;color:var(--green);margin-top:4px"><i class="fa-solid fa-tag"></i> ${tour.discount}% discount applied</div>` : ''}
        ${advanceNoticeHTML}
      </div>
      <form class="booking-form" id="bookingForm" onsubmit="submitBooking(event, ${tour.id})">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input class="form-input" type="text" id="bName" required placeholder="Your full name" />
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-input" type="email" id="bEmail" required placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" type="tel" id="bPhone" placeholder="+212 6 00 00 00 00" />
        </div>
        <div class="form-group">
          <label class="form-label">Tour Date *</label>
          <input class="form-input" type="date" id="bDate" required min="${minDateString}" value="${minDateString}" />
        </div>
        <div class="form-group">
          <label class="form-label">Number of People *</label>
          <input class="form-input" type="number" id="bPeople" required min="${tour.minPeople || 1}" max="${tour.maxPeople || 12}" value="${initialPeople}" oninput="updateBookingTotal(${Math.round(displayPrice)})" />
        </div>
        <div class="form-group">
          <label class="form-label">Coupon Code</label>
          <div class="coupon-row">
            <input class="form-input" type="text" id="bCoupon" placeholder="Enter coupon" />
            <button type="button" class="btn btn-ghost btn-sm" onclick="applyCoupon(${Math.round(displayPrice)})">Apply</button>
          </div>
          <div id="couponMsg" style="font-size:0.78rem;margin-top:4px"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" id="bNotes" placeholder="Special requests, dietary needs..."></textarea>
        </div>
        <div class="booking-summary" id="bookingSummary">
          <div class="booking-summary-row"><span>Price per person</span><span>${sym}${Math.round(displayPrice)}</span></div>
          <div class="booking-summary-row"><span>Persons</span><span id="bPersonsDisplay">${initialPeople}</span></div>
          <div class="booking-summary-row total"><span>Total</span><span id="bTotalDisplay">${sym}${initialTotal}</span></div>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px">
          <i class="fa-solid fa-calendar-check"></i> Book Now
        </button>
        <button type="button" id="btnBookWhatsapp" class="btn-whatsapp" style="width:100%">
          <i class="fa-brands fa-whatsapp"></i> Book via WhatsApp
        </button>
      </form>
    `;

    // Hook WhatsApp click listener
    const waBtn = document.getElementById('btnBookWhatsapp');
    waBtn?.addEventListener('click', () => {
      const form = document.getElementById('bookingForm');
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const waNum = settings.whatsapp || '+212600000000';
      const cleanedNum = waNum.replace(/[^0-9]/g, '');
      const name = document.getElementById('bName')?.value.trim() || 'Guest';
      const email = document.getElementById('bEmail')?.value.trim() || 'N/A';
      const phone = document.getElementById('bPhone')?.value.trim() || 'N/A';
      const date = document.getElementById('bDate')?.value || 'TBD';
      const people = document.getElementById('bPeople')?.value || '1';
      const notes = document.getElementById('bNotes')?.value.trim() || 'None';

      const discPrice = tour.discount ? tour.price * (1 - tour.discount/100) : tour.price;
      const subtotal = Math.round(discPrice) * parseInt(people);
      const total = Math.max(0, subtotal - couponDiscount);
      const formattedTotal = `${sym}${Math.round(total)}`;

      const message = `*New Order Request*

*Customer Details:*
Name: ${name}
Email: ${email}
Phone: ${phone}
Notes: ${notes}

*Order Summary:*
- Tour: ${tour.title} (${tour.duration})
- Date: ${date}
- People: ${people} person(s)

*Total Estimated:* ${formattedTotal}`;

      window.open(`https://wa.me/${cleanedNum}?text=${encodeURIComponent(message)}`, '_blank');
    });
  }

  // Related tours
  const relGrid = document.getElementById('relatedToursGrid');
  if (relGrid) {
    const related = TM.get('tours').filter(t => t.active && t.id != tour.id && (t.destination === tour.destination || t.category === tour.category)).slice(0, 3);
    relGrid.innerHTML = related.map(t => tourCard(t, sym)).join('');
  }

  // Render Tour Gallery
  const gallerySection = document.getElementById('tourGallerySection');
  const galleryGrid = document.getElementById('tourGalleryGrid');
  if (gallerySection && galleryGrid) {
    const galleryImages = tour.gallery || [];
    if (galleryImages.length > 0) {
      gallerySection.style.display = 'block';
      galleryGrid.className = 'gallery-grid';
      if (galleryImages.length === 1) galleryGrid.classList.add('gallery-1');
      else if (galleryImages.length === 2) galleryGrid.classList.add('gallery-2');
      
      galleryGrid.innerHTML = galleryImages.map((img, idx) => `
        <div class="gallery-thumb" onclick="openLightbox(${idx})">
          <img src="${img}" alt="${tour.title} Gallery Image ${idx + 1}" onerror="this.src='https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=400&q=70'" />
        </div>
      `).join('');
    } else {
      gallerySection.style.display = 'none';
    }
  }

  // Dynamic Structured Data (TouristTrip Schema)
  const itineraryItems = (tour.itinerary || []).map((item, idx) => ({
    "@type": "ListItem",
    "position": idx + 1,
    "name": item
  }));

  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": tour.description,
    "image": tour.image,
    "touristType": "Leisure",
    "provider": {
      "@type": "TravelAgency",
      "name": settings.siteName || "TourVoyage",
      "url": window.location.origin
    },
    "offers": {
      "@type": "Offer",
      "price": tour.discount ? Math.round(tour.price * (1 - tour.discount/100)) : tour.price,
      "priceCurrency": settings.currency || "EUR",
      "url": window.location.href,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2027-12-31"
    }
  };

  if (itineraryItems.length > 0) {
    schemaObj.itinerary = {
      "@type": "ItemList",
      "numberOfItems": itineraryItems.length,
      "itemListElement": itineraryItems
    };
  }

  let schemaScript = document.getElementById('tm-tour-schema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'tm-tour-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify(schemaObj, null, 2);

  // Render Tour Reviews List
  const matchingReviews = TM.get('reviews').filter(r => r.tourId == id && r.approved);
  const reviewsCountEl = document.getElementById('reviewsCount');
  if (reviewsCountEl) reviewsCountEl.textContent = matchingReviews.length;

  const reviewsListEl = document.getElementById('reviewsList');
  if (reviewsListEl) {
    if (matchingReviews.length > 0) {
      reviewsListEl.innerHTML = matchingReviews.map(r => `
        <div class="review-card">
          <div class="review-card-header">
            <span class="review-author">${r.author}</span>
            <span class="review-date">${r.date}</span>
          </div>
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <p class="review-text">${r.text}</p>
        </div>
      `).join('');
    } else {
      reviewsListEl.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem;text-align:center;padding:20px 0;">No reviews yet. Be the first to share your experience!</p>`;
    }
  }

  // Interactive Stars Selector logic inside the review form
  const starElements = document.querySelectorAll('.star-input');
  const ratingInput = document.getElementById('rRating');
  
  function highlightStars(rating) {
    starElements.forEach(el => {
      const starVal = parseInt(el.getAttribute('data-rating'));
      if (starVal <= rating) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Set default highlight state (5 stars)
  highlightStars(5);

  starElements.forEach(star => {
    star.addEventListener('click', () => {
      const ratingVal = parseInt(star.getAttribute('data-rating'));
      if (ratingInput) ratingInput.value = ratingVal;
      highlightStars(ratingVal);
    });
  });
}

function submitReview(e) {
  e.preventDefault();
  const id = getParam('id');
  const tour = TM.getItem('tours', id);
  if (!tour) return;

  const author = document.getElementById('rAuthor').value.trim();
  const email = document.getElementById('rEmail').value.trim();
  const rating = parseInt(document.getElementById('rRating').value) || 5;
  const text = document.getElementById('rText').value.trim();

  const newReview = {
    tourId: parseInt(id),
    tourName: tour.title,
    author,
    email,
    rating,
    text,
    date: new Date().toISOString().split('T')[0],
    approved: false, // Require admin approval by default
  };

  TM.addItem('reviews', newReview);
  
  showToast('Thank you! Your review has been submitted and is pending admin approval.', 'success');
  document.getElementById('reviewForm').reset();
  
  // Reset rating back to 5 stars
  const ratingInput = document.getElementById('rRating');
  if (ratingInput) ratingInput.value = '5';
  
  const starElements = document.querySelectorAll('.star-input');
  starElements.forEach(el => el.classList.add('active'));
}
window.submitReview = submitReview;

let couponDiscount = 0;
let couponCode = '';

function applyCoupon(basePrice) {
  const code = document.getElementById('bCoupon')?.value;
  const people = parseInt(document.getElementById('bPeople')?.value) || 1;
  const total = basePrice * people;
  const msgEl = document.getElementById('couponMsg');

  const result = TM.validateCoupon(code, total);
  if (result.valid) {
    couponDiscount = result.discount;
    couponCode = result.code;
    if (msgEl) msgEl.innerHTML = `<span style="color:var(--green)"><i class="fa-solid fa-check"></i> Coupon applied! -${TM.get('settings').currencySymbol}${result.discount.toFixed(2)}</span>`;
    updateBookingTotal(basePrice);
  } else {
    couponDiscount = 0; couponCode = '';
    if (msgEl) msgEl.innerHTML = `<span style="color:var(--red)"><i class="fa-solid fa-xmark"></i> ${result.message}</span>`;
    updateBookingTotal(basePrice);
  }
}

function updateBookingTotal(pricePerPerson) {
  const people = parseInt(document.getElementById('bPeople')?.value) || 1;
  const sym = TM.get('settings').currencySymbol || '€';
  const subtotal = pricePerPerson * people;
  const total = Math.max(0, subtotal - couponDiscount);

  const pDisp = document.getElementById('bPersonsDisplay');
  const tDisp = document.getElementById('bTotalDisplay');
  const summary = document.getElementById('bookingSummary');

  if (pDisp) pDisp.textContent = people;
  if (tDisp) tDisp.textContent = `${sym}${Math.round(total)}`;

  // Show discount row
  const existDiscRow = document.getElementById('bDiscountRow');
  if (existDiscRow) existDiscRow.remove();
  if (couponDiscount > 0 && summary) {
    const row = document.createElement('div');
    row.id = 'bDiscountRow';
    row.className = 'booking-summary-row discount-row';
    row.innerHTML = `<span>Discount (${couponCode})</span><span>-${sym}${couponDiscount.toFixed(2)}</span>`;
    const totalRow = summary.querySelector('.total');
    summary.insertBefore(row, totalRow);
  }
}

function submitBooking(e, tourId) {
  e.preventDefault();
  const tour = TM.getItem('tours', tourId);
  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';

  const name   = document.getElementById('bName').value.trim();
  const email  = document.getElementById('bEmail').value.trim();
  const phone  = document.getElementById('bPhone').value.trim();
  const date   = document.getElementById('bDate').value;
  const people = parseInt(document.getElementById('bPeople').value) || 1;
  const notes  = document.getElementById('bNotes').value.trim();

  const pricePerPerson = tour.discount ? tour.price * (1 - tour.discount/100) : tour.price;
  const subtotal = Math.round(pricePerPerson) * people;
  const total = Math.max(0, subtotal - couponDiscount);

  const reservation = {
    tourId,
    tourName: tour.title,
    customer: name,
    email,
    phone,
    people,
    date,
    total,
    paid: 0,
    coupon: couponCode,
    status: 'Pending',
    notes,
    createdAt: new Date().toLocaleString(),
  };

  TM.addItem('reservations', reservation);

  // Update coupon usage
  if (couponCode) {
    const coupons = TM.get('coupons');
    const ci = coupons.findIndex(c => c.code === couponCode);
    if (ci >= 0) { coupons[ci].used++; TM.set('coupons', coupons); }
  }

  showToast(`Booking confirmed! Thank you, ${name}. We'll contact you shortly.`, 'success');
  document.getElementById('bookingForm').reset();
  couponDiscount = 0; couponCode = '';
  document.getElementById('couponMsg').innerHTML = '';
  updateBookingTotal(Math.round(pricePerPerson));
}

// ─── DESTINATIONS PAGE ────────────────────────────────────────────────────────
function initDestinationsPage() {
  const grid = document.getElementById('destinationsGrid');
  if (!grid) return;
  const dests = TM.get('destinations').filter(d => d.active);

  grid.innerHTML = dests.map(d => `
    <div class="dest-card" style="min-height:260px" onclick="location.href='tours.html?dest=${encodeURIComponent(d.name)}'">
      <img src="${d.image}" alt="${d.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=600&q=70'" />
      <div class="dest-card-info">
        <div class="dest-card-name">${d.name}, ${d.country}</div>
        <div class="dest-card-count">${d.tours || 0} tours available</div>
        <div style="font-size:0.78rem;color:rgba(255,255,255,0.6);margin-top:4px">${truncate(d.description, 80)}</div>
      </div>
    </div>
  `).join('');
}

// ─── HOTELS PAGE ─────────────────────────────────────────────────────────────
function initHotelsPage() {
  const grid = document.getElementById('hotelsGrid');
  if (!grid) return;
  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';
  const hotels = TM.get('hotels').filter(h => h.active);

  grid.innerHTML = hotels.map(h => `
    <div class="hotel-card">
      <div class="hotel-card-img">
        <img src="${h.image}" alt="${h.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=70'" />
        <div class="hotel-stars">${'★'.repeat(h.stars)}</div>
      </div>
      <div class="hotel-card-body">
        <h3 class="hotel-card-name">${h.name}</h3>
        <div class="hotel-card-dest"><i class="fa-solid fa-location-dot"></i> ${h.destination}</div>
        <p class="hotel-card-desc">${h.description}</p>
        <div class="hotel-amenities">
          ${(h.amenities || []).slice(0, 4).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
        </div>
        <div class="hotel-card-footer">
          <div class="hotel-price">${sym}${h.price}<small>/night</small></div>
          <a href="hotel-detail.html?id=${h.id}" class="btn btn-primary btn-sm">View Rooms</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── HOTEL DETAIL PAGE ────────────────────────────────────────────────────────
let activeSelectedRoom = null;
let activeHotelDiscount = 0;
let appliedHotelCouponCode = '';

function initHotelDetailPage() {
  const container = document.getElementById('hotelRoomsSection');
  if (!container) return; // Only run on hotel-detail page

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    window.location.href = 'hotels.html';
    return;
  }

  const hotel = TM.getItem('hotels', id);
  if (!hotel) {
    window.location.href = 'hotels.html';
    return;
  }

  const settings = TM.get('settings') || {};
  const sym = settings.currencySymbol || '€';

  // Fill in Hotel Details
  document.getElementById('detailTitleH1').textContent = hotel.name;
  document.getElementById('detailHeroImg').src = hotel.image;
  document.getElementById('detailDest').textContent = hotel.destination;
  document.getElementById('detailRating').textContent = '★'.repeat(hotel.stars);
  document.getElementById('detailContent').textContent = hotel.description || '';

  // Render Amenities Tags
  const amenitiesContainer = document.getElementById('hotelAmenitiesTags');
  if (amenitiesContainer) {
    amenitiesContainer.innerHTML = (hotel.amenities || []).map(amen => `
      <span class="amenity-tag" style="background:var(--sand-warm);color:var(--coffee-dark);padding:6px 12px;border-radius:4px;font-size:0.82rem;font-weight:600;"><i class="fa-solid fa-check" style="color:var(--teal)"></i> ${amen}</span>
    `).join('');
  }

  // Render Gallery
  if (hotel.gallery && hotel.gallery.length > 0) {
    const gallerySection = document.getElementById('hotelGallerySection');
    const galleryGrid = document.getElementById('hotelGalleryGrid');
    if (gallerySection && galleryGrid) {
      gallerySection.style.display = 'block';
      galleryGrid.innerHTML = hotel.gallery.map(img => `
        <div class="gallery-item" onclick="openLightbox('${img}')">
          <img src="${img}" alt="Hotel Gallery Image" />
        </div>
      `).join('');
    }
  }

  // Fetch and Render Rooms
  const rooms = (TM.get('rooms') || []).filter(r => r.hotelId == id && r.status === 'Publish');
  const roomsGrid = document.getElementById('hotelRoomsGrid');
  if (roomsGrid) {
    if (rooms.length === 0) {
      roomsGrid.innerHTML = `
        <div style="text-align:center;padding:40px;background:var(--cream);border-radius:8px;border:1px solid var(--border);color:var(--text-muted)">
          <i class="fa-solid fa-circle-info" style="font-size:2rem;color:var(--teal);margin-bottom:12px"></i>
          <p>No available rooms listed at this moment. Please contact us directly for reservations.</p>
        </div>
      `;
    } else {
      roomsGrid.innerHTML = rooms.map(r => {
        const featHTML = (r.attributes || []).map(f => `<span class="amenity-tag" style="font-size:0.75rem;"><i class="fa-solid fa-tag"></i> ${f}</span>`).join('');
        return `
          <div style="display:grid; grid-template-columns: 240px 1fr; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:white;">
            <div style="position:relative; max-height: 180px;">
              <img src="${r.image || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=70'}" alt="${r.name}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
              <div>
                <h4 style="font-size:1.1rem; font-weight:700; color:var(--coffee-dark); margin:0 0 6px 0;">${r.name}</h4>
                <div style="display:flex; gap:12px; font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">
                  <span><i class="fa-solid fa-user"></i> Max Adults: ${r.maxAdults || 2}</span>
                  <span><i class="fa-solid fa-child"></i> Max Children: ${r.maxChildren || 0}</span>
                  <span><i class="fa-solid fa-hotel"></i> Available: ${r.number || 1} rooms</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  ${featHTML}
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:12px;">
                <div style="font-weight:700; font-size:1.2rem; color:var(--coffee-dark);">${sym}${r.price}<small style="font-size:0.7rem; font-weight:normal; color:var(--text-muted);"> /night</small></div>
                <button type="button" class="btn btn-primary btn-sm" onclick="selectRoomForBooking(${r.id}, '${r.name.replace(/'/g, "\\'")}', ${r.price})">Select Room</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render Booking Form Card
  renderHotelBookingCard(hotel, rooms);
}

function selectRoomForBooking(roomId, roomName, roomPrice) {
  activeSelectedRoom = { id: roomId, name: roomName, price: roomPrice };
  
  // Set room selection value in select element
  const selectEl = document.getElementById('bRoomSelect');
  if (selectEl) {
    selectEl.value = roomId;
  }
  
  updateHotelBookingTotal();
  
  // Scroll to booking form
  document.getElementById('bookingCard').scrollIntoView({ behavior: 'smooth' });
}

function renderHotelBookingCard(hotel, rooms) {
  const bookingCard = document.getElementById('bookingCard');
  if (!bookingCard) return;

  const settings = TM.get('settings') || {};
  const sym = settings.currencySymbol || '€';

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const roomOptions = rooms.map(r => `<option value="${r.id}">${r.name} - ${sym}${r.price}/night</option>`).join('');

  bookingCard.innerHTML = `
    <div class="booking-card-price" style="padding:20px; text-align:center; border-bottom:1px solid var(--border);">
      <h4 style="font-size:0.9rem;text-transform:uppercase;color:var(--text-muted);margin:0 0 6px 0;">Request Reservation</h4>
      <div id="bookingSelectedRoomName" style="font-weight:700; font-size:1.1rem; color:var(--coffee-dark);">Please select a room</div>
    </div>
    <form class="booking-form" id="hotelBookingForm" onsubmit="submitHotelBooking(event, ${hotel.id})">
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input class="form-input" type="text" id="bhName" required placeholder="Your full name" />
      </div>
      <div class="form-group">
        <label class="form-label">Email *</label>
        <input class="form-input" type="email" id="bhEmail" required placeholder="your@email.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input class="form-input" type="tel" id="bhPhone" placeholder="+212 6 00 00 00 00" />
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Check-in Date *</label>
          <input class="form-input" type="date" id="bhCheckIn" required min="${todayStr}" value="${todayStr}" onchange="updateHotelBookingDates()" />
        </div>
        <div class="form-group">
          <label class="form-label">Check-out Date *</label>
          <input class="form-input" type="date" id="bhCheckOut" required min="${tomorrowStr}" value="${tomorrowStr}" onchange="updateHotelBookingTotal()" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Select Room *</label>
        <select class="form-input" id="bRoomSelect" required onchange="handleRoomSelectChange(this, ${JSON.stringify(rooms).replace(/"/g, '&quot;')})">
          <option value="">-- Choose Room --</option>
          ${roomOptions}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Coupon Code</label>
        <div class="coupon-row" style="display:flex; gap:8px;">
          <input class="form-input" type="text" id="bhCoupon" placeholder="Enter coupon" style="flex:1;" />
          <button type="button" class="btn btn-ghost btn-sm" onclick="applyHotelCoupon()">Apply</button>
        </div>
        <div id="bhCouponMsg" style="font-size:0.78rem;margin-top:4px"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Notes / Requests</label>
        <textarea class="form-textarea" id="bhNotes" placeholder="Additional requirements..."></textarea>
      </div>

      <div class="booking-summary" id="bhBookingSummary" style="display:none; background:var(--cream); padding:12px; border-radius:6px; margin-bottom:16px;">
        <div class="booking-summary-row" style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
          <span>Room price/night</span><span id="bhRoomPrice">0</span>
        </div>
        <div class="booking-summary-row" style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
          <span>Number of Nights</span><span id="bhNights">1</span>
        </div>
        <div class="booking-summary-row total" style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed var(--border); padding-top:8px; font-size:1.1rem; color:var(--coffee-dark);">
          <span>Total Cost</span><span id="bhTotalDisplay">0</span>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">
        <i class="fa-solid fa-calendar-check"></i> Request Booking
      </button>
    </form>
  `;

  // Prefill first room
  if (rooms.length > 0) {
    selectRoomForBooking(rooms[0].id, rooms[0].name, rooms[0].price);
  }
}

function handleRoomSelectChange(select, rooms) {
  const roomId = select.value;
  if (!roomId) {
    activeSelectedRoom = null;
    document.getElementById('bookingSelectedRoomName').textContent = 'Please select a room';
    document.getElementById('bhBookingSummary').style.display = 'none';
    return;
  }
  const r = rooms.find(room => room.id == roomId);
  if (r) {
    activeSelectedRoom = { id: r.id, name: r.name, price: r.price };
    document.getElementById('bookingSelectedRoomName').textContent = r.name;
    updateHotelBookingTotal();
  }
}

function updateHotelBookingDates() {
  const checkIn = document.getElementById('bhCheckIn').value;
  const checkOutEl = document.getElementById('bhCheckOut');
  if (checkIn && checkOutEl) {
    const minCheckOut = new Date(checkIn);
    minCheckOut.setDate(minCheckOut.getDate() + 1);
    const minCheckOutStr = minCheckOut.toISOString().split('T')[0];
    checkOutEl.min = minCheckOutStr;
    if (new Date(checkOutEl.value) <= new Date(checkIn)) {
      checkOutEl.value = minCheckOutStr;
    }
  }
  updateHotelBookingTotal();
}

function updateHotelBookingTotal() {
  if (!activeSelectedRoom) return;

  const checkIn = document.getElementById('bhCheckIn')?.value;
  const checkOut = document.getElementById('bhCheckOut')?.value;
  const summary = document.getElementById('bhBookingSummary');
  if (!checkIn || !checkOut || !summary) return;

  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.abs(date2 - date1);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const settings = TM.get('settings') || {};
  const sym = settings.currencySymbol || '€';

  let rawTotal = activeSelectedRoom.price * nights;
  let discountedTotal = rawTotal;
  
  if (activeHotelDiscount > 0) {
    discountedTotal = Math.max(0, rawTotal - activeHotelDiscount);
  }

  summary.style.display = 'block';
  document.getElementById('bhRoomPrice').textContent = `${sym}${activeSelectedRoom.price}`;
  document.getElementById('bhNights').textContent = nights;
  document.getElementById('bhTotalDisplay').textContent = `${sym}${discountedTotal}`;
}

function applyHotelCoupon() {
  if (!activeSelectedRoom) {
    showToast('Please select a room first', 'warning');
    return;
  }

  const code = document.getElementById('bhCoupon').value.trim();
  const msg = document.getElementById('bhCouponMsg');
  if (!code) {
    showToast('Enter a coupon code', 'error');
    return;
  }

  const checkIn = document.getElementById('bhCheckIn').value;
  const checkOut = document.getElementById('bhCheckOut').value;
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.abs(date2 - date1);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = activeSelectedRoom.price * nights;

  const res = TM.validateCoupon(code, totalAmount);
  if (res.valid) {
    activeHotelDiscount = res.discount;
    appliedHotelCouponCode = res.code;
    msg.style.color = 'var(--green)';
    msg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Coupon applied! Saved €${res.discount}`;
    updateHotelBookingTotal();
  } else {
    activeHotelDiscount = 0;
    appliedHotelCouponCode = '';
    msg.style.color = 'var(--red)';
    msg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${res.message}`;
    updateHotelBookingTotal();
  }
}

function submitHotelBooking(event, hotelId) {
  if (event) event.preventDefault();
  if (!activeSelectedRoom) {
    showToast('Please select a room type', 'error');
    return;
  }

  const name = document.getElementById('bhName').value.trim();
  const email = document.getElementById('bhEmail').value.trim();
  const phone = document.getElementById('bhPhone').value.trim();
  const checkIn = document.getElementById('bhCheckIn').value;
  const checkOut = document.getElementById('bhCheckOut').value;
  const notes = document.getElementById('bhNotes').value.trim();

  const hotel = TM.getItem('hotels', hotelId);
  const hotelName = hotel ? hotel.name : 'Hotel';

  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.abs(date2 - date1);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const baseCost = activeSelectedRoom.price * nights;
  const total = Math.max(0, baseCost - activeHotelDiscount);

  const bookingData = {
    tourId: 0, 
    tourName: `${hotelName} - ${activeSelectedRoom.name}`,
    customer: name,
    email: email,
    phone: phone,
    people: 1, 
    date: checkIn,
    total: total,
    paid: 0,
    coupon: appliedHotelCouponCode,
    status: 'In Progress',
    notes: `Check-in: ${checkIn} | Check-out: ${checkOut}\nNights: ${nights}\nRoom Type: ${activeSelectedRoom.name}\n${notes}`,
  };

  TM.addItem('reservations', bookingData);
  
  // Show success alert
  const formCard = document.getElementById('hotelBookingForm');
  if (formCard) {
    formCard.innerHTML = `
      <div style="text-align:center;padding:30px;color:var(--coffee-dark);">
        <i class="fa-solid fa-circle-check" style="font-size:3.5rem;color:var(--teal);margin-bottom:16px;"></i>
        <h3 style="font-family:var(--font-headings);font-size:1.3rem;font-weight:700;margin-bottom:8px;">Booking Requested!</h3>
        <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.5;">Thank you ${name}. Your reservation request for <strong>${activeSelectedRoom.name}</strong> at <strong>${hotelName}</strong> has been received.<br>Our agents will contact you shortly.</p>
        <a href="hotels.html" class="btn btn-primary btn-sm" style="margin-top:20px;display:inline-flex;">Browse Hotels</a>
      </div>
    `;
  }

  showToast('Booking request submitted successfully!', 'success');
}

// Make room booking helpers available globally
window.initHotelDetailPage = initHotelDetailPage;
window.selectRoomForBooking = selectRoomForBooking;
window.handleRoomSelectChange = handleRoomSelectChange;
window.updateHotelBookingDates = updateHotelBookingDates;
window.updateHotelBookingTotal = updateHotelBookingTotal;
window.applyHotelCoupon = applyHotelCoupon;
window.submitHotelBooking = submitHotelBooking;

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function initAboutPage() {
  const el = document.getElementById('aboutSiteName');
  if (el) el.textContent = TM.get('settings').siteName;
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('cName').value.trim();
    const email   = document.getElementById('cEmail').value.trim();
    const subject = document.getElementById('cSubject').value.trim();
    const message = document.getElementById('cMessage').value.trim();

    // Save as a reservation note
    TM.addItem('reservations', {
      tourId: 0, tourName: `Inquiry: ${subject}`,
      customer: name, email, phone: '', people: 1,
      date: new Date().toISOString().split('T')[0],
      total: 0, paid: 0, coupon: '', status: 'Pending',
      notes: message, createdAt: new Date().toLocaleString(),
    });

    showToast(`Thank you ${name}! We'll reply to ${email} shortly.`, 'success');
    form.reset();
  });
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
function isWishlisted(id) {
  const list = JSON.parse(localStorage.getItem('tm_wishlist') || '[]');
  return list.includes(Number(id));
}
function toggleWishlist(id) {
  const list = JSON.parse(localStorage.getItem('tm_wishlist') || '[]');
  const numId = Number(id);
  const idx = list.indexOf(numId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(numId);
  localStorage.setItem('tm_wishlist', JSON.stringify(list));
}
function initWishlist() {
  $$('.tour-card-wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      toggleWishlist(id);
      const icon = btn.querySelector('i');
      if (isWishlisted(id)) {
        icon.className = 'fa-solid fa-heart';
        btn.classList.add('active');
        showToast('Added to wishlist!', 'success');
      } else {
        icon.className = 'fa-regular fa-heart';
        btn.classList.remove('active');
        showToast('Removed from wishlist', 'warning');
      }
    });
  });
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function initNewsletter() {
  $$('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value) return;
      const emailVal = input.value.trim().toLowerCase();
      
      if (window.TM) {
        const subs = TM.get('subscribers') || [];
        if (subs.some(s => s.email === emailVal)) {
          showToast('You are already subscribed!', 'warning');
        } else {
          TM.addItem('subscribers', {
            email: emailVal,
            createdAt: new Date().toLocaleString()
          });
          showToast('Subscribed! Thank you for joining us.', 'success');
        }
      } else {
        showToast('Subscribed! Thank you for joining us.', 'success');
      }
      input.value = '';
    });
  });
}

function initCleanUrls() {
  if (window.location.protocol === 'file:') return;

  const mapping = {
    'index.html': '/',
    'tours.html': '/tours',
    'cars.html': '/cars',
    'about.html': '/about',
    'contact.html': '/contact',
    'destinations.html': '/destinations',
    'hotels.html': '/hotels',
    'blog.html': '/blog',
  };

  // Rewrite address bar to clean URL (removes .html and website/)
  const path = window.location.pathname;
  if (path.endsWith('.html') || path.includes('/website/')) {
    let cleanPath = path.replace('.html', '').replace('/website/', '/');
    if (cleanPath.endsWith('/index')) {
      cleanPath = cleanPath.slice(0, -6) || '/';
    }
    if (!cleanPath) cleanPath = '/';
    try {
      window.history.replaceState({}, '', cleanPath + window.location.search);
    } catch (e) {
      console.warn('History API replaceState failed', e);
    }
  }

  // Intercept click events on links to handle navigation cleanly
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) return;

    // Check if the link corresponds to one of our pages
    let targetPage = href.split('?')[0];
    if (mapping[targetPage]) {
      e.preventDefault();
      let newUrl = mapping[targetPage];
      const query = href.includes('?') ? href.substring(href.indexOf('?')) : '';
      window.location.href = newUrl + query;
    } else if (href.startsWith('tour-detail.html?')) {
      e.preventDefault();
      const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
      const tourId = urlParams.get('id');
      const tour = TM.getItem('tours', tourId);
      if (tour && tour.slug) {
        window.location.href = '/tours/' + tour.slug;
      } else {
        window.location.href = '/tour-detail' + href.substring(href.indexOf('?'));
      }
    } else if (href.startsWith('blog-detail.html?')) {
      e.preventDefault();
      const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
      const slug = urlParams.get('slug');
      const id = urlParams.get('id');
      let blogItem = null;
      if (slug) blogItem = TM.getBySlug('news', slug);
      else if (id) blogItem = TM.getItem('news', id);
      if (blogItem && blogItem.slug) {
        window.location.href = '/blog/' + blogItem.slug;
      } else {
        window.location.href = '/blog-detail' + href.substring(href.indexOf('?'));
      }
    }
  });
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Wait for TM to be available
  if (typeof TM === 'undefined') {
    console.error('TM data layer not loaded!');
    return;
  }

  initCleanUrls();
  initNavbar();
  initBackToTop();
  initFooter();
  initNewsletter();
  initFloatingWidget();
  applyThemeCustomizations();

  // Apply SEO
  const pageMap = {
    'index.html': 'home', 'tours.html': 'tours', 'tour-detail.html': 'tours',
    'cars.html': 'cars',
    'destinations.html': 'destinations', 'hotels.html': 'hotels', 'hotel-detail.html': 'hotels',
    'about.html': 'about', 'contact.html': 'contact',
    'blog.html': 'home', 'blog-detail.html': 'home'
  };
  let currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (window.location.pathname.includes('/tours/')) {
    currentPage = 'tour-detail.html';
  } else if (window.location.pathname.includes('/hotels/')) {
    currentPage = 'hotel-detail.html';
  } else if (window.location.pathname.includes('/blog/')) {
    currentPage = 'blog-detail.html';
  } else if (currentPage && !currentPage.includes('.')) {
    currentPage = currentPage + '.html';
  }
  TM.applySEO(pageMap[currentPage] || 'home');

  // Page-specific init
  initHomePage();
  initToursPage();
  initTourDetailPage();
  initDestinationsPage();
  initHotelsPage();
  initHotelDetailPage();
  initAboutPage();
  initContactPage();
  initCarsPage();
  initBlogPage();
  initBlogDetailPage();
  initPopupSystem();
});

// Floating Support Chat Widget (with Chat, FAQ, Channels tabs)
function initFloatingWidget() {
  const settings = TM.get('settings');
  const waNum = settings.whatsapp || '+212600000000';
  const cleanedNum = waNum.replace(/[^0-9]/g, '');
  const siteName = settings.siteName || 'TourVoyage';
  const phone = settings.phone || '+212 5 24 00 00 00';
  const email = settings.email || 'contact@tourvoyage.com';
  let logoIcon = settings.favicon || 'images/favicon.png';
  if (logoIcon.startsWith('website/')) {
    logoIcon = logoIcon.substring(8);
  }

  // 1. Create Floating Button Launcher
  const launcher = document.createElement('button');
  launcher.id = 'widgetLauncher';
  launcher.className = 'widget-launcher';
  launcher.setAttribute('aria-label', 'Open support widget');
  launcher.innerHTML = `<i class="fa-solid fa-comments"></i>`;
  document.body.appendChild(launcher);

  // 2. Create Widget Box
  const widgetBox = document.createElement('div');
  widgetBox.id = 'widgetBox';
  widgetBox.className = 'widget-box';
  widgetBox.innerHTML = `
    <div class="widget-header">
      <button class="widget-close" onclick="toggleWidget()"><i class="fa-solid fa-xmark"></i></button>
      <img src="${logoIcon}" class="widget-header-logo" alt="${siteName} Icon" onerror="this.style.display='none'" />
      <div class="widget-header-title">👋 Our team is here for you</div>
    </div>
    <div class="widget-body">
      <!-- Chat Tab content -->
      <div id="wTabContentChat" class="widget-tab-content active">
        <div class="widget-chat-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:10px">
              <img src="${logoIcon}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" alt="${siteName}" />
              <div>
                <div style="font-weight:600;font-size:0.9rem;color:var(--coffee-dark)">${siteName} Support</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">Typically replies instantly</div>
              </div>
            </div>
            <span class="widget-status-badge"><span class="status-dot"></span> Online</span>
          </div>
          <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.5;margin-bottom:16px">Hi, how can we help you today? Ask us anything about our Morocco tours, bookings, or customization options.</p>
          <a href="https://wa.me/${cleanedNum}?text=${encodeURIComponent('Hello ' + siteName + '! I have a question about your tours.')}" target="_blank" class="widget-btn-chat" onclick="toggleWidget()">
            Start a new chat <i class="fa-solid fa-paper-plane" style="font-size:0.8rem"></i>
          </a>
        </div>
      </div>

      <!-- FAQ Tab content -->
      <div id="wTabContentFaq" class="widget-tab-content">
        <div class="widget-faq-title"><i class="fa-regular fa-circle-question"></i> Frequently Asked Questions</div>
        <div class="widget-faq-list">
          <div class="w-faq-item">
            <div class="w-faq-q" onclick="toggleFaqAccordion(this)">What is ${siteName}? <i class="fa-solid fa-chevron-down"></i></div>
            <div class="w-faq-a">${siteName} is a premium travel platform offering authentic, expert-guided tours, desert excursions, and hand-picked riad stays across Morocco.</div>
          </div>
          <div class="w-faq-item">
            <div class="w-faq-q" onclick="toggleFaqAccordion(this)">Can I customize a private tour? <i class="fa-solid fa-chevron-down"></i></div>
            <div class="w-faq-a">Yes! We specialize in tailored private itineraries. You can get in touch with our team via WhatsApp or by sending a request on our Contact page to design your custom route.</div>
          </div>
          <div class="w-faq-item">
            <div class="w-faq-q" onclick="toggleFaqAccordion(this)">Do I need a visa to travel to Morocco? <i class="fa-solid fa-chevron-down"></i></div>
            <div class="w-faq-a">Tourists from many countries (US, EU, UK, Canada, Australia) do not require a visa for tourist stays up to 90 days. Please verify current regulations with your local Moroccan consulate.</div>
          </div>
          <div class="w-faq-item">
            <div class="w-faq-q" onclick="toggleFaqAccordion(this)">When is the best time to visit? <i class="fa-solid fa-chevron-down"></i></div>
            <div class="w-faq-a">Spring (March to May) and Autumn (September to November) offer the most pleasant weather, with mild temperatures for sightseeing and desert treks.</div>
          </div>
          <div class="w-faq-item">
            <div class="w-faq-q" onclick="toggleFaqAccordion(this)">Is transport included in the price? <i class="fa-solid fa-chevron-down"></i></div>
            <div class="w-faq-a">Yes, all our tours and multi-day circuits include high-end, air-conditioned private transportation with professional drivers.</div>
          </div>
        </div>
      </div>

      <!-- Channels Tab content -->
      <div id="wTabContentChannels" class="widget-tab-content">
        <div class="widget-faq-title"><i class="fa-solid fa-share-nodes"></i> Contact Channels</div>
        <div class="widget-channels-list">
          <a href="https://wa.me/${cleanedNum}" target="_blank" class="w-channel-item">
            <span class="w-channel-icon wa"><i class="fa-brands fa-whatsapp"></i></span>
            <span class="w-channel-label">WhatsApp</span>
            <i class="fa-solid fa-arrow-up-right-from-square arrow"></i>
          </a>
          <a href="tel:${phone.replace(/[^0-9+]/g, '')}" class="w-channel-item">
            <span class="w-channel-icon phone"><i class="fa-solid fa-phone"></i></span>
            <span class="w-channel-label">Phone (${phone})</span>
            <i class="fa-solid fa-arrow-up-right-from-square arrow"></i>
          </a>
          <a href="mailto:${email}" class="w-channel-item">
            <span class="w-channel-icon email"><i class="fa-regular fa-envelope"></i></span>
            <span class="w-channel-label">Email (${email})</span>
            <i class="fa-solid fa-arrow-up-right-from-square arrow"></i>
          </a>
          <a href="contact.html" class="w-channel-item">
            <span class="w-channel-icon contact"><i class="fa-solid fa-link"></i></span>
            <span class="w-channel-label">Contact Us Form</span>
            <i class="fa-solid fa-arrow-up-right-from-square arrow"></i>
          </a>
        </div>
      </div>
    </div>
    <div class="widget-footer">
      <button class="w-footer-tab active" onclick="switchWidgetTab('Chat', this)"><i class="fa-regular fa-comment"></i><span>Chat</span></button>
      <button class="w-footer-tab" onclick="switchWidgetTab('Faq', this)"><i class="fa-regular fa-circle-question"></i><span>FAQ</span></button>
      <button class="w-footer-tab" onclick="switchWidgetTab('Channels', this)"><i class="fa-solid fa-grip"></i><span>Channels</span></button>
    </div>
  `;
  document.body.appendChild(widgetBox);

  // 3. Attach click listener to launcher
  launcher.addEventListener('click', toggleWidget);
}

function toggleWidget() {
  const box = document.getElementById('widgetBox');
  const launcher = document.getElementById('widgetLauncher');
  if (!box) return;
  box.classList.toggle('open');
  launcher.classList.toggle('active');
  if (launcher.classList.contains('active')) {
    launcher.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  } else {
    launcher.innerHTML = `<i class="fa-solid fa-comments"></i>`;
  }
}

function switchWidgetTab(tabName, btn) {
  document.querySelectorAll('.widget-tab-content').forEach(el => el.classList.remove('active'));
  const activeContent = document.getElementById(`wTabContent${tabName}`);
  if (activeContent) activeContent.classList.add('active');

  document.querySelectorAll('.w-footer-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

function toggleFaqAccordion(header) {
  const item = header.parentElement;
  const wasActive = item.classList.contains('active');
  document.querySelectorAll('.w-faq-item').forEach(el => el.classList.remove('active'));
  if (!wasActive) {
    item.classList.add('active');
  }
}

// Expose widget functions to window
window.toggleWidget = toggleWidget;
window.switchWidgetTab = switchWidgetTab;
window.toggleFaqAccordion = toggleFaqAccordion;

// Lightbox functionality
let currentLightboxIndex = 0;
let lightboxImages = [];

function openLightbox(idx) {
  const id = getParam('id');
  const tour = TM.getItem('tours', id);
  if (!tour || !tour.gallery || !tour.gallery.length) return;

  lightboxImages = tour.gallery;
  currentLightboxIndex = idx;

  let lb = document.getElementById('galleryLightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'galleryLightbox';
    lb.className = 'gallery-lightbox';
    lb.innerHTML = `
      <button class="gallery-lb-close" onclick="closeLightbox()">&times;</button>
      <button class="gallery-lb-prev" onclick="prevLightbox()"><i class="fa-solid fa-chevron-left"></i></button>
      <img id="lightboxImg" src="" alt="Enlarged gallery view" />
      <button class="gallery-lb-next" onclick="nextLightbox()"><i class="fa-solid fa-chevron-right"></i></button>
    `;
    document.body.appendChild(lb);

    // Close on background click
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
    });
  }

  document.getElementById('lightboxImg').src = lightboxImages[currentLightboxIndex];
  lb.classList.add('open');
}

function closeLightbox() {
  const lb = document.getElementById('galleryLightbox');
  if (lb) lb.classList.remove('open');
}

function prevLightbox() {
  if (!lightboxImages.length) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  document.getElementById('lightboxImg').src = lightboxImages[currentLightboxIndex];
}

// Next image
function nextLightbox() {
  if (!lightboxImages.length) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
  document.getElementById('lightboxImg').src = lightboxImages[currentLightboxIndex];
}

// Expose lightbox functions to window
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.prevLightbox = prevLightbox;
window.nextLightbox = nextLightbox;

function applyThemeCustomizations() {
  const settings = TM.get('settings') || {};
  const theme = settings.theme;
  if (!theme) return;

  // 1. Colors override
  if (theme.colors) {
    let css = ':root {\n';
    Object.entries(theme.colors).forEach(([variable, value]) => {
      if (value) {
        css += `  ${variable}: ${value} !important;\n`;
        // Handle hover shades automatically
        if (variable === '--terracotta') {
          css += `  --terracotta2: ${adjustThemeColor(value, -12)} !important;\n`;
        }
        if (variable === '--gold') {
          css += `  --gold2: ${adjustThemeColor(value, -12)} !important;\n`;
        }
      }
    });
    css += '}';

    // Add extra overrides for header styles if needed
    if (theme.headerStyle === 'solid') {
      css += `
        .navbar {
          background: var(--cream) !important;
          backdrop-filter: none !important;
        }
        .navbar.scrolled {
          background: var(--cream) !important;
        }
      `;
    } else if (theme.headerStyle === 'glass') {
      css += `
        .navbar {
          background: var(--navbar-bg, rgba(253, 246, 236, 0.8)) !important;
          backdrop-filter: blur(20px) !important;
        }
        .navbar.scrolled {
          background: var(--navbar-bg, rgba(253, 246, 236, 0.95)) !important;
        }
      `;
    }

    let styleEl = document.getElementById('tm-theme-colors');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tm-theme-colors';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }

  // 2. Homepage Sections Ordering & Visibility
  if (theme.layoutOrder && Array.isArray(theme.layoutOrder)) {
    const layoutContainer = document.getElementById('homepage-layout');
    if (layoutContainer) {
      theme.layoutOrder.forEach((block, idx) => {
        const el = document.getElementById(block.id);
        if (el) {
          el.style.order = idx;
          if (block.visible === false) {
            el.style.display = 'none';
          } else {
            el.style.display = '';
          }
        }
      });
    }
  }

  // 3. Widget Toggle
  if (theme.sidebarSupport === false) {
    const launcher = document.getElementById('widgetLauncher');
    if (launcher) launcher.style.display = 'none';
    const widgetBox = document.getElementById('widgetBox');
    if (widgetBox) widgetBox.style.display = 'none';
  }
}

function adjustThemeColor(hex, percent) {
  let num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

// ─── CAR RENTAL PAGE ─────────────────────────────────────────────────────────
function carCard(c, sym = '€') {
  return `
  <div class="tour-card car-card" data-car-id="${c.id}">
    <div class="tour-card-img">
      <img src="${c.image}" alt="${c.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=70'" />
      <div class="tour-card-badges">
        <span class="badge badge-cat">${c.type || 'Car'}</span>
        ${c.featured ? `<span class="badge badge-featured">⭐ Popular</span>` : ''}
      </div>
    </div>
    <div class="tour-card-body">
      <h3 class="tour-card-title">${c.name}</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 15px; height: 4.5em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
        ${c.description || 'Enjoy a comfortable drive in Morocco.'}
      </p>
      <div class="tour-card-meta" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 15px;">
        <span class="tour-meta-item"><i class="fa-solid fa-gears"></i> ${c.transmission}</span>
        <span class="tour-meta-item"><i class="fa-solid fa-gas-pump"></i> ${c.fuel}</span>
        <span class="tour-meta-item"><i class="fa-solid fa-door-closed"></i> ${c.doors || 4} Doors</span>
        <span class="tour-meta-item"><i class="fa-solid fa-user-group"></i> ${c.seats || 5} Seats</span>
      </div>
      <div class="tour-card-footer">
        <div>
          <div class="tour-price-from">Per Day</div>
          <div class="tour-price-val">${sym}${c.pricePerDay}<small>/day</small></div>
        </div>
        <button onclick="openCarBookModal(${c.id})" class="btn btn-primary btn-sm">Rent Now</button>
      </div>
    </div>
  </div>`;
}

function initCarsPage() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';

  const searchInput = document.getElementById('carsSearch');
  const typeFilter = document.getElementById('carsTypeFilter');
  const transFilter = document.getElementById('carsTransFilter');
  const countEl = document.getElementById('carsCount');

  function render() {
    const cars = TM.get('cars') || [];
    const q = searchInput?.value.toLowerCase() || '';
    const type = typeFilter?.value || '';
    const trans = transFilter?.value || '';

    const filtered = cars.filter(c => {
      if (!c.active) return false;
      const matchesQ = !q || c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      const matchesType = !type || c.type === type;
      const matchesTrans = !trans || c.transmission === trans;
      return matchesQ && matchesType && matchesTrans;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} vehicles found`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)"><i class="fa-solid fa-car" style="font-size:2.5rem;margin-bottom:16px;display:block"></i>No vehicles match your criteria.</div>';
    } else {
      grid.innerHTML = filtered.map(c => carCard(c, sym)).join('');
    }
  }

  [searchInput, typeFilter, transFilter].forEach(el => {
    el?.addEventListener('input', render);
  });

  render();
}

window.openCarBookModal = function(id) {
  const car = TM.getItem('cars', id);
  if (!car) return;
  const modal = document.getElementById('carBookModal');
  if (!modal) return;

  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';

  document.getElementById('bookCarId').value = car.id;
  document.getElementById('bookCarName').textContent = car.name;
  document.getElementById('bookCarPrice').textContent = `${sym}${car.pricePerDay}/day`;
  
  const imgEl = document.getElementById('bookCarImg');
  if (imgEl) {
    imgEl.src = car.image;
    imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=70'; };
  }

  // Pre-fill dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bcStartDate').value = today;
  document.getElementById('bcStartDate').min = today;
  document.getElementById('bcDays').value = '1';

  modal.classList.remove('hidden');
};

window.closeCarBookModal = function() {
  const modal = document.getElementById('carBookModal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

window.submitCarBooking = function() {
  const carId = document.getElementById('bookCarId').value;
  const car = TM.getItem('cars', carId);
  if (!car) return;

  const custName = document.getElementById('bcCust').value.trim();
  const custEmail = document.getElementById('bcEmail').value.trim();
  const custPhone = document.getElementById('bcPhone').value.trim();
  const startDate = document.getElementById('bcStartDate').value;
  const days = parseInt(document.getElementById('bcDays').value) || 1;
  const notes = document.getElementById('bcNotes').value.trim();

  if (!custName || !custEmail || !custPhone || !startDate || days < 1) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';
  const total = car.pricePerDay * days;

  // Save reservation
  const reservation = {
    tourId: 0,
    carId: car.id,
    carName: car.name,
    tourName: `Car: ${car.name}`, // fallback
    customer: custName,
    email: custEmail,
    phone: custPhone,
    people: 1,
    date: startDate,
    total: total,
    paid: 0,
    coupon: '',
    status: 'Pending',
    notes: `Rental Days: ${days}. Notes: ${notes}`,
    createdAt: new Date().toLocaleString()
  };

  TM.addItem('reservations', reservation);

  // Send WhatsApp pre-filled message
  const waNum = settings.whatsapp || '+212600000000';
  const cleanedNum = waNum.replace(/[^0-9]/g, '');
  const formattedTotal = `${sym}${total}`;

  const message = `*New Car Rental Inquiry*

*Customer Details:*
Name: ${custName}
Email: ${custEmail}
Phone: ${custPhone}
Notes: ${notes}

*Rental Summary:*
- Vehicle: ${car.name} (${car.type})
- Transmission: ${car.transmission}
- Pickup Date: ${startDate}
- Duration: ${days} day(s)

*Total Estimated:* ${formattedTotal}`;

  // Close modal and show toast
  window.closeCarBookModal();
  showToast('Booking saved! Redirecting to WhatsApp...', 'success');

  // Clear fields
  document.getElementById('bcCust').value = '';
  document.getElementById('bcEmail').value = '';
  document.getElementById('bcPhone').value = '';
  document.getElementById('bcDays').value = '1';
  document.getElementById('bcNotes').value = '';

  // WhatsApp redirection
  setTimeout(() => {
    window.open(`https://wa.me/${cleanedNum}?text=${encodeURIComponent(message)}`, '_blank');
  }, 1000);
};

// ─── POPUP SYSTEM ────────────────────────────────────────────────────────────
function initPopupSystem() {
  let currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage && !currentPage.includes('.')) {
    currentPage = currentPage + '.html';
  }

  const popups = (window.TM ? TM.get('popups') : null) || [];
  const activePopup = popups.find(p => p.status === 'Published' && (p.targetPage === 'all' || p.targetPage === currentPage));

  if (!activePopup) return;

  // Check 24h dismissal flag
  const dismissedTime = localStorage.getItem('tm_popup_dismissed_' + activePopup.id);
  if (dismissedTime) {
    const now = new Date().getTime();
    if (now - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return; // Closed recently
    }
  }

  // Render popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'webPopupOverlay';
  overlay.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s ease;
    padding: 20px;
  `;

  const card = document.createElement('div');
  card.style = `
    background: #fff;
    width: 100%;
    max-width: 500px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    position: relative;
    transform: scale(0.8);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(255,255,255,0.2);
  `;

  let imageHTML = '';
  if (activePopup.image) {
    imageHTML = `<div style="width:100%; height:200px; overflow:hidden">
      <img src="${activePopup.image}" style="width:100%; height:100%; object-fit:cover" alt="Promo" />
    </div>`;
  }

  card.innerHTML = `
    ${imageHTML}
    <button id="closeWebPopupBtn" style="
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(0,0,0,0.1);
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      z-index: 10;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">&times;</button>
    <div style="padding: 24px; text-align: center">
      <h3 style="font-family:var(--font-headings, 'Playfair Display', serif); font-size:1.5rem; font-weight:700; color:#2c1810; margin-bottom:12px">${activePopup.title}</h3>
      <div style="font-size:0.92rem; color:#5c4033; line-height:1.6; margin-bottom:20px">${activePopup.content}</div>
      <button id="closeWebPopupActionBtn" class="btn btn-primary" style="margin: 0 auto; min-width:140px; justify-content:center">Découvrir</button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Trigger animations
  setTimeout(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'scale(1)';
  }, 100);

  const closePopup = () => {
    localStorage.setItem('tm_popup_dismissed_' + activePopup.id, new Date().getTime());
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    setTimeout(() => {
      overlay.remove();
    }, 400);
  };

  document.getElementById('closeWebPopupBtn').addEventListener('click', closePopup);
  document.getElementById('closeWebPopupActionBtn').addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });
}

// ─── FAQ ACCORDION TOGGLE ───────────────────────────────────────────────────
function toggleFaqAccordion(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const icon = btn.querySelector('i');
  if (answer.style.maxHeight && answer.style.maxHeight !== '0px') {
    answer.style.maxHeight = '0px';
    icon.style.transform = 'rotate(0deg)';
  } else {
    // Close all other FAQs on the page first
    document.querySelectorAll('.faq-answer').forEach(el => el.style.maxHeight = '0px');
    document.querySelectorAll('.faq-item i').forEach(el => el.style.transform = 'rotate(0deg)');
    
    answer.style.maxHeight = answer.scrollHeight + 'px';
    icon.style.transform = 'rotate(180deg)';
  }
}
window.toggleFaqAccordion = toggleFaqAccordion;
window.initPopupSystem = initPopupSystem;

// ─── BLOG PAGE ────────────────────────────────────────────────────────────────
function initBlogPage() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const searchInput = document.getElementById('blogSearch');
  const categoriesList = document.getElementById('blogCategoriesWidget');
  const recentList = document.getElementById('blogRecentWidget');
  const countEl = document.getElementById('blogCount');

  let activeCategory = getParam('cat') || '';
  let searchQuery = getParam('q') || '';

  if (searchInput && searchQuery) {
    searchInput.value = searchQuery;
  }

  const posts = TM.get('news') || [];

  function render() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = posts.filter(item => {
      if (item.status !== 'Publish') return false;
      
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) || 
        (item.content && item.content.toLowerCase().includes(query));
      
      const matchesCategory = !activeCategory || 
        item.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} article${filtered.length === 1 ? '' : 's'} found`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:80px 0;color:var(--text-muted)">No articles found.</div>';
      return;
    }

    grid.innerHTML = filtered.map(item => {
      let link = `blog-detail.html?slug=${item.slug}`;
      if (window.location.protocol !== 'file:') {
        link = `/blog/${item.slug}`;
      }
      return `
        <article class="blog-card">
          <div class="blog-card-img-wrap">
            <a href="${link}">
              <img src="${item.image || 'images/blog-default.jpg'}" alt="${item.title}" class="blog-card-img" />
            </a>
            <span class="blog-card-tag">${item.category}</span>
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
              <span><i class="fa-regular fa-user"></i> By ${item.author || 'Admin'}</span>
            </div>
            <h3 class="blog-card-title"><a href="${link}">${item.title}</a></h3>
            <p class="blog-card-desc">${truncate(item.content || '', 120)}</p>
            <div class="blog-card-footer">
              <a href="${link}" class="blog-read-more">Read More <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => render());
  }

  // Render Sidebar Categories widget
  if (categoriesList) {
    const counts = {};
    posts.forEach(p => {
      if (p.status === 'Publish') {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });

    const categoriesHtml = Object.entries(counts).map(([cat, count]) => {
      const activeClass = activeCategory.toLowerCase() === cat.toLowerCase() ? 'active' : '';
      return `
        <li>
          <a href="#" class="widget-category-link ${activeClass}" data-category="${cat}">
            <span>${cat}</span>
            <span class="widget-category-count">${count}</span>
          </a>
        </li>
      `;
    }).join('');

    categoriesList.innerHTML = `
      <li>
        <a href="#" class="widget-category-link ${!activeCategory ? 'active' : ''}" data-category="">
          <span>All Categories</span>
          <span class="widget-category-count">${posts.filter(p => p.status === 'Publish').length}</span>
        </a>
      </li>
      ${categoriesHtml}
    `;

    categoriesList.querySelectorAll('.widget-category-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        categoriesList.querySelectorAll('.widget-category-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        activeCategory = link.getAttribute('data-category') || '';
        render();
      });
    });
  }

  // Render Sidebar Recent Posts widget
  if (recentList) {
    const recent = posts
      .filter(p => p.status === 'Publish')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    recentList.innerHTML = recent.map(item => {
      let link = `blog-detail.html?slug=${item.slug}`;
      if (window.location.protocol !== 'file:') {
        link = `/blog/${item.slug}`;
      }
      return `
        <a href="${link}" class="recent-post-item">
          <div class="recent-post-img-wrap">
            <img src="${item.image || 'images/blog-default.jpg'}" alt="${item.title}" class="recent-post-img" />
          </div>
          <div class="recent-post-info">
            <h4 class="recent-post-title">${item.title}</h4>
            <span class="recent-post-date">${item.date}</span>
          </div>
        </a>
      `;
    }).join('');
  }

  render();
}

// ─── BLOG DETAIL PAGE ─────────────────────────────────────────────────────────
function initBlogDetailPage() {
  const container = document.getElementById('blogDetailContent');
  if (!container) return;

  let post = null;
  const slugParam = getParam('slug');
  const idParam = getParam('id');

  if (slugParam) {
    post = TM.getBySlug('news', slugParam);
  } else if (idParam) {
    post = TM.getItem('news', idParam);
  } else {
    const path = window.location.pathname;
    const match = path.match(/\/blog\/([^/]+)/);
    if (match && match[1]) {
      const slug = match[1];
      if (slug !== 'index.html' && slug !== 'blog.html' && slug !== 'blog-detail.html') {
        post = TM.getBySlug('news', slug);
      }
    }
  }

  if (!post) {
    container.innerHTML = '<div style="text-align:center;padding:80px 0;color:var(--text-muted)">Article not found.</div>';
    return;
  }

  document.title = `${post.title} | Blog | TourVoyage Morocco`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', truncate(post.content || '', 150));
  }

  container.innerHTML = `
    <div class="blog-detail-content">
      <h1 class="page-hero-title" style="font-family: 'Playfair Display', serif; font-size: 2.2rem; color: var(--coffee-dark); margin-bottom: 15px;">${post.title}</h1>
      <div class="blog-detail-meta">
        <span><i class="fa-regular fa-calendar"></i> Published: ${post.date}</span>
        <span><i class="fa-regular fa-user"></i> Written by: ${post.author || 'Admin'}</span>
        <span><i class="fa-regular fa-folder"></i> Category: ${post.category}</span>
      </div>
      <img src="${post.image || 'images/blog-default.jpg'}" alt="${post.title}" class="blog-detail-featured-img" />
      <div class="blog-detail-body">
        ${post.content ? (post.content.includes('<p>') ? post.content : post.content.split('\n').map(p => `<p>${p}</p>`).join('')) : ''}
      </div>
      ${post.tags ? `
        <div class="blog-detail-tags">
          <span class="blog-detail-tags-label">Tags:</span>
          ${post.tags.split(',').map(tag => `<a href="blog.html?q=${tag.trim()}" class="blog-tag">${tag.trim()}</a>`).join('')}
        </div>
      ` : ''}
    </div>

    <div class="blog-comments-area" style="margin-top: 40px;">
      <h3 class="comments-title">Leave a Comment</h3>
      <form class="comment-form" onsubmit="event.preventDefault(); showToast('Comment submitted for moderation!', 'success'); this.reset();">
        <div class="comment-form-grid">
          <input type="text" placeholder="Your Name" class="comment-form-input" required />
          <input type="email" placeholder="Your Email" class="comment-form-input" required />
        </div>
        <textarea placeholder="Write your comment here..." class="comment-form-textarea" rows="5" required></textarea>
        <button type="submit" class="comment-submit-btn">Submit Comment</button>
      </form>
    </div>
  `;

  const recentList = document.getElementById('blogRecentWidget');
  if (recentList) {
    const posts = TM.get('news') || [];
    const recent = posts
      .filter(p => p.status === 'Publish' && p.id !== post.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    recentList.innerHTML = recent.map(item => {
      let link = `blog-detail.html?slug=${item.slug}`;
      if (window.location.protocol !== 'file:') {
        link = `/blog/${item.slug}`;
      }
      return `
        <a href="${link}" class="recent-post-item">
          <div class="recent-post-img-wrap">
            <img src="${item.image || 'images/blog-default.jpg'}" alt="${item.title}" class="recent-post-img" />
          </div>
          <div class="recent-post-info">
            <h4 class="recent-post-title">${item.title}</h4>
            <span class="recent-post-date">${item.date}</span>
          </div>
        </a>
      `;
    }).join('');
  }

  const categoriesList = document.getElementById('blogCategoriesWidget');
  if (categoriesList) {
    const posts = TM.get('news') || [];
    const counts = {};
    posts.forEach(p => {
      if (p.status === 'Publish') {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });

    const categoriesHtml = Object.entries(counts).map(([cat, count]) => {
      return `
        <li>
          <a href="blog.html?cat=${encodeURIComponent(cat)}" class="widget-category-link">
            <span>${cat}</span>
            <span class="widget-category-count">${count}</span>
          </a>
        </li>
      `;
    }).join('');

    categoriesList.innerHTML = `
      <li>
        <a href="blog.html" class="widget-category-link">
          <span>All Categories</span>
          <span class="widget-category-count">${posts.filter(p => p.status === 'Publish').length}</span>
        </a>
      </li>
      ${categoriesHtml}
    `;
  }
}

window.initBlogPage = initBlogPage;
window.initBlogDetailPage = initBlogDetailPage;
