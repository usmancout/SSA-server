const Product = require('../models/product.model');
const { analyzeReviewsWithRealBERT, BERT_MODEL_ID } = require('./bert.service');

const MARTS = [
  { id: 'mart1', store: 'Martello', name: 'Martello Downtown', address: 'Johar Town Main Blvd, Lahore', lat: 31.4697, lng: 74.2728, rating: 4.7 },
  { id: 'mart2', store: 'Martello', name: 'Martello West', address: 'Wapda Town Roundabout, Lahore', lat: 31.4312, lng: 74.2644, rating: 4.4 },
  { id: 'mart3', store: 'Prodexa', name: 'Prodexa Central', address: 'MM Alam Road, Gulberg III, Lahore', lat: 31.5102, lng: 74.3441, rating: 4.8 },
  { id: 'mart4', store: 'Storenta', name: 'Storenta Plaza', address: 'DHA Phase 5 Commercial, Lahore', lat: 31.4625, lng: 74.4085, rating: 4.2 },
];

const MART_MAP = Object.fromEntries(MARTS.map(m => [m.id, m]));

// Templates to generate raw customer reviews per store offer (passed into the real BERT model during seeding)
function buildStoreReviews(productName, storeName, scenario) {
  if (scenario === 'high_fake_inflation') {
    return [
      {
        user: 'ShopBot_99',
        rating: 5,
        text: `Best product ever!!! 100% original ${productName} from ${storeName} buy now A++++ super fast!!`,
        date: '1 day ago'
      },
      {
        user: 'PromoUser_21',
        rating: 5,
        text: `Superb amazing awesome!! Best store in the world highly recommend to everyone five stars!!`,
        date: '3 days ago'
      },
      {
        user: 'SubtlePromo_8',
        rating: 5,
        text: `Everything is perfect about this ${productName}, best price in the city, no complaints at all, 10/10.`,
        date: '4 days ago'
      },
      {
        user: 'Usman K.',
        rating: 2,
        text: `Visited ${storeName} for the low price on ${productName}, but the seal was already broken and staff refused warranty claim.`,
        date: '5 days ago'
      },
      {
        user: 'Ayesha T.',
        rating: 3,
        text: `Price was cheap and close to my area, but box had dents and waiting time at the counter was 40 minutes.`,
        date: '1 week ago'
      }
    ];
  }

  if (scenario === 'genuine_top_quality') {
    return [
      {
        user: 'Faseeh M.',
        rating: 5,
        text: `Picked up ${productName} from ${storeName}. Factory sealed, verified serial number at the counter, and smooth billing.`,
        date: '2 days ago'
      },
      {
        user: 'Ahsan R.',
        rating: 5,
        text: `Slightly farther drive for me, but ${storeName} had the lowest genuine price and full 1-year official warranty card.`,
        date: '4 days ago'
      },
      {
        user: 'Zainab H.',
        rating: 4,
        text: `Original ${productName} in stock. Parking was a bit crowded in the evening, otherwise 5/5 experience.`,
        date: '1 week ago'
      },
      {
        user: 'AutoReviewer_4',
        rating: 5,
        text: `Must buy immediately!! Great deal super nice A++++!`,
        date: '2 weeks ago'
      }
    ];
  }

  // 'balanced_store'
  return [
    {
      user: 'Bilal S.',
      rating: 4,
      text: `${storeName} is very close to my house so convenient for picking up ${productName}, though their price is a bit higher than other marts.`,
      date: '3 days ago'
    },
    {
      user: 'Hira N.',
      rating: 5,
      text: `Authentic stock and helpful staff at ${storeName}. Tested the ${productName} before leaving the store.`,
      date: '6 days ago'
    },
    {
      user: 'BoostAccount_12',
      rating: 5,
      text: `Best product ever buy now 100% original!!`,
      date: '1 week ago'
    }
  ];
}

// Helper to create product offers across selected marts
function makeOffers(config) {
  const martDefaults = {
    mart1: { store: 'Martello', delivery: '30-min express', url: 'https://martello.vercel.app' },
    mart2: { store: 'Martello', delivery: 'Same-day delivery', url: 'https://martello.vercel.app' },
    mart3: { store: 'Prodexa', delivery: '2-hour delivery', url: 'https://prodexa.vercel.app' },
    mart4: { store: 'Storenta', delivery: 'Same-day pickup', url: 'https://storenta.vercel.app' },
  };
  return config.map(c => ({
    store: martDefaults[c.martId].store,
    martId: c.martId,
    price: c.price,
    originalPrice: c.originalPrice,
    reviewCount: c.reviewCount || 180,
    scenario: c.scenario || 'balanced_store',
    inStock: true,
    stockCount: c.stockCount || 12,
    deliveryEstimate: martDefaults[c.martId].delivery,
    url: martDefaults[c.martId].url
  }));
}

