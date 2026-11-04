const Product = require('../models/product.model');
const { analyzeReviewsWithRealBERT, BERT_MODEL_ID } = require('./bert.service');
const { createProductImage } = require('./productImage.helper');
const { vectorDbService } = require('./vectorDb.service');

const MARTS = [
  { id: 'mart1', store: 'Martello', name: 'Martello Downtown', address: 'Johar Town Main Blvd, Lahore', lat: 31.4697, lng: 74.2728, rating: 4.7 },
  { id: 'mart2', store: 'Martello', name: 'Martello West', address: 'Wapda Town Roundabout, Lahore', lat: 31.4312, lng: 74.2644, rating: 4.4 },
  { id: 'mart3', store: 'Prodexa', name: 'Prodexa Central', address: 'MM Alam Road, Gulberg III, Lahore', lat: 31.5102, lng: 74.3441, rating: 4.8 },
  { id: 'mart4', store: 'Storenta', name: 'Storenta Plaza', address: 'DHA Phase 5 Commercial, Lahore', lat: 31.4625, lng: 74.4085, rating: 4.2 },
];

const MART_MAP = Object.fromEntries(MARTS.map(m => [m.id, m]));

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

function makeOffers(basePrice, originalPrice, martIds) {
  const martConfigs = {
    mart1: { store: 'Martello', priceFactor: 1.03, reviewCount: 410, scenario: 'balanced_store', delivery: '30-min express', url: 'https://martello.vercel.app' },
    mart2: { store: 'Martello', priceFactor: 1.01, reviewCount: 330, scenario: 'genuine_top_quality', delivery: 'Same-day delivery', url: 'https://martello.vercel.app' },
    mart3: { store: 'Prodexa', priceFactor: 1.00, reviewCount: 540, scenario: 'genuine_top_quality', delivery: '2-hour delivery', url: 'https://prodexa.vercel.app' },
    mart4: { store: 'Storenta', priceFactor: 0.94, reviewCount: 115, scenario: 'high_fake_inflation', delivery: 'Same-day pickup', url: 'https://storenta.vercel.app' }
  };

  return martIds.map(mId => {
    const cfg = martConfigs[mId];
    const computedPrice = Math.max(8, Math.round(basePrice * cfg.priceFactor));
    return {
      store: cfg.store,
      martId: mId,
      price: computedPrice,
      originalPrice: Math.max(computedPrice + 10, originalPrice),
      reviewCount: cfg.reviewCount,
      scenario: cfg.scenario,
      inStock: true,
      stockCount: 14,
      deliveryEstimate: cfg.delivery,
      url: cfg.url
    };
  });
}

// Availability sets designed so that:
// - Not every product is at every mart (some at 1 mart, some at 2, some at 3, some at 4)
// - Every single mart (mart1, mart2, mart3, mart4) stocks >= 52 products!
const AVAILABILITY_PATTERNS = [
  ['mart1', 'mart2', 'mart3', 'mart4'], // 4 marts
  ['mart1', 'mart3', 'mart4'],          // 3 marts
  ['mart1', 'mart2', 'mart3'],          // 3 marts
  ['mart2', 'mart3', 'mart4'],          // 3 marts
  ['mart1', 'mart2', 'mart4'],          // 3 marts
  ['mart1', 'mart3'],                   // 2 marts
  ['mart2', 'mart4'],                   // 2 marts
  ['mart3']                             // 1 mart
];

