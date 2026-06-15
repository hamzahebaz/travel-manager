/* ════════════════════════════════════════════════════
   TM – Tour Manager Dashboard | app.js
════════════════════════════════════════════════════ */

// ─── Data ───────────────────────────────────────────
const bookingsData = [
  { id: 330, item: 'Marrakech City Tour – 3 Days', customer: 'Ahmed Bennani',    total: 0,    paid: 0,    status: 'In Progress', date: '06/14/2026 10:22' },
  { id: 329, item: 'Umrah Al-Mawlid – 14 Nights from Marrakech', customer: 'Fatima Alaoui',    total: 0,    paid: 0,    status: 'In Progress', date: '06/11/2026 16:01' },
  { id: 328, item: 'Sahara Desert – Quad & Dromedary', customer: 'Youssef Tazi',      total: 120,  paid: 60,   status: 'Confirmed',   date: '06/10/2026 09:15' },
  { id: 305, item: 'Circuit Aït Bougamez – 5 Days | Sahara & Atlas', customer: 'Karima Haddad',   total: 0,    paid: 0,    status: 'In Progress', date: '05/16/2026 11:59' },
  { id: 301, item: 'Agafay Desert: Quad, Dromedary & Dinner – Premium', customer: 'Omar El Fassi',    total: 49,   paid: 0,    status: 'In Progress', date: '05/15/2026 13:20' },
  { id: 295, item: 'Essaouira – Full Day Excursion', customer: 'Nadia Berrada',     total: 75,   paid: 75,   status: 'Confirmed',   date: '05/12/2026 08:45' },
  { id: 290, item: 'Fes Medina Discovery – 2 Days', customer: 'Leila Bouzidi',     total: 180,  paid: 180,  status: 'Confirmed',   date: '05/08/2026 14:30' },
  { id: 288, item: 'In a Week: Atlas & Grand South | TourVoyage Morocco', customer: 'Karim Alaoui',     total: 749,  paid: 0,    status: 'In Progress', date: '05/04/2026 17:30' },
  { id: 275, item: 'Imperial Cities Grand Tour – 8 Days', customer: 'Sara Mansouri',    total: 1200, paid: 600,  status: 'Confirmed',   date: '04/28/2026 11:00' },
  { id: 260, item: 'Ouarzazate & Draa Valley – 4 Days', customer: 'Hassan Chraibi',    total: 320,  paid: 320,  status: 'Confirmed',   date: '04/15/2026 09:20' },
  { id: 245, item: 'Casablanca Hassan II Mosque & Rabat', customer: 'Zineb Taoufik',    total: 95,   paid: 0,    status: 'Pending',     date: '04/01/2026 15:10' },
  { id: 210, item: 'Chefchaouen Blue City – 2 Days', customer: 'Mehdi Lahmidi',    total: 150,  paid: 0,    status: 'Cancelled',   date: '03/20/2026 10:05' },
];

const reviewsData = [
  { author: 'Ahmed B.',   initial: 'A', color: '#6c63ff', dest: 'Circuit Atlas – 5 Days',          stars: 5, text: 'An absolutely incredible experience! The guide was professional and the scenery breathtaking. Highly recommend!', date: 'Jun 12, 2026' },
  { author: 'Sarah M.',   initial: 'S', color: '#ec4899', dest: 'Sahara Desert Quad Experience',   stars: 5, text: 'Unforgettable adventure! The Sahara at sunset is pure magic. Everything was perfectly organized.', date: 'Jun 8, 2026' },
  { author: 'Karim T.',   initial: 'K', color: '#14b8a6', dest: 'Marrakech City Tour',             stars: 4, text: 'Great tour with knowledgeable guides. The medina walk was fascinating. Would definitely book again.', date: 'Jun 5, 2026' },
  { author: 'Leila H.',   initial: 'L', color: '#10b981', dest: 'Essaouira Full Day',             stars: 5, text: 'Beautiful coastal town! The wind, the colors, the fish market — everything was amazing. Perfect day trip.', date: 'May 30, 2026' },
  { author: 'Omar F.',    initial: 'O', color: '#f59e0b', dest: 'Fes Medina Discovery',           stars: 4, text: 'Fes is like stepping back in time. Our guide knew every corner. A bit tiring but totally worth it!', date: 'May 22, 2026' },
  { author: 'Nadia B.',   initial: 'N', color: '#3b82f6', dest: 'Agafay Desert Premium',          stars: 5, text: 'The dinner under the stars was absolutely magical. Top-notch service and stunning landscape. 10/10!', date: 'May 18, 2026' },
];

