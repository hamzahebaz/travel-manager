/**
 * TM Tour Manager Dashboard – Full Logic (dashboard.js)
 * Manages all CRUD, SEO tools, charts, settings, and UI
 */

// ─── State ────────────────────────────────────────────────────────────────────
let resPage = 1;
const RES_PER_PAGE = 8;
let currentSEOPage = 'home';
let charts = {};
let notifs = [];
let activeLayoutOrder = [];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  initSidebar();
  initDropdowns();
  initNavigation();
  loadDashboard();
  loadNotifications();
  updateResBadge();

  // Listen for data changes from website
  window.addEventListener('tm_data_change', () => {
    updateResBadge();
    if (document.getElementById('page-dashboard').classList.contains('page') && !document.getElementById('page-dashboard').classList.contains('hidden')) {
      loadDashboard();
    }
  });

  // Featured image input listener
  document.getElementById('tImage')?.addEventListener('input', (e) => {
    const preview = document.getElementById('tFeaturedImagePreview');
    if (preview) {
      if (e.target.value) {
        preview.src = e.target.value;
        preview.classList.add('visible');
      } else {
        preview.src = '';
        preview.classList.remove('visible');
      }
    }
  });

  // Settings logo and favicon input listeners
  document.getElementById('setLogo')?.addEventListener('input', (e) => {
    const preview = document.getElementById('setLogoPreview');
    if (preview) {
      if (e.target.value) {
        preview.src = e.target.value;
        preview.classList.add('visible');
      } else {
        preview.src = '';
        preview.classList.remove('visible');
      }
    }
  });
  document.getElementById('setFavicon')?.addEventListener('input', (e) => {
    const preview = document.getElementById('setFaviconPreview');
    if (preview) {
      if (e.target.value) {
        preview.src = e.target.value;
        preview.classList.add('visible');
      } else {
        preview.src = '';
        preview.classList.remove('visible');
      }
    }
  });
});

function setCurrentDate() {
  const el = document.getElementById('currentDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function initSidebar() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.getElementById('mainWrapper');

  btn?.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) sidebar.classList.toggle('mobile-open');
    else { sidebar.classList.toggle('collapsed'); wrapper.classList.toggle('expanded'); }
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !btn?.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

// ─── Dropdowns ───────────────────────────────────────────────────────────────
function initDropdowns() {
  const pairs = [
    ['notifDropBtn', 'notifMenu'],
    ['profileDropBtn', 'profileMenu'],
  ];
  pairs.forEach(([btnId, menuId]) => {
    document.getElementById(btnId)?.addEventListener('click', (e) => {
      e.stopPropagation();
      pairs.forEach(([, m]) => { if (m !== menuId) document.getElementById(m)?.classList.remove('open'); });
      document.getElementById(menuId)?.classList.toggle('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => closeModal(m.id));
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.getAttribute('data-page'));
    });
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(`page-${page}`);
  if (!target) return;
  target.classList.remove('hidden');

  document.querySelectorAll('.nav-item.active').forEach(i => i.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

  const labels = {
    dashboard:'Dashboard', tours:'Tours', hotels:'Hotels', destinations:'Destinations',
    reservations:'Reservations', coupons:'Coupons', payments:'Payments', reviews:'Reviews',
    media:'Media Library', menu:'Menu Editor', 'seo-pages':'Page SEO', 'seo-sitemap':'Sitemap',
    'seo-robots':'Robots.txt', 'seo-redirects':'Redirects', users:'Users', reports:'Reports', settings:'Settings',
    subscribers:'Email Submitters', cars: 'Car Rental', themes: 'Tous les thèmes',
  };
  document.getElementById('breadcrumbLabel').textContent = labels[page] || page;

  // Page-specific loaders
  const loaders = {
    dashboard: loadDashboard,
    tours: renderTours,
    hotels: renderHotels,
    destinations: renderDestinations,
    cars: renderCars,
    reservations: renderReservations,
    coupons: renderCoupons,
    payments: renderPayments,
    reviews: renderReviews,
    media: renderMedia,
    menu: renderMenu,
    subscribers: renderSubscribers,
    themes: renderThemes,
    'seo-pages': () => loadSEOPage(currentSEOPage),
    'seo-sitemap': generateSitemapPreview,
    'seo-robots': loadRobots,
    'seo-redirects': renderRedirects,
    users: renderUsers,
    reports: loadReports,
    settings: loadSettings,
  };
  if (loaders[page]) setTimeout(loaders[page], 50);
  document.getElementById('pageContent').scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('sidebar')?.classList.remove('mobile-open');
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function loadDashboard() {
  const stats = TM.getStats();
  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';

  // Update names
  const adminName = TM.get('users').find(u => u.role === 'Administrator')?.name || 'Admin';
  ['welcomeName','sfName','profileName','pmName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = adminName.split(' ')[0];
  });
  const pmEmail = document.getElementById('pmEmail');
  if (pmEmail) pmEmail.textContent = TM.get('users').find(u => u.role === 'Administrator')?.email || '';

  // Stats cards
  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid) {
    statsGrid.innerHTML = [
      { label:'REVENUE', value:`${sym}${stats.revenue.toLocaleString()}`, sub:'Total revenue', icon:'fa-cart-shopping', cls:'purple', trend:'+12.5%' },
      { label:'PAID', value:`${sym}${stats.earnings.toLocaleString()}`, sub:'Total collected', icon:'fa-money-bill-wave', cls:'pink', trend:'+8.2%' },
      { label:'RESERVATIONS', value:stats.reservations, sub:'Total bookings', icon:'fa-calendar-check', cls:'teal', trend:'+5 this week' },
      { label:'SERVICES', value:stats.services, sub:'Tours + Hotels', icon:'fa-bolt', cls:'green', trend:'No change' },
    ].map(s => `
      <div class="stat-card ${s.cls}">
        <div class="stat-card-body">
          <div class="stat-info"><p class="stat-label">${s.label}</p><h2 class="stat-value">${s.value}</h2><p class="stat-sub">${s.sub}</p></div>
          <div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div>
        </div>
        <div class="stat-trend positive"><i class="fa-solid fa-arrow-trend-up"></i><span>${s.trend}</span></div>
      </div>`).join('');
  }

  // Recent reservations
  renderRecentRes();

  // Mini stats
  const mini = document.getElementById('miniStatsRow');
  if (mini) {
    mini.innerHTML = [
      { val:stats.destinations, label:'Destinations', icon:'fa-map-location-dot', cls:'purple-bg' },
      { val:stats.hotels, label:'Hotels', icon:'fa-hotel', cls:'blue-bg' },
      { val:TM.get('tours').filter(t=>t.category==='circuit').length, label:'Circuits', icon:'fa-route', cls:'teal-bg' },
      { val:TM.get('coupons').filter(c=>c.active).length, label:'Active Coupons', icon:'fa-ticket', cls:'orange-bg' },
      { val:TM.get('reviews').filter(r=>r.approved).length, label:'Reviews', icon:'fa-star', cls:'green-bg' },
      { val:TM.get('users').length, label:'Users', icon:'fa-users', cls:'pink-bg' },
    ].map(m => `
      <div class="card mini-stat-card">
        <div class="mini-stat-icon ${m.cls}"><i class="fa-solid ${m.icon}"></i></div>
        <div class="mini-stat-info"><span class="mini-stat-val">${m.val}</span><span class="mini-stat-label">${m.label}</span></div>
      </div>`).join('');
  }

  // Top tours
  const res = TM.get('reservations');
  const tourCount = {};
  res.forEach(r => { if (r.tourId) tourCount[r.tourId] = (tourCount[r.tourId] || 0) + 1; });
  const tours = TM.get('tours');
  const top5 = Object.entries(tourCount).sort((a,b) => b[1]-a[1]).slice(0,5);
  const maxC = top5[0] ? top5[0][1] : 1;
  const topList = document.getElementById('topToursList');
  if (topList) {
    topList.innerHTML = top5.map(([id, count], i) => {
      const t = tours.find(t => t.id == id);
      const pct = Math.round((count / maxC) * 100);
      return `<div class="destination-item">
        <div class="dest-rank">${i+1}</div>
        <div class="dest-info">
          <span class="dest-name">${t?.title.substring(0,30) || 'Unknown'}...</span>
          <div class="dest-bar-wrap"><div class="dest-bar" style="width:${pct}%"></div></div>
        </div>
        <span class="dest-count">${count} bk</span>
      </div>`;
    }).join('') || '<p style="padding:16px;color:var(--text-muted);font-size:0.85rem">No booking data yet</p>';
  }

  // Activity
  const actList = document.getElementById('activityList');
  if (actList) {
    const recentRes = [...res].slice(0, 6);
    const colors = ['green','blue','yellow','purple','orange','red'];
    actList.innerHTML = recentRes.map((r, i) => `
      <div class="activity-item">
        <div class="activity-dot ${colors[i % colors.length]}"></div>
        <div class="activity-content">
          <p><strong>Reservation #${r.id}</strong> – ${r.customer}</p>
          <span>${r.createdAt || 'Recently'}</span>
        </div>
      </div>`).join('');
  }

  // Donut chart
  const statusCounts = {};
  res.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  const donutTotal = document.getElementById('donutTotal');
  if (donutTotal) donutTotal.textContent = res.length;
  const donutLegend = document.getElementById('donutLegend');
  const statusColors = { 'In Progress':'#6c63ff', 'Confirmed':'#10b981', 'Pending':'#f59e0b', 'Cancelled':'#ef4444' };
  if (donutLegend) {
    donutLegend.innerHTML = Object.entries(statusCounts).map(([s,c]) => `
      <div class="donut-legend-item"><span class="dl-dot" style="background:${statusColors[s]||'#94a3b8'}"></span> ${s} <strong>${c}</strong></div>
    `).join('');
  }

  // Charts
  setTimeout(() => {
    initRevenueChart();
    initStatusDonut(statusCounts);
  }, 100);
}

function renderRecentRes() {
  const tbody = document.getElementById('recentResTbody');
  if (!tbody) return;
  const settings = TM.get('settings');
  const sym = settings.currencySymbol || '€';
  const res = TM.get('reservations').slice(0, 6);
  tbody.innerHTML = res.map(r => `
    <tr>
      <td style="font-weight:700;color:var(--text-primary)">#${r.id}</td>
      <td><span style="color:var(--blue);max-width:160px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.tourName || r.carName || '–'}">${r.tourName || r.carName || '–'}</span></td>
      <td>${r.customer}</td>
      <td>${sym}${(r.total||0).toLocaleString()}</td>
      <td><span class="status-badge ${statusCls(r.status)}">${r.status}</span></td>
    </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;padding:15px;color:var(--text-muted)">No recent reservations</td></tr>';
}

function updateResBadge() {
  const badge = document.getElementById('resBadge');
  if (badge) badge.textContent = TM.get('reservations').length;
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (charts.revenue) { charts.revenue.destroy(); }

  const res = TM.get('reservations');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const revenue = [4200, 5800, 3900, 7100, 8200, 9400, 6800];
  const paid    = [1200, 2100, 1400, 2800, 3100, 3900, 2500];

  charts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        { label:'Revenue', data: revenue, borderColor:'#6c63ff', backgroundColor:'rgba(108,99,255,0.08)', borderWidth:2.5, pointBackgroundColor:'#6c63ff', pointRadius:4, tension:0.4, fill:true },
        { label:'Collected', data: paid, borderColor:'#ec4899', backgroundColor:'rgba(236,72,153,0.06)', borderWidth:2.5, pointBackgroundColor:'#ec4899', pointRadius:4, tension:0.4, fill:true },
      ],
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'#1e2334', borderColor:'rgba(255,255,255,0.1)', borderWidth:1, titleColor:'#f1f5f9', bodyColor:'#94a3b8', padding:12 } },
      scales:{
        x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#64748b', font:{ size:11 } }, border:{ color:'rgba(255,255,255,0.07)' } },
        y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#64748b', font:{ size:11 } }, border:{ color:'rgba(255,255,255,0.07)' } },
      },
    },
  });
}

function initStatusDonut(statusCounts) {
  const ctx = document.getElementById('statusDonut');
  if (!ctx) return;
  if (charts.donut) { charts.donut.destroy(); }
  const labels = Object.keys(statusCounts);
  const data   = Object.values(statusCounts);
  const colors = { 'In Progress':'#6c63ff','Confirmed':'#10b981','Pending':'#f59e0b','Cancelled':'#ef4444' };
  charts.donut = new Chart(ctx, {
    type:'doughnut',
    data:{ labels, datasets:[{ data, backgroundColor:labels.map(l=>colors[l]||'#94a3b8'), borderColor:'#181c27', borderWidth:3, hoverBorderWidth:4 }] },
    options:{ responsive:true, maintainAspectRatio:true, cutout:'72%', plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'#1e2334', titleColor:'#f1f5f9', bodyColor:'#94a3b8', padding:10 } } },
  });
}

function loadReports() {
  setTimeout(() => {
    const mCtx = document.getElementById('monthlyChart');
    if (mCtx && !charts.monthly) {
      charts.monthly = new Chart(mCtx, {
        type:'bar',
        data:{ labels:['Jan','Feb','Mar','Apr','May','Jun'], datasets:[
          { label:'Revenue (€)', data:[4200,5100,6800,7200,9100,12400], backgroundColor:'rgba(108,99,255,0.7)', borderRadius:6 },
          { label:'Collected (€)', data:[800,950,1100,1400,1700,2300], backgroundColor:'rgba(236,72,153,0.7)', borderRadius:6 },
        ]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#94a3b8', font:{ size:12 } } }, tooltip:{ backgroundColor:'#1e2334', titleColor:'#f1f5f9', bodyColor:'#94a3b8', padding:10 } },
          scales:{ x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#64748b' }, border:{ color:'rgba(255,255,255,0.07)' } }, y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#64748b' }, border:{ color:'rgba(255,255,255,0.07)' } } } },
      });
    }
    const sCtx = document.getElementById('serviceChart');
    if (sCtx && !charts.service) {
      charts.service = new Chart(sCtx, {
        type:'polarArea',
        data:{ labels:['Circuits','Hotels','Excursions','City Tours','Transfers'], datasets:[{ data:[41,63,28,22,10], backgroundColor:['rgba(108,99,255,0.7)','rgba(20,184,166,0.7)','rgba(245,158,11,0.7)','rgba(236,72,153,0.7)','rgba(59,130,246,0.7)'], borderColor:'#181c27', borderWidth:2 }] },
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#94a3b8', font:{ size:12 } } }, tooltip:{ backgroundColor:'#1e2334', titleColor:'#f1f5f9', bodyColor:'#94a3b8', padding:10 } }, scales:{ r:{ grid:{ color:'rgba(255,255,255,0.06)' }, ticks:{ display:false } } } },
      });
    }
  }, 100);
}

// ─── TOURS CRUD ───────────────────────────────────────────────────────────────
function renderTours() {
  const tbody = document.getElementById('toursTbody');
  if (!tbody) return;
  const q = document.getElementById('searchTours')?.value.toLowerCase() || '';
  const cat = document.getElementById('tourCatFilter')?.value || '';
  const status = document.getElementById('tourStatusFilter')?.value || '';
  const sym = TM.get('settings').currencySymbol || '€';

  let tours = TM.get('tours').filter(t => {
    return (!q || t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q))
      && (!cat || t.category === cat)
      && (!status || (status === 'active' ? t.active : !t.active));
  });

  tbody.innerHTML = tours.map(t => `
    <tr>
      <td style="font-weight:700;color:var(--text-primary)">${t.id}</td>
      <td><span style="max-width:200px;display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${t.title}">${t.title}</span></td>
      <td><span style="color:var(--teal)"><i class="fa-solid fa-location-dot"></i> ${t.destination}</span></td>
      <td>${t.duration}</td>
      <td>${sym}${t.price}${t.discount ? `<br><small style="color:var(--green)">-${t.discount}%</small>` : ''}</td>
      <td><span class="star-display">★</span> ${t.rating} <small style="color:var(--text-muted)">(${t.reviews})</small></td>
      <td><span class="status-badge ${t.active ? 'confirmed' : 'cancelled'}">${t.active ? 'Active' : 'Inactive'}</span></td>
      <td>${t.featured ? '<span class="status-badge in-progress">⭐ Yes</span>' : '<span style="color:var(--text-muted)">No</span>'}</td>
      <td><div class="action-btns">
        <a href="${t.slug ? `tours/${t.slug}` : `website/tour-detail.html?id=${t.id}`}" target="_blank" class="act-btn" title="View on Site"><i class="fa-solid fa-eye"></i></a>
        <button class="act-btn" title="Edit" onclick="editTour(${t.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="act-btn" title="Toggle Active" onclick="toggleTourActive(${t.id})"><i class="fa-solid fa-toggle-on"></i></button>
        <button class="act-btn delete" title="Delete" onclick="deleteTour(${t.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted)">No tours found</td></tr>';
}

let tempTourGallery = [];

function uploadTourFeaturedImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;
      document.getElementById('tImage').value = base64;
      const preview = document.getElementById('tFeaturedImagePreview');
      if (preview) {
        preview.src = base64;
        preview.classList.add('visible');
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function uploadTourGalleryImages(input) {
  if (input.files && input.files.length) {
    const promises = Array.from(input.files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(images => {
      tempTourGallery = tempTourGallery.concat(images);
      renderTourGalleryPreviews();
    });
  }
}

function renderTourGalleryPreviews() {
  const grid = document.getElementById('tGalleryPreviewGrid');
  if (!grid) return;
  grid.innerHTML = tempTourGallery.map((img, idx) => `
    <div style="position:relative;display:inline-block">
      <img src="${img}" class="gallery-upload-thumb" />
      <button type="button" onclick="removeTourGalleryImage(${idx})" style="position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Remove image">&times;</button>
    </div>
  `).join('');
}

function removeTourGalleryImage(idx) {
  tempTourGallery.splice(idx, 1);
  renderTourGalleryPreviews();
}

function clearTourGallery() {
  tempTourGallery = [];
  renderTourGalleryPreviews();
}

function openAddTourModal() {
  document.getElementById('tourModalTitle').textContent = 'Add New Tour';
  document.getElementById('editTourId').value = '';
  ['tTitle','tDest','tDuration','tImage','tDesc','tItinerary','tIncluded','tExcluded','tSeoTitle','tSeoDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('tPrice').value = '';
  document.getElementById('tDiscount').value = '0';
  document.getElementById('tMaxPeople').value = '12';
  document.getElementById('tCategory').value = 'circuit';
  document.getElementById('tSeoRobots').value = 'index, follow';
  document.getElementById('tFeatured').checked = false;
  document.getElementById('tActive').checked = true;
  
  // Clear image uploads
  tempTourGallery = [];
  renderTourGalleryPreviews();
  const fPreview = document.getElementById('tFeaturedImagePreview');
  if (fPreview) {
    fPreview.src = '';
    fPreview.classList.remove('visible');
  }
  
  openModal('addTourModal');
}

function editTour(id) {
  const t = TM.getItem('tours', id);
  if (!t) return;
  document.getElementById('tourModalTitle').textContent = 'Edit Tour';
  document.getElementById('editTourId').value = id;
  document.getElementById('tTitle').value = t.title || '';
  document.getElementById('tDest').value = t.destination || '';
  document.getElementById('tDuration').value = t.duration || '';
  document.getElementById('tPrice').value = t.price || '';
  document.getElementById('tDiscount').value = t.discount || 0;
  document.getElementById('tMaxPeople').value = t.maxPeople || 12;
  document.getElementById('tCategory').value = t.category || 'circuit';
  document.getElementById('tImage').value = t.image || '';
  document.getElementById('tDesc').value = t.description || '';
  document.getElementById('tItinerary').value = (t.itinerary || []).join('\n');
  document.getElementById('tIncluded').value = (t.included || []).join('\n');
  document.getElementById('tExcluded').value = (t.excluded || []).join('\n');
  
  // Populate SEO
  document.getElementById('tSeoTitle').value = t.seoTitle || '';
  document.getElementById('tSeoDesc').value = t.seoDesc || '';
  document.getElementById('tSeoRobots').value = t.seoRobots || 'index, follow';

  document.getElementById('tFeatured').checked = t.featured || false;
  document.getElementById('tActive').checked = t.active !== false;
  
  // Populate image previews
  tempTourGallery = t.gallery || [];
  renderTourGalleryPreviews();
  const fPreview = document.getElementById('tFeaturedImagePreview');
  if (fPreview) {
    if (t.image) {
      fPreview.src = t.image;
      fPreview.classList.add('visible');
    } else {
      fPreview.src = '';
      fPreview.classList.remove('visible');
    }
  }
  
  openModal('addTourModal');
}

function saveTour() {
  const id = document.getElementById('editTourId').value;
  const title = document.getElementById('tTitle').value.trim();
  if (!title) { showToast('Tour title is required', 'error'); return; }

  let rating = 4.8;
  let reviews = 0;
  if (id) {
    const existing = TM.getItem('tours', id);
    if (existing) {
      rating = existing.rating || 4.8;
      reviews = existing.reviews || 0;
    }
  }

  const data = {
    title,
    destination: document.getElementById('tDest').value.trim(),
    duration: document.getElementById('tDuration').value.trim(),
    price: parseFloat(document.getElementById('tPrice').value) || 0,
    discount: parseInt(document.getElementById('tDiscount').value) || 0,
    maxPeople: parseInt(document.getElementById('tMaxPeople').value) || 12,
    category: document.getElementById('tCategory').value,
    image: document.getElementById('tImage').value.trim(),
    description: document.getElementById('tDesc').value.trim(),
    itinerary: document.getElementById('tItinerary').value.split('\n').filter(s=>s.trim()),
    included: document.getElementById('tIncluded').value.split('\n').filter(s=>s.trim()),
    excluded: document.getElementById('tExcluded').value.split('\n').filter(s=>s.trim()),
    seoTitle: document.getElementById('tSeoTitle').value.trim(),
    seoDesc: document.getElementById('tSeoDesc').value.trim(),
    seoRobots: document.getElementById('tSeoRobots').value,
    featured: document.getElementById('tFeatured').checked,
    active: document.getElementById('tActive').checked,
    rating: rating,
    reviews: reviews,
    gallery: tempTourGallery,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  };

  if (id) {
    TM.updateItem('tours', id, data);
    showToast('Tour updated successfully!', 'success');
  } else {
    TM.addItem('tours', data);
    showToast('Tour added! Now visible on website.', 'success');
  }
  closeModal('addTourModal');
  renderTours();
}

function toggleTourActive(id) {
  const t = TM.getItem('tours', id);
  if (!t) return;
  TM.updateItem('tours', id, { active: !t.active });
  renderTours();
  showToast(`Tour ${!t.active ? 'activated' : 'deactivated'}`, 'success');
}

function deleteTour(id) {
  confirm2(`Delete this tour? This cannot be undone.`, () => {
    TM.deleteItem('tours', id);
    renderTours();
    showToast('Tour deleted', 'error');
  });
}

// ─── HOTELS CRUD ──────────────────────────────────────────────────────────────
function renderHotels() {
  const tbody = document.getElementById('hotelsTbody');
  if (!tbody) return;
  const sym = TM.get('settings').currencySymbol || '€';
  tbody.innerHTML = TM.get('hotels').map(h => `
    <tr>
      <td>${h.id}</td>
      <td style="font-weight:600;color:var(--text-primary)">${h.name}</td>
      <td><span style="color:var(--teal)">${h.destination}</span></td>
      <td><span style="color:var(--gold)">${'★'.repeat(h.stars)}</span></td>
      <td>${sym}${h.price}/night</td>
      <td>${h.rooms || 0}</td>
      <td>${h.featured ? '<span class="status-badge in-progress">⭐ Yes</span>' : 'No'}</td>
      <td><span class="status-badge ${h.active ? 'confirmed' : 'cancelled'}">${h.active ? 'Active' : 'Inactive'}</span></td>
      <td><div class="action-btns">
        <button class="act-btn" onclick="editHotel(${h.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="act-btn delete" onclick="deleteHotel(${h.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted)">No hotels yet</td></tr>';
}

function editHotel(id) {
  const h = TM.getItem('hotels', id);
  if (!h) return;
  document.getElementById('hotelModalTitle').textContent = 'Edit Hotel';
  document.getElementById('editHotelId').value = id;
  document.getElementById('hName').value = h.name || '';
  document.getElementById('hDest').value = h.destination || '';
  document.getElementById('hStars').value = h.stars || 5;
  document.getElementById('hPrice').value = h.price || '';
  document.getElementById('hRooms').value = h.rooms || 10;
  document.getElementById('hImage').value = h.image || '';
  document.getElementById('hDesc').value = h.description || '';
  document.getElementById('hAmenities').value = (h.amenities || []).join(', ');
  document.getElementById('hFeatured').checked = h.featured || false;
  document.getElementById('hActive').checked = h.active !== false;
  openModal('addHotelModal');
}

function saveHotel() {
  const id = document.getElementById('editHotelId').value;
  const name = document.getElementById('hName').value.trim();
  if (!name) { showToast('Hotel name required', 'error'); return; }
  const data = {
    name, destination: document.getElementById('hDest').value.trim(),
    stars: parseInt(document.getElementById('hStars').value),
    price: parseFloat(document.getElementById('hPrice').value) || 0,
    rooms: parseInt(document.getElementById('hRooms').value) || 10,
    image: document.getElementById('hImage').value.trim(),
    description: document.getElementById('hDesc').value.trim(),
    amenities: document.getElementById('hAmenities').value.split(',').map(s=>s.trim()).filter(Boolean),
    featured: document.getElementById('hFeatured').checked,
    active: document.getElementById('hActive').checked,
  };
  if (id) { TM.updateItem('hotels', id, data); showToast('Hotel updated!', 'success'); }
  else { TM.addItem('hotels', data); showToast('Hotel added!', 'success'); }
  closeModal('addHotelModal');
  renderHotels();
}

function deleteHotel(id) {
  confirm2('Delete this hotel?', () => { TM.deleteItem('hotels', id); renderHotels(); showToast('Hotel deleted', 'error'); });
}

// ─── DESTINATIONS CRUD ────────────────────────────────────────────────────────
function renderDestinations() {
  const tbody = document.getElementById('destsTbody');
  if (!tbody) return;
  tbody.innerHTML = TM.get('destinations').map(d => `
    <tr>
      <td>${d.id}</td>
      <td style="font-weight:600;color:var(--text-primary)">${d.name}</td>
      <td>${d.country}</td>
      <td>${d.tours}</td>
      <td>${d.featured ? '<span class="status-badge in-progress">⭐ Yes</span>' : 'No'}</td>
      <td><span class="status-badge ${d.active ? 'confirmed' : 'cancelled'}">${d.active ? 'Active' : 'Inactive'}</span></td>
      <td><div class="action-btns">
        <button class="act-btn" onclick="editDest(${d.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="act-btn delete" onclick="deleteDest(${d.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function editDest(id) {
  const d = TM.getItem('destinations', id);
  if (!d) return;
  document.getElementById('editDestId').value = id;
  document.getElementById('dName').value = d.name || '';
  document.getElementById('dCountry').value = d.country || 'Morocco';
  document.getElementById('dImage').value = d.image || '';
  document.getElementById('dDesc').value = d.description || '';
  document.getElementById('dTours').value = d.tours || 0;
  document.getElementById('dFeatured').checked = d.featured || false;
  openModal('addDestModal');
}

function saveDestination() {
  const id = document.getElementById('editDestId').value;
  const name = document.getElementById('dName').value.trim();
  if (!name) { showToast('Name required', 'error'); return; }
  const data = {
    name, country: document.getElementById('dCountry').value.trim(),
    image: document.getElementById('dImage').value.trim(),
    description: document.getElementById('dDesc').value.trim(),
    tours: parseInt(document.getElementById('dTours').value) || 0,
    featured: document.getElementById('dFeatured').checked,
    active: true,
  };
  if (id) { TM.updateItem('destinations', id, data); showToast('Destination updated!', 'success'); }
  else { TM.addItem('destinations', data); showToast('Destination added!', 'success'); }
  closeModal('addDestModal');
  renderDestinations();
}

function deleteDest(id) {
  confirm2('Delete this destination?', () => { TM.deleteItem('destinations', id); renderDestinations(); showToast('Deleted', 'error'); });
}

// ─── CAR FLEET CRUD ───────────────────────────────────────────────────────────
function renderCars() {
  const tbody = document.getElementById('carsTbody');
  if (!tbody) return;
  const sym = TM.get('settings').currencySymbol || '€';
  const cars = TM.get('cars') || [];

  tbody.innerHTML = cars.map(c => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <img src="${c.image}" style="width:50px;height:35px;border-radius:4px;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=80&q=80'" />
        <span style="font-weight:600;color:var(--text-primary)">${c.name}</span>
      </div></td>
      <td>${c.type}</td>
      <td><span class="role-badge role-agent">${c.transmission}</span></td>
      <td><span class="role-badge role-manager">${c.fuel}</span></td>
      <td style="font-size:0.8rem">${c.doors} Doors, ${c.seats} Seats</td>
      <td style="font-weight:600">${sym}${c.pricePerDay}</td>
      <td>${c.featured ? '<span class="status-badge in-progress">⭐ Yes</span>' : '<span style="color:var(--text-muted)">No</span>'}</td>
      <td><span class="status-badge ${c.active ? 'confirmed' : 'cancelled'}">${c.active ? 'Active' : 'Inactive'}</span></td>
      <td><div class="action-btns">
        <button class="act-btn" title="Edit" onclick="editCar(${c.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="act-btn" title="Toggle Active" onclick="toggleCarActive(${c.id})"><i class="fa-solid fa-toggle-on"></i></button>
        <button class="act-btn delete" title="Delete" onclick="deleteCar(${c.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>
  `).join('') || '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted)">No vehicles found</td></tr>';
}

function openAddCarModal() {
  document.getElementById('editCarId').value = '';
  document.getElementById('carModalTitle').textContent = 'Add Vehicle';
  document.getElementById('cName').value = '';
  document.getElementById('cType').value = 'SUV';
  document.getElementById('cTransmission').value = 'Manual';
  document.getElementById('cFuel').value = 'Diesel';
  document.getElementById('cPricePerDay').value = '';
  document.getElementById('cDoors').value = '4';
  document.getElementById('cSeats').value = '5';
  document.getElementById('cImage').value = '';
  document.getElementById('cDescription').value = '';
  document.getElementById('cFeatured').checked = false;
  document.getElementById('cActive').checked = true;

  const preview = document.getElementById('carImagePreview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }

  openModal('addCarModal');
}

function saveCar() {
  const id = document.getElementById('editCarId').value;
  const name = document.getElementById('cName').value.trim();
  const pricePerDay = parseFloat(document.getElementById('cPricePerDay').value);
  const description = document.getElementById('cDescription').value.trim();

  if (!name || isNaN(pricePerDay) || !description) {
    showToast('Name, price per day and description are required', 'error');
    return;
  }

  const data = {
    name,
    type: document.getElementById('cType').value,
    transmission: document.getElementById('cTransmission').value,
    fuel: document.getElementById('cFuel').value,
    pricePerDay,
    doors: parseInt(document.getElementById('cDoors').value) || 4,
    seats: parseInt(document.getElementById('cSeats').value) || 5,
    image: document.getElementById('cImage').value.trim() || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    description,
    featured: document.getElementById('cFeatured').checked,
    active: document.getElementById('cActive').checked
  };

  if (id) {
    TM.updateItem('cars', id, data);
    showToast('Vehicle updated successfully!', 'success');
  } else {
    TM.addItem('cars', data);
    showToast('Vehicle added successfully!', 'success');
  }

  closeModal('addCarModal');
  renderCars();
}

function editCar(id) {
  const c = TM.getItem('cars', id);
  if (!c) return;

  document.getElementById('editCarId').value = c.id;
  document.getElementById('carModalTitle').textContent = 'Edit Vehicle';
  document.getElementById('cName').value = c.name || '';
  document.getElementById('cType').value = c.type || 'SUV';
  document.getElementById('cTransmission').value = c.transmission || 'Manual';
  document.getElementById('cFuel').value = c.fuel || 'Diesel';
  document.getElementById('cPricePerDay').value = c.pricePerDay || '';
  document.getElementById('cDoors').value = c.doors || '4';
  document.getElementById('cSeats').value = c.seats || '5';
  document.getElementById('cImage').value = c.image || '';
  document.getElementById('cDescription').value = c.description || '';
  document.getElementById('cFeatured').checked = c.featured || false;
  document.getElementById('cActive').checked = c.active !== false;

  const preview = document.getElementById('carImagePreview');
  if (preview && c.image) {
    preview.src = c.image;
    preview.style.display = 'block';
  } else if (preview) {
    preview.style.display = 'none';
  }

  openModal('addCarModal');
}

function toggleCarActive(id) {
  const c = TM.getItem('cars', id);
  if (!c) return;
  TM.updateItem('cars', id, { active: c.active === false ? true : false });
  renderCars();
  showToast('Vehicle status updated', 'success');
}

function deleteCar(id) {
  confirm2('Are you sure you want to delete this vehicle from the fleet?', () => {
    TM.deleteItem('cars', id);
    renderCars();
    showToast('Vehicle deleted', 'error');
  });
}

function uploadCarImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;
      document.getElementById('cImage').value = base64;
      const preview = document.getElementById('carImagePreview');
      if (preview) {
        preview.src = base64;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ─── RESERVATIONS CRUD ────────────────────────────────────────────────────────
function renderReservations() {
  const tbody = document.getElementById('resTbody');
  if (!tbody) return;
  const sym = TM.get('settings').currencySymbol || '€';
  const q = document.getElementById('searchRes')?.value.toLowerCase() || '';
  const status = document.getElementById('resStatusFilter')?.value || '';
  const sort = document.getElementById('resSortFilter')?.value || 'newest';

  let list = TM.get('reservations').filter(r =>
    (!q || r.customer?.toLowerCase().includes(q) || (r.tourName || r.carName || '').toLowerCase().includes(q) || String(r.id).includes(q))
    && (!status || r.status === status)
  );
  if (sort === 'highest') list.sort((a,b) => b.total - a.total);
  else list.sort((a,b) => b.id - a.id);

  const total = list.length;
  const start = (resPage - 1) * RES_PER_PAGE;
  const slice = list.slice(start, start + RES_PER_PAGE);

  tbody.innerHTML = slice.map(r => `
    <tr>
      <td style="font-weight:700;color:var(--text-primary)">#${r.id}</td>
      <td><span style="max-width:140px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.tourName || r.carName || '–'}">${r.tourName || r.carName || '–'}</span></td>
      <td style="font-weight:500;color:var(--text-primary)">${r.customer}</td>
      <td><a href="mailto:${r.email}" style="color:var(--blue);font-size:0.8rem">${r.email}</a></td>
      <td>${r.people || 1}</td>
      <td style="white-space:nowrap;font-size:0.78rem">${r.date || '–'}</td>
      <td>${sym}${(r.total||0).toLocaleString()}</td>
      <td>${sym}${(r.paid||0).toLocaleString()}</td>
      <td><span class="status-badge ${statusCls(r.status)}">${r.status}</span></td>
      <td style="white-space:nowrap;font-size:0.75rem">${r.createdAt}</td>
      <td><div class="action-btns">
        <button class="act-btn" title="Mark Confirmed" onclick="updateResStatus(${r.id},'Confirmed')"><i class="fa-solid fa-check"></i></button>
        <button class="act-btn" title="Mark Cancelled" onclick="updateResStatus(${r.id},'Cancelled')"><i class="fa-solid fa-ban"></i></button>
        <button class="act-btn delete" title="Delete" onclick="deleteRes(${r.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('') || '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--text-muted)">No reservations found</td></tr>';

  document.getElementById('resPagInfo').textContent = `Showing ${Math.min(start+1,total)}–${Math.min(start+RES_PER_PAGE,total)} of ${total}`;
  document.getElementById('resPageCur').textContent = resPage;
  document.getElementById('resPrev').disabled = resPage <= 1;
  document.getElementById('resNext').disabled = resPage >= Math.ceil(total / RES_PER_PAGE);
}

function changeResPage(dir) {
  const total = TM.get('reservations').length;
  resPage = Math.max(1, Math.min(Math.ceil(total/RES_PER_PAGE), resPage + dir));
  renderReservations();
}

function updateResStatus(id, status) {
  TM.updateItem('reservations', id, { status });
  renderReservations();
  renderRecentRes();
  showToast(`Reservation #${id} marked as ${status}`, 'success');
}

function deleteRes(id) {
  confirm2(`Delete reservation #${id}?`, () => {
    TM.deleteItem('reservations', id);
    renderReservations();
    renderRecentRes();
    updateResBadge();
    showToast(`Reservation #${id} deleted`, 'error');
  });
}

function saveReservation() {
  // Populate tour selector
  const tours = TM.get('tours');
  const sel = document.getElementById('rTour');
  const tourId = parseInt(sel.value);
  const tour = tours.find(t => t.id === tourId);
  const data = {
    tourId, tourName: tour?.title || 'Custom',
    customer: document.getElementById('rName').value.trim(),
    email: document.getElementById('rEmail').value.trim(),
    phone: document.getElementById('rPhone').value.trim(),
    date: document.getElementById('rDate').value,
    people: parseInt(document.getElementById('rPeople').value) || 1,
    total: parseFloat(document.getElementById('rTotal').value) || 0,
    paid: parseFloat(document.getElementById('rPaid').value) || 0,
    status: document.getElementById('rStatus').value,
    notes: document.getElementById('rNotes').value.trim(),
    coupon: '',
    createdAt: new Date().toLocaleString(),
  };
  if (!data.customer || !data.email) { showToast('Name and email required', 'error'); return; }
  TM.addItem('reservations', data);
  closeModal('addResModal');
  renderReservations();
  updateResBadge();
  showToast('Reservation created!', 'success');
}

// Init reservation tour select
function initResModal() {
  const sel = document.getElementById('rTour');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select a Tour</option>';
  TM.get('tours').filter(t=>t.active).forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id; opt.textContent = t.title;
    sel.appendChild(opt);
  });
}

// ─── COUPONS CRUD ─────────────────────────────────────────────────────────────
function renderCoupons() {
  const tbody = document.getElementById('couponsTbody');
  if (!tbody) return;
  const sym = TM.get('settings').currencySymbol || '€';
  tbody.innerHTML = TM.get('coupons').map(c => `
    <tr>
      <td><span class="coupon-code">${c.code}</span></td>
      <td>${c.type === 'percent' ? 'Percentage' : 'Fixed'}</td>
      <td>${c.type === 'percent' ? c.value + '%' : sym + c.value}</td>
      <td>${sym}${c.minAmount}</td>
      <td>${c.used} / ${c.limit}</td>
      <td style="white-space:nowrap;font-size:0.8rem">${c.expiry}</td>
      <td>
        <label class="toggle-switch"><input type="checkbox" ${c.active ? 'checked' : ''} onchange="toggleCoupon(${c.id},this.checked)" /><span class="toggle-slider"></span></label>
      </td>
      <td><div class="action-btns">
        <button class="act-btn delete" onclick="deleteCoupon(${c.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function saveCoupon() {
  const code = document.getElementById('cpCode').value.trim().toUpperCase();
  if (!code) { showToast('Coupon code required', 'error'); return; }
  const existing = TM.get('coupons').find(c => c.code === code);
  if (existing) { showToast('Coupon code already exists', 'error'); return; }
  TM.addItem('coupons', {
    code, type: document.getElementById('cpType').value,
    value: parseFloat(document.getElementById('cpValue').value) || 10,
    minAmount: parseFloat(document.getElementById('cpMin').value) || 0,
    limit: parseInt(document.getElementById('cpLimit').value) || 100,
    expiry: document.getElementById('cpExpiry').value,
    used: 0, active: true,
  });
  closeModal('addCouponModal');
  renderCoupons();
  showToast(`Coupon ${code} created!`, 'success');
}

function toggleCoupon(id, active) {
  TM.updateItem('coupons', id, { active });
  showToast(`Coupon ${active ? 'activated' : 'deactivated'}`, 'success');
}

function deleteCoupon(id) {
  confirm2('Delete this coupon?', () => { TM.deleteItem('coupons', id); renderCoupons(); showToast('Coupon deleted', 'error'); });
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
function renderPayments() {
  const sym = TM.get('settings').currencySymbol || '€';
  const res = TM.get('reservations');
  const total = res.reduce((s,r) => s + (r.total||0), 0);
  const paid  = res.reduce((s,r) => s + (r.paid||0), 0);

  const sg = document.getElementById('paymentsStatsGrid');
  if (sg) sg.innerHTML = [
    { label:'TOTAL BILLED', value:`${sym}${total.toLocaleString()}`, icon:'fa-money-bill-wave', cls:'purple' },
    { label:'COLLECTED', value:`${sym}${paid.toLocaleString()}`, icon:'fa-check-circle', cls:'green' },
    { label:'OUTSTANDING', value:`${sym}${(total-paid).toLocaleString()}`, icon:'fa-clock', cls:'teal' },
    { label:'TRANSACTIONS', value:res.filter(r=>r.paid>0).length, icon:'fa-receipt', cls:'pink' },
  ].map(s => `<div class="stat-card ${s.cls}"><div class="stat-card-body"><div class="stat-info"><p class="stat-label">${s.label}</p><h2 class="stat-value">${s.value}</h2></div><div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div></div></div>`).join('');

  const tbody = document.getElementById('paymentsTbody');
  if (tbody) tbody.innerHTML = res.map(r => `
    <tr>
      <td style="font-weight:700">#${r.id}</td>
      <td>#${r.id}</td>
      <td>${r.customer}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.tourName}</td>
      <td>${sym}${(r.total||0).toLocaleString()}</td>
      <td>${sym}${(r.paid||0).toLocaleString()}</td>
      <td style="color:${(r.total-r.paid)>0?'var(--red)':'var(--green)'}">${sym}${Math.max(0, (r.total||0)-(r.paid||0)).toLocaleString()}</td>
      <td><span class="status-badge ${statusCls(r.status)}">${r.status}</span></td>
    </tr>`).join('');
}

function exportPayments() {
  const res = TM.get('reservations');
  const sym = TM.get('settings').currencySymbol || '€';
  const csv = ['#,Tour,Customer,Email,Total,Paid,Balance,Status,Date',
    ...res.map(r => `${r.id},"${r.tourName}","${r.customer}","${r.email}",${r.total},${r.paid},${r.total-r.paid},${r.status},${r.createdAt}`)
  ].join('\n');
  downloadText(csv, 'payments.csv', 'text/csv');
  showToast('CSV exported!', 'success');
}

// ─── REVIEWS CRUD ─────────────────────────────────────────────────────────────
function renderReviews() {
  const tbody = document.getElementById('reviewsTbody');
  if (!tbody) return;
  const filter = document.getElementById('reviewFilter')?.value || '';
  let reviews = TM.get('reviews');
  if (filter === 'approved') reviews = reviews.filter(r => r.approved);
  if (filter === 'pending')  reviews = reviews.filter(r => !r.approved);

  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary)">${r.author}</td>
      <td>${r.tourName}</td>
      <td><span class="star-display">${'★'.repeat(r.rating)}</span> ${r.rating}</td>
      <td style="max-width:200px;font-size:0.8rem;color:var(--text-secondary)">${r.text?.substring(0,80)}...</td>
      <td style="font-size:0.78rem">${r.date}</td>
      <td><span class="status-badge ${r.approved ? 'confirmed' : 'pending'}">${r.approved ? 'Approved' : 'Pending'}</span></td>
      <td><div class="action-btns">
        ${!r.approved ? `<button class="act-btn" title="Approve" onclick="approveReview(${r.id})"><i class="fa-solid fa-check"></i></button>` : ''}
        <button class="act-btn delete" title="Delete" onclick="deleteReview(${r.id})"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function approveReview(id) {
  TM.updateItem('reviews', id, { approved: true });
  renderReviews();
  showToast('Review approved! Now visible on website.', 'success');
}

function deleteReview(id) {
  confirm2('Delete this review?', () => { TM.deleteItem('reviews', id); renderReviews(); showToast('Review deleted', 'error'); });
}

// ─── MEDIA ────────────────────────────────────────────────────────────────────
function renderMedia() {
  const grid = document.getElementById('mediaGrid');
  if (!grid) return;
  const media = TM.get('media');
  grid.innerHTML = media.map(m => `
    <div class="media-item">
      <img src="${m.url}" alt="${m.name}" loading="lazy" />
      <div class="media-item-overlay">
        <button onclick="copyToClipboard('${m.url}')" title="Copy URL"><i class="fa-solid fa-copy"></i></button>
        <button onclick="deleteMedia('${m.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="media-item-name">${m.name}</div>
    </div>`).join('') || '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)"><i class="fa-solid fa-images" style="font-size:2rem;margin-bottom:12px;display:block"></i>No media yet. Upload images above.</div>';

  // Drag zone
  const zone = document.getElementById('mediaDropZone');
  if (zone) {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('drag-over');
      handleMediaFiles(e.dataTransfer.files);
    });
  }
}

function uploadMedia(input) {
  handleMediaFiles(input.files);
}

function handleMediaFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      TM.addItem('media', { name: file.name, url: e.target.result, size: file.size, type: file.type });
      renderMedia();
      showToast(`${file.name} uploaded!`, 'success');
    };
    reader.readAsDataURL(file);
  });
}

function deleteMedia(id) {
  confirm2('Delete this image?', () => { TM.deleteItem('media', id); renderMedia(); showToast('Image deleted', 'error'); });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('URL copied!', 'success'));
}

// ─── MENU EDITOR ──────────────────────────────────────────────────────────────
function renderMenu() {
  const list = document.getElementById('menuList');
  if (!list) return;
  const menu = TM.get('menu').sort((a,b) => a.order - b.order);
  list.innerHTML = menu.map((m, idx) => `
    <div class="menu-item-row" data-id="${m.id}" draggable="true" ondragstart="onMenuDragStart(event)" ondragover="onMenuDragOver(event)" ondragleave="onMenuDragLeave(event)" ondrop="onMenuDrop(event)" style="cursor:move; transition: border-color 0.2s; display:flex; align-items:center; gap:10px; padding:12px; margin-bottom:8px; border:1px solid var(--border); border-radius:8px; background:var(--card-bg)">
      <span class="menu-drag-handle" style="cursor:grab; color:var(--text-muted)"><i class="fa-solid fa-grip-vertical"></i></span>
      <div style="flex:1; margin-left:10px">
        <div class="menu-item-label" style="font-weight:600; color:var(--text-primary)">${m.label}</div>
        <div class="menu-item-url" style="font-size:0.8rem; color:var(--text-muted); word-break:break-all">${m.url}</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px">
        <button type="button" class="act-btn" onclick="moveMenuItem(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''} title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
        <button type="button" class="act-btn" onclick="moveMenuItem(${idx}, 1)" ${idx === menu.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''} title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
        <button type="button" class="act-btn" onclick="openEditMenuModal(${m.id})" title="Edit Menu Item"><i class="fa-solid fa-pen-to-square"></i></button>
        <label class="toggle-switch"><input type="checkbox" ${m.active ? 'checked' : ''} onchange="toggleMenuItem(${m.id},this.checked)" /><span class="toggle-slider"></span></label>
        <button type="button" class="act-btn delete" onclick="deleteMenuItem(${m.id})" title="Remove"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function toggleMenuItem(id, active) {
  TM.updateItem('menu', id, { active });
  showToast(`Menu item ${active ? 'shown' : 'hidden'}`, 'success');
}

function deleteMenuItem(id) {
  confirm2('Remove this menu item?', () => { TM.deleteItem('menu', id); renderMenu(); showToast('Menu item removed', 'error'); });
}

function addMenuItem() {
  const label = document.getElementById('mLabel').value.trim();
  const url = document.getElementById('mUrl').value.trim();
  if (!label || !url) { showToast('Label and URL required', 'error'); return; }
  const menu = TM.get('menu');
  const maxOrder = menu.length ? Math.max(...menu.map(m=>m.order)) : 0;
  TM.addItem('menu', { label, url, order: maxOrder + 1, active: true });
  closeModal('addMenuModal');
  renderMenu();
  showToast('Menu item added!', 'success');
}

function saveMenu() {
  const rows = document.querySelectorAll('.menu-item-row');
  const menu = TM.get('menu');
  rows.forEach((row, i) => {
    const id = parseInt(row.getAttribute('data-id'));
    TM.updateItem('menu', id, { order: i + 1 });
  });
  showToast('Menu saved! Changes live on website.', 'success');
}

window.openEditMenuModal = function(id) {
  const item = TM.getItem('menu', id);
  if (!item) return;
  document.getElementById('editMenuId').value = item.id;
  document.getElementById('editMLabel').value = item.label;
  document.getElementById('editMUrl').value = item.url;
  openModal('editMenuModal');
};

window.saveEditMenuItem = function() {
  const id = parseInt(document.getElementById('editMenuId').value);
  const label = document.getElementById('editMLabel').value.trim();
  const url = document.getElementById('editMUrl').value.trim();
  if (!label || !url) { showToast('Label and URL required', 'error'); return; }
  
  TM.updateItem('menu', id, { label, url });
  closeModal('editMenuModal');
  renderMenu();
  showToast('Menu item updated!', 'success');
};

window.moveMenuItem = function(index, direction) {
  const menu = TM.get('menu').sort((a,b) => a.order - b.order);
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= menu.length) return;

  // Swap orders
  const temp = menu[index].order;
  menu[index].order = menu[targetIndex].order;
  menu[targetIndex].order = temp;

  TM.set('menu', menu);
  renderMenu();
};

let draggedMenuItemId = null;

window.onMenuDragStart = function(e) {
  draggedMenuItemId = e.currentTarget.getAttribute('data-id');
  e.dataTransfer.effectAllowed = 'move';
};

window.onMenuDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const row = e.currentTarget;
  row.style.borderColor = 'var(--terracotta)';
};

window.onMenuDragLeave = function(e) {
  e.currentTarget.style.borderColor = '';
};

window.onMenuDrop = function(e) {
  e.preventDefault();
  const row = e.currentTarget;
  row.style.borderColor = '';
  const targetId = row.getAttribute('data-id');
  if (!draggedMenuItemId || draggedMenuItemId === targetId) return;

  let menu = TM.get('menu').sort((a,b) => a.order - b.order);
  const draggedIdx = menu.findIndex(m => m.id == draggedMenuItemId);
  const targetIdx = menu.findIndex(m => m.id == targetId);

  if (draggedIdx !== -1 && targetIdx !== -1) {
    const [removed] = menu.splice(draggedIdx, 1);
    menu.splice(targetIdx, 0, removed);

    // Reassign orders
    menu.forEach((item, idx) => {
      item.order = idx + 1;
    });

    TM.set('menu', menu);
    renderMenu();
    showToast('Menu order updated', 'success');
  }
};

// ─── USERS CRUD ───────────────────────────────────────────────────────────────
function renderUsers() {
  const tbody = document.getElementById('usersTbody');
  if (!tbody) return;
  const roleColors = { 'Administrator':'role-admin', 'Manager':'role-manager', 'Agent':'role-agent', 'Customer':'role-customer' };
  tbody.innerHTML = TM.get('users').map(u => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--pink));display:flex;align-items:center;justify-content:center;font-weight:700;color:white;flex-shrink:0">${u.avatar || u.name?.charAt(0)}</div>
        <span style="font-weight:600;color:var(--text-primary)">${u.name}</span>
      </div></td>
      <td><a href="mailto:${u.email}" style="color:var(--blue)">${u.email}</a></td>
      <td><code>${u.password || (u.role === 'Administrator' ? 'Hamza' + '123' : 'admin')}</code></td>
      <td><span class="role-badge ${roleColors[u.role] || 'role-customer'}">${u.role}</span></td>
      <td><span class="status-badge ${u.status === 'active' ? 'confirmed' : 'cancelled'}">${u.status}</span></td>
      <td style="font-size:0.8rem">${u.joined}</td>
      <td><div class="action-btns">
        <button class="act-btn" title="Toggle Status" onclick="toggleUser(${u.id})"><i class="fa-solid fa-toggle-on"></i></button>
        ${u.role !== 'Administrator' ? `<button class="act-btn delete" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
      </div></td>
    </tr>`).join('');
}

function toggleUser(id) {
  const u = TM.getItem('users', id);
  if (!u) return;
  TM.updateItem('users', id, { status: u.status === 'active' ? 'inactive' : 'active' });
  renderUsers();
  showToast('User status updated', 'success');
}

function deleteUser(id) {
  confirm2('Delete this user?', () => { TM.deleteItem('users', id); renderUsers(); showToast('User deleted', 'error'); });
}

function saveUser() {
  const name = document.getElementById('uName').value.trim();
  const email = document.getElementById('uEmail').value.trim();
  const password = document.getElementById('uPassword').value.trim();
  if (!name || !email || !password) { showToast('Name, email and password required', 'error'); return; }
  TM.addItem('users', {
    name, email, password,
    role: document.getElementById('uRole').value,
    status: document.getElementById('uStatus').value,
    joined: new Date().toISOString().split('T')[0],
    avatar: name.charAt(0).toUpperCase(),
  });
  closeModal('addUserModal');
  // Clear modal inputs
  document.getElementById('uName').value = '';
  document.getElementById('uEmail').value = '';
  document.getElementById('uPassword').value = '';
  renderUsers();
  showToast(`${name} invited!`, 'success');
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function loadNotifications() {
  const res = TM.get('reservations').slice(0, 5);
  notifs = res.map(r => ({
    id: r.id, type: r.status === 'Pending' ? 'orange' : 'green',
    icon: r.status === 'Pending' ? 'fa-clock' : 'fa-calendar-check',
    msg: `Reservation #${r.id} – ${r.customer}`,
    time: r.createdAt || 'Recently',
  }));

  const el = document.getElementById('notifList');
  const badge = document.getElementById('notifCount');
  if (badge) badge.textContent = notifs.length;
  if (el) {
    el.innerHTML = notifs.map(n => `
      <div class="notif-item unread">
        <div class="notif-icon ${n.type}"><i class="fa-solid ${n.icon}"></i></div>
        <div class="notif-text"><p>${n.msg}</p><span>${n.time}</span></div>
      </div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--text-muted)">No notifications</div>';
  }
}

function clearNotifs() {
  notifs = [];
  document.getElementById('notifCount').textContent = '0';
  document.getElementById('notifList').innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted)">All clear!</div>';
}

// ─── SEO TOOLS ────────────────────────────────────────────────────────────────
function loadSEOPage(page, btn) {
  currentSEOPage = page;

  // Update active tab
  document.querySelectorAll('.seo-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const b = document.querySelector(`.seo-tab[data-seo-page="${page}"]`);
    if (b) b.classList.add('active');
  }

  const seo = TM.getSEO(page);
  document.getElementById('seoTitle').value = seo.title || '';
  document.getElementById('seoDesc').value = seo.description || '';
  document.getElementById('seoKeywords').value = seo.keywords || '';
  document.getElementById('seoCanonical').value = seo.canonical || '';
  document.getElementById('seoNoindex').checked = seo.noindex || false;
  document.getElementById('seoOgTitle').value = seo.ogTitle || '';
  document.getElementById('seoOgDesc').value = seo.ogDescription || '';
  document.getElementById('seoOgImage').value = seo.ogImage || '';
  document.getElementById('seoSchema').value = seo.schema || '';

  updateSEOCounts();
  calcSEOScore();
}

function saveSEOPage() {
  TM.setSEO(currentSEOPage, {
    title: document.getElementById('seoTitle').value.trim(),
    description: document.getElementById('seoDesc').value.trim(),
    keywords: document.getElementById('seoKeywords').value.trim(),
    canonical: document.getElementById('seoCanonical').value.trim(),
    noindex: document.getElementById('seoNoindex').checked,
    ogTitle: document.getElementById('seoOgTitle').value.trim(),
    ogDescription: document.getElementById('seoOgDesc').value.trim(),
    ogImage: document.getElementById('seoOgImage').value.trim(),
    schema: document.getElementById('seoSchema').value.trim(),
  });
  showToast(`SEO saved for "${currentSEOPage}" page! Changes apply on next page load.`, 'success');
  calcSEOScore();
}

function updateSEOCounts() {
  const titleLen = document.getElementById('seoTitle').value.length;
  const descLen  = document.getElementById('seoDesc').value.length;
  const tc = document.getElementById('titleCount');
  const dc = document.getElementById('descCount');
  if (tc) {
    tc.textContent = `${titleLen}/60`;
    tc.className = `seo-charcount ${titleLen >= 50 && titleLen <= 60 ? 'good' : titleLen > 60 ? 'over' : titleLen > 30 ? 'warn' : ''}`;
  }
  if (dc) {
    dc.textContent = `${descLen}/160`;
    dc.className = `seo-charcount ${descLen >= 150 && descLen <= 160 ? 'good' : descLen > 160 ? 'over' : descLen > 80 ? 'warn' : ''}`;
  }
  // Preview
  const title = document.getElementById('seoTitle').value;
  const desc  = document.getElementById('seoDesc').value;
  const pt = document.getElementById('seoPreviewTitle');
  const pd = document.getElementById('seoPreviewDesc');
  if (pt) pt.textContent = title || 'Page Title – Site Name';
  if (pd) pd.textContent = desc || 'Page description will appear here in search results.';
}

function calcSEOScore() {
  const title    = document.getElementById('seoTitle').value.trim();
  const desc     = document.getElementById('seoDesc').value.trim();
  const keywords = document.getElementById('seoKeywords').value.trim();
  const ogTitle  = document.getElementById('seoOgTitle').value.trim();
  const schema   = document.getElementById('seoSchema').value.trim();
  const canonical= document.getElementById('seoCanonical').value.trim();

  const checks = [
    { label: 'Title tag set', pass: title.length > 0, weight: 20 },
    { label: 'Title length (50-60 chars)', pass: title.length >= 50 && title.length <= 60, weight: 15 },
    { label: 'Meta description set', pass: desc.length > 0, weight: 15 },
    { label: 'Description length (150-160)', pass: desc.length >= 150 && desc.length <= 160, weight: 10 },
    { label: 'Keywords defined', pass: keywords.length > 0, weight: 10 },
    { label: 'Open Graph title set', pass: ogTitle.length > 0, weight: 10 },
    { label: 'Structured data (JSON-LD)', pass: schema.length > 10, weight: 10 },
    { label: 'Canonical URL set', pass: canonical.length > 0, weight: 5 },
    { label: 'No noindex flag', pass: !document.getElementById('seoNoindex').checked, weight: 5 },
  ];

  const score = checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0);

  // Update score ring
  const circle = document.getElementById('seoScoreCircle');
  const scoreVal = document.getElementById('seoScoreVal');
  const scoreLabel = document.getElementById('seoScoreLabel');
  if (circle) {
    const dashOffset = 201 - (201 * score / 100);
    circle.style.strokeDashoffset = dashOffset;
    circle.style.stroke = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  }
  if (scoreVal) scoreVal.textContent = score;
  if (scoreLabel) scoreLabel.textContent = score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Good' : '🔴 Needs Improvement';

  // Checklist
  const cl = document.getElementById('seoChecklist');
  if (cl) {
    cl.innerHTML = checks.map(c => `
      <div class="seo-checklist-item ${c.pass ? 'pass' : 'fail'}">
        <i class="fa-solid ${c.pass ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
        ${c.label}
      </div>`).join('');
  }
}

function generateSchema() {
  const settings = TM.get('settings');
  const page = currentSEOPage;
  const tours = TM.get('tours').filter(t => t.active);
  let schema = {};

  if (page === 'home') {
    schema = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": settings.siteName,
      "description": TM.getSEO('home').description,
      "url": settings.websiteUrl || "https://yourdomain.com",
      "telephone": settings.phone,
      "email": settings.email,
      "address": { "@type": "PostalAddress", "streetAddress": settings.address },
      "sameAs": [settings.facebook, settings.instagram, settings.twitter].filter(Boolean),
    };
  } else if (page === 'tours') {
    schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Morocco Tours",
      "itemListElement": tours.map((t, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": t.title,
        "url": t.slug ? `tours/${t.slug}` : `website/tour-detail.html?id=${t.id}`
      }))
    };
  } else {
    schema = { "@context": "https://schema.org", "@type": "WebPage", "name": TM.getSEO(page).title, "description": TM.getSEO(page).description };
  }

  document.getElementById('seoSchema').value = JSON.stringify(schema, null, 2);
  showToast('Schema generated!', 'success');
  calcSEOScore();
}

// ─── SITEMAP ──────────────────────────────────────────────────────────────────
function generateSitemapPreview() {
  const base = document.getElementById('sitemapBaseUrl')?.value || 'https://yourdomain.com';
  const xml = TM.generateSitemap(base);
  const pre = document.getElementById('sitemapPreview');
  if (pre) pre.textContent = xml;

  const tours = TM.get('tours').filter(t => t.active);
  const statsEl = document.getElementById('sitemapStats');
  if (statsEl) {
    statsEl.innerHTML = [
      { label: 'Total URLs', val: 6 + tours.length },
      { label: 'Static Pages', val: 6 },
      { label: 'Tour Pages', val: tours.length },
      { label: 'Last Updated', val: new Date().toLocaleDateString() },
    ].map(s => `<div class="sitemap-stat"><strong>${s.val}</strong>${s.label}</div>`).join('');
  }
}

function downloadSitemap() {
  const base = document.getElementById('sitemapBaseUrl')?.value || 'https://yourdomain.com';
  const xml = TM.generateSitemap(base);
  downloadText(xml, 'sitemap.xml', 'application/xml');
  showToast('sitemap.xml downloaded!', 'success');
}

// ─── ROBOTS.TXT ───────────────────────────────────────────────────────────────
function loadRobots() {
  const el = document.getElementById('robotsEditor');
  if (el) el.value = TM.get('robots');
}

function saveRobots() {
  const val = document.getElementById('robotsEditor')?.value || '';
  TM.set('robots', val);
  showToast('robots.txt saved!', 'success');
}

function addRobotsRule(rule) {
  const el = document.getElementById('robotsEditor');
  if (el) { el.value += (el.value ? '\n' : '') + rule; }
}

function resetRobots() {
  TM.set('robots', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://yourdomain.com/sitemap.xml`);
  loadRobots();
  showToast('robots.txt reset to default', 'success');
}

function downloadRobots() {
  downloadText(document.getElementById('robotsEditor')?.value || '', 'robots.txt', 'text/plain');
  showToast('robots.txt downloaded!', 'success');
}

// ─── REDIRECTS CRUD ───────────────────────────────────────────────────────────
function renderRedirects() {
  const tbody = document.getElementById('redirectsTbody');
  if (!tbody) return;
  tbody.innerHTML = TM.get('redirects').map(r => `
    <tr>
      <td><code style="font-size:0.82rem;color:var(--red)">${r.from}</code></td>
      <td><code style="font-size:0.82rem;color:var(--green)">${r.to}</code></td>
      <td><span class="status-badge in-progress">${r.type}</span></td>
      <td><label class="toggle-switch"><input type="checkbox" ${r.active ? 'checked' : ''} onchange="TM.updateItem('redirects',${r.id},{active:this.checked})" /><span class="toggle-slider"></span></label></td>
      <td><button class="act-btn delete" onclick="deleteRedirect(${r.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted)">No redirects configured</td></tr>';
}

function saveRedirect() {
  const from = document.getElementById('rdFrom').value.trim();
  const to   = document.getElementById('rdTo').value.trim();
  if (!from || !to) { showToast('From and To URLs required', 'error'); return; }
  TM.addItem('redirects', { from, to, type: document.getElementById('rdType').value, active: document.getElementById('rdActive').checked });
  closeModal('addRedirectModal');
  renderRedirects();
  showToast('Redirect added!', 'success');
}

function deleteRedirect(id) {
  confirm2('Delete this redirect?', () => { TM.deleteItem('redirects', id); renderRedirects(); showToast('Redirect deleted', 'error'); });
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function loadSettings() {
  const s = TM.get('settings');
  const map = {
    setSiteName: 'siteName', setTagline: 'tagline', setEmail: 'email',
    setPhone: 'phone', setAddress: 'address', setWhatsapp: 'whatsapp',
    setCurrencySymbol: 'currencySymbol', setFacebook: 'facebook',
    setInstagram: 'instagram', setTwitter: 'twitter', setYoutube: 'youtube',
    setTiktok: 'tiktok', setLinkedin: 'linkedin', setPinterest: 'pinterest',
    setLogo: 'logo', setFavicon: 'favicon',
    setGA: 'googleAnalytics',
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.value = s[key] || '';
  });

  // Set image previews
  const logoPreview = document.getElementById('setLogoPreview');
  if (logoPreview) {
    if (s.logo) {
      logoPreview.src = s.logo;
      logoPreview.classList.add('visible');
    } else {
      logoPreview.src = '';
      logoPreview.classList.remove('visible');
    }
  }
  const faviconPreview = document.getElementById('setFaviconPreview');
  if (faviconPreview) {
    if (s.favicon) {
      faviconPreview.src = s.favicon;
      faviconPreview.classList.add('visible');
    } else {
      faviconPreview.src = '';
      faviconPreview.classList.remove('visible');
    }
  }

  const maint = document.getElementById('setMaintenance');
  if (maint) maint.checked = s.maintenanceMode || false;

  // Load Visual Theme Settings
  const theme = s.theme || {
    colors: {
      '--cream': '#FDF6EC',
      '--sand-warm': '#FAEBD7',
      '--terracotta': '#C05621',
      '--gold': '#D4A017',
      '--coffee-dark': '#2C1810',
      '--coffee-med': '#5C4033'
    },
    headerStyle: 'glass',
    layoutOrder: [
      { "id": "hero-section", "name": "Hero Section", "visible": true },
      { "id": "why-section", "name": "Why Choose Us", "visible": true },
      { "id": "tours-section", "name": "Featured Tours", "visible": true },
      { "id": "destGrid-section", "name": "Popular Destinations", "visible": true },
      { "id": "reviews-section", "name": "Traveler Reviews", "visible": true },
      { "id": "newsletter-section", "name": "Newsletter Signup", "visible": true }
    ],
    sidebarSupport: true
  };

  const colorsMap = {
    themePrimaryColor: '--terracotta',
    themeCream: '--cream',
    themeSandWarm: '--sand-warm',
    themeGold: '--gold',
    themeCoffeeDark: '--coffee-dark',
    themeCoffeeMed: '--coffee-med'
  };
  Object.entries(colorsMap).forEach(([id, varName]) => {
    const el = document.getElementById(id);
    if (el) el.value = theme.colors?.[varName] || '';
  });

  const headerStyleEl = document.getElementById('themeHeaderStyle');
  if (headerStyleEl) headerStyleEl.value = theme.headerStyle || 'glass';

  const sidebarSupportEl = document.getElementById('themeSidebarSupport');
  if (sidebarSupportEl) sidebarSupportEl.checked = theme.sidebarSupport !== false;

  activeLayoutOrder = theme.layoutOrder || [];
  renderThemeLayoutSettings();
}

function saveSettings() {
  const map = {
    setSiteName: 'siteName', setTagline: 'tagline', setEmail: 'email',
    setPhone: 'phone', setAddress: 'address', setWhatsapp: 'whatsapp',
    setCurrencySymbol: 'currencySymbol', setFacebook: 'facebook',
    setInstagram: 'instagram', setTwitter: 'twitter', setYoutube: 'youtube',
    setTiktok: 'tiktok', setLinkedin: 'linkedin', setPinterest: 'pinterest',
    setLogo: 'logo', setFavicon: 'favicon',
    setGA: 'googleAnalytics',
  };
  const s = TM.get('settings');
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) s[key] = el.value;
  });
  s.maintenanceMode = document.getElementById('setMaintenance')?.checked || false;

  // Save Theme Settings
  s.theme = {
    colors: {
      '--cream': document.getElementById('themeCream')?.value || '#FDF6EC',
      '--sand-warm': document.getElementById('themeSandWarm')?.value || '#FAEBD7',
      '--terracotta': document.getElementById('themePrimaryColor')?.value || '#C05621',
      '--gold': document.getElementById('themeGold')?.value || '#D4A017',
      '--coffee-dark': document.getElementById('themeCoffeeDark')?.value || '#2C1810',
      '--coffee-med': document.getElementById('themeCoffeeMed')?.value || '#5C4033'
    },
    headerStyle: document.getElementById('themeHeaderStyle')?.value || 'glass',
    layoutOrder: activeLayoutOrder,
    sidebarSupport: document.getElementById('themeSidebarSupport')?.checked !== false
  };

  TM.set('settings', s);
  showToast('Settings saved! Changes apply on next website visit.', 'success');
}

function renderThemeLayoutSettings() {
  const container = document.getElementById('themeLayoutBlocks');
  if (!container) return;

  container.innerHTML = activeLayoutOrder.map((block, idx) => `
    <div class="layout-block-item" data-id="${block.id}" style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-dark);padding:10px 14px;border-radius:10px;border:1px solid var(--border);gap:10px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:12px;flex:1">
        <label class="toggle-switch" style="font-size:0.8rem">
          <input type="checkbox" class="block-visible" ${block.visible ? 'checked' : ''} onchange="toggleThemeBlock(${idx}, this.checked)" />
          <span class="toggle-slider"></span>
        </label>
        <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary)">${block.name}</span>
      </div>
      <div style="display:flex;gap:6px">
        <button type="button" class="btn btn-outline btn-sm" onclick="moveThemeBlock(${idx}, -1)" style="padding:4px 8px;min-height:unset;height:28px;width:28px;display:flex;align-items:center;justify-content:center" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up" style="font-size:0.75rem"></i></button>
        <button type="button" class="btn btn-outline btn-sm" onclick="moveThemeBlock(${idx}, 1)" style="padding:4px 8px;min-height:unset;height:28px;width:28px;display:flex;align-items:center;justify-content:center" ${idx === activeLayoutOrder.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down" style="font-size:0.75rem"></i></button>
      </div>
    </div>
  `).join('');
}

function toggleThemeBlock(index, checked) {
  if (activeLayoutOrder[index]) {
    activeLayoutOrder[index].visible = checked;
  }
}

function moveThemeBlock(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= activeLayoutOrder.length) return;

  // Swap elements
  const temp = activeLayoutOrder[index];
  activeLayoutOrder[index] = activeLayoutOrder[targetIndex];
  activeLayoutOrder[targetIndex] = temp;

  renderThemeLayoutSettings();
}

function uploadSettingImage(inputId, previewId, input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;
      document.getElementById(inputId).value = base64;
      const preview = document.getElementById(previewId);
      if (preview) {
        preview.src = base64;
        preview.classList.add('visible');
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function exportAllData() {
  const data = TM.getAll();
  downloadText(JSON.stringify(data, null, 2), 'tm-data-export.json', 'application/json');
  showToast('Data exported!', 'success');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Object.keys(TM.KEYS || {}).forEach(key => {
        if (data[key]) TM.set(key, data[key]);
      });
      showToast('Data imported! Refreshing...', 'success');
      setTimeout(() => location.reload(), 1500);
    } catch(err) {
      showToast('Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusCls(status) {
  const m = { 'In Progress':'in-progress','Confirmed':'confirmed','Pending':'pending','Cancelled':'cancelled','Refunded':'refunded' };
  return m[status] || 'pending';
}

function downloadText(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Init reservation tour dropdown
  if (id === 'addResModal') initResModal();
}

function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
  document.body.style.overflow = '';
}

function confirm2(msg, onOk) {
  document.getElementById('confirmMsg').textContent = msg;
  const btn = document.getElementById('confirmOkBtn');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => { onOk(); closeModal('confirmModal'); });
  openModal('confirmModal');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
});

function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warning:'fa-triangle-exclamation' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type]||icons.success}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.transition='0.3s'; t.style.opacity='0'; t.style.transform='translateX(20px)'; setTimeout(() => t.remove(), 300); }, 3500);
}

// ─── Email Submitters / Subscribers Page ──────────────────────────────────────
function renderSubscribers() {
  const tbody = document.getElementById('subscribersTbody');
  if (!tbody) return;
  const subscribers = TM.get('subscribers') || [];

  if (subscribers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px 0;color:var(--text-secondary)">No subscribers found.</td></tr>`;
    return;
  }

  tbody.innerHTML = subscribers.map(s => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary)">${s.email}</td>
      <td style="font-size:0.78rem">${s.createdAt || 'N/A'}</td>
      <td>
        <div class="action-btns">
          <button class="act-btn delete" title="Delete" onclick="deleteSubscriber('${s.email}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function deleteSubscriber(email) {
  confirm2(`Are you sure you want to delete subscriber ${email}?`, () => {
    let subscribers = TM.get('subscribers') || [];
    subscribers = subscribers.filter(s => s.email !== email);
    TM.set('subscribers', subscribers);
    renderSubscribers();
    showToast('Subscriber deleted successfully', 'error');
  });
}

function downloadSubscribersList() {
  const subscribers = TM.get('subscribers') || [];
  if (subscribers.length === 0) {
    showToast('No subscribers to download', 'warning');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Email,Date Joined\r\n";

  subscribers.forEach(s => {
    csvContent += `"${s.email}","${s.createdAt || 'N/A'}"\r\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `tourvoyage_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
  showToast('Downloaded subscribers list successfully', 'success');
}

window.deleteSubscriber = deleteSubscriber;
window.downloadSubscribersList = downloadSubscribersList;

// ─── THEME PRESETS & CHOICES ──────────────────────────────────────────────────
const THEME_PRESETS = [
  {
    id: "moroccan-oasis",
    name: "Moroccan Oasis",
    version: "2.0.0",
    description: "Authentic warm terracotta, cream, saffron gold, and deep coffee tones matching luxury Moroccan riads.",
    colors: {
      '--cream': '#FDF6EC',
      '--sand-warm': '#FAEBD7',
      '--sand-dark': '#F3E1C8',
      '--terracotta': '#C05621',
      '--gold': '#D4A017',
      '--orange': '#E28743',
      '--burgundy': '#8B2635',
      '--card-bg': '#FFFFFF',
      '--card2': '#FFFBF5',
      '--coffee-dark': '#2C1810',
      '--coffee-med': '#5C4033',
      '--coffee-light': '#8C6D58',
      '--border': 'rgba(44, 24, 16, 0.08)',
      '--border2': 'rgba(44, 24, 16, 0.15)'
    }
  },
  {
    id: "luxury-navy",
    name: "Luxury Navy",
    version: "1.4.0",
    description: "Sleek and professional travel agent design with deep navy blue, warm gold highlights, and clean silver backgrounds.",
    colors: {
      '--cream': '#F4F7FA',
      '--sand-warm': '#E9EFF5',
      '--sand-dark': '#D5E2EE',
      '--terracotta': '#1A365D',
      '--gold': '#D69E2E',
      '--orange': '#DD6B20',
      '--burgundy': '#9B2C2C',
      '--card-bg': '#FFFFFF',
      '--card2': '#FAFCFF',
      '--coffee-dark': '#1A202C',
      '--coffee-med': '#4A5568',
      '--coffee-light': '#718096',
      '--border': 'rgba(26, 54, 93, 0.08)',
      '--border2': 'rgba(26, 54, 93, 0.15)'
    }
  },
  {
    id: "nordic-breeze",
    name: "Nordic Breeze",
    version: "1.1.0",
    description: "Cool glacier blue, deep slate ocean, and sharp granite elements for sub-zero expeditions and clean arctic looks.",
    colors: {
      '--cream': '#F0F4F8',
      '--sand-warm': '#D9E2EC',
      '--sand-dark': '#BCCCDC',
      '--terracotta': '#334E68',
      '--gold': '#102A43',
      '--orange': '#486581',
      '--burgundy': '#627D98',
      '--card-bg': '#FFFFFF',
      '--card2': '#F5F7FA',
      '--coffee-dark': '#0F172A',
      '--coffee-med': '#334155',
      '--coffee-light': '#64748B',
      '--border': 'rgba(51, 78, 104, 0.08)',
      '--border2': 'rgba(51, 78, 104, 0.15)'
    }
  },
  {
    id: "forest-nature",
    name: "Forest Nature",
    version: "1.0.5",
    description: "Deep evergreen timber, organic wood details, warm leaf gold, and herbal tea tints for eco-nature tours.",
    colors: {
      '--cream': '#F4F6F0',
      '--sand-warm': '#E2E8DD',
      '--sand-dark': '#C8D3C0',
      '--terracotta': '#2F5233',
      '--gold': '#76A035',
      '--orange': '#D97706',
      '--burgundy': '#991B1B',
      '--card-bg': '#FFFFFF',
      '--card2': '#FAFBF9',
      '--coffee-dark': '#1E291B',
      '--coffee-med': '#3F4E3C',
      '--coffee-light': '#6B7A68',
      '--border': 'rgba(47, 82, 51, 0.08)',
      '--border2': 'rgba(47, 82, 51, 0.15)'
    }
  },
  {
    id: "sunset-rose",
    name: "Sunset Rose",
    version: "1.2.0",
    description: "Luxurious rose gold, rich cranberry burgundy, warm pearl backdrops, and aubergine highlights for premium boutique riads.",
    colors: {
      '--cream': '#FAF5F5',
      '--sand-warm': '#F2E3E3',
      '--sand-dark': '#E6CCCC',
      '--terracotta': '#881337',
      '--gold': '#BE123C',
      '--orange': '#FB7185',
      '--burgundy': '#4C0519',
      '--card-bg': '#FFFFFF',
      '--card2': '#FFF8F8',
      '--coffee-dark': '#270812',
      '--coffee-med': '#571E2F',
      '--coffee-light': '#8A5161',
      '--border': 'rgba(136, 19, 55, 0.08)',
      '--border2': 'rgba(136, 19, 55, 0.15)'
    }
  },
  {
    id: "midnight-cyber",
    name: "Midnight Cyber",
    version: "1.5.0",
    description: "Sleek and high-contrast dark mode explorer styling with slate charcoal, neon blue accents, and violet highlights.",
    colors: {
      '--cream': '#0D0E12',
      '--sand-warm': '#171923',
      '--sand-dark': '#2D3748',
      '--terracotta': '#06B6D4',
      '--gold': '#A855F7',
      '--orange': '#3B82F6',
      '--burgundy': '#EC4899',
      '--card-bg': '#1A1D24',
      '--card2': '#13161C',
      '--coffee-dark': '#F8FAFC',
      '--coffee-med': '#E2E8F0',
      '--coffee-light': '#94A3B8',
      '--border': 'rgba(255, 255, 255, 0.08)',
      '--border2': 'rgba(255, 255, 255, 0.15)'
    }
  }
];

function renderThemes() {
  const container = document.getElementById('themesGrid');
  if (!container) return;

  const settings = TM.get('settings') || {};
  const activeThemeId = settings.activeTheme || 'moroccan-oasis';

  container.innerHTML = THEME_PRESETS.map(theme => {
    const isActive = theme.id === activeThemeId;
    
    // Create a color bar HTML with the first 5 colors
    const previewColors = ['--cream', '--terracotta', '--gold', '--coffee-dark', '--sand-warm'];
    const colorBarHtml = previewColors.map(c => {
      const colorVal = theme.colors[c];
      return `<div style="background:${colorVal}; width:24px; height:24px; border-radius:50%; border:1px solid rgba(0,0,0,0.1); margin-right:-6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)" title="${c}: ${colorVal}"></div>`;
    }).join('');

    // Previews mockup
    const mockBg = theme.colors['--cream'];
    const mockCard = theme.colors['--card-bg'];
    const mockPrimary = theme.colors['--terracotta'];
    const mockText = theme.colors['--coffee-dark'];
    const mockMuted = theme.colors['--coffee-light'];
    const mockSecBg = theme.colors['--sand-warm'];

    const mockupHtml = `
      <div style="background:${mockBg}; border:1px solid ${theme.colors['--border2']}; border-radius:8px; padding:10px; height:120px; display:flex; flex-direction:column; gap:8px; overflow:hidden; position:relative; margin-bottom:12px">
        <!-- Mock Navbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:${mockCard}; padding:4px 8px; border-radius:4px; border-bottom:1px solid ${theme.colors['--border']}; font-size:9px; font-weight:bold; color:${mockText}">
          <span style="color:${mockPrimary}">★ Brand</span>
          <div style="display:flex; gap:6px; font-weight:normal; color:${mockMuted}">
            <span>Home</span><span>Tours</span><span>Cars</span>
          </div>
        </div>
        <!-- Mock Hero -->
        <div style="background:linear-gradient(135deg, ${mockPrimary}, ${theme.colors['--orange'] || mockPrimary}); padding:12px 8px; border-radius:6px; text-align:center; color:#fff">
          <div style="font-weight:700; font-size:10px">Discover Morocco</div>
          <div style="font-size:7px; opacity:0.8">With Expert Local Guides</div>
        </div>
        <!-- Mock Content -->
        <div style="display:flex; gap:8px">
          <div style="background:${mockCard}; padding:6px; border-radius:6px; border:1px solid ${theme.colors['--border']}; flex:1; display:flex; flex-direction:column; gap:4px">
            <div style="width:100%; height:20px; background:${mockSecBg}; border-radius:4px"></div>
            <div style="font-weight:700; font-size:7px; color:${mockText}">Sahara Tour</div>
            <div style="font-weight:bold; font-size:7px; color:${mockPrimary}">$499</div>
          </div>
          <div style="background:${mockCard}; padding:6px; border-radius:6px; border:1px solid ${theme.colors['--border']}; flex:1; display:flex; flex-direction:column; gap:4px">
            <div style="width:100%; height:20px; background:${mockSecBg}; border-radius:4px"></div>
            <div style="font-weight:700; font-size:7px; color:${mockText}">Agafay Quad</div>
            <div style="font-weight:bold; font-size:7px; color:${mockPrimary}">$89</div>
          </div>
        </div>
      </div>
    `;

    return `
      <div class="card theme-card" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; border: 2px solid ${isActive ? 'var(--terracotta)' : 'var(--border)'}; box-shadow: ${isActive ? 'var(--shadow-lg)' : 'none'}; border-radius:12px; background:var(--card-bg)">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
            <h3 style="font-family:'Outfit',sans-serif; font-size:1.15rem; font-weight:700; color:var(--text-primary)">${theme.name}</h3>
            <span style="font-size:0.7rem; background:var(--bg-dark); color:var(--text-muted); padding:3px 6px; border-radius:4px; font-weight:600">v${theme.version}</span>
          </div>
          
          <!-- Mockup preview -->
          ${mockupHtml}
          
          <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.5; margin-bottom:16px; min-height:48px">${theme.description}</p>
        </div>
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border); padding-top:14px; margin-top:auto">
          <div style="display:flex; align-items:center">
            ${colorBarHtml}
          </div>
          ${isActive 
            ? `<button class="btn btn-warning btn-sm" disabled style="background:#d97706; color:white; border:none; padding:6px 12px; font-weight:bold; opacity:1; cursor:default"><i class="fa-solid fa-circle-check"></i> Actif</button>` 
            : `<button class="btn btn-primary btn-sm" onclick="activateTheme('${theme.id}')" style="padding:6px 12px"><i class="fa-solid fa-bolt"></i> Activer</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

window.activateTheme = function(themeId) {
  const theme = THEME_PRESETS.find(t => t.id === themeId);
  if (!theme) return;

  const settings = TM.get('settings') || {};
  settings.activeTheme = themeId;
  
  if (!settings.theme) settings.theme = {};
  settings.theme.colors = { ...theme.colors };

  TM.set('settings', settings);
  renderThemes();
  showToast(`Thème "${theme.name}" activé avec succès !`, 'success');
};

window.renderThemes = renderThemes;