const RAW_CATALOG = [
  // ==================== ELECTRONICS (24 Products) ====================
  { id: 'prod-iphone-16-pro-max', name: 'iPhone 16 Pro Max (256GB)', brand: 'Apple', category: 'Electronics', icon: 'smartphone', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 1199, originalPrice: 1349, rating: 4.9, reviewCount: 4120, description: 'Grade 5 titanium design with A18 Pro chip, Camera Control button, 48MP Fusion camera, and 4K 120fps Dolby Vision.', features: ['A18 Pro 3nm Chip', 'Camera Control Button', '48MP Ultra Wide + 5x Telephoto', '33-Hour Video Playback'], tags: ['smartphone', 'phone', 'mobile', 'apple', 'iphone', 'iphone 16', '5g', 'camera'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-iphone-15-pro-max', name: 'iPhone 15 Pro Max (256GB)', brand: 'Apple', category: 'Electronics', icon: 'smartphone', palette: ['#111827', '#1f2937', '#14b8a6'], basePrice: 1099, originalPrice: 1299, rating: 4.8, reviewCount: 3420, description: 'Aerospace-grade titanium design with A17 Pro chip, 48MP main camera, and 5x optical zoom.', features: ['A17 Pro 3nm Chip', 'Aerospace Titanium Design', '48MP Main + 5x Optical Zoom', 'USB-C with USB 3 speeds'], tags: ['smartphone', 'phone', 'mobile', 'apple', 'iphone', '5g', 'camera'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-samsung-s24-ultra', name: 'Samsung Galaxy S24 Ultra (512GB)', brand: 'Samsung', category: 'Electronics', icon: 'smartphone', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 1069, originalPrice: 1399, rating: 4.8, reviewCount: 2740, description: 'Titanium exterior, 200MP quad-telephoto camera system, built-in S Pen, and Snapdragon 8 Gen 3.', features: ['200MP ProVisual Engine Camera', 'Snapdragon 8 Gen 3 for Galaxy', 'Built-in S Pen & Galaxy AI', 'Corning Gorilla Armor'], tags: ['smartphone', 'phone', 'mobile', 'samsung', 'galaxy', 'android', 'ai', 'camera'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-google-pixel-9-pro', name: 'Google Pixel 9 Pro XL (256GB)', brand: 'Google', category: 'Electronics', icon: 'smartphone', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 999, originalPrice: 1199, rating: 4.8, reviewCount: 1620, description: 'Google Tensor G4 flagship smartphone with Super Actua OLED display and pro-level triple rear camera bar.', features: ['Google Tensor G4 Processor', '50MP Main + 48MP 5x Telephoto', '6.8" Super Actua 120Hz OLED', '7 Years of OS Updates'], tags: ['smartphone', 'phone', 'mobile', 'google', 'pixel', 'android', 'camera'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-oneplus-12-5g', name: 'OnePlus 12 5G (16GB/512GB)', brand: 'OnePlus', category: 'Electronics', icon: 'smartphone', palette: ['#064e3b', '#0f172a', '#34d399'], basePrice: 749, originalPrice: 899, rating: 4.7, reviewCount: 1410, description: 'Snapdragon 8 Gen 3 flagship phone with 4th-Gen Hasselblad Camera for Mobile and 100W SUPERVOOC fast charging.', features: ['Snapdragon 8 Gen 3', '4th-Gen Hasselblad Triple Camera', '100W SUPERVOOC Charging', '5400mAh Dual-Cell Battery'], tags: ['smartphone', 'phone', 'mobile', 'oneplus', 'android', '5g'], marts: ['mart2', 'mart3', 'mart4'] },
  { id: 'prod-xiaomi-14-ultra', name: 'Xiaomi 14 Ultra Leica Camera Phone', brand: 'Xiaomi', category: 'Electronics', icon: 'smartphone', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 899, originalPrice: 1099, rating: 4.7, reviewCount: 980, description: 'Co-engineered with Leica Summilux optical lens and 1-inch LYT-900 main camera sensor for pro mobile photography.', features: ['Leica Quad Camera System', '1-Inch LYT-900 Sensor', 'WQHD+ 120Hz AMOLED Display', '90W HyperCharge'], tags: ['smartphone', 'phone', 'mobile', 'xiaomi', 'leica', 'camera', 'android'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-samsung-qled-tv-65', name: 'Samsung 65" Neo QLED 4K Smart TV', brand: 'Samsung', category: 'Electronics', icon: 'tv', palette: ['#0f172a', '#1e293b', '#0ea5e9'], basePrice: 1199, originalPrice: 1499, rating: 4.7, reviewCount: 1120, description: 'Quantum Matrix Technology with Mini LEDs, Neural Quantum Processor 4K, and Dolby Atmos.', features: ['Quantum Mini LED', 'Neural Quantum Processor 4K', 'Dolby Atmos & Object Tracking Sound', '120Hz Motion Xcelerator'], tags: ['tv', 'television', 'samsung', 'qled', '4k', 'smart-tv', 'screen'], marts: ['mart2', 'mart3'] },
  { id: 'prod-lg-oled-c4-55', name: 'LG C4 55" 4K OLED evo WebOS Smart TV', brand: 'LG', category: 'Electronics', icon: 'tv', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 1299, originalPrice: 1599, rating: 4.9, reviewCount: 1940, description: 'Self-lit OLED evo pixels powered by the a9 AI Processor Gen7 with 144Hz G-SYNC & FreeSync gaming support.', features: ['Self-Lit OLED evo Brightness Booster', 'a9 AI Processor Gen7', '144Hz Refresh Rate for Gaming', 'Dolby Vision & Dolby Atmos'], tags: ['tv', 'television', 'lg', 'oled', '4k', 'smart-tv'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-samsung-buds2-pro', name: 'Samsung Galaxy Buds2 Pro Wireless Earbuds', brand: 'Samsung', category: 'Electronics', icon: 'earbuds', palette: ['#1e1b4b', '#0f172a', '#38bdf8'], basePrice: 149, originalPrice: 229, rating: 4.6, reviewCount: 890, description: '24-bit Hi-Fi audio, intelligent Active Noise Canceling, and ergonomic water-resistant fit.', features: ['24-bit Hi-Fi Sound', 'Intelligent Active Noise Cancellation', '360 Audio', 'IPX7 Water Resistance'], tags: ['earbuds', 'earphones', 'samsung', 'galaxy', 'audio', 'wireless'], marts: ['mart4'] },
  { id: 'prod-airpods-pro-2-usbc', name: 'Apple AirPods Pro (2nd Gen) with MagSafe USB-C', brand: 'Apple', category: 'Electronics', icon: 'earbuds', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 199, originalPrice: 249, rating: 4.9, reviewCount: 6420, description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Conversation Awareness, and personalized spatial audio.', features: ['Apple H2 Headphone Chip', '2x Active Noise Cancellation', 'Adaptive Transparency Mode', 'IP54 Dust & Water Resistant'], tags: ['airpods', 'apple', 'earbuds', 'earphones', 'wireless', 'audio', 'usbc'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-macbook-air-m3', name: 'MacBook Air 15" M3 (16GB/512GB)', brand: 'Apple', category: 'Electronics', icon: 'laptop', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 1229, originalPrice: 1499, rating: 4.9, reviewCount: 1890, description: 'Supercharged by the M3 chip with an ultra-thin design, 15.3-inch Liquid Retina display, and 18-hour battery life.', features: ['Apple M3 8-Core CPU / 10-Core GPU', '18-hour all-day battery', '15.3" Liquid Retina Display', 'MagSafe 3 & 2x Thunderbolt'], tags: ['laptop', 'computer', 'notebook', 'apple', 'macbook', 'm3', 'ultrabook'], marts: ['mart1', 'mart3'] },
  { id: 'prod-macbook-pro-m3-max', name: 'MacBook Pro 16" M3 Max (36GB/1TB)', brand: 'Apple', category: 'Electronics', icon: 'laptop', palette: ['#090d16', '#1e293b', '#10b981'], basePrice: 2899, originalPrice: 3199, rating: 4.9, reviewCount: 940, description: 'Extreme workstation performance with Liquid Retina XDR display, 14-core CPU, and 30-core GPU.', features: ['Apple M3 Max Chip', '16.2" Liquid Retina XDR Display', '22-Hour Battery Life', 'SDXC, HDMI & 3x Thunderbolt 4'], tags: ['laptop', 'computer', 'notebook', 'apple', 'macbook', 'pro', 'workstation'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-dell-xps-15-oled', name: 'Dell XPS 15 3.5K OLED Laptop (Intel Core Ultra 7)', brand: 'Dell', category: 'Electronics', icon: 'laptop', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 1649, originalPrice: 1899, rating: 4.7, reviewCount: 1240, description: 'CNC machined aluminum & carbon fiber chassis with a stunning 15.6-inch 3.5K OLED InfinityEdge display and RTX 4060.', features: ['15.6" 3.5K OLED Touch Display', 'NVIDIA GeForce RTX 4060', '32GB DDR5 RAM + 1TB SSD', 'CNC Machined Aluminum'], tags: ['dell', 'xps', 'laptop', 'computer', 'notebook', 'oled', 'windows', 'rtx'], marts: ['mart2', 'mart3', 'mart4'] },
  { id: 'prod-asus-rog-zephyrus-g16', name: 'ASUS ROG Zephyrus G16 Gaming Laptop (RTX 4070)', brand: 'ASUS', category: 'Electronics', icon: 'laptop', palette: ['#0f172a', '#1e1b4b', '#10b981'], basePrice: 1749, originalPrice: 1999, rating: 4.8, reviewCount: 1120, description: 'Ultra-sleek 240Hz ROG Nebula OLED gaming laptop powered by Intel Core Ultra 9 and NVIDIA GeForce RTX 4070.', features: ['16" 2.5K 240Hz OLED Display', 'NVIDIA GeForce RTX 4070 GPU', 'CNC Aluminum Unibody Chassis', '6-Speaker Dolby Atmos Audio'], tags: ['asus', 'rog', 'gaming', 'laptop', 'computer', 'rtx', 'oled'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-hp-spectre-x360-14', name: 'HP Spectre x360 14" 2-in-1 Convertible OLED Laptop', brand: 'HP', category: 'Electronics', icon: 'laptop', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 1349, originalPrice: 1599, rating: 4.7, reviewCount: 860, description: '360-degree convertible 2.8K OLED touchscreen laptop with rechargeable tilt stylus pen and AI processor.', features: ['14" 2.8K 120Hz OLED Touch', '360-Degree Hinge + Stylus Pen', 'Intel Core Ultra 7 155H', '9MP NightMode Webcam'], tags: ['hp', 'spectre', 'laptop', 'computer', 'convertible', '2-in-1', 'touchscreen'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-sony-wh1000xm5', name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', brand: 'Sony', category: 'Electronics', icon: 'headphones', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 319, originalPrice: 399, rating: 4.8, reviewCount: 4120, description: 'Industry-leading noise cancellation powered by 8 microphones and two processors with 30-hour battery life.', features: ['8-Mic Auto Noise Canceling', '30-Hour Battery + Quick Charge', 'Multipoint Bluetooth Connection', 'Soft Fit Leather'], tags: ['headphones', 'headset', 'sony', 'audio', 'wireless', 'noise-canceling', 'music'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-bose-quietcomfort-ultra', name: 'Bose QuietComfort Ultra Spatial Audio Headphones', brand: 'Bose', category: 'Electronics', icon: 'headphones', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 349, originalPrice: 429, rating: 4.8, reviewCount: 2390, description: 'Breakthrough Bose Immersive Audio with CustomTune sound calibration and world-class quiet mode.', features: ['Bose Immersive Spatial Audio', 'CustomTune Ear Calibration', '24-Hour Battery Life', 'Snapdragon Sound AptX Adaptive'], tags: ['headphones', 'headset', 'bose', 'audio', 'wireless', 'noise-canceling'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-ps5-slim-console', name: 'PlayStation 5 Slim Disc Edition (1TB)', brand: 'Sony', category: 'Electronics', icon: 'console', palette: ['#0f172a', '#172554', '#38bdf8'], basePrice: 459, originalPrice: 549, rating: 4.9, reviewCount: 5390, description: 'Lightning-fast loading with an ultra-high-speed 1TB SSD, haptic feedback, adaptive triggers, and 3D Audio.', features: ['1TB Custom NVMe SSD', '4K 120Hz Gaming Output', 'DualSense Wireless Controller', 'Ray Tracing & 3D Audio'], tags: ['gaming', 'console', 'ps5', 'playstation', 'sony', 'entertainment'], marts: ['mart3', 'mart4'] },
  { id: 'prod-xbox-series-x', name: 'Xbox Series X 1TB 4K Gaming Console', brand: 'Microsoft', category: 'Electronics', icon: 'console', palette: ['#052e16', '#0f172a', '#10b981'], basePrice: 449, originalPrice: 499, rating: 4.8, reviewCount: 3180, description: '12 teraflops of raw graphic processing power, DirectX ray tracing, custom 1TB SSD, and true 4K 120fps gaming.', features: ['12 Teraflops GPU Power', '1TB Custom NVMe SSD', 'True 4K Gaming up to 120FPS', 'Xbox Velocity Architecture'], tags: ['xbox', 'gaming', 'console', 'microsoft', '4k', 'technology'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-nintendo-switch-oled', name: 'Nintendo Switch OLED Model (White Joy-Con)', brand: 'Nintendo', category: 'Electronics', icon: 'console', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 319, originalPrice: 349, rating: 4.8, reviewCount: 2890, description: '7-inch vibrant OLED screen, wide adjustable stand, wired LAN dock port, and 64GB internal storage.', features: ['7-Inch OLED Touch Screen', '64GB Internal Storage', 'Enhanced Handheld Audio', 'TV, Tabletop & Handheld Modes'], tags: ['nintendo', 'switch', 'gaming', 'console', 'oled'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-ipad-pro-m4', name: 'iPad Pro 11" M4 Ultra Retina XDR Tablet', brand: 'Apple', category: 'Electronics', icon: 'tablet', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 929, originalPrice: 999, rating: 4.8, reviewCount: 980, description: 'Breakthrough Tandem OLED Ultra Retina XDR display paired with the next-gen M4 chip.', features: ['Tandem OLED Ultra Retina XDR', 'Apple M4 Chip', '5.3mm Ultra-Thin Enclosure', 'Supports Apple Pencil Pro'], tags: ['tablet', 'ipad', 'apple', 'oled', 'design', 'portable'], marts: ['mart3'] },
  { id: 'prod-canon-eos-r6-mark2', name: 'Canon EOS R6 Mark II Mirrorless Camera Body', brand: 'Canon', category: 'Electronics', icon: 'camera', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 1999, originalPrice: 2499, rating: 4.9, reviewCount: 780, description: '24.2MP full-frame CMOS sensor, 40fps electronic shutter, Dual Pixel CMOS AF II, and 6K oversampled 4K 60p video.', features: ['24.2MP Full-Frame Sensor', '40fps Continuous Shooting', '8-Stop In-Body Image Stabilizer', '4K 60p 10-Bit Internal Video'], tags: ['camera', 'dslr', 'canon', 'mirrorless', 'photography', '4k', 'video'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-logitech-mx-master-3s', name: 'Logitech MX Master 3S Wireless Performance Mouse', brand: 'Logitech', category: 'Electronics', icon: 'mouse', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 89, originalPrice: 109, rating: 4.8, reviewCount: 3910, description: '8K DPI track-on-glass optical sensor, Quiet Click switches, and MagSpeed electromagnetic scrolling.', features: ['8000 DPI Optical Sensor', '90% Quieter Clicks', 'MagSpeed Electromagnetic Wheel', 'Multi-Device & Multi-OS Flow'], tags: ['mouse', 'logitech', 'wireless', 'office', 'ergonomic', 'computer', 'accessories'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-keychron-q1-pro-keyboard', name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard', brand: 'Keychron', category: 'Electronics', icon: 'keyboard', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 189, originalPrice: 219, rating: 4.8, reviewCount: 1450, description: 'Full CNC machined 6063 aluminum body with double-gasket design, hot-swappable tactile switches, and QMK/VIA.', features: ['Full CNC Machined Aluminum Body', 'Hot-Swappable Mechanical Switches', 'QMK & VIA Programmable', 'Bluetooth 5.1 + USB-C Wired'], tags: ['keyboard', 'mechanical', 'gaming', 'keychron', 'wireless', 'computer', 'accessories'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },

  // ==================== FASHION (18 Products: Shoes, Shirts, Jackets, Jeans, Watches, Bags, Sunglasses) ====================
  { id: 'prod-nike-jordan-1-retro', name: 'Nike Air Jordan 1 Retro High OG Shoes', brand: 'Nike', category: 'Fashion', icon: 'shoes', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 155, originalPrice: 190, rating: 4.8, reviewCount: 1540, description: 'Iconic heritage court basketball shoes crafted with full-grain leather overlays and encapsulated Nike Air cushioning.', features: ['Full-Grain Leather Upper', 'Encapsulated Nike Air Cushioning', 'Solid Rubber Cupsole', 'Classic Wings Ankle Logo'], tags: ['sneakers', 'shoes', 'footwear', 'nike', 'jordan', 'basketball', 'streetwear', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-nike-pegasus-41-shoes', name: 'Nike Air Zoom Pegasus 41 Road Running Shoes', brand: 'Nike', category: 'Fashion', icon: 'shoes', palette: ['#064e3b', '#0f172a', '#34d399'], basePrice: 129, originalPrice: 160, rating: 4.9, reviewCount: 2310, description: 'Responsive ReactX foam midsole paired with dual Air Zoom units in the forefoot and heel for energized running.', features: ['Dual Air Zoom Units', 'ReactX Foam Midsole', 'Engineered Breathable Mesh Upper', 'Waffle-Inspired Rubber Outsole'], tags: ['nike', 'shoes', 'sneakers', 'running', 'footwear', 'sports', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-nike-air-force-1-07', name: 'Nike Air Force 1 \'07 Triple White Leather Shoes', brand: 'Nike', category: 'Fashion', icon: 'shoes', palette: ['#0f172a', '#334155', '#2dd4bf'], basePrice: 109, originalPrice: 135, rating: 4.8, reviewCount: 4820, description: 'Crisp stitched leather overlays, low-cut padded collar, and full-length Nike Air cushioning for everyday comfort.', features: ['Stitched Leather Overlays', 'Full-Length Nike Air Cushioning', 'Perforated Toe Box', 'Non-Marking Rubber Pivot Outsole'], tags: ['nike', 'shoes', 'sneakers', 'air-force', 'white', 'footwear', 'fashion'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-adidas-ultraboost-light', name: 'Adidas Ultraboost Light Running Sneakers', brand: 'Adidas', category: 'Fashion', icon: 'shoes', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 139, originalPrice: 190, rating: 4.8, reviewCount: 2140, description: '30% lighter BOOST midsole material wrapped in a breathable PRIMEKNIT+ textile upper with Continental rubber grip.', features: ['Light BOOST Cushioning', 'PRIMEKNIT+ Breathable Upper', 'Linear Energy Push System', 'Continental Rubber Outsole'], tags: ['adidas', 'sneakers', 'running', 'shoes', 'footwear', 'ultraboost', 'fashion'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-new-balance-990v6', name: 'New Balance Made in USA 990v6 Suede Sneakers', brand: 'New Balance', category: 'Fashion', icon: 'shoes', palette: ['#1e293b', '#0f172a', '#10b981'], basePrice: 175, originalPrice: 200, rating: 4.8, reviewCount: 1410, description: 'Premium pigskin suede and breathable mesh upper over FuelCell and ENCAP midsole cushioning.', features: ['FuelCell Foam Propulsion', 'ENCAP Midsole Support', 'Premium Suede & Mesh Overlays', 'NDurance Rubber Outsole'], tags: ['sneakers', 'new-balance', 'shoes', 'footwear', 'running', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-puma-velocity-nitro-shoes', name: 'Puma Velocity NITRO 3 Performance Running Shoes', brand: 'Puma', category: 'Fashion', icon: 'shoes', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 115, originalPrice: 145, rating: 4.7, reviewCount: 960, description: 'Nitrogen-infused NITRO foam cushioning with PUMAGRIP multi-surface traction outsole.', features: ['Nitrogen-Infused NITRO Foam', 'PUMAGRIP Rubber Outsole', 'Engineered Knit Upper', 'Reflective Heel Accents'], tags: ['puma', 'shoes', 'sneakers', 'running', 'footwear', 'fashion'], marts: ['mart2', 'mart3', 'mart4'] },
  { id: 'prod-nike-dri-fit-training-shirt', name: 'Nike Dri-FIT Legend Athletic Training T-Shirt', brand: 'Nike', category: 'Fashion', icon: 'shirt', palette: ['#064e3b', '#0f172a', '#10b981'], basePrice: 32, originalPrice: 45, rating: 4.8, reviewCount: 1920, description: 'Sweat-wicking Nike Dri-FIT jersey shirt with odor-resistant finish and relaxed athletic cut.', features: ['Nike Dri-FIT Sweat-Wicking Fabric', 'Odor-Resistant Anti-Microbial Finish', '100% Recycled Polyester Jersey', 'Ribbed Crewneck Collar'], tags: ['shirt', 't-shirt', 'tshirt', 'top', 'nike', 'clothing', 'apparel', 'menswear', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-tommy-hilfiger-oxford-shirt', name: 'Tommy Hilfiger Classic Fit Organic Cotton Oxford Shirt', brand: 'Tommy Hilfiger', category: 'Fashion', icon: 'shirt', palette: ['#0f172a', '#1e293b', '#38bdf8'], basePrice: 54, originalPrice: 79, rating: 4.7, reviewCount: 1120, description: 'Crisp button-down collar shirt tailored from 100% organic cotton oxford cloth with embroidered flag logo.', features: ['100% Organic Cotton Oxford', 'Button-Down Collar', 'Adjustable Barrel Cuffs', 'Signature Embroidered Flag'], tags: ['shirt', 't-shirt', 'button-down', 'menswear', 'clothing', 'cotton', 'tommy-hilfiger', 'formal', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-ralph-lauren-pique-polo-shirt', name: 'Polo Ralph Lauren Custom Slim Fit Cotton Mesh Polo Shirt', brand: 'Ralph Lauren', category: 'Fashion', icon: 'shirt', palette: ['#0f172a', '#1e3a8a', '#10b981'], basePrice: 79, originalPrice: 110, rating: 4.8, reviewCount: 2640, description: 'Breathable cotton piqué polo shirt featuring a ribbed collar, two-button placket, and signature embroidered pony.', features: ['100% Breathable Cotton Mesh', 'Ribbed Polo Collar & Armbands', 'Two-Button Mother-of-Pearl Placket', 'Signature Embroidered Pony'], tags: ['shirt', 'polo', 't-shirt', 'ralph-lauren', 'clothing', 'menswear', 'cotton', 'fashion'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-lacoste-cotton-crew-shirt', name: 'Lacoste Pima Cotton Crewneck T-Shirt', brand: 'Lacoste', category: 'Fashion', icon: 'shirt', palette: ['#064e3b', '#0f172a', '#34d399'], basePrice: 49, originalPrice: 65, rating: 4.7, reviewCount: 1380, description: 'Ultra-soft 100% Peruvian Pima cotton jersey t-shirt with signature embroidered green crocodile chest emblem.', features: ['100% Peruvian Pima Cotton', 'Embroidered Green Crocodile Logo', 'Regular Classic Fit', 'Machine Washable'], tags: ['shirt', 't-shirt', 'tshirt', 'lacoste', 'cotton', 'clothing', 'menswear', 'fashion'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-levis-511-slim-jeans', name: 'Levi\'s 511 Slim Fit Stretch Denim Jeans', brand: 'Levi\'s', category: 'Fashion', icon: 'jeans', palette: ['#0f172a', '#1e3a8a', '#38bdf8'], basePrice: 59, originalPrice: 89, rating: 4.7, reviewCount: 3410, description: 'Modern slim-fit jeans with Levi\'s Flex Eco performance stretch woven directly into heavyweight indigo denim.', features: ['99% Cotton, 1% Elastane Stretch', 'Slim from Hip to Ankle', 'Signature Arcuate Back Pockets', ' Solid Brass Zip Fly'], tags: ['jeans', 'pants', 'trousers', 'denim', 'levis', 'clothing', 'menswear', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-levis-trucker-jacket', name: 'Levi\'s Vintage Fit Sherpa Trucker Denim Jacket', brand: 'Levi\'s', category: 'Fashion', icon: 'jacket', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 79, originalPrice: 128, rating: 4.6, reviewCount: 940, description: 'The original denim jacket since 1967, winterized with warm quilted sleeve lining and plush sherpa insulation.', features: ['100% Cotton Non-Stretch Denim', 'Cozy Sherpa-Lined Collar', 'Signature Metal Buttons', 'Relaxed Vintage Fit'], tags: ['jacket', 'coat', 'denim', 'levis', 'outerwear', 'clothing', 'menswear', 'winter', 'fashion'], marts: ['mart2'] },
  { id: 'prod-north-face-nuptse-jacket', name: 'The North Face 1996 Retro Nuptse Down Puffer Jacket', brand: 'The North Face', category: 'Fashion', icon: 'jacket', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 269, originalPrice: 330, rating: 4.8, reviewCount: 2450, description: 'Boxy 1996 silhouette packed with lofty 700-fill responsible goose down and water-repellent ripstop fabric.', features: ['700-Fill Goose Down Insulation', 'DWR Water-Repellent Finish', 'Stowable 3-Piece Hood', 'Packs into Right Hand Pocket'], tags: ['jacket', 'coat', 'north-face', 'winter', 'puffer', 'outerwear', 'clothing', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-rayban-aviator-classic', name: 'Ray-Ban Aviator Classic Polarized Sunglasses', brand: 'Ray-Ban', category: 'Fashion', icon: 'sunglasses', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 159, originalPrice: 221, rating: 4.8, reviewCount: 2180, description: 'Timeless gold-tone metal frame paired with G-15 green polarized crystal lenses for 100% UV protection.', features: ['G-15 Polarized Crystal Lenses', '100% UVA/UVB Protection', 'Lightweight Metal Frame', 'Includes Leather Case'], tags: ['sunglasses', 'glasses', 'shades', 'accessories', 'rayban', 'eyewear', 'fashion'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-oakley-holbrook-sunglasses', name: 'Oakley Holbrook Prizm Sapphire Polarized Sunglasses', brand: 'Oakley', category: 'Fashion', icon: 'sunglasses', palette: ['#0f172a', '#172554', '#38bdf8'], basePrice: 149, originalPrice: 212, rating: 4.7, reviewCount: 1290, description: 'Lightweight O Matter frame with Prizm Polarized lenses that enhance color contrast and block glare.', features: ['Prizm Polarized Lens Technology', 'Lightweight O Matter Frame', 'HDO High Definition Optics', 'Impact Protection'], tags: ['sunglasses', 'glasses', 'shades', 'oakley', 'eyewear', 'accessories', 'fashion'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-fossil-chronograph-watch', name: 'Fossil Townsman Automatic Leather Watch', brand: 'Fossil', category: 'Fashion', icon: 'watch', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 169, originalPrice: 250, rating: 4.7, reviewCount: 1320, description: 'Exposed automatic mechanical movement in a 44mm brushed stainless steel case with genuine leather strap.', features: ['Self-Winding Automatic Movement', 'Skeleton Exhibition Dial', '5 ATM Water Resistant', 'Genuine Leather Strap'], tags: ['watch', 'wristwatch', 'accessories', 'luxury', 'leather', 'fossil', 'fashion'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-tissot-prx-powermatic', name: 'Tissot PRX Powermatic 80 Swiss Automatic Watch', brand: 'Tissot', category: 'Fashion', icon: 'watch', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 625, originalPrice: 725, rating: 4.9, reviewCount: 1680, description: '1978 integrated-bracelet Swiss design featuring a waffle-patterned dial, sapphire crystal, and 80-hour power reserve.', features: ['Swiss Powermatic 80 Movement', 'Scratch-Resistant Sapphire Crystal', '100m Water Resistance', 'Quick-Release Steel Bracelet'], tags: ['watch', 'wristwatch', 'tissot', 'swiss', 'luxury', 'fashion', 'automatic'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-michael-kors-tote-bag', name: 'Michael Kors Jet Set Travel Saffiano Leather Tote Bag', brand: 'Michael Kors', category: 'Fashion', icon: 'bag', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 179, originalPrice: 298, rating: 4.7, reviewCount: 1930, description: 'Structured Saffiano leather tote bag with padded center laptop compartment and gold-tone hardware.', features: ['100% Saffiano Leather', 'Padded 15" Laptop Compartment', 'Top-Zip Closure', 'Gold-Tone Logo Charm'], tags: ['bag', 'tote', 'handbag', 'purse', 'leather', 'michael-kors', 'fashion'], marts: ['mart2', 'mart3', 'mart4'] },

  // ==================== HOME & GARDEN (12 Products) ====================
  { id: 'prod-instant-pot-pro-8qt', name: 'Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker', brand: 'Instant Pot', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 89, originalPrice: 139, rating: 4.8, reviewCount: 16420, description: 'Replaces 9 kitchen appliances: pressure cooker, slow cooker, rice maker, steamer, sauté pan, yogurt maker, and warmer.', features: ['9-in-1 Smart Programs', 'Food-Grade 304 Stainless Steel Pot', 'Whisper-Quiet Steam Release', '15+ Safety Mechanisms'], tags: ['kitchen', 'cooking', 'appliance', 'instant-pot', 'cooker', 'home'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-dyson-v15-detect', name: 'Dyson V15 Detect Cordless Vacuum with Laser', brand: 'Dyson', category: 'Home & Garden', icon: 'vacuum', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 579, originalPrice: 749, rating: 4.8, reviewCount: 3810, description: 'Engineered with a Fluffy Optic cleaner head that reveals invisible dust on hard floors and adapts suction power.', features: ['Fluffy Optic Dust Illumination', 'Piezo Sensor Dust Counting', '60-Minute Fade-Free Suction', 'HEPA Filtration'], tags: ['vacuum', 'cleaner', 'dyson', 'cleaning', 'home', 'cordless'], marts: ['mart2', 'mart3'] },
  { id: 'prod-breville-barista-express', name: 'Breville Barista Express Espresso Coffee Machine', brand: 'Breville', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 559, originalPrice: 749, rating: 4.9, reviewCount: 6250, description: 'Create third-wave specialty coffee at home from bean to espresso in less than a minute with integrated burr grinder.', features: ['Integrated Conical Burr Grinder', 'Digital PID Temperature Control', '15-Bar Italian Pump', 'Microfoam Steam Wand'], tags: ['coffee', 'espresso', 'machine', 'kitchen', 'breville', 'barista', 'home'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-ninja-foodi-dualzone-airfryer', name: 'Ninja Foodi DualZone 10-Quart 2-Basket Air Fryer', brand: 'Ninja', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 169, originalPrice: 229, rating: 4.8, reviewCount: 8420, description: 'First air fryer with 2 independent baskets that let you cook 2 foods, 2 ways, at the same time with Smart Finish.', features: ['DualZone 2-Basket Technology', 'Smart Finish & Match Cook', '6-in-1 Air Fry, Roast, Bake & Dehydrate', '10-Quart XL Capacity'], tags: ['airfryer', 'air fryer', 'ninja', 'kitchen', 'cooking', 'appliance', 'home'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-kitchenaid-artisan-mixer', name: 'KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer', brand: 'KitchenAid', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 349, originalPrice: 449, rating: 4.9, reviewCount: 11200, description: 'Iconic culinary stand mixer with 10 mixing speeds, 59-point planetary mixing action, and stainless steel bowl.', features: ['5-Quart Stainless Steel Bowl', '10-Speed Slide Control', 'Power Hub for 15+ Attachments', 'Includes Dough Hook, Whisk & Beater'], tags: ['kitchenaid', 'mixer', 'baking', 'kitchen', 'appliance', 'home'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-philips-hue-starter-kit', name: 'Philips Hue White & Color Ambiance Smart Bulb Starter Kit', brand: 'Philips', category: 'Home & Garden', icon: 'bulb', palette: ['#0f172a', '#1e293b', '#38bdf8'], basePrice: 149, originalPrice: 199, rating: 4.7, reviewCount: 3190, description: 'Includes 4 A19 smart LED bulbs (16 million colors) and Hue Bridge for whole-home voice & app automation.', features: ['16 Million Colors + Warm-to-Cool White', 'Includes Philips Hue Bridge', 'Works with Alexa, HomeKit & Google', '25,000-Hour Bulb Lifespan'], tags: ['smart-home', 'philips', 'lighting', 'bulb', 'led', 'lights', 'home'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-irobot-roomba-j7-plus', name: 'iRobot Roomba j7+ Self-Emptying Robot Vacuum', brand: 'iRobot', category: 'Home & Garden', icon: 'vacuum', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 499, originalPrice: 699, rating: 4.7, reviewCount: 2740, description: 'PrecisionVision navigation identifies and avoids pet waste and charging cords, with 60-day Clean Base auto-emptying.', features: ['PrecisionVision Obstacle Avoidance', '60-Day Self-Emptying Clean Base', 'Smart Mapping & Room Scheduling', 'Dual Multi-Surface Rubber Brushes'], tags: ['roomba', 'robot', 'vacuum', 'cleaner', 'smart-home', 'cleaning', 'home'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-herman-miller-aeron-chair', name: 'Ergonomic Mesh Executive Office Chair (Lumbar Support)', brand: 'ComfortSeating', category: 'Home & Garden', icon: 'chair', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 289, originalPrice: 399, rating: 4.8, reviewCount: 1850, description: 'Breathable 8Z Pellicle elastomeric suspension mesh with PostureFit sacral-lumbar support and 4D adjustable armrests.', features: ['Breathable Suspension Mesh', 'Adjustable Lumbar Support', '4D Padded Armrests', '135-Degree Synchro-Tilt Lock'], tags: ['chair', 'office', 'furniture', 'ergonomic', 'home', 'desk'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-vitamix-a3500-blender', name: 'Vitamix Ascent Series A3500 Touchscreen Blender', brand: 'Vitamix', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 549, originalPrice: 649, rating: 4.9, reviewCount: 2410, description: 'Laser-cut hardened stainless-steel blades with 5 touchscreen program settings and Self-Detect container technology.', features: ['5 Touchscreen Program Settings', 'Laser-Cut Stainless Steel Blades', 'Programmable Built-In Timer', 'Self-Detect 64oz Container'], tags: ['blender', 'vitamix', 'smoothie', 'kitchen', 'appliance', 'home'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-nespresso-vertuo-next', name: 'Nespresso Vertuo Next Coffee and Espresso Maker', brand: 'Nespresso', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 139, originalPrice: 179, rating: 4.7, reviewCount: 4180, description: 'Centrifusion extraction technology reads each capsule barcode to brew 5 cup sizes with rich crema.', features: ['Centrifusion Barcode Brewing', '5 Cup Sizes (Espresso to Carafe)', '30-Second Fast Heat-Up', 'Bluetooth & Wi-Fi Updates'], tags: ['coffee', 'nespresso', 'espresso', 'kitchen', 'appliance', 'home'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-levoit-core-400s-purifier', name: 'Levoit Core 400S Smart True HEPA Air Purifier', brand: 'Levoit', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#38bdf8'], basePrice: 189, originalPrice: 219, rating: 4.8, reviewCount: 5320, description: '3-stage H13 True HEPA filtration with AirSight Plus laser dust sensor captures 99.97% of airborne particles.', features: ['H13 True HEPA 3-Stage Filter', 'AirSight Plus Laser Dust Sensor', '24dB QuietKEAP Sleep Mode', 'VeSync App & Voice Control'], tags: ['air purifier', 'purifier', 'hepa', 'levoit', 'home', 'appliance'], marts: ['mart2', 'mart3', 'mart4'] },
  { id: 'prod-ecobee-smart-thermostat', name: 'ecobee Smart Thermostat Premium with Air Quality Monitor', brand: 'ecobee', category: 'Home & Garden', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 219, originalPrice: 249, rating: 4.8, reviewCount: 1940, description: 'Zinc body smart thermostat with SmartSensor room occupancy detection, built-in air quality monitor, and Siri/Alexa.', features: ['Includes SmartSensor for Rooms', 'Built-In Indoor Air Quality Sensor', 'Saves Up to 26% on Heating/Cooling', 'Works with Apple HomeKit & Alexa'], tags: ['thermostat', 'smart-home', 'ecobee', 'home', 'energy'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },

  // ==================== BOOKS (8 Products) ====================
  { id: 'prod-psychology-of-money', name: 'The Psychology of Money (Special Hardcover Book)', brand: 'Morgan Housel', category: 'Books', icon: 'book', palette: ['#064e3b', '#0f172a', '#10b981'], basePrice: 15, originalPrice: 24, rating: 4.9, reviewCount: 12840, description: 'Timeless lessons on wealth, greed, and happiness through 19 short stories exploring how people think about money.', features: ['Hardcover Collector Edition', '256 Pages', 'New York Times Bestseller', 'Includes Bonus Chapter'], tags: ['book', 'books', 'finance', 'investing', 'psychology', 'money', 'bestseller'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-atomic-habits', name: 'Atomic Habits: An Easy & Proven Way to Build Good Habits', brand: 'James Clear', category: 'Books', icon: 'book', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 15, originalPrice: 27, rating: 4.9, reviewCount: 24910, description: 'A comprehensive, practical guide on how tiny daily changes transform into remarkable life-changing results.', features: ['Hardcover Edition', '320 Pages', 'Over 15 Million Copies Sold', 'Habit Tracker Templates Included'], tags: ['book', 'books', 'self-help', 'productivity', 'habits', 'bestseller'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-deep-work-cal-newport', name: 'Deep Work: Rules for Focused Success in a Distracted World', brand: 'Cal Newport', category: 'Books', icon: 'book', palette: ['#0f172a', '#172554', '#38bdf8'], basePrice: 14, originalPrice: 22, rating: 4.8, reviewCount: 9320, description: 'Essential strategies for mastering complicated information and producing better results in less time.', features: ['Hardcover Edition', '304 Pages', 'Wall Street Journal Bestseller', '4 Deep Work Scheduling Frameworks'], tags: ['book', 'books', 'productivity', 'focus', 'career', 'business'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-clean-code-robert-martin', name: 'Clean Code: A Handbook of Agile Software Craftsmanship', brand: 'Robert C. Martin', category: 'Books', icon: 'book', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 32, originalPrice: 49, rating: 4.8, reviewCount: 7450, description: 'The definitive software engineering guide to writing readable, maintainable, and refactorable production code.', features: ['464 Pages Technical Reference', 'Real-World Java & OOP Case Studies', 'Code Smells & Heuristics Chapter', 'Unit Testing Best Practices'], tags: ['book', 'books', 'programming', 'coding', 'software', 'engineering'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-zero-to-one-peter-thiel', name: 'Zero to One: Notes on Startups, or How to Build the Future', brand: 'Peter Thiel', category: 'Books', icon: 'book', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 16, originalPrice: 26, rating: 4.8, reviewCount: 11200, description: 'Contrarian insights on innovation, monopoly advantage, and building breakthrough technology companies.', features: ['Hardcover Edition', '224 Pages', 'Startup & Venture Capital Classic', 'Illustrated Diagrams'], tags: ['book', 'books', 'startups', 'business', 'entrepreneurship', 'tech'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-designing-data-intensive-apps', name: 'Designing Data-Intensive Applications (O\'Reilly Book)', brand: 'Martin Kleppmann', category: 'Books', icon: 'book', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 39, originalPrice: 59, rating: 4.9, reviewCount: 6840, description: 'The big ideas behind reliable, scalable, and maintainable distributed systems, databases, and stream processing.', features: ['616 Pages System Design Guide', 'Distributed Databases & Consensus', 'Batch & Stream Processing', 'Architecture Diagrams'], tags: ['book', 'books', 'programming', 'databases', 'system-design', 'software'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-pragmatic-programmer-20th', name: 'The Pragmatic Programmer: 20th Anniversary Edition', brand: 'David Thomas', category: 'Books', icon: 'book', palette: ['#064e3b', '#0f172a', '#34d399'], basePrice: 34, originalPrice: 49, rating: 4.9, reviewCount: 5120, description: 'Classic software development guide updated for modern engineering teams, automation, and career mastery.', features: ['Hardcover 20th Anniversary Edition', '352 Pages', 'DRY, Orthogonality & Tracer Bullets', 'Practical Coding Exercises'], tags: ['book', 'books', 'programming', 'coding', 'software', 'career'], marts: ['mart2', 'mart3', 'mart4'] },
  { id: 'prod-thinking-fast-and-slow', name: 'Thinking, Fast and Slow by Daniel Kahneman', brand: 'Daniel Kahneman', category: 'Books', icon: 'book', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 14, originalPrice: 22, rating: 4.8, reviewCount: 15800, description: 'Nobel laureate Daniel Kahneman explains the two systems that drive the way we think and make choices.', features: ['512 Pages', 'Winner of the National Academy Book Award', 'System 1 vs System 2 Behavioral Science', 'Prospect Theory Appendix'], tags: ['book', 'books', 'psychology', 'economics', 'decision-making', 'bestseller'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },

  // ==================== SPORTS (10 Products) ====================
  { id: 'prod-manduka-pro-yoga-mat', name: 'Manduka PRO Yoga and Pilates Mat (6mm)', brand: 'Manduka', category: 'Sports', icon: 'yoga', palette: ['#064e3b', '#0f172a', '#10b981'], basePrice: 95, originalPrice: 138, rating: 4.7, reviewCount: 1420, description: 'Ultra-dense 6mm performance yoga mat with closed-cell hygienic surface and high-grip texture.', features: ['6mm Ultra-Dense Cushioning', 'OEKO-TEX Certified Non-Toxic', 'Closed-Cell Moisture Barrier', 'Lifetime Guarantee'], tags: ['yoga', 'mat', 'fitness', 'sports', 'exercise', 'pilates', 'gym'], marts: ['mart1', 'mart2', 'mart4'] },
  { id: 'prod-bowflex-selecttech-552', name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)', brand: 'Bowflex', category: 'Sports', icon: 'dumbbell', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 369, originalPrice: 549, rating: 4.8, reviewCount: 8930, description: 'Replaces 15 sets of weights. Adjusts from 5 to 52.5 lbs in 2.5-lb increments with the turn of a dial.', features: ['5 to 52.5 lbs Weight Range', 'Replaces 30 Individual Dumbbells', 'Quiet Durable Molding', 'Includes Storage Trays'], tags: ['gym', 'dumbbells', 'weights', 'fitness', 'strength', 'sports', 'workout'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-garmin-forerunner-265', name: 'Garmin Forerunner 265 GPS Running Smartwatch', brand: 'Garmin', category: 'Sports', icon: 'watch', palette: ['#0f172a', '#1e293b', '#06b6d4'], basePrice: 379, originalPrice: 449, rating: 4.9, reviewCount: 2150, description: 'Bright AMOLED touchscreen display with training readiness score, multi-band GPS, and 13-day battery.', features: ['1.3" Colorful AMOLED Touchscreen', 'Multi-Band GNSS with SatIQ', '13-Day Smartwatch Battery', 'Running Dynamics'], tags: ['smartwatch', 'watch', 'garmin', 'running', 'fitness', 'gps', 'sports'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-theragun-pro-massager', name: 'Therabody Theragun PRO Deep Tissue Percussion Massager', brand: 'Therabody', category: 'Sports', icon: 'appliance', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 399, originalPrice: 549, rating: 4.8, reviewCount: 1920, description: 'Professional-grade deep muscle treatment with rotating arm, OLED screen, and 6 scientifically calibrated attachments.', features: ['16mm Amplitude Deep Muscle Relief', 'QuietForce Brushless Motor', 'Built-In OLED Force Meter', '300-Minute Dual Battery Pack'], tags: ['massager', 'theragun', 'recovery', 'fitness', 'gym', 'sports'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-wilson-pro-staff-racket', name: 'Wilson Pro Staff 97 v14 Performance Tennis Racket', brand: 'Wilson', category: 'Sports', icon: 'racket', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 219, originalPrice: 279, rating: 4.8, reviewCount: 840, description: 'Tour-level precision tennis frame with Paradigm Bending carbon fiber construction and braided graphite feel.', features: ['Paradigm Bending Carbon Construction', 'Braided 45-Degree Graphite', '16x19 String Pattern', 'Ergonomic End Cap'], tags: ['tennis', 'wilson', 'racket', 'racquet', 'sports', 'outdoor'], marts: ['mart2', 'mart3', 'mart4'] },
  { id: 'prod-hydroflask-40oz-tumbler', name: 'Hydro Flask 40 oz Wide Mouth Insulated Stainless Bottle', brand: 'Hydro Flask', category: 'Sports', icon: 'bottle', palette: ['#0f172a', '#172554', '#38bdf8'], basePrice: 39, originalPrice: 49, rating: 4.9, reviewCount: 5430, description: 'TempShield double-wall vacuum insulation keeps beverages ice-cold for 24 hours or piping hot for 12 hours.', features: ['TempShield Vacuum Insulation', '18/8 Pro-Grade Stainless Steel', 'Leakproof Flex Straw Cap', 'BPA-Free & Dishwasher Safe'], tags: ['bottle', 'water bottle', 'flask', 'hydration', 'gym', 'outdoor', 'sports'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-yonex-astrox-99-badminton', name: 'Yonex Astrox 99 Pro Carbon Graphite Badminton Racket', brand: 'Yonex', category: 'Sports', icon: 'racket', palette: ['#064e3b', '#0f172a', '#34d399'], basePrice: 179, originalPrice: 229, rating: 4.8, reviewCount: 1120, description: 'Rotational Generator System head-heavy badminton frame crafted in Japan with Namd high-flex carbon.', features: ['Namd Graphite Shaft', 'Rotational Generator Weight Distribution', 'Energy Boost Cap Plus', 'Isometric Sweet Spot Frame'], tags: ['badminton', 'racket', 'racquet', 'yonex', 'sports'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-spalding-tf1000-basketball', name: 'Spalding Legacy TF-1000 Indoor Game Basketball', brand: 'Spalding', category: 'Sports', icon: 'dumbbell', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 64, originalPrice: 85, rating: 4.8, reviewCount: 1680, description: 'Wet-grip microfiber composite cover with Shooter\'s Seam design and rotationally balanced butyl bladder.', features: ['Wet-Grip Microfiber Composite Cover', 'Official Size 7 (29.5")', 'Deep Channel Shooter\'s Seam', 'Nylon Windings for Structural Integrity'], tags: ['basketball', 'ball', 'spalding', 'sports', 'indoor'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-trx-all-in-one-suspension', name: 'TRX All-In-One Bodyweight Resistance Suspension Trainer', brand: 'TRX', category: 'Sports', icon: 'dumbbell', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 149, originalPrice: 199, rating: 4.7, reviewCount: 2340, description: 'Full-body strength, cardio, and core resistance training system tested to support up to 700 lbs.', features: ['Supports Up to 700 lbs', 'Indoor Door Anchor + Outdoor Strap', 'Foam Handles & Foot Cradles', 'Mesh Carry Travel Bag'], tags: ['trx', 'gym', 'fitness', 'workout', 'resistance', 'sports'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-nike-brasilia-gym-duffel', name: 'Nike Brasilia 9.5 Training Gym Duffel Bag (60L)', brand: 'Nike', category: 'Sports', icon: 'bag', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 42, originalPrice: 55, rating: 4.8, reviewCount: 3120, description: 'Durable 60-liter gym bag with ventilated shoe compartment, coated water-resistant bottom shield, and padded strap.', features: ['60L Main Zippered Compartment', 'Ventilated Footwear Pocket', 'Water-Resistant Coated Bottom', 'Detachable Padded Shoulder Strap'], tags: ['nike', 'bag', 'gym bag', 'duffel', 'sports', 'fitness'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },

  // ==================== BEAUTY (8 Products) ====================
  { id: 'prod-fenty-pro-filtr-foundation', name: 'Fenty Beauty Pro Filt\'r Soft Matte Longwear Foundation', brand: 'Fenty Beauty', category: 'Beauty', icon: 'cosmetics', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 34, originalPrice: 40, rating: 4.7, reviewCount: 4320, description: 'Soft matte, long-wear foundation with climate-adaptive technology that resists sweat and humidity.', features: ['50 Inclusive Shades', 'Oil-Free & Sweat-Resistant', 'Medium to Full Buildable Coverage', '100% Cruelty-Free'], tags: ['makeup', 'foundation', 'beauty', 'skincare', 'fenty', 'cosmetics'], marts: ['mart1', 'mart2', 'mart3'] },
  { id: 'prod-dyson-airwrap-multi-styler', name: 'Dyson Airwrap Multi-Styler Complete Long', brand: 'Dyson', category: 'Beauty', icon: 'styler', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 519, originalPrice: 599, rating: 4.8, reviewCount: 3670, description: 'Curl, shape, smooth, and hide flyaways using the Coanda airflow effect with no extreme heat damage.', features: ['Enhanced Coanda Airflow Styling', 'Intelligent Heat Control', '6 Engineered Attachments', 'Presentation Case Included'], tags: ['haircare', 'styler', 'hair dryer', 'dyson', 'beauty', 'luxury'], marts: ['mart1', 'mart3', 'mart4'] },
  { id: 'prod-dior-sauvage-elixir', name: 'Dior Sauvage Eau de Parfum Spray (100ml)', brand: 'Dior', category: 'Beauty', icon: 'cosmetics', palette: ['#0f172a', '#172554', '#38bdf8'], basePrice: 135, originalPrice: 165, rating: 4.9, reviewCount: 5120, description: 'Fresh Calabrian bergamot and spicy Sichuan pepper wrapped in warm Papua New Guinean vanilla absolute.', features: ['100ml Refillable Spray Bottle', 'Notes of Bergamot, Ambroxan & Vanilla', '12-Hour Long-Lasting Sillage', 'Made in France'], tags: ['perfume', 'fragrance', 'cologne', 'dior', 'sauvage', 'beauty', 'luxury'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-la-roche-posay-vitamin-c', name: 'La Roche-Posay 10% Pure Vitamin C Anti-Aging Serum', brand: 'La Roche-Posay', category: 'Beauty', icon: 'cosmetics', palette: ['#064e3b', '#0f172a', '#34d399'], basePrice: 36, originalPrice: 45, rating: 4.7, reviewCount: 2890, description: 'Dermatologist-tested brightening face serum formulated with 10% pure Vitamin C, salicylic acid, and neurosensine.', features: ['10% Pure L-Ascorbic Acid', 'Salicylic Acid & Thermal Spring Water', 'Safe for Sensitive Skin', 'Allergy-Tested & Paraben-Free'], tags: ['skincare', 'serum', 'vitamin-c', 'beauty', 'face', 'cream'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-chanel-coco-mademoiselle', name: 'Chanel Coco Mademoiselle Eau de Parfum (100ml)', brand: 'Chanel', category: 'Beauty', icon: 'cosmetics', palette: ['#0f172a', '#1e293b', '#10b981'], basePrice: 152, originalPrice: 175, rating: 4.9, reviewCount: 3840, description: 'Sparkling orange blossom, Turkish rose, and jasmine layered over Indonesian patchouli and white musk.', features: ['100ml Signature Glass Flacon', 'Vibrant Amber-Floral Accord', 'Long-Lasting Eau de Parfum', 'Authentic French Parfumerie'], tags: ['perfume', 'chanel', 'fragrance', 'beauty', 'luxury'], marts: ['mart3'] },
  { id: 'prod-cerave-hydrating-cleanser', name: 'CeraVe Hydrating Facial Cleanser with Ceramides & Hyaluronic Acid', brand: 'CeraVe', category: 'Beauty', icon: 'cosmetics', palette: ['#0f172a', '#1e293b', '#2dd4bf'], basePrice: 16, originalPrice: 22, rating: 4.8, reviewCount: 9420, description: 'Developed with dermatologists to cleanse and refresh skin without stripping natural moisture barrier.', features: ['3 Essential Ceramides (1, 3, 6-II)', 'Hyaluronic Acid Moisture Retention', 'MVE 24-Hour Hydration Delivery', 'Non-Comedogenic & Fragrance-Free'], tags: ['skincare', 'cleanser', 'face wash', 'cerave', 'beauty'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-ordinary-niacinamide-10', name: 'The Ordinary Niacinamide 10% + Zinc 1% Oil Control Serum', brand: 'The Ordinary', category: 'Beauty', icon: 'cosmetics', palette: ['#0f172a', '#1e293b', '#14b8a6'], basePrice: 11, originalPrice: 16, rating: 4.7, reviewCount: 7310, description: 'High-strength vitamin and mineral blemish formula that visibly brightens skin tone and minimizes pores.', features: ['10% Niacinamide (Vitamin B3)', '1% PCA Zinc Sebum Balance', 'Water-Based Vegan Formula', 'Cruelty-Free & Alcohol-Free'], tags: ['skincare', 'serum', 'niacinamide', 'the-ordinary', 'beauty'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] },
  { id: 'prod-philips-oneblade-pro-360', name: 'Philips Norelco OneBlade Pro 360 Hybrid Face & Body Trimmer', brand: 'Philips', category: 'Beauty', icon: 'styler', palette: ['#064e3b', '#0f172a', '#10b981'], basePrice: 69, originalPrice: 89, rating: 4.8, reviewCount: 4150, description: 'Innovative 360 Blade flexes in all directions with a 14-length precision dial comb and 90-minute Li-ion battery.', features: ['360-Degree Flexing Stainless Blade', '14-Length Precision Lock Comb', 'Wet & Dry Waterproof Use', '90-Minute Rechargeable Battery'], tags: ['trimmer', 'shaver', 'grooming', 'philips', 'oneblade', 'beauty'], marts: ['mart1', 'mart2', 'mart3', 'mart4'] }
];

const INITIAL_PRODUCTS = RAW_CATALOG.map((item, idx) => {
  const martIds = item.marts || AVAILABILITY_PATTERNS[idx % AVAILABILITY_PATTERNS.length];
  const [bgStart, bgEnd, accent] = item.palette;
  return {
    productId: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    description: item.description,
    image: createProductImage(item.name, item.brand, item.category, item.icon, bgStart, bgEnd, accent, item.id),
    rating: item.rating,
    reviewCount: item.reviewCount,
    features: item.features,
    tags: item.tags,
    offers: makeOffers(item.basePrice, item.originalPrice, martIds)
  };
});

/**
 * Natural Language / Conversational Search Parser
 * Handles queries like:
 * - "i want nike shoes"
 * - "i want nike shoes and a shirt"
 * - "show me apple laptop or headphones"
 */
const CONVERSATIONAL_STOP_WORDS = new Set([
  'i', 'want', 'need', 'looking', 'for', 'buy', 'get', 'show', 'me', 'find', 'search',
  'some', 'a', 'an', 'the', 'please', 'can', 'you', 'give', 'have', 'in', 'at', 'from',
  'with', 'good', 'best', 'cheap', 'price', 'near', 'my', 'house', 'mart', 'store',
  'to', 'of', 'is', 'are', 'something', 'like', 'that'
]);

const SYNONYM_EXPANSIONS = {
  shoe: ['shoes', 'sneakers', 'footwear'],
  shoes: ['shoes', 'sneakers', 'footwear'],
  sneaker: ['sneakers', 'shoes', 'footwear'],
  sneakers: ['sneakers', 'shoes', 'footwear'],
  shirt: ['shirt', 't-shirt', 'tshirt', 'polo'],
  shirts: ['shirt', 't-shirt', 'tshirt', 'polo'],
  tshirt: ['shirt', 't-shirt', 'tshirt'],
  phone: ['smartphone'],
  phones: ['smartphone'],
  mobile: ['smartphone'],
  smartphone: ['smartphone'],
  laptop: ['laptop', 'macbook', 'xps', 'zephyrus', 'spectre', 'notebook'],
  earphone: ['earbuds', 'airpods', 'headphones'],
  earphones: ['earbuds', 'airpods', 'headphones'],
  headphone: ['headphones', 'headset', 'earbuds'],
  coat: ['jacket', 'puffer', 'outerwear'],
  pant: ['jeans', 'pants', 'trousers', 'denim'],
  pants: ['jeans', 'pants', 'trousers', 'denim']
};

function parseConversationalQuery(rawQuery = '') {
  const cleaned = rawQuery.toLowerCase().trim();
  if (!cleaned) return [];

  // Split multi-item requests on "and", "or", ",", "&", "+", "also", "plus"
  const clauses = cleaned
    .split(/\b(?:and|or|also|plus|with)\b|[,&+]/i)
    .map(c => c.trim())
    .filter(Boolean);

  const parsedClauses = clauses
    .map(clause => {
      const tokens = clause
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1 && !CONVERSATIONAL_STOP_WORDS.has(t));
      return tokens;
    })
    .filter(tokens => tokens.length > 0);

  return parsedClauses;
}

function matchesProductConversational(product, rawQuery) {
  const cleaned = (rawQuery || '').trim().toLowerCase();
  if (!cleaned) return true;

  const searchableText = [
    product.name,
    product.brand,
    product.category,
    product.description,
    ...(product.tags || []),
    ...(product.features || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Direct substring match first (exact product name / phrase searches)
  if (searchableText.includes(cleaned)) return true;

  const clauses = parseConversationalQuery(cleaned);
  if (clauses.length === 0) return false;

  // Item keywords are matched only against identity fields (name, brand, category, tags),
  // so a gym bag whose description mentions a "shoe compartment" is not returned for "nike shoes"
  const identityText = [product.name, product.brand, product.category, ...(product.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // A product matches if it satisfies ANY requested item clause (e.g. Clause 1: ["nike", "shoes"] OR Clause 2: ["shirt"])
  // Within a single clause, EVERY meaningful keyword (or its synonym) must appear in the product's identity fields
  return clauses.some(tokens =>
    tokens.every(token => {
      const candidates = SYNONYM_EXPANSIONS[token] || [token, token.replace(/s$/, '')];
      // Word-start boundary so "phone" does not match inside "headphones"
      return candidates.some(c => c && new RegExp(`(^|[^a-z0-9])${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(identityText));
    })
  );
}

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
        const hasExactProductImage = sample?.image === '/products/prod-iphone-16-pro-max.jpg';

        if (count !== INITIAL_PRODUCTS.length || !hasExactProductImage) {
          console.log(`🔄 Running real Hugging Face BERT (${BERT_MODEL_ID}) on ${INITIAL_PRODUCTS.length} products across 4 marts (50+ products per mart)...`);
          const enriched = await this.enrichProductsWithBERT(INITIAL_PRODUCTS);
          await Product.deleteMany({});
          await Product.insertMany(enriched);
          console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} products across 4 marts (each mart has 50+ products) with exact product images & BERT!`);
          const allDocs = await Product.find({}).lean();
          const allFormatted = allDocs.map(doc => this.formatProduct(doc));
          await vectorDbService.indexMartProducts(allFormatted);
        } else if (!vectorDbService.getStatus().initialized) {
          const allDocs = await Product.find({}).lean();
          const allFormatted = allDocs.map(doc => this.formatProduct(doc));
          await vectorDbService.indexMartProducts(allFormatted);
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

    const docs = await Product.find(filter).lean();
    const formatted = docs.map(doc => this.formatProduct(doc, store, martId));

    if (query && query.trim()) {
      return formatted.filter(product => matchesProductConversational(product, query));
    }

    return formatted;
  }

  async ragSearchProducts(rawQuery = '', options = {}) {
    await this.seedIfEmpty();
    const docs = await Product.find({}).lean();
    const allFormatted = docs.map(doc => this.formatProduct(doc));
    return vectorDbService.retrieveProductsRAG(rawQuery, allFormatted, options);
  }

  getVectorDbStatus() {
    return vectorDbService.getStatus();
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