// ─── State ──────────────────────────────────────────
let currentPage = 'dashboard';
let reservationPage = 1;
const ROWS_PER_PAGE = 6;
let filteredBookings = [...bookingsData];

// ─── DOM Ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  initSidebar();
  initDropdowns();
  initNavigation();
  renderRecentBookings();
  renderReservationsTable();
  renderReviews();
  animateCounters();
  setTimeout(() => {
    initRevenueChart();
    initStatusDonut();
  }, 100);
});

// ─── Date ───────────────────────────────────────────
function setCurrentDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById('currentDate');
  if (el) el.textContent = now.toLocaleDateString('en-US', opts);
}

// ─── Sidebar Toggle ─────────────────────────────────
function initSidebar() {
  const btn    = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.getElementById('mainWrapper');
  let isMobile = window.innerWidth <= 768;

  btn.addEventListener('click', () => {
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
      wrapper.classList.toggle('expanded');
    }
  });

  // Close sidebar on mobile when clicking outside
  document.addEventListener('click', (e) => {
    if (isMobile && !sidebar.contains(e.target) && !btn.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });

  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
  });

  // Sub-menu toggles
  document.querySelectorAll('.nav-item.has-children').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-toggle');
      const sub = document.getElementById(targetId);
      if (!sub) return;
      const isOpen = sub.classList.contains('open');

      // Close all
      document.querySelectorAll('.nav-sub.open').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));

      if (!isOpen) {
        sub.classList.add('open');
        item.classList.add('open');
      }
    });
  });
}

// ─── Dropdown Menus ─────────────────────────────────
function initDropdowns() {
  const dropdowns = [
    { wrap: 'langDropWrap',    btn: 'langDropBtn',    menu: 'langMenu' },
    { wrap: 'notifDropWrap',   btn: 'notifDropBtn',   menu: 'notifMenu' },
    { wrap: 'profileDropWrap', btn: 'profileDropBtn', menu: 'profileMenu' },
  ];

  dropdowns.forEach(({ wrap, btn, menu }) => {
    const wrapEl = document.getElementById(wrap);
    const btnEl  = document.getElementById(btn);
    const menuEl = document.getElementById(menu);

    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close others
      dropdowns.forEach(d => {
        if (d.menu !== menu) {
          document.getElementById(d.menu)?.classList.remove('open');
        }
      });
      menuEl.classList.toggle('open');
    });
  });

  // Close all on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

// ─── Navigation ─────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Card "More" links
  document.querySelectorAll('.card-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute('data-page'));
    });
  });
}

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  // Show target
  const target = document.getElementById(`page-${page}`);
  if (!target) return;
  target.classList.remove('hidden');
  currentPage = page;

  // Update nav active state
  document.querySelectorAll('.nav-item.active').forEach(i => i.classList.remove('active'));
  const activeItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (activeItem) activeItem.classList.add('active');

  // Update breadcrumb
  const labels = {
    dashboard: 'Dashboard', reservations: 'Reservations', payments: 'Payments',
    reports: 'Reports', reviews: 'Reviews', news: 'News', pages: 'Pages',
    media: 'Media', coupons: 'Coupons', popup: 'Popups',
  };
  document.getElementById('breadcrumbLabel').textContent = labels[page] || page;

  // Init page-specific charts
  if (page === 'reports') {
    setTimeout(() => { initMonthlyChart(); initServiceChart(); }, 100);
  }

  // Scroll to top
  document.querySelector('.page-content').scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');
}

// ─── Counter Animation ───────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const target  = parseInt(el.getAttribute('data-count'), 10);
    const prefix  = el.getAttribute('data-prefix') || '';
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(ease * target);
      el.textContent = prefix + (target > 999 ? value.toLocaleString() : value);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = prefix + target.toLocaleString();
    }
    requestAnimationFrame(update);
  });
}

