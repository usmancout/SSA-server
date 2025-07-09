export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  store: string;
  inStock: boolean;
  description: string;
  features: string[];
  tags: string[];
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 1199,
    originalPrice: 1299,
    rating: 4.8,
    reviewCount: 2847,
    image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    store: 'TechMart',
    inStock: true,
    description: 'The most advanced iPhone yet with titanium design and A17 Pro chip.',
    features: ['A17 Pro chip', 'Titanium build', '5x optical zoom', 'Action Button'],
    tags: ['smartphone', 'apple', 'premium', 'camera']
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    brand: 'Apple',
    price: 1099,
    rating: 4.9,
    reviewCount: 1256,
    image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    store: 'ElectroWorld',
    inStock: true,
    description: 'Supercharged by the M3 chip, ultra-thin and lightweight laptop.',
    features: ['M3 chip', '18-hour battery', 'Retina display', 'Touch ID'],
    tags: ['laptop', 'apple', 'portable', 'productivity']
  },
  {
    id: '3',
    name: 'Nike Air Jordan 1 Retro',
    brand: 'Nike',
    price: 170,
    originalPrice: 200,
    rating: 4.6,
    reviewCount: 892,
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Fashion',
    store: 'SneakerHub',
    inStock: true,
    description: 'Classic basketball shoe with timeless style and premium leather.',
    features: ['Premium leather', 'Air cushioning', 'Rubber outsole', 'Iconic design'],
    tags: ['sneakers', 'basketball', 'retro', 'style']
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    price: 399,
    originalPrice: 450,
    rating: 4.7,
    reviewCount: 3421,
    image: 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Electronics',
    store: 'AudioPlus',
    inStock: false,
    description: 'Industry-leading noise canceling headphones with premium sound.',
    features: ['30hr battery', 'Quick charge', 'Multipoint connection', 'Touch controls'],
    tags: ['headphones', 'wireless', 'noise-canceling', 'premium']
  },
  {
    id: '5',
    name: 'Instant Pot Duo 7-in-1',
    brand: 'Instant Pot',
    price: 89,
    originalPrice: 120,
    rating: 4.5,
    reviewCount: 15743,
    image: 'https://images.pexels.com/photos/4252135/pexels-photo-4252135.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Home & Garden',
    store: 'KitchenMart',
    inStock: true,
    description: 'Multi-use pressure cooker that replaces 7 kitchen appliances.',
    features: ['7-in-1 functionality', 'Stainless steel', 'Smart programs', 'Safety features'],
    tags: ['kitchen', 'cooking', 'pressure-cooker', 'multi-use']
  },
  {
    id: '6',
    name: 'The Psychology of Money',
    brand: 'Morgan Housel',
    price: 16,
    originalPrice: 20,
    rating: 4.8,
    reviewCount: 8234,
    image: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Books',
    store: 'BookCorner',
    inStock: true,
    description: 'Timeless lessons on wealth, greed, and happiness.',
    features: ['Paperback', '256 pages', 'Financial wisdom', 'Bestseller'],
    tags: ['finance', 'psychology', 'investment', 'money']
  },
  {
    id: '7',
    name: 'Yoga Mat Premium',
    brand: 'Manduka',
    price: 68,
    rating: 4.4,
    reviewCount: 567,
    image: 'https://images.pexels.com/photos/892618/pexels-photo-892618.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Sports',
    store: 'FitGear',
    inStock: true,
    description: 'High-performance yoga mat with superior grip and cushioning.',
    features: ['6mm thickness', 'Non-slip surface', 'Eco-friendly', 'Lifetime guarantee'],
    tags: ['yoga', 'fitness', 'exercise', 'wellness']
  },
  {
    id: '8',
    name: 'Fenty Beauty Foundation',
    brand: 'Fenty Beauty',
    price: 38,
    rating: 4.6,
    reviewCount: 2156,
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Beauty',
    store: 'BeautyWorld',
    inStock: true,
    description: 'Full-coverage foundation with 50 shades for all skin tones.',
    features: ['50 shades', 'Long-wearing', 'Buildable coverage', 'Inclusive'],
    tags: ['makeup', 'foundation', 'inclusive', 'coverage']
  }
];

export const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Books',
  'Sports',
  'Beauty'
];

export const stores = [
  'All Stores',
  'TechMart',
  'ElectroWorld',
  'SneakerHub',
  'AudioPlus',
  'KitchenMart',
  'BookCorner',
  'FitGear',
  'BeautyWorld'
];

export const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Most Popular' }
];