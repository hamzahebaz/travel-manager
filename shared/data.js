// Google Sheet Web App URL for auto-sync and recovery (e.g. 'https://script.google.com/macros/s/.../exec')
// Set this to automatically restore all data if local storage/cache is cleared.
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwgp0rCRh58SZfA6KKmdhd0NjVy4k--IqpHEyAKRWur8WOimkBotHpK_CsJibvHQqii/exec ';

const TM = (() => {

  // ─── Keys ────────────────────────────────────────────────────────────────
  const KEYS = {
    tours:        'tm_tours',
    hotels:       'tm_hotels',
    destinations: 'tm_destinations',
    reservations: 'tm_reservations',
    reviews:      'tm_reviews',
    coupons:      'tm_coupons',
    users:        'tm_users',
    media:        'tm_media',
    seo:          'tm_seo',
    settings:     'tm_settings',
    menu:         'tm_menu',
    redirects:    'tm_redirects',
    robots:       'tm_robots',
    subscribers:  'tm_subscribers',
    cars:         'tm_cars',
    popups:       'tm_popups',
  };

  // ─── Default Data ────────────────────────────────────────────────────────
  const DEFAULTS = {
    tours: [
      {
        id: 1,
        slug: 'circuit-atlas-5-days',
        title: 'Circuit Aït Bougamez – 5 Days | Sahara & Atlas',
        destination: 'Marrakech',
        duration: '5 Days',
        price: 499,
        rating: 4.8,
        reviews: 42,
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=800&q=80',
        gallery: [],
        category: 'circuit',
        featured: true,
        active: true,
        description: 'Explore the breathtaking High Atlas mountains and the golden dunes of the Sahara on this 5-day adventure circuit.',
        itinerary: ['Day 1: Marrakech → Ouarzazate', 'Day 2: Draa Valley & Zagora', 'Day 3: Merzouga Sahara Dunes', 'Day 4: Todra Gorge & Dades', 'Day 5: Return to Marrakech'],
        included: ['Professional guide', 'Transport', 'Accommodation', 'Breakfast & Dinner', 'Camel ride'],
        excluded: ['Flights', 'Lunch', 'Personal expenses'],
        maxPeople: 12,
        discount: 0,
        createdAt: '2026-01-15',
        youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        minAdvanceDays: 2,
        minPeople: 1,
        bannerImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=1200&q=80',
        travelStyles: ['Cultural', 'Nature & Adventure'],
        facilities: ['WiFi', 'Guest Rooms'],
        faqs: [
          { q: 'Is transportation included?', a: 'Yes, round-trip transport in an air-conditioned 4x4 or minivan from your hotel in Marrakech is fully included.' },
          { q: 'What should I pack for the desert?', a: 'We recommend comfortable walking shoes, sunglasses, sunscreen, a hat, and warm clothing for the cool desert nights.' }
        ],
        itineraryDays: [
          { title: 'Day 1: Marrakech → Ouarzazate', desc: 'Cross the High Atlas Mountains via Tizi n\'Tichka pass.', content: 'Start your journey from Marrakech, driving through beautiful Berber villages. Visit the UNESCO World Heritage site of Ait Benhaddou before arriving in Ouarzazate.', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=800&q=80' },
          { title: 'Day 2: Draa Valley & Zagora', desc: 'Drive through palm groves and volcanic landscapes.', content: 'Travel through the lush Draa Valley, lined with date palms. Arrive in Zagora for a camel trek into the desert camp.', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80' },
          { title: 'Day 3: Merzouga Sahara Dunes', desc: 'Deep Sahara exploration and overnight in a luxury camp.', content: 'Head further east to the iconic golden dunes of Erg Chebbi in Merzouga. Experience traditional Berber music and hospitality around the campfire.', image: 'https://images.unsplash.com/photo-1534534573898-db5148bc8b0c?w=800&q=80' },
          { title: 'Day 4: Todra Gorge & Dades', desc: 'Walk under the towering limestone cliffs.', content: 'Wake up early for a spectacular desert sunrise, then travel to the dramatic Todra Gorges and Dades Valley.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80' },
          { title: 'Day 5: Return to Marrakech', desc: 'Scenic drive back through the High Atlas.', content: 'Enjoy your final breakfast in the mountains before returning to Marrakech, arriving in the late afternoon.', image: 'https://images.unsplash.com/photo-1539020140153-e479b8f22cc5?w=800&q=80' }
        ]
      },
      { id: 2, slug: 'sahara-desert-quad', title: 'Agafay Desert: Quad, Dromedary & Dinner – Premium', destination: 'Agafay', duration: '1 Day', price: 89, rating: 4.9, reviews: 78, image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80', gallery: [], category: 'excursion', featured: true, active: true, description: 'An unforgettable premium desert experience with quad biking, dromedary riding, and a magical dinner under the stars.', itinerary: ['09:00 – Pickup from Marrakech', '10:30 – Quad biking in Agafay', '14:00 – Dromedary ride & sunset', '19:00 – Berber dinner under stars', '22:00 – Return to Marrakech'], included: ['Transport', 'Quad bike', 'Dromedary ride', 'Dinner', 'Show'], excluded: ['Personal expenses', 'Tips'], maxPeople: 20, discount: 10, createdAt: '2026-01-20' },
      { id: 3, slug: 'marrakech-city-tour', title: 'Marrakech City Tour – Full Day Discovery', destination: 'Marrakech', duration: '1 Day', price: 45, rating: 4.7, reviews: 124, image: 'https://images.unsplash.com/photo-1539020140153-e479b8f22cc5?w=800&q=80', gallery: [], category: 'city-tour', featured: true, active: true, description: 'Discover the magical medina, souks, palaces, and gardens of Marrakech with an expert local guide.', itinerary: ['09:00 – Djemaa el-Fna', '10:30 – Koutoubia Mosque', '11:30 – Souks & Spice Market', '13:00 – Lunch at local restaurant', '15:00 – Bahia Palace', '16:30 – Majorelle Garden', '18:00 – Drop-off'], included: ['Guide', 'Transport', 'Entry fees', 'Mint tea'], excluded: ['Lunch', 'Shopping'], maxPeople: 15, discount: 0, createdAt: '2026-02-01' },
      { id: 4, slug: 'essaouira-day-trip', title: 'Essaouira – Atlantic Coast Day Trip', destination: 'Essaouira', duration: '1 Day', price: 65, rating: 4.6, reviews: 56, image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', gallery: [], category: 'excursion', featured: false, active: true, description: 'Visit the enchanting blue-and-white coastal town of Essaouira, a UNESCO World Heritage site.', itinerary: ['08:00 – Depart Marrakech', '11:00 – Arrive Essaouira', '11:30 – Medina & Ramparts walk', '13:00 – Fresh seafood lunch', '15:00 – Souks & artisan shops', '16:30 – Depart to Marrakech', '19:30 – Arrive Marrakech'], included: ['Transport', 'Guide'], excluded: ['Lunch', 'Entry fees'], maxPeople: 18, discount: 0, createdAt: '2026-02-10' },
      { id: 5, slug: 'fes-medina-2-days', title: 'Fes Medina Discovery – 2 Days', destination: 'Fes', duration: '2 Days', price: 180, rating: 4.8, reviews: 33, image: 'https://images.unsplash.com/photo-1582461869685-ced5ea14c3a0?w=800&q=80', gallery: [], category: 'circuit', featured: false, active: true, description: 'Explore Fes el-Bali, the world\'s largest car-free urban area and a living medieval city.', itinerary: ['Day 1: Arrival, medina walk, tanneries', 'Day 2: Madrasa Bou Inania, souks, departure'], included: ['Transport', 'Guide', 'Hotel', 'Breakfast'], excluded: ['Lunches', 'Personal'], maxPeople: 10, discount: 5, createdAt: '2026-02-15' },
      { id: 6, slug: 'imperial-cities-8-days', title: 'Imperial Cities Grand Tour – 8 Days', destination: 'Multiple', duration: '8 Days', price: 1200, rating: 4.9, reviews: 18, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80', gallery: [], category: 'circuit', featured: true, active: true, description: 'The ultimate Morocco experience: Casablanca, Rabat, Fes, Meknes, and Marrakech in one grand tour.', itinerary: ['Day 1: Casablanca', 'Day 2: Rabat', 'Day 3-4: Fes', 'Day 5: Meknes & Volubilis', 'Day 6-7: Marrakech', 'Day 8: Departure'], included: ['All transport', 'Guide', 'Hotels', 'Breakfast & Dinner'], excluded: ['Flights', 'Lunches'], maxPeople: 12, discount: 15, createdAt: '2026-03-01' },
    ],

    hotels: [
      { id: 1, name: 'Riad Dar Atlas', destination: 'Marrakech', stars: 5, price: 150, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', description: 'A stunning 5-star riad in the heart of Marrakech medina with rooftop pool and traditional Moroccan decor.', amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Air Conditioning'], featured: true, active: true, rooms: 12 },
      { id: 2, name: 'Kasbah du Toubkal', destination: 'Atlas Mountains', stars: 4, price: 95, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', description: 'Perched high in the Atlas Mountains, this mountain lodge offers breathtaking views and authentic Berber hospitality.', amenities: ['Mountain Views', 'Restaurant', 'WiFi', 'Trekking'], featured: true, active: true, rooms: 8 },
      { id: 3, name: 'Sahara Luxury Camp', destination: 'Merzouga', stars: 4, price: 120, image: 'https://images.unsplash.com/photo-1534534573898-db5148bc8b0c?w=800&q=80', description: 'Experience the magic of sleeping under the Sahara stars in luxury desert tents with all modern comforts.', amenities: ['Camel Ride', 'Stargazing', 'Traditional Food', 'Music'], featured: true, active: true, rooms: 20 },
      { id: 4, name: 'La Sultana Marrakech', destination: 'Marrakech', stars: 5, price: 220, image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80', description: 'Five connected 17th-century riads forming one of the most luxurious boutique hotels in Marrakech.', amenities: ['Pool', 'Spa', 'Restaurant', 'Bar', 'WiFi'], featured: false, active: true, rooms: 28 },
    ],

    destinations: [
      { id: 1, name: 'Marrakech', country: 'Morocco', image: 'https://images.unsplash.com/photo-1539020140153-e479b8f22cc5?w=800&q=80', description: 'The Red City — a vibrant imperial city full of souks, palaces, and ancient medinas.', tours: 12, featured: true, active: true },
      { id: 2, name: 'Sahara Desert', country: 'Morocco', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80', description: 'The world\'s largest hot desert, with golden dunes stretching to the horizon.', tours: 8, featured: true, active: true },
      { id: 3, name: 'Fes', country: 'Morocco', image: 'https://images.unsplash.com/photo-1582461869685-ced5ea14c3a0?w=800&q=80', description: 'Home to the world\'s oldest university and the largest car-free urban zone.', tours: 6, featured: true, active: true },
      { id: 4, name: 'Essaouira', country: 'Morocco', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', description: 'A UNESCO World Heritage coastal city known for its blue and white architecture.', tours: 4, featured: true, active: true },
      { id: 5, name: 'Chefchaouen', country: 'Morocco', image: 'https://images.unsplash.com/photo-1553603229-45b0b8fca94b?w=800&q=80', description: 'The Blue City — a magical mountain town draped in shades of blue and white.', tours: 3, featured: false, active: true },
      { id: 6, name: 'Atlas Mountains', country: 'Morocco', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', description: 'Majestic mountain range with Berber villages, trekking trails, and stunning vistas.', tours: 5, featured: false, active: true },
    ],

    reservations: [
      { id: 330, tourId: 3, tourName: 'Marrakech City Tour', customer: 'Ahmed Bennani', email: 'ahmed@example.com', phone: '+212 6 12 34 56 78', people: 2, date: '2026-06-20', total: 90, paid: 0, coupon: '', status: 'In Progress', notes: '', createdAt: '2026-06-14 10:22' },
      { id: 329, tourId: 1, tourName: 'Circuit Aït Bougamez – 5 Days', customer: 'Fatima Alaoui', email: 'fatima@example.com', phone: '+212 6 98 76 54 32', people: 4, date: '2026-07-01', total: 1996, paid: 0, coupon: '', status: 'In Progress', notes: 'Vegetarian meals required', createdAt: '2026-06-11 16:01' },
      { id: 328, tourId: 2, tourName: 'Agafay Desert Premium', customer: 'Youssef Tazi', email: 'youssef@example.com', phone: '+212 6 55 44 33 22', people: 2, date: '2026-06-18', total: 178, paid: 89, coupon: 'SUMMER10', status: 'Confirmed', notes: '', createdAt: '2026-06-10 09:15' },
      { id: 305, tourId: 1, tourName: 'Circuit Aït Bougamez – 5 Days', customer: 'Karima Haddad', email: 'karima@example.com', phone: '+212 6 11 22 33 44', people: 1, date: '2026-06-25', total: 499, paid: 0, coupon: '', status: 'In Progress', notes: '', createdAt: '2026-05-16 11:59' },
      { id: 301, tourId: 2, tourName: 'Agafay Desert Premium', customer: 'Omar El Fassi', email: 'omar@example.com', phone: '+212 6 77 88 99 00', people: 1, date: '2026-06-15', total: 49, paid: 0, coupon: '', status: 'In Progress', notes: '', createdAt: '2026-05-15 13:20' },
      { id: 288, tourId: 6, tourName: 'Imperial Cities Grand Tour – 8 Days', customer: 'Karim Alaoui', email: 'karim@example.com', phone: '+212 6 66 55 44 33', people: 1, date: '2026-07-10', total: 749, paid: 0, coupon: '', status: 'In Progress', notes: '', createdAt: '2026-05-04 17:30' },
    ],

    reviews: [
      { id: 1, tourId: 1, tourName: 'Circuit Aït Bougamez', author: 'Ahmed B.', email: 'ahmed@example.com', rating: 5, text: 'An absolutely incredible experience! The guide was professional and the scenery breathtaking. Highly recommend!', date: '2026-06-12', approved: true },
      { id: 2, tourId: 2, tourName: 'Agafay Desert', author: 'Sarah M.', email: 'sarah@example.com', rating: 5, text: 'Unforgettable adventure! The Sahara at sunset is pure magic. Everything was perfectly organized.', date: '2026-06-08', approved: true },
      { id: 3, tourId: 3, tourName: 'Marrakech City Tour', author: 'Karim T.', email: 'karim@example.com', rating: 4, text: 'Great tour with knowledgeable guides. The medina walk was fascinating. Would definitely book again.', date: '2026-06-05', approved: true },
      { id: 4, tourId: 4, tourName: 'Essaouira Day Trip', author: 'Leila H.', email: 'leila@example.com', rating: 5, text: 'Beautiful coastal town! The wind, the colors, the fish market — everything was amazing.', date: '2026-05-30', approved: true },
      { id: 5, tourId: 2, tourName: 'Agafay Desert', author: 'Omar F.', email: 'omar@example.com', rating: 4, text: 'Fes is like stepping back in time. Our guide knew every corner. A bit tiring but totally worth it!', date: '2026-05-22', approved: false },
      { id: 6, tourId: 2, tourName: 'Agafay Desert', author: 'Nadia B.', email: 'nadia@example.com', rating: 5, text: 'The dinner under the stars was absolutely magical. Top-notch service and stunning landscape. 10/10!', date: '2026-05-18', approved: true },
    ],

    coupons: [
      { id: 1, code: 'SUMMER10', type: 'percent', value: 10, minAmount: 50, used: 3, limit: 50, expiry: '2026-08-31', active: true },
      { id: 2, code: 'WELCOME20', type: 'percent', value: 20, minAmount: 100, used: 1, limit: 20, expiry: '2026-12-31', active: true },
      { id: 3, code: 'FLAT50', type: 'fixed', value: 50, minAmount: 200, used: 0, limit: 10, expiry: '2026-07-31', active: true },
      { id: 4, code: 'VIPTRAVEL', type: 'percent', value: 30, minAmount: 500, used: 2, limit: 5, expiry: '2026-06-30', active: false },
    ],

    users: [
      { id: 1, name: 'Admin User', email: 'hamzadehabaz' + '@gmail.com', password: 'Hamza' + '123', role: 'Administrator', status: 'active', joined: '2025-01-01', avatar: 'A' },
      { id: 2, name: 'Sara Manager', email: 'sara' + '@tourvoyage.com', password: 'admin', role: 'Manager', status: 'active', joined: '2025-03-15', avatar: 'S' },
      { id: 3, name: 'Karim Agent', email: 'karim' + '@tourvoyage.com', password: 'admin', role: 'Agent', status: 'active', joined: '2025-06-01', avatar: 'K' },
      { id: 4, name: 'Test User', email: 'test' + '@example.com', password: 'admin', role: 'Customer', status: 'inactive', joined: '2026-01-10', avatar: 'T' },
    ],

    seo: {
      'home':         { title: 'TourVoyage – Discover Morocco | Premium Travel Experiences', description: 'Explore Morocco with expert guides. Book tours, circuits, hotels and desert experiences. Best prices guaranteed.', keywords: 'Morocco tours, Marrakech, Sahara desert, travel packages, circuits', ogTitle: 'TourVoyage – Premium Morocco Travel', ogDescription: 'Discover the magic of Morocco with our expert-guided tours.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"TravelAgency","name":"TourVoyage","description":"Explore Morocco with expert guides. Book tours, circuits, hotels and desert experiences. Best prices guaranteed.","url":"https://yourdomain.com","telephone":"+212 5 24 00 00 00","email":"contact@tourvoyage.com","address":{"@type":"PostalAddress","streetAddress":"15 Rue de la Liberté","addressLocality":"Marrakech","postalCode":"40000","addressCountry":"MA"}}' },
      'tours':        { title: 'All Tours & Circuits | TourVoyage Morocco', description: 'Browse our complete collection of Morocco tours, circuits, excursions and day trips. Filter by destination, duration and price.', keywords: 'Morocco tours, circuits, excursions, day trips, Marrakech tours', ogTitle: 'Morocco Tours & Circuits', ogDescription: 'Find your perfect Morocco tour.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"ItemList","name":"Morocco Tours & Circuits","description":"Browse our complete collection of Morocco tours, circuits, excursions and day trips."}' },
      'destinations': { title: 'Top Destinations in Morocco | TourVoyage', description: 'Explore the most beautiful destinations in Morocco: Marrakech, Sahara, Fes, Essaouira, Chefchaouen and more.', keywords: 'Morocco destinations, Marrakech, Sahara, Fes, Essaouira, Chefchaouen', ogTitle: 'Morocco Top Destinations', ogDescription: 'Discover Morocco\'s most iconic destinations.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"WebPage","name":"Top Destinations in Morocco | TourVoyage","description":"Explore the most beautiful destinations in Morocco: Marrakech, Sahara, Fes, Essaouira, Chefchaouen and more."}' },
      'hotels':       { title: 'Best Hotels & Riads in Morocco | TourVoyage', description: 'Stay in Morocco\'s finest riads, desert camps and mountain lodges. Hand-picked accommodations for every budget.', keywords: 'Morocco hotels, riads, desert camps, Marrakech accommodation', ogTitle: 'Morocco Hotels & Riads', ogDescription: 'Find the perfect place to stay in Morocco.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"WebPage","name":"Best Hotels & Riads in Morocco | TourVoyage","description":"Stay in Morocco\'s finest riads, desert camps and mountain lodges."}' },
      'cars':         { title: 'Premium Car Rental & 4x4 Fleet | TourVoyage Morocco', description: 'Rent a car in Morocco at the best price. Explore Marrakech, Atlas Mountains and desert roads in our reliable 4x4 and economy fleet.', keywords: 'car rental Morocco, 4x4 rent, Marrakech car hire, SUV rental', ogTitle: 'Morocco Premium Car Rental', ogDescription: 'Explore Morocco at your own pace with our reliable fleet.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"WebPage","name":"Premium Car Rental & 4x4 Fleet | TourVoyage Morocco","description":"Explore Morocco at your own pace with our reliable fleet."}' },
      'about':        { title: 'About TourVoyage – Your Morocco Travel Experts', description: 'Learn about TourVoyage, our team of passionate local experts, and our commitment to authentic Morocco travel experiences.', keywords: 'about us, travel agency Morocco, local guides, authentic travel', ogTitle: 'About TourVoyage', ogDescription: 'Your trusted Morocco travel experts.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"AboutPage","name":"About TourVoyage – Your Morocco Travel Experts","description":"Learn about TourVoyage, our team of passionate local experts, and our commitment to authentic Morocco travel experiences."}' },
      'contact':      { title: 'Contact TourVoyage – Book Your Morocco Adventure', description: 'Get in touch with our travel experts. Book your Morocco tour, ask questions, or request a custom itinerary.', keywords: 'contact, book tour Morocco, travel inquiry, custom itinerary', ogTitle: 'Contact TourVoyage', ogDescription: 'Book your Morocco adventure today.', ogImage: '', canonical: '', noindex: false, schema: '{"@context":"https://schema.org","@type":"ContactPage","name":"Contact TourVoyage – Book Your Morocco Adventure","description":"Get in touch with our travel experts. Book your Morocco tour, ask questions, or request a custom itinerary."}' },
    },

    settings: {
      siteName: 'TourVoyage',
      tagline: 'With Expert Local Guides',
      email: 'contact@tourvoyage.com',
      phone: '+212 5 24 00 00 00',
      address: '15 Rue de la Liberté, Marrakech 40000, Morocco',
      facebook: 'https://facebook.com/tourvoyage',
      instagram: 'https://instagram.com/tourvoyage',
      twitter: 'https://twitter.com/tourvoyage',
      youtube: '',
      whatsapp: '+212600000000',
      currency: 'EUR',
      currencySymbol: '€',
      googleAnalytics: '',
      primaryColor: '#6c63ff',
      accentColor: '#14b8a6',
      logoText: 'TourVoyage',
      websiteUrl: 'website/index.html',
      googleSheetUrl: '',
      maintenanceMode: false,
      logo: 'website/images/logo.png',
      favicon: 'website/images/favicon.png',
      theme: {
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
      }
    },

    menu: [
      { id: 1, label: 'Home', url: 'index.html', order: 1, active: true },
      { id: 2, label: 'Tours', url: 'tours.html', order: 2, active: true },
      { id: 3, label: 'Car Rental', url: 'cars.html', order: 3, active: true },
      { id: 4, label: 'Destinations', url: 'destinations.html', order: 4, active: true },
      { id: 5, label: 'Hotels', url: 'hotels.html', order: 5, active: true },
      { id: 6, label: 'About', url: 'about.html', order: 6, active: true },
      { id: 7, label: 'Contact', url: 'contact.html', order: 7, active: true },
    ],

    redirects: [
      { id: 1, from: '/old-tours', to: '/tours.html', type: '301', active: true },
    ],

    robots: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://yourdomain.com/sitemap.xml`,

    media: [],
    subscribers: [
      { email: 'traveler1@gmail.com', createdAt: '2026-06-12 10:22' },
      { email: 'desertfan@yahoo.com', createdAt: '2026-06-13 14:05' },
      { email: 'riadseeker@outlook.com', createdAt: '2026-06-14 09:12' }
    ],
    cars: [
      { id: 1, name: "Dacia Duster 4x4", type: "SUV", transmission: "Manual", fuel: "Diesel", doors: 4, seats: 5, pricePerDay: 45, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", active: true, featured: true, description: "Highly reliable 4x4 SUV perfect for crossing mountain passes and desert roads in absolute comfort." },
      { id: 2, name: "Hyundai i10", type: "Economy", transmission: "Manual", fuel: "Gasoline", doors: 4, seats: 5, pricePerDay: 25, image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80", active: true, featured: true, description: "Compact and extremely fuel-efficient city car, ideal for navigating old streets and parking in tight spaces." },
      { id: 3, name: "Mercedes C-Class Sedan", type: "Luxury", transmission: "Automatic", fuel: "Diesel", doors: 4, seats: 5, pricePerDay: 85, image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80", active: true, featured: false, description: "Premium automatic sedan offering absolute luxury, smooth performance, and high-end highway cruising." }
    ],
    popups: [
      {
        id: 1,
        title: "Discover Morocco's Imperial Cities and Atlas Wonders",
        content: "Get an exclusive 15% discount on all bookings this week! Use coupon <strong>WELCOME20</strong> at checkout.",
        image: "https://images.unsplash.com/photo-1539650116574-75c0c6d38a7a?w=800&q=80",
        status: "Draft",
        targetPage: "all",
        createdAt: "2025-09-04"
      }
    ],
  };

  // ─── Core API ─────────────────────────────────────────────────────────────

  function _load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('tm_data_change', { detail: { key } }));
    } catch (e) { console.error('TM save error:', e); }
  }

  function get(key) {
    const stored = _load(KEYS[key]);
    if (stored !== null) return stored;
    // First run: seed defaults
    _save(KEYS[key], DEFAULTS[key]);
    return DEFAULTS[key];
  }

  function set(key, data) {
    _save(KEYS[key], data);
  }

  function getAll() {
    const result = {};
    Object.keys(KEYS).forEach(k => { result[k] = get(k); });
    return result;
  }

  // ─── CRUD Helpers ─────────────────────────────────────────────────────────

  function addItem(key, item) {
    const list = get(key);
    const maxId = list.length ? Math.max(...list.map(i => i.id || 0)) : 0;
    item.id = maxId + 1;
    item.createdAt = item.createdAt || new Date().toISOString().split('T')[0];
    list.unshift(item);
    set(key, list);
    
    // Automatically backup reservations, users, or subscribers if configured
    if (['reservations', 'users', 'subscribers'].includes(key)) {
      triggerGoogleSheetSync(key, item, 'upsert');
    }

    return item;
  }

  function updateItem(key, id, updates) {
    const list = get(key);
    const idx = list.findIndex(i => i.id == id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    set(key, list);

    if (['reservations', 'users', 'subscribers'].includes(key)) {
      triggerGoogleSheetSync(key, list[idx], 'upsert');
    }

    return list[idx];
  }

  function deleteItem(key, id) {
    const list = get(key);
    const filtered = list.filter(i => i.id != id);
    set(key, filtered);

    if (['reservations', 'users', 'subscribers'].includes(key)) {
      triggerGoogleSheetSync(key, { id: id }, 'delete');
    }
  }

  function getItem(key, id) {
    return get(key).find(i => i.id == id) || null;
  }

  function getBySlug(key, slug) {
    return get(key).find(i => i.slug === slug) || null;
  }

  // ─── SEO Helpers ─────────────────────────────────────────────────────────

  function getSEO(page) {
    const all = get('seo');
    return all[page] || { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '', noindex: false, schema: '' };
  }

  function setSEO(page, data) {
    const all = get('seo');
    all[page] = { ...getSEO(page), ...data };
    set('seo', all);
  }

  function applySEO(page) {
    const seo = getSEO(page);
    if (seo.title)       document.title = seo.title;
    if (seo.description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
      m.content = seo.description;
    }
    if (seo.keywords) {
      let m = document.querySelector('meta[name="keywords"]');
      if (!m) { m = document.createElement('meta'); m.name = 'keywords'; document.head.appendChild(m); }
      m.content = seo.keywords;
    }
    // OG tags
    const ogFields = { 'og:title': seo.ogTitle || seo.title, 'og:description': seo.ogDescription || seo.description, 'og:image': seo.ogImage };
    Object.entries(ogFields).forEach(([prop, content]) => {
      if (!content) return;
      let m = document.querySelector(`meta[property="${prop}"]`);
      if (!m) { m = document.createElement('meta'); m.setAttribute('property', prop); document.head.appendChild(m); }
      m.content = content;
    });
    if (seo.noindex) {
      let m = document.querySelector('meta[name="robots"]');
      if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
      m.content = 'noindex, nofollow';
    }
    if (seo.schema) {
      let s = document.getElementById('tm-schema');
      if (!s) { s = document.createElement('script'); s.id = 'tm-schema'; s.type = 'application/ld+json'; document.head.appendChild(s); }
      s.textContent = seo.schema;
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────────────
  function getStats() {
    const res = get('reservations');
    const tours = get('tours');
    const hotels = get('hotels');
    const dests = get('destinations');
    const settings = get('settings');
    const sym = settings.currencySymbol || '€';

    const totalRevenue = res.reduce((s, r) => s + (r.total || 0), 0);
    const totalPaid    = res.reduce((s, r) => s + (r.paid  || 0), 0);

    return {
      revenue:      totalRevenue,
      earnings:     totalPaid,
      reservations: res.length,
      services:     tours.length + hotels.length,
      tours:        tours.length,
      hotels:       hotels.length,
      destinations: dests.length,
      currencySymbol: sym,
    };
  }

  // ─── Coupon validation ────────────────────────────────────────────────────
  function validateCoupon(code, amount) {
    const coupons = get('coupons');
    const c = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!c) return { valid: false, message: 'Invalid coupon code' };
    if (c.used >= c.limit) return { valid: false, message: 'Coupon usage limit reached' };
    if (new Date(c.expiry) < new Date()) return { valid: false, message: 'Coupon has expired' };
    if (amount < c.minAmount) return { valid: false, message: `Minimum order amount is ${amount < c.minAmount ? c.minAmount : amount}` };
    const discount = c.type === 'percent' ? (amount * c.value / 100) : c.value;
    return { valid: true, code: c.code, discount: Math.min(discount, amount), type: c.type, value: c.value };
  }

  // ─── Generate sitemap XML ─────────────────────────────────────────────────
  function generateSitemap(baseUrl = 'https://yourdomain.com') {
    const tours = get('tours').filter(t => t.active);
    const pages = [
      { loc: `${baseUrl}/website/index.html`,        changefreq: 'weekly',  priority: '1.0' },
      { loc: `${baseUrl}/website/tours.html`,        changefreq: 'daily',   priority: '0.9' },
      { loc: `${baseUrl}/website/destinations.html`, changefreq: 'weekly',  priority: '0.8' },
      { loc: `${baseUrl}/website/hotels.html`,       changefreq: 'weekly',  priority: '0.8' },
      { loc: `${baseUrl}/website/about.html`,        changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/website/contact.html`,      changefreq: 'monthly', priority: '0.7' },
      ...tours.map(t => ({ loc: t.slug ? `${baseUrl}/tours/${t.slug}` : `${baseUrl}/website/tour-detail.html?id=${t.id}`, changefreq: 'weekly', priority: '0.85' })),
    ];
    const today = new Date().toISOString().split('T')[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  }

  // ─── Reset to defaults ────────────────────────────────────────────────────
  function resetAll() {
    Object.keys(KEYS).forEach(k => _save(KEYS[k], DEFAULTS[k]));
  }

  function triggerGoogleSheetSync(key, item, action = 'upsert') {
    try {
      const settings = get('settings');
      const syncUrl = settings.googleSheetUrl;
      if (!syncUrl || !syncUrl.startsWith('http')) return;
      
      fetch(syncUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: key, data: item, action: action })
      }).catch(err => console.error('Google Sheet sync failed', err));
    } catch (e) {
      console.error('Google Sheet sync error:', e);
    }
  }

  function getGoogleSheetUrl() {
    try {
      const settings = get('settings');
      if (settings && settings.googleSheetUrl) {
        return settings.googleSheetUrl.trim();
      }
    } catch (e) {}
    return (GOOGLE_SHEET_URL || '').trim();
  }

  function autoRestoreFromGoogleSheets() {
    const syncUrl = getGoogleSheetUrl();
    if (!syncUrl || !syncUrl.startsWith('http')) return;

    const currentReservations = _load(KEYS.reservations);
    const currentSubscribers = _load(KEYS.subscribers);

    const isReservationsEmpty = !currentReservations || currentReservations.length === 0;
    const isSubscribersEmpty = !currentSubscribers || currentSubscribers.length === 0;

    if (isReservationsEmpty || isSubscribersEmpty) {
      console.log('Local storage empty or cleared. Auto-restoring from Google Sheets...');
      pullFromGoogleSheets();
    }
  }

  function pullFromGoogleSheets() {
    const syncUrl = getGoogleSheetUrl();
    if (!syncUrl || !syncUrl.startsWith('http')) return Promise.reject('No URL configured');

    return fetch(syncUrl)
      .then(res => res.json())
      .then(res => {
        if (res.result === 'success' && res.data) {
          const data = res.data;
          
          if (data.reservations && data.reservations.length > 0) {
            data.reservations.forEach(r => {
              if (r.id) r.id = Number(r.id);
              if (r.people) r.people = Number(r.people);
              if (r.total) r.total = Number(r.total);
              if (r.paid) r.paid = Number(r.paid);
              if (r.tourId) r.tourId = Number(r.tourId);
            });
            const merged = mergeLists(get('reservations') || [], data.reservations, 'id');
            set('reservations', merged);
          }
          
          if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
              if (u.id) u.id = Number(u.id);
            });
            const merged = mergeLists(get('users') || [], data.users, 'id');
            set('users', merged);
          }
          
          if (data.subscribers && data.subscribers.length > 0) {
            const merged = mergeLists(get('subscribers') || [], data.subscribers, 'email');
            set('subscribers', merged);
          }
          
          console.log('Auto-restore from Google Sheets completed successfully!');
          window.dispatchEvent(new CustomEvent('tm_data_restored'));
          return true;
        }
        return false;
      })
      .catch(err => {
        console.error('Failed to auto-restore from Google Sheets:', err);
      });
  }

  function mergeLists(local, remote, uniqueKey) {
    const map = new Map();
    remote.forEach(item => {
      if (item[uniqueKey]) {
        let keyVal = String(item[uniqueKey]).toLowerCase();
        map.set(keyVal, item);
      }
    });
    local.forEach(item => {
      if (item[uniqueKey]) {
        let keyVal = String(item[uniqueKey]).toLowerCase();
        if (!map.has(keyVal)) {
          map.set(keyVal, item);
        }
      }
    });
    return Array.from(map.values());
  }

  // Public API
  return { get, set, getAll, addItem, updateItem, deleteItem, getItem, getBySlug, getSEO, setSEO, applySEO, getStats, validateCoupon, generateSitemap, resetAll, KEYS, triggerGoogleSheetSync, pullFromGoogleSheets, autoRestoreFromGoogleSheets };

})();

// Make available globally
window.TM = TM;

// Auto-restore asynchronously on load
setTimeout(() => {
  if (typeof TM.autoRestoreFromGoogleSheets === 'function') {
    TM.autoRestoreFromGoogleSheets();
  }
}, 200);