// ─── Revenue Chart ───────────────────────────────────
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  const labels = ['Jun 8','Jun 9','Jun 10','Jun 11','Jun 12','Jun 13','Jun 14','Jun 15'];
  const revenue = [0.3, 0.5, 0.4, 0.8, 0.6, 0.9, 0.7, 1.0];
  const earnings = [0.1, 0.2, 0.15, 0.3, 0.25, 0.4, 0.3, 0.35];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: revenue,
          borderColor: '#6c63ff',
          backgroundColor: 'rgba(108,99,255,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#6c63ff',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Total Earnings',
          data: earnings,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236,72,153,0.06)',
          borderWidth: 2.5,
          pointBackgroundColor: '#ec4899',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e2334',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 } },
          border: { color: 'rgba(255,255,255,0.07)' },
        },
        y: {
          min: 0, max: 1.2,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 }, stepSize: 0.2 },
          border: { color: 'rgba(255,255,255,0.07)' },
        },
      },
    },
  });
}

// ─── Status Donut ────────────────────────────────────
function initStatusDonut() {
  const ctx = document.getElementById('statusDonut');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['In Progress', 'Confirmed', 'Pending', 'Cancelled'],
      datasets: [{
        data: [32, 12, 4, 2],
        backgroundColor: ['#6c63ff', '#10b981', '#f59e0b', '#ef4444'],
        borderColor: '#181c27',
        borderWidth: 3,
        hoverBorderWidth: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e2334',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 10,
        },
      },
    },
  });
}

// ─── Monthly Chart (Reports) ─────────────────────────
function initMonthlyChart() {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx || ctx._chartInitialized) return;
  ctx._chartInitialized = true;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [
        { label: 'Revenue (€)', data: [4200,5100,6800,7200,9100,12400], backgroundColor: 'rgba(108,99,255,0.7)', borderRadius: 6 },
        { label: 'Earnings (€)', data: [800,950,1100,1400,1700,2300], backgroundColor: 'rgba(236,72,153,0.7)', borderRadius: 6 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } }, tooltip: { backgroundColor: '#1e2334', titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10 } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' }, border: { color: 'rgba(255,255,255,0.07)' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' }, border: { color: 'rgba(255,255,255,0.07)' } },
      },
    },
  });
}

// ─── Service Chart (Reports) ─────────────────────────
function initServiceChart() {
  const ctx = document.getElementById('serviceChart');
  if (!ctx || ctx._chartInitialized) return;
  ctx._chartInitialized = true;
  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Circuits', 'Hotels', 'Vehicles', 'Excursions', 'Transfers'],
      datasets: [{
        data: [41, 63, 12, 48, 10],
        backgroundColor: ['rgba(108,99,255,0.7)','rgba(20,184,166,0.7)','rgba(245,158,11,0.7)','rgba(236,72,153,0.7)','rgba(59,130,246,0.7)'],
        borderColor: '#181c27', borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } }, tooltip: { backgroundColor: '#1e2334', titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10 } },
      scales: { r: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { display: false } } },
    },
  });
}

// ─── Recent Bookings (Dashboard) ────────────────────
function renderRecentBookings() {
  const tbody = document.getElementById('recentBookingsTbody');
  if (!tbody) return;

  const recent = bookingsData.slice(0, 6);
  tbody.innerHTML = recent.map(b => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary)">#${b.id}</td>
      <td><a class="booking-link" href="#" title="${b.item}">${b.item}</a></td>
      <td style="color:var(--text-primary);white-space:nowrap">€ ${b.total.toLocaleString()}</td>
      <td style="white-space:nowrap">€ ${b.paid.toLocaleString()}</td>
      <td><span class="status-badge ${statusClass(b.status)}">${b.status}</span></td>
      <td style="white-space:nowrap;font-size:0.78rem">${b.date}</td>
    </tr>
  `).join('');
}

// ─── Reservations Table ──────────────────────────────
function renderReservationsTable() {
  const tbody = document.getElementById('reservationsTbody');
  if (!tbody) return;

  const start = (reservationPage - 1) * ROWS_PER_PAGE;
  const slice = filteredBookings.slice(start, start + ROWS_PER_PAGE);

  tbody.innerHTML = slice.map(b => `
    <tr>
      <td style="font-weight:700;color:var(--text-primary)">#${b.id}</td>
      <td><a class="booking-link" href="#" title="${b.item}">${b.item}</a></td>
      <td style="white-space:nowrap;color:var(--text-primary)">${b.customer}</td>
      <td style="white-space:nowrap">€ ${b.total.toLocaleString()}</td>
      <td style="white-space:nowrap">€ ${b.paid.toLocaleString()}</td>
      <td><span class="status-badge ${statusClass(b.status)}">${b.status}</span></td>
      <td style="white-space:nowrap;font-size:0.78rem">${b.date}</td>
      <td>
        <div class="action-btns">
          <button class="act-btn" title="View" onclick="showToast('Viewing reservation #${b.id}','success')"><i class="fa-solid fa-eye"></i></button>
          <button class="act-btn" title="Edit" onclick="showToast('Edit feature coming soon','warning')"><i class="fa-solid fa-pen"></i></button>
          <button class="act-btn delete" title="Delete" onclick="deleteBooking(${b.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Pagination
  const total = filteredBookings.length;
  const totalPages = Math.ceil(total / ROWS_PER_PAGE);
  document.getElementById('paginationInfo').textContent = `Showing ${Math.min(start+1, total)}–${Math.min(start+ROWS_PER_PAGE, total)} of ${total}`;
  document.getElementById('pageCurrent').textContent = reservationPage;
  document.getElementById('prevPage').disabled = reservationPage <= 1;
  document.getElementById('nextPage').disabled = reservationPage >= totalPages;
}