// 50 Products across 4 Marts (Martello Downtown, Martello West, Prodexa Central, Storenta Plaza)
const INITIAL_PRODUCTS = [
  // ==================== ELECTRONICS (16 Products) ====================
  {
    productId: 'prod-iphone-16-pro-max',
    name: 'iPhone 16 Pro Max (256GB)',
    brand: 'Apple',
    category: 'Electronics',
    description: 'Grade 5 titanium design with A18 Pro chip, Camera Control button, 48MP Fusion camera, and 4K 120fps Dolby Vision.',
    image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 4120,
    features: ['A18 Pro 3nm Chip', 'Camera Control Button', '48MP Ultra Wide + 5x Telephoto', '33-Hour Video Playback'],
    tags: ['smartphone', 'apple', 'iphone', 'iphone 16', '5g', 'camera'],
    offers: makeOffers([
      { martId: 'mart4', price: 1149, originalPrice: 1349, reviewCount: 165, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 1199, originalPrice: 1349, reviewCount: 540, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 1249, originalPrice: 1349, reviewCount: 380, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-iphone-15-pro-max',
    name: 'iPhone 15 Pro Max (256GB)',
    brand: 'Apple',
    category: 'Electronics',
    description: 'Aerospace-grade titanium design with A17 Pro chip, 48MP main camera, and 5x optical zoom.',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 3420,
    features: ['A17 Pro 3nm Chip', 'Aerospace Titanium Design', '48MP Main + 5x Optical Zoom', 'USB-C with USB 3 speeds'],
    tags: ['smartphone', 'apple', 'iphone', '5g', 'camera', 'premium'],
    offers: makeOffers([
      { martId: 'mart4', price: 1049, originalPrice: 1299, reviewCount: 140, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 1099, originalPrice: 1299, reviewCount: 420, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 1149, originalPrice: 1299, reviewCount: 310, scenario: 'balanced_store' },
      { martId: 'mart2', price: 1129, originalPrice: 1299, reviewCount: 270, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra (512GB)',
    brand: 'Samsung',
    category: 'Electronics',
    description: 'Titanium exterior, 200MP quad-telephoto camera system, built-in S Pen, and Snapdragon 8 Gen 3.',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 2740,
    features: ['200MP ProVisual Engine Camera', 'Snapdragon 8 Gen 3 for Galaxy', 'Built-in S Pen & Galaxy AI', 'Corning Gorilla Armor'],
    tags: ['smartphone', 'samsung', 'galaxy', 'android', 'ai', 'camera'],
    offers: makeOffers([
      { martId: 'mart1', price: 1049, originalPrice: 1399, reviewCount: 520, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 1019, originalPrice: 1399, reviewCount: 95, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 1129, originalPrice: 1399, reviewCount: 380, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-samsung-qled-tv-65',
    name: 'Samsung 65" Neo QLED 4K Smart TV',
    brand: 'Samsung',
    category: 'Electronics',
    description: 'Quantum Matrix Technology with Mini LEDs, Neural Quantum Processor 4K, and Dolby Atmos.',
    image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 1120,
    features: ['Quantum Mini LED', 'Neural Quantum Processor 4K', 'Dolby Atmos & Object Tracking Sound', '120Hz Motion Xcelerator'],
    tags: ['tv', 'samsung', 'qled', '4k', 'smart-tv', 'electronics'],
    offers: makeOffers([
      { martId: 'mart2', price: 1199, originalPrice: 1499, reviewCount: 310, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 1249, originalPrice: 1499, reviewCount: 240, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-samsung-buds2-pro',
    name: 'Samsung Galaxy Buds2 Pro Wireless Earbuds',
    brand: 'Samsung',
    category: 'Electronics',
    description: '24-bit Hi-Fi audio, intelligent Active Noise Canceling, and ergonomic water-resistant fit.',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    reviewCount: 890,
    features: ['24-bit Hi-Fi Sound', 'Intelligent Active Noise Cancellation', '360 Audio', 'IPX7 Water Resistance'],
    tags: ['earbuds', 'samsung', 'galaxy', 'audio', 'wireless'],
    offers: makeOffers([
      { martId: 'mart4', price: 149, originalPrice: 229, reviewCount: 115, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-macbook-air-m3',
    name: 'MacBook Air 15" M3 (16GB/512GB)',
    brand: 'Apple',
    category: 'Electronics',
    description: 'Supercharged by the M3 chip with an ultra-thin design, 15.3-inch Liquid Retina display, and 18-hour battery life.',
    image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 1890,
    features: ['Apple M3 8-Core CPU / 10-Core GPU', '18-hour all-day battery', '15.3" Liquid Retina Display', 'MagSafe 3 & 2x Thunderbolt'],
    tags: ['laptop', 'apple', 'macbook', 'm3', 'ultrabook', 'productivity'],
    offers: makeOffers([
      { martId: 'mart3', price: 1229, originalPrice: 1499, reviewCount: 490, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 1279, originalPrice: 1499, reviewCount: 310, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-macbook-pro-m3-max',
    name: 'MacBook Pro 16" M3 Max (36GB/1TB)',
    brand: 'Apple',
    category: 'Electronics',
    description: 'Extreme workstation performance with Liquid Retina XDR display, 14-core CPU, and 30-core GPU.',
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 940,
    features: ['Apple M3 Max Chip', '16.2" Liquid Retina XDR Display', '22-Hour Battery Life', 'SDXC, HDMI & 3x Thunderbolt 4'],
    tags: ['laptop', 'apple', 'macbook', 'pro', 'workstation'],
    offers: makeOffers([
      { martId: 'mart3', price: 2899, originalPrice: 3199, reviewCount: 280, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 2949, originalPrice: 3199, reviewCount: 190, scenario: 'balanced_store' },
      { martId: 'mart4', price: 2799, originalPrice: 3199, reviewCount: 65, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    brand: 'Sony',
    category: 'Electronics',
    description: 'Industry-leading noise cancellation powered by 8 microphones and two processors with 30-hour battery life.',
    image: 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 4120,
    features: ['8-Mic Auto Noise Canceling', '30-Hour Battery + Quick Charge', 'Multipoint Bluetooth Connection', 'Soft Fit Leather'],
    tags: ['headphones', 'sony', 'audio', 'wireless', 'noise-canceling', 'music'],
    offers: makeOffers([
      { martId: 'mart4', price: 299, originalPrice: 399, reviewCount: 115, scenario: 'high_fake_inflation' },
      { martId: 'mart2', price: 319, originalPrice: 399, reviewCount: 430, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 349, originalPrice: 399, reviewCount: 280, scenario: 'balanced_store' },
      { martId: 'mart3', price: 359, originalPrice: 399, reviewCount: 510, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-ps5-slim-console',
    name: 'PlayStation 5 Slim Disc Edition (1TB)',
    brand: 'Sony',
    category: 'Electronics',
    description: 'Lightning-fast loading with an ultra-high-speed 1TB SSD, haptic feedback, adaptive triggers, and 3D Audio.',
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 5390,
    features: ['1TB Custom NVMe SSD', '4K 120Hz Gaming Output', 'DualSense Wireless Controller', 'Ray Tracing & 3D Audio'],
    tags: ['gaming', 'console', 'ps5', 'playstation', 'sony', 'entertainment'],
    offers: makeOffers([
      { martId: 'mart3', price: 459, originalPrice: 549, reviewCount: 840, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 439, originalPrice: 549, reviewCount: 95, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-xbox-series-x',
    name: 'Xbox Series X 1TB 4K Gaming Console',
    brand: 'Microsoft',
    category: 'Electronics',
    description: '12 teraflops of raw graphic processing power, DirectX ray tracing, custom 1TB SSD, and true 4K 120fps gaming.',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 3180,
    features: ['12 Teraflops GPU Power', '1TB Custom NVMe SSD', 'True 4K Gaming up to 120FPS', 'Xbox Velocity Architecture'],
    tags: ['xbox', 'gaming', 'console', 'microsoft', '4k', 'technology'],
    offers: makeOffers([
      { martId: 'mart1', price: 449, originalPrice: 499, reviewCount: 410, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 459, originalPrice: 499, reviewCount: 290, scenario: 'balanced_store' },
      { martId: 'mart4', price: 429, originalPrice: 499, reviewCount: 88, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-nintendo-switch-oled',
    name: 'Nintendo Switch OLED Model (White Joy-Con)',
    brand: 'Nintendo',
    category: 'Electronics',
    description: '7-inch vibrant OLED screen, wide adjustable stand, wired LAN dock port, and 64GB internal storage.',
    image: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 2890,
    features: ['7-Inch OLED Touch Screen', '64GB Internal Storage', 'Enhanced Handheld Audio', 'TV, Tabletop & Handheld Modes'],
    tags: ['nintendo', 'switch', 'gaming', 'console', 'oled'],
    offers: makeOffers([
      { martId: 'mart1', price: 319, originalPrice: 349, reviewCount: 520, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 329, originalPrice: 349, reviewCount: 390, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-ipad-pro-m4',
    name: 'iPad Pro 11" M4 Ultra Retina XDR',
    brand: 'Apple',
    category: 'Electronics',
    description: 'Breakthrough Tandem OLED Ultra Retina XDR display paired with the next-gen M4 chip.',
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 980,
    features: ['Tandem OLED Ultra Retina XDR', 'Apple M4 Chip', '5.3mm Ultra-Thin Enclosure', 'Supports Apple Pencil Pro'],
    tags: ['tablet', 'ipad', 'apple', 'oled', 'design', 'portable'],
    offers: makeOffers([
      { martId: 'mart3', price: 929, originalPrice: 999, reviewCount: 410, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-dell-xps-15-oled',
    name: 'Dell XPS 15 3.5K OLED Laptop (Intel Core Ultra 7)',
    brand: 'Dell',
    category: 'Electronics',
    description: 'CNC machined aluminum & carbon fiber chassis with a stunning 15.6-inch 3.5K OLED InfinityEdge display and RTX 4060.',
    image: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 1240,
    features: ['15.6" 3.5K OLED Touch Display', 'NVIDIA GeForce RTX 4060', '32GB DDR5 RAM + 1TB SSD', 'CNC Machined Aluminum'],
    tags: ['dell', 'xps', 'laptop', 'oled', 'windows', 'rtx'],
    offers: makeOffers([
      { martId: 'mart3', price: 1649, originalPrice: 1899, reviewCount: 320, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 1699, originalPrice: 1899, reviewCount: 210, scenario: 'balanced_store' },
      { martId: 'mart4', price: 1589, originalPrice: 1899, reviewCount: 74, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-airpods-pro-2-usbc',
    name: 'Apple AirPods Pro (2nd Gen) with MagSafe USB-C',
    brand: 'Apple',
    category: 'Electronics',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Conversation Awareness, and personalized spatial audio.',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 6420,
    features: ['Apple H2 Headphone Chip', '2x Active Noise Cancellation', 'Adaptive Transparency Mode', 'IP54 Dust & Water Resistant'],
    tags: ['airpods', 'apple', 'earbuds', 'wireless', 'audio', 'usbc'],
    offers: makeOffers([
      { martId: 'mart1', price: 199, originalPrice: 249, reviewCount: 890, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 205, originalPrice: 249, reviewCount: 540, scenario: 'balanced_store' },
      { martId: 'mart3', price: 209, originalPrice: 249, reviewCount: 710, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 185, originalPrice: 249, reviewCount: 130, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-canon-eos-r6-mark2',
    name: 'Canon EOS R6 Mark II Mirrorless Camera Body',
    brand: 'Canon',
    category: 'Electronics',
    description: '24.2MP full-frame CMOS sensor, 40fps electronic shutter, Dual Pixel CMOS AF II, and 6K oversampled 4K 60p video.',
    image: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 780,
    features: ['24.2MP Full-Frame Sensor', '40fps Continuous Shooting', '8-Stop In-Body Image Stabilizer', '4K 60p 10-Bit Internal Video'],
    tags: ['camera', 'canon', 'mirrorless', 'photography', '4k', 'video'],
    offers: makeOffers([
      { martId: 'mart3', price: 1999, originalPrice: 2499, reviewCount: 290, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 2049, originalPrice: 2499, reviewCount: 185, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-logitech-mx-master-3s',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    brand: 'Logitech',
    category: 'Electronics',
    description: '8K DPI track-on-glass optical sensor, Quiet Click switches, and MagSpeed electromagnetic scrolling.',
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 3910,
    features: ['8000 DPI Optical Sensor', '90% Quieter Clicks', 'MagSpeed Electromagnetic Wheel', 'Multi-Device & Multi-OS Flow'],
    tags: ['mouse', 'logitech', 'wireless', 'office', 'ergonomic', 'accessories'],
    offers: makeOffers([
      { martId: 'mart1', price: 89, originalPrice: 109, reviewCount: 620, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 94, originalPrice: 109, reviewCount: 440, scenario: 'balanced_store' },
      { martId: 'mart4', price: 79, originalPrice: 109, reviewCount: 95, scenario: 'high_fake_inflation' }
    ])
  },

  // ==================== FASHION (10 Products) ====================
  {
    productId: 'prod-nike-jordan-1-retro',
    name: 'Nike Air Jordan 1 Retro High OG',
    brand: 'Nike',
    category: 'Fashion',
    description: 'Iconic heritage court style crafted with full-grain leather overlays and Air-Sole cushioning.',
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 1540,
    features: ['Full-Grain Leather Upper', 'Encapsulated Nike Air Cushioning', 'Solid Rubber Cupsole', 'Classic Wings Logo'],
    tags: ['sneakers', 'shoes', 'nike', 'jordan', 'streetwear', 'fashion'],
    offers: makeOffers([
      { martId: 'mart4', price: 135, originalPrice: 190, reviewCount: 118, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 155, originalPrice: 190, reviewCount: 690, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-adidas-ultraboost-light',
    name: 'Adidas Ultraboost Light Running Sneakers',
    brand: 'Adidas',
    category: 'Fashion',
    description: '30% lighter BOOST midsole material wrapped in a breathable PRIMEKNIT+ textile upper with Continental rubber grip.',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 2140,
    features: ['Light BOOST Cushioning', 'PRIMEKNIT+ Breathable Upper', 'Linear Energy Push System', 'Continental Rubber Outsole'],
    tags: ['adidas', 'sneakers', 'running', 'shoes', 'ultraboost', 'fashion'],
    offers: makeOffers([
      { martId: 'mart1', price: 139, originalPrice: 190, reviewCount: 480, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 145, originalPrice: 190, reviewCount: 310, scenario: 'balanced_store' },
      { martId: 'mart3', price: 149, originalPrice: 190, reviewCount: 520, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-rayban-aviator-classic',
    name: 'Ray-Ban Aviator Classic Polarized Sunglasses',
    brand: 'Ray-Ban',
    category: 'Fashion',
    description: 'Timeless gold-tone metal frame paired with G-15 green polarized crystal lenses for 100% UV protection.',
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 2180,
    features: ['G-15 Polarized Crystal Lenses', '100% UVA/UVB Protection', 'Lightweight Metal Frame', 'Includes Leather Case'],
    tags: ['sunglasses', 'accessories', 'rayban', 'eyewear', 'summer', 'style'],
    offers: makeOffers([
      { martId: 'mart1', price: 159, originalPrice: 221, reviewCount: 420, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 145, originalPrice: 221, reviewCount: 63, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 185, originalPrice: 221, reviewCount: 510, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-levis-trucker-jacket',
    name: 'Levi\'s Vintage Fit Sherpa Trucker Jacket',
    brand: 'Levi\'s',
    category: 'Fashion',
    description: 'The original denim jacket since 1967, winterized with warm quilted sleeve lining and plush sherpa insulation.',
    image: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    reviewCount: 940,
    features: ['100% Cotton Non-Stretch Denim', 'Cozy Sherpa-Lined Collar', 'Signature Metal Buttons', 'Relaxed Vintage Fit'],
    tags: ['jacket', 'denim', 'levis', 'outerwear', 'menswear', 'winter'],
    offers: makeOffers([
      { martId: 'mart2', price: 79, originalPrice: 128, reviewCount: 390, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-fossil-chronograph-watch',
    name: 'Fossil Townsman Automatic Leather Watch',
    brand: 'Fossil',
    category: 'Fashion',
    description: 'Exposed automatic mechanical movement in a 44mm brushed stainless steel case with genuine leather strap.',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 1320,
    features: ['Self-Winding Automatic Movement', 'Skeleton Exhibition Dial', '5 ATM Water Resistant', 'Genuine Leather Strap'],
    tags: ['watch', 'accessories', 'luxury', 'leather', 'fashion', 'automatic'],
    offers: makeOffers([
      { martId: 'mart3', price: 169, originalPrice: 250, reviewCount: 340, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 195, originalPrice: 250, reviewCount: 175, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-tissot-prx-powermatic',
    name: 'Tissot PRX Powermatic 80 Swiss Watch',
    brand: 'Tissot',
    category: 'Fashion',
    description: '1978 integrated-bracelet Swiss design featuring a waffle-patterned dial, sapphire crystal, and 80-hour power reserve.',
    image: 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 1680,
    features: ['Swiss Powermatic 80 Movement', 'Scratch-Resistant Sapphire Crystal', '100m Water Resistance', 'Quick-Release Steel Bracelet'],
    tags: ['watch', 'tissot', 'swiss', 'luxury', 'fashion', 'automatic'],
    offers: makeOffers([
      { martId: 'mart3', price: 625, originalPrice: 725, reviewCount: 410, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 649, originalPrice: 725, reviewCount: 290, scenario: 'balanced_store' },
      { martId: 'mart4', price: 589, originalPrice: 725, reviewCount: 72, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-north-face-nuptse-jacket',
    name: 'The North Face 1996 Retro Nuptse Puffer Jacket',
    brand: 'The North Face',
    category: 'Fashion',
    description: 'Boxy 1996 silhouette packed with lofty 700-fill responsible goose down and water-repellent ripstop fabric.',
    image: 'https://images.pexels.com/photos/6770028/pexels-photo-6770028.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 2450,
    features: ['700-Fill Goose Down Insulation', 'DWR Water-Repellent Finish', 'Stowable 3-Piece Hood', 'Packs into Right Hand Pocket'],
    tags: ['jacket', 'north-face', 'winter', 'puffer', 'outerwear', 'fashion'],
    offers: makeOffers([
      { martId: 'mart1', price: 269, originalPrice: 330, reviewCount: 540, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 279, originalPrice: 330, reviewCount: 380, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-michael-kors-tote-bag',
    name: 'Michael Kors Jet Set Travel Saffiano Leather Tote',
    brand: 'Michael Kors',
    category: 'Fashion',
    description: 'Structured Saffiano leather tote bag with padded center laptop compartment and gold-tone hardware.',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 1930,
    features: ['100% Saffiano Leather', 'Padded 15" Laptop Compartment', 'Top-Zip Closure', 'Gold-Tone Logo Charm'],
    tags: ['bag', 'tote', 'handbag', 'leather', 'michael-kors', 'fashion'],
    offers: makeOffers([
      { martId: 'mart3', price: 179, originalPrice: 298, reviewCount: 620, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 159, originalPrice: 298, reviewCount: 84, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-new-balance-990v6',
    name: 'New Balance Made in USA 990v6 Suede Sneakers',
    brand: 'New Balance',
    category: 'Fashion',
    description: 'Premium pigskin suede and breathable mesh upper over FuelCell and ENCAP midsole cushioning.',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 1410,
    features: ['FuelCell Foam Propulsion', 'ENCAP Midsole Support', 'Premium Suede & Mesh Overlays', 'NDurance Rubber Outsole'],
    tags: ['sneakers', 'new-balance', 'shoes', 'running', 'fashion'],
    offers: makeOffers([
      { martId: 'mart1', price: 175, originalPrice: 200, reviewCount: 390, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 179, originalPrice: 200, reviewCount: 240, scenario: 'balanced_store' },
      { martId: 'mart3', price: 185, originalPrice: 200, reviewCount: 410, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-tommy-hilfiger-oxford-shirt',
    name: 'Tommy Hilfiger Classic Fit Organic Cotton Oxford Shirt',
    brand: 'Tommy Hilfiger',
    category: 'Fashion',
    description: 'Crisp button-down collar shirt tailored from 100% organic cotton oxford cloth with embroidered flag logo.',
    image: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    reviewCount: 1120,
    features: ['100% Organic Cotton Oxford', 'Button-Down Collar', 'Adjustable Barrel Cuffs', 'Signature Embroidered Flag'],
    tags: ['shirt', 'menswear', 'cotton', 'tommy-hilfiger', 'formal', 'fashion'],
    offers: makeOffers([
      { martId: 'mart1', price: 54, originalPrice: 79, reviewCount: 310, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 48, originalPrice: 79, reviewCount: 68, scenario: 'high_fake_inflation' }
    ])
  },

  // ==================== HOME & GARDEN (8 Products) ====================
  {
    productId: 'prod-instant-pot-pro-8qt',
    name: 'Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker',
    brand: 'Instant Pot',
    category: 'Home & Garden',
    description: 'Replaces 9 kitchen appliances: pressure cooker, slow cooker, rice maker, steamer, sauté pan, yogurt maker, and warmer.',
    image: 'https://images.pexels.com/photos/4252135/pexels-photo-4252135.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 16420,
    features: ['9-in-1 Smart Programs', 'Food-Grade 304 Stainless Steel Pot', 'Whisper-Quiet Steam Release', '15+ Safety Mechanisms'],
    tags: ['kitchen', 'cooking', 'appliance', 'instant-pot', 'home'],
    offers: makeOffers([
      { martId: 'mart4', price: 79, originalPrice: 139, reviewCount: 142, scenario: 'high_fake_inflation' },
      { martId: 'mart1', price: 89, originalPrice: 139, reviewCount: 1240, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 105, originalPrice: 139, reviewCount: 680, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-dyson-v15-detect',
    name: 'Dyson V15 Detect Cordless Vacuum with Laser',
    brand: 'Dyson',
    category: 'Home & Garden',
    description: 'Engineered with a Fluffy Optic cleaner head that reveals invisible dust on hard floors and adapts suction power.',
    image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 3810,
    features: ['Fluffy Optic Dust Illumination', 'Piezo Sensor Dust Counting', '60-Minute Fade-Free Suction', 'HEPA Filtration'],
    tags: ['vacuum', 'dyson', 'cleaning', 'home', 'cordless', 'smart-home'],
    offers: makeOffers([
      { martId: 'mart2', price: 579, originalPrice: 749, reviewCount: 530, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 629, originalPrice: 749, reviewCount: 410, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-breville-barista-express',
    name: 'Breville Barista Express Espresso Machine',
    brand: 'Breville',
    category: 'Home & Garden',
    description: 'Create third-wave specialty coffee at home from bean to espresso in less than a minute with integrated burr grinder.',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 6250,
    features: ['Integrated Conical Burr Grinder', 'Digital PID Temperature Control', '15-Bar Italian Pump', 'Microfoam Steam Wand'],
    tags: ['coffee', 'espresso', 'kitchen', 'breville', 'barista', 'home'],
    offers: makeOffers([
      { martId: 'mart3', price: 559, originalPrice: 749, reviewCount: 910, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 539, originalPrice: 749, reviewCount: 72, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-ninja-foodi-dualzone-airfryer',
    name: 'Ninja Foodi DualZone 10-Quart 2-Basket Air Fryer',
    brand: 'Ninja',
    category: 'Home & Garden',
    description: 'First air fryer with 2 independent baskets that let you cook 2 foods, 2 ways, at the same time with Smart Finish.',
    image: 'https://images.pexels.com/photos/6996085/pexels-photo-6996085.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 8420,
    features: ['DualZone 2-Basket Technology', 'Smart Finish & Match Cook', '6-in-1 Air Fry, Roast, Bake & Dehydrate', '10-Quart XL Capacity'],
    tags: ['airfryer', 'ninja', 'kitchen', 'cooking', 'appliance', 'home'],
    offers: makeOffers([
      { martId: 'mart1', price: 169, originalPrice: 229, reviewCount: 740, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 175, originalPrice: 229, reviewCount: 490, scenario: 'balanced_store' },
      { martId: 'mart3', price: 179, originalPrice: 229, reviewCount: 610, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 155, originalPrice: 229, reviewCount: 95, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-kitchenaid-artisan-mixer',
    name: 'KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer',
    brand: 'KitchenAid',
    category: 'Home & Garden',
    description: 'Iconic culinary stand mixer with 10 mixing speeds, 59-point planetary mixing action, and stainless steel bowl.',
    image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 11200,
    features: ['5-Quart Stainless Steel Bowl', '10-Speed Slide Control', 'Power Hub for 15+ Attachments', 'Includes Dough Hook, Whisk & Beater'],
    tags: ['kitchenaid', 'mixer', 'baking', 'kitchen', 'appliance', 'home'],
    offers: makeOffers([
      { martId: 'mart3', price: 349, originalPrice: 449, reviewCount: 890, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 369, originalPrice: 449, reviewCount: 540, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-philips-hue-starter-kit',
    name: 'Philips Hue White & Color Ambiance Smart Bulb Starter Kit',
    brand: 'Philips',
    category: 'Home & Garden',
    description: 'Includes 4 A19 smart LED bulbs (16 million colors) and Hue Bridge for whole-home voice & app automation.',
    image: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 3190,
    features: ['16 Million Colors + Warm-to-Cool White', 'Includes Philips Hue Bridge', 'Works with Alexa, HomeKit & Google', '25,000-Hour Bulb Lifespan'],
    tags: ['smart-home', 'philips', 'lighting', 'led', 'home'],
    offers: makeOffers([
      { martId: 'mart1', price: 149, originalPrice: 199, reviewCount: 410, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 159, originalPrice: 199, reviewCount: 330, scenario: 'balanced_store' },
      { martId: 'mart4', price: 139, originalPrice: 199, reviewCount: 64, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-irobot-roomba-j7-plus',
    name: 'iRobot Roomba j7+ Self-Emptying Robot Vacuum',
    brand: 'iRobot',
    category: 'Home & Garden',
    description: 'PrecisionVision navigation identifies and avoids pet waste and charging cords, with 60-day Clean Base auto-emptying.',
    image: 'https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 2740,
    features: ['PrecisionVision Obstacle Avoidance', '60-Day Self-Emptying Clean Base', 'Smart Mapping & Room Scheduling', 'Dual Multi-Surface Rubber Brushes'],
    tags: ['roomba', 'robot', 'vacuum', 'smart-home', 'cleaning', 'home'],
    offers: makeOffers([
      { martId: 'mart2', price: 499, originalPrice: 699, reviewCount: 380, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 529, originalPrice: 699, reviewCount: 290, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-herman-miller-aeron-chair',
    name: 'Ergonomic Mesh Executive Office Chair (Lumbar Support)',
    brand: 'ComfortSeating',
    category: 'Home & Garden',
    description: 'Breathable 8Z Pellicle elastomeric suspension mesh with PostureFit sacral-lumbar support and 4D adjustable armrests.',
    image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 1850,
    features: ['Breathable Suspension Mesh', 'Adjustable Lumbar Support', '4D Padded Armrests', '135-Degree Synchro-Tilt Lock'],
    tags: ['chair', 'office', 'furniture', 'ergonomic', 'home', 'desk'],
    offers: makeOffers([
      { martId: 'mart3', price: 289, originalPrice: 399, reviewCount: 440, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 309, originalPrice: 399, reviewCount: 310, scenario: 'balanced_store' },
      { martId: 'mart4', price: 269, originalPrice: 399, reviewCount: 77, scenario: 'high_fake_inflation' }
    ])
  },

  // ==================== BOOKS (5 Products) ====================
  {
    productId: 'prod-psychology-of-money',
    name: 'The Psychology of Money (Special Hardcover)',
    brand: 'Morgan Housel',
    category: 'Books',
    description: 'Timeless lessons on wealth, greed, and happiness through 19 short stories exploring how people think about money.',
    image: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 12840,
    features: ['Hardcover Collector Edition', '256 Pages', 'New York Times Bestseller', 'Includes Bonus Chapter'],
    tags: ['books', 'finance', 'investing', 'psychology', 'bestseller'],
    offers: makeOffers([
      { martId: 'mart1', price: 15, originalPrice: 24, reviewCount: 1520, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 12, originalPrice: 24, reviewCount: 210, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-atomic-habits',
    name: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    brand: 'James Clear',
    category: 'Books',
    description: 'A comprehensive, practical guide on how tiny daily changes transform into remarkable life-changing results.',
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 24910,
    features: ['Hardcover Edition', '320 Pages', 'Over 15 Million Copies Sold', 'Habit Tracker Templates Included'],
    tags: ['books', 'self-help', 'productivity', 'habits', 'bestseller'],
    offers: makeOffers([
      { martId: 'mart3', price: 15, originalPrice: 27, reviewCount: 1890, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-deep-work-cal-newport',
    name: 'Deep Work: Rules for Focused Success in a Distracted World',
    brand: 'Cal Newport',
    category: 'Books',
    description: 'Essential strategies for mastering complicated information and producing better results in less time.',
    image: 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 9320,
    features: ['Hardcover Edition', '304 Pages', 'Wall Street Journal Bestseller', '4 Deep Work Scheduling Frameworks'],
    tags: ['books', 'productivity', 'focus', 'career', 'business'],
    offers: makeOffers([
      { martId: 'mart1', price: 14, originalPrice: 22, reviewCount: 640, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 15, originalPrice: 22, reviewCount: 410, scenario: 'balanced_store' },
      { martId: 'mart3', price: 16, originalPrice: 22, reviewCount: 520, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-clean-code-robert-martin',
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    brand: 'Robert C. Martin',
    category: 'Books',
    description: 'The definitive software engineering guide to writing readable, maintainable, and refactorable production code.',
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 7450,
    features: ['464 Pages Technical Reference', 'Real-World Java & OOP Case Studies', 'Code Smells & Heuristics Chapter', 'Unit Testing Best Practices'],
    tags: ['books', 'programming', 'coding', 'software', 'engineering'],
    offers: makeOffers([
      { martId: 'mart3', price: 32, originalPrice: 49, reviewCount: 820, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 35, originalPrice: 49, reviewCount: 510, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-zero-to-one-peter-thiel',
    name: 'Zero to One: Notes on Startups, or How to Build the Future',
    brand: 'Peter Thiel',
    category: 'Books',
    description: 'Contrarian insights on innovation, monopoly advantage, and building breakthrough technology companies.',
    image: 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 11200,
    features: ['Hardcover Edition', '224 Pages', 'Startup & Venture Capital Classic', 'Illustrated Diagrams'],
    tags: ['books', 'startups', 'business', 'entrepreneurship', 'tech'],
    offers: makeOffers([
      { martId: 'mart1', price: 16, originalPrice: 26, reviewCount: 740, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 13, originalPrice: 26, reviewCount: 95, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 17, originalPrice: 26, reviewCount: 610, scenario: 'balanced_store' }
    ])
  },

  // ==================== SPORTS (6 Products) ====================
  {
    productId: 'prod-manduka-pro-yoga-mat',
    name: 'Manduka PRO Yoga and Pilates Mat (6mm)',
    brand: 'Manduka',
    category: 'Sports',
    description: 'Ultra-dense 6mm performance yoga mat with closed-cell hygienic surface and high-grip texture.',
    image: 'https://images.pexels.com/photos/892618/pexels-photo-892618.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 1420,
    features: ['6mm Ultra-Dense Cushioning', 'OEKO-TEX Certified Non-Toxic', 'Closed-Cell Moisture Barrier', 'Lifetime Guarantee'],
    tags: ['yoga', 'fitness', 'sports', 'exercise', 'pilates', 'wellness'],
    offers: makeOffers([
      { martId: 'mart1', price: 95, originalPrice: 138, reviewCount: 340, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 89, originalPrice: 138, reviewCount: 90, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-bowflex-selecttech-552',
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
    brand: 'Bowflex',
    category: 'Sports',
    description: 'Replaces 15 sets of weights. Adjusts from 5 to 52.5 lbs in 2.5-lb increments with the turn of a dial.',
    image: 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 8930,
    features: ['5 to 52.5 lbs Weight Range', 'Replaces 30 Individual Dumbbells', 'Quiet Durable Molding', 'Includes Storage Trays'],
    tags: ['gym', 'dumbbells', 'weights', 'fitness', 'strength', 'sports'],
    offers: makeOffers([
      { martId: 'mart4', price: 349, originalPrice: 549, reviewCount: 82, scenario: 'high_fake_inflation' },
      { martId: 'mart2', price: 369, originalPrice: 549, reviewCount: 620, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-garmin-forerunner-265',
    name: 'Garmin Forerunner 265 GPS Running Smartwatch',
    brand: 'Garmin',
    category: 'Sports',
    description: 'Bright AMOLED touchscreen display with training readiness score, multi-band GPS, and 13-day battery.',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 2150,
    features: ['1.3" Colorful AMOLED Touchscreen', 'Multi-Band GNSS with SatIQ', '13-Day Smartwatch Battery', 'Running Dynamics'],
    tags: ['smartwatch', 'garmin', 'running', 'fitness', 'gps', 'sports'],
    offers: makeOffers([
      { martId: 'mart3', price: 379, originalPrice: 449, reviewCount: 540, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 415, originalPrice: 449, reviewCount: 190, scenario: 'balanced_store' },
      { martId: 'mart4', price: 365, originalPrice: 449, reviewCount: 75, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-theragun-pro-massager',
    name: 'Therabody Theragun PRO Deep Tissue Percussion Massager',
    brand: 'Therabody',
    category: 'Sports',
    description: 'Professional-grade deep muscle treatment with rotating arm, OLED screen, and 6 scientifically calibrated attachments.',
    image: 'https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 1920,
    features: ['16mm Amplitude Deep Muscle Relief', 'QuietForce Brushless Motor', 'Built-In OLED Force Meter', '300-Minute Dual Battery Pack'],
    tags: ['massager', 'theragun', 'recovery', 'fitness', 'gym', 'sports'],
    offers: makeOffers([
      { martId: 'mart3', price: 399, originalPrice: 549, reviewCount: 410, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 419, originalPrice: 549, reviewCount: 290, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-wilson-pro-staff-racket',
    name: 'Wilson Pro Staff 97 v14 Performance Tennis Racket',
    brand: 'Wilson',
    category: 'Sports',
    description: 'Tour-level precision tennis frame with Paradigm Bending carbon fiber construction and braided graphite feel.',
    image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 840,
    features: ['Paradigm Bending Carbon Construction', 'Braided 45-Degree Graphite', '16x19 String Pattern', 'Ergonomic End Cap'],
    tags: ['tennis', 'wilson', 'racket', 'sports', 'outdoor'],
    offers: makeOffers([
      { martId: 'mart2', price: 219, originalPrice: 279, reviewCount: 240, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 229, originalPrice: 279, reviewCount: 195, scenario: 'balanced_store' },
      { martId: 'mart4', price: 199, originalPrice: 279, reviewCount: 58, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-hydroflask-40oz-tumbler',
    name: 'Hydro Flask 40 oz Wide Mouth Insulated Stainless Bottle',
    brand: 'Hydro Flask',
    category: 'Sports',
    description: 'TempShield double-wall vacuum insulation keeps beverages ice-cold for 24 hours or piping hot for 12 hours.',
    image: 'https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 5430,
    features: ['TempShield Vacuum Insulation', '18/8 Pro-Grade Stainless Steel', 'Leakproof Flex Straw Cap', 'BPA-Free & Dishwasher Safe'],
    tags: ['bottle', 'hydration', 'gym', 'outdoor', 'sports'],
    offers: makeOffers([
      { martId: 'mart1', price: 39, originalPrice: 49, reviewCount: 890, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 41, originalPrice: 49, reviewCount: 520, scenario: 'balanced_store' },
      { martId: 'mart3', price: 42, originalPrice: 49, reviewCount: 640, scenario: 'genuine_top_quality' },
      { martId: 'mart4', price: 34, originalPrice: 49, reviewCount: 110, scenario: 'high_fake_inflation' }
    ])
  },

  // ==================== BEAUTY (5 Products) ====================
  {
    productId: 'prod-fenty-pro-filtr-foundation',
    name: 'Fenty Beauty Pro Filt\'r Soft Matte Longwear Foundation',
    brand: 'Fenty Beauty',
    category: 'Beauty',
    description: 'Soft matte, long-wear foundation with climate-adaptive technology that resists sweat and humidity.',
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 4320,
    features: ['50 Inclusive Shades', 'Oil-Free & Sweat-Resistant', 'Medium to Full Buildable Coverage', '100% Cruelty-Free'],
    tags: ['makeup', 'foundation', 'beauty', 'skincare', 'fenty', 'cosmetics'],
    offers: makeOffers([
      { martId: 'mart1', price: 34, originalPrice: 40, reviewCount: 680, scenario: 'genuine_top_quality' },
      { martId: 'mart3', price: 38, originalPrice: 40, reviewCount: 420, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-dyson-airwrap-multi-styler',
    name: 'Dyson Airwrap Multi-Styler Complete Long',
    brand: 'Dyson',
    category: 'Beauty',
    description: 'Curl, shape, smooth, and hide flyaways using the Coanda airflow effect with no extreme heat damage.',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviewCount: 3670,
    features: ['Enhanced Coanda Airflow Styling', 'Intelligent Heat Control', '6 Engineered Attachments', 'Presentation Case Included'],
    tags: ['haircare', 'styler', 'dyson', 'beauty', 'luxury', 'appliances'],
    offers: makeOffers([
      { martId: 'mart4', price: 489, originalPrice: 599, reviewCount: 78, scenario: 'high_fake_inflation' },
      { martId: 'mart3', price: 519, originalPrice: 599, reviewCount: 1150, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 549, originalPrice: 599, reviewCount: 430, scenario: 'balanced_store' }
    ])
  },
  {
    productId: 'prod-dior-sauvage-elixir',
    name: 'Dior Sauvage Eau de Parfum Spray (100ml)',
    brand: 'Dior',
    category: 'Beauty',
    description: 'Fresh Calabrian bergamot and spicy Sichuan pepper wrapped in warm Papua New Guinean vanilla absolute.',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 5120,
    features: ['100ml Refillable Spray Bottle', 'Notes of Bergamot, Ambroxan & Vanilla', '12-Hour Long-Lasting Sillage', 'Made in France'],
    tags: ['perfume', 'fragrance', 'dior', 'sauvage', 'beauty', 'luxury'],
    offers: makeOffers([
      { martId: 'mart3', price: 135, originalPrice: 165, reviewCount: 780, scenario: 'genuine_top_quality' },
      { martId: 'mart1', price: 142, originalPrice: 165, reviewCount: 510, scenario: 'balanced_store' },
      { martId: 'mart4', price: 119, originalPrice: 165, reviewCount: 92, scenario: 'high_fake_inflation' }
    ])
  },
  {
    productId: 'prod-la-roche-posay-vitamin-c',
    name: 'La Roche-Posay 10% Pure Vitamin C Anti-Aging Serum',
    brand: 'La Roche-Posay',
    category: 'Beauty',
    description: 'Dermatologist-tested brightening face serum formulated with 10% pure Vitamin C, salicylic acid, and neurosensine.',
    image: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviewCount: 2890,
    features: ['10% Pure L-Ascorbic Acid', 'Salicylic Acid & Thermal Spring Water', 'Safe for Sensitive Skin', 'Allergy-Tested & Paraben-Free'],
    tags: ['skincare', 'serum', 'vitamin-c', 'beauty', 'face'],
    offers: makeOffers([
      { martId: 'mart1', price: 36, originalPrice: 45, reviewCount: 540, scenario: 'genuine_top_quality' },
      { martId: 'mart2', price: 38, originalPrice: 45, reviewCount: 320, scenario: 'balanced_store' },
      { martId: 'mart3', price: 39, originalPrice: 45, reviewCount: 410, scenario: 'genuine_top_quality' }
    ])
  },
  {
    productId: 'prod-chanel-coco-mademoiselle',
    name: 'Chanel Coco Mademoiselle Eau de Parfum (100ml)',
    brand: 'Chanel',
    category: 'Beauty',
    description: 'Sparkling orange blossom, Turkish rose, and jasmine layered over Indonesian patchouli and white musk.',
    image: 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviewCount: 3840,
    features: ['100ml Signature Glass Flacon', 'Vibrant Amber-Floral Accord', 'Long-Lasting Eau de Parfum', 'Authentic French Parfumerie'],
    tags: ['perfume', 'chanel', 'fragrance', 'beauty', 'luxury'],
    offers: makeOffers([
      { martId: 'mart3', price: 152, originalPrice: 175, reviewCount: 690, scenario: 'genuine_top_quality' }
    ])
  }
];

class ProductService {
  constructor() {
    this.seedingPromise = null;
  }

  async enrichProductsWithBERT(products) {
    const enrichedProducts = [];
    for (const p of products) {
      const enrichedOffers = [];
      for (const o of p.offers) {
        const mart = MART_MAP[o.martId] || MARTS[0];
        const rawReviews = buildStoreReviews(p.name, mart.name, o.scenario || 'balanced_store');
        const bertStats = await analyzeReviewsWithRealBERT(rawReviews);
        const totalCount = o.reviewCount || 120;
        const fakeCount = Math.round((totalCount * bertStats.fakePercentage) / 100);
        const genuineCount = totalCount - fakeCount;

        enrichedOffers.push({
          store: o.store,
          martId: o.martId,
          martName: mart.name,
          martAddress: mart.address,
          lat: mart.lat,
          lng: mart.lng,
          price: o.price,
          originalPrice: o.originalPrice,
          rawRating: bertStats.rawRating,
          rating: bertStats.genuineRating,
          reviewCount: totalCount,
          genuineReviewCount: genuineCount,
          fakeReviewCount: fakeCount,
          fakeReviewPercentage: bertStats.fakePercentage,
          bertTrustScore: bertStats.bertTrustScore,
          reviews: bertStats.reviews,
          inStock: o.inStock ?? true,
          stockCount: o.stockCount ?? 10,
          deliveryEstimate: o.deliveryEstimate || 'Same-day delivery',
          url: o.url
        });
      }
      enrichedProducts.push({
        ...p,
        offers: enrichedOffers
      });
    }
    return enrichedProducts;
  }

  async seedIfEmpty() {
    if (this.seedingPromise) {
      return this.seedingPromise;
    }

    this.seedingPromise = (async () => {
      try {
        const count = await Product.countDocuments();
        const sample = await Product.findOne({ productId: 'prod-iphone-16-pro-max' }).lean();
        const prodexaOffer = (sample?.offers || []).find(o => o.store === 'Prodexa');
        const hasRealBertMetadata =
          prodexaOffer &&
          prodexaOffer.fakeReviewPercentage === 25 &&
          prodexaOffer.reviews?.[0]?.bertReason?.includes('BERT');

        if (count !== INITIAL_PRODUCTS.length || !hasRealBertMetadata) {
          console.log(`🔄 Running real Hugging Face BERT (${BERT_MODEL_ID}) on ${INITIAL_PRODUCTS.length} products' reviews...`);
          const enriched = await this.enrichProductsWithBERT(INITIAL_PRODUCTS);
          await Product.deleteMany({});
          await Product.insertMany(enriched);
          console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} products across 4 marts with real Hugging Face BERT (${BERT_MODEL_ID}) review classification!`);
        }
      } finally {
        this.seedingPromise = null;
      }
    })();

    return this.seedingPromise;
  }

  getMarts() {
    return MARTS;
  }

  // Dedicated endpoint helper to simulate individual mart APIs (Martello, Prodexa, Storenta)
  async getProductsByStoreName(storeName, query = '') {
    await this.seedIfEmpty();
    return this.searchProducts({ query, store: storeName });
  }

  formatProduct(doc, preferredStore, preferredMartId) {
    const p = doc.toObject ? doc.toObject() : doc;
    let relevantOffers = [...(p.offers || [])];

    if (preferredStore && preferredStore !== 'All Stores') {
      const storeFiltered = relevantOffers.filter(o => o.store.toLowerCase() === preferredStore.toLowerCase());
      if (storeFiltered.length > 0) relevantOffers = storeFiltered;
    }

    if (preferredMartId && preferredMartId !== 'Select Mart') {
      const martFiltered = relevantOffers.filter(o => o.martId === preferredMartId);
      if (martFiltered.length > 0) relevantOffers = martFiltered;
    }

    const allSortedOffers = [...(p.offers || [])].sort((a, b) => a.price - b.price);
    const activeSortedOffers = relevantOffers.sort((a, b) => a.price - b.price);

    const bestOffer = activeSortedOffers[0] || allSortedOffers[0];
    const highestOffer = allSortedOffers[allSortedOffers.length - 1] || bestOffer;
    const lowestOverallOffer = allSortedOffers[0] || bestOffer;

    return {
      id: p.productId,
      productId: p.productId,
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      features: p.features || [],
      tags: p.tags || [],
      store: bestOffer.store,
      martId: bestOffer.martId,
      martName: bestOffer.martName || MART_MAP[bestOffer.martId]?.name,
      martAddress: bestOffer.martAddress || MART_MAP[bestOffer.martId]?.address,
      lat: bestOffer.lat || MART_MAP[bestOffer.martId]?.lat || 31.4697,
      lng: bestOffer.lng || MART_MAP[bestOffer.martId]?.lng || 74.2728,
      price: bestOffer.price,
      originalPrice: bestOffer.originalPrice || highestOffer.price,
      inStock: bestOffer.inStock,
      deliveryEstimate: bestOffer.deliveryEstimate,
      url: bestOffer.url,
      lowestPrice: lowestOverallOffer.price,
      highestPrice: highestOffer.price,
      maxSavings: highestOffer.price - lowestOverallOffer.price,
      bestStore: lowestOverallOffer.store,
      bestMartName: lowestOverallOffer.martName || MART_MAP[lowestOverallOffer.martId]?.name,
      offers: allSortedOffers
    };
  }

  async searchProducts({ query = '', category = 'All Categories', store = 'All Stores', martId = 'Select Mart' } = {}) {
    await this.seedIfEmpty();

    const filter = {};

    if (category && category !== 'All Categories') {
      filter.category = category;
    }

    if (store && store !== 'All Stores') {
      filter['offers.store'] = new RegExp(`^${store}$`, 'i');
    }

    if (martId && martId !== 'Select Mart') {
      filter['offers.martId'] = martId;
    }

    if (query && query.trim()) {
      const regex = new RegExp(query.trim(), 'i');
      filter.$or = [
        { name: regex },
        { brand: regex },
        { category: regex },
        { description: regex },
        { tags: regex }
      ];
    }

    const docs = await Product.find(filter).lean();
    return docs.map(doc => this.formatProduct(doc, store, martId));
  }

  async getRecommendationsForUser(user) {
    await this.seedIfEmpty();
    const allDocs = await Product.find().lean();

    const viewedIds = new Set((user.viewedProducts || []).map(v => v.productId));
    const wishlistIds = new Set((user.wishlist || []).map(w => w.productId));

    const preferredCategories = new Set();
    (user.searchHistory || []).forEach(s => {
      if (s.category) preferredCategories.add(s.category);
    });

    const formatted = allDocs.map(doc => this.formatProduct(doc));

    const scored = formatted
      .filter(p => !wishlistIds.has(p.id))
      .map(p => {
        let score = p.rating * 10 + (p.maxSavings / p.highestPrice) * 30;
        let reason = `Popular in ${p.category} • Rated ${p.rating}★`;

        if (preferredCategories.has(p.category)) {
          score += 25;
          reason = `Based on your interest in ${p.category}`;
        } else if (viewedIds.has(p.id)) {
          score += 15;
          reason = `Based on your recently viewed products`;
        }

        return {
          productId: p.id,
          name: p.name,
          brand: p.brand,
          price: p.lowestPrice,
          originalPrice: p.highestPrice,
          image: p.image,
          store: p.category,
          reason,
          score
        };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 4);
  }
}

module.exports = new ProductService();