function filterReservations() {
  const search = document.getElementById('searchRes').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const sort   = document.getElementById('sortFilter').value;

  filteredBookings = bookingsData.filter(b => {
    const matchSearch = b.item.toLowerCase().includes(search) || b.customer.toLowerCase().includes(search) || String(b.id).includes(search);
    const matchStatus = !status || b.status === status;
    return matchSearch && matchStatus;
  });

  if (sort === 'oldest') filteredBookings.sort((a, b) => a.id - b.id);
  else if (sort === 'highest') filteredBookings.sort((a, b) => b.total - a.total);
  else filteredBookings.sort((a, b) => b.id - a.id);

  reservationPage = 1;
  renderReservationsTable();
}

function changePage(dir) {
  const totalPages = Math.ceil(filteredBookings.length / ROWS_PER_PAGE);
  reservationPage = Math.max(1, Math.min(totalPages, reservationPage + dir));
  renderReservationsTable();
}

function deleteBooking(id) {
  const idx = bookingsData.findIndex(b => b.id === id);
  if (idx === -1) return;
  bookingsData.splice(idx, 1);
  filteredBookings = filteredBookings.filter(b => b.id !== id);
  renderReservationsTable();
  renderRecentBookings();
  showToast(`Reservation #${id} deleted`, 'error');
}

// ─── Reviews ─────────────────────────────────────────
function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;
  grid.innerHTML = reviewsData.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar" style="background:${r.color}">${r.initial}</div>
        <div>
          <div class="review-author">${r.author}</div>
          <div class="review-dest">${r.dest}</div>
        </div>
      </div>
      <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      <p class="review-text">${r.text}</p>
      <p class="review-date">${r.date}</p>
    </div>
  `).join('');
}

// ─── Status helper ───────────────────────────────────
function statusClass(status) {
  const map = {
    'In Progress': 'in-progress',
    'Confirmed':   'confirmed',
    'Pending':     'pending',
    'Cancelled':   'cancelled',
    'Refunded':    'refunded',
  };
  return map[status] || 'pending';
}

// ─── Modal ───────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ─── Add Booking ─────────────────────────────────────
function addBooking() {
  const customer = document.getElementById('mb-customer').value.trim();
  const item     = document.getElementById('mb-service').value;
  const status   = document.getElementById('mb-status').value;
  const total    = parseFloat(document.getElementById('mb-total').value) || 0;
  const paid     = parseFloat(document.getElementById('mb-paid').value) || 0;

  if (!customer) { showToast('Please enter a customer name', 'error'); return; }

  const newId = Math.max(...bookingsData.map(b => b.id)) + 1;
  const now = new Date();
  const dateStr = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  bookingsData.unshift({ id: newId, item, customer, total, paid, status, date: dateStr });
  filteredBookings = [...bookingsData];

  renderRecentBookings();
  renderReservationsTable();
  closeModal('addBookingModal');

  // Reset form
  ['mb-customer','mb-email','mb-total','mb-paid','mb-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  showToast(`Reservation #${newId} created successfully!`, 'success');
}

// ─── Toast ───────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.success}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Keyboard shortcuts ──────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => closeModal(m.id));
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  }
});
