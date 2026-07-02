/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // ---- Products (prices stored as whole LKR units) ----
  const products = [
    { id: 'seed-prod-1', name: 'Ceylon Cinnamon Premium Quality',    price: 1450, rating: 5,   reviewCount: 128, image: '/images/products/cinnamon.png', badge: 'Best Seller', category: 'spices',   sortOrder: 1 },
    { id: 'seed-prod-2', name: 'Clove Whole Premium Quality',        price: 1350, rating: 4.5, reviewCount: 96,  image: '/images/products/clove.png',    badge: 'Best Seller', category: 'spices',   sortOrder: 2 },
    { id: 'seed-prod-3', name: 'Cardamom Green Premium Quality',     price: 1750, rating: 5,   reviewCount: 123, image: '/images/products/cardamom.png', badge: 'Best Seller', category: 'spices',   sortOrder: 3 },
    { id: 'seed-prod-4', name: 'Black Pepper Whole Premium Quality', price: 1750, rating: 4.5, reviewCount: 118, image: '/images/products/pepper.png',   badge: 'Best Seller', category: 'spices',   sortOrder: 4 },
    { id: 'seed-prod-5', name: 'Ceylon Oud Pure Perfume 12ml',       price: 9950, rating: 5,   reviewCount: 87,  image: '/images/products/perfume.png',  badge: 'Best Seller', category: 'perfumes', sortOrder: 5 },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: p, create: { ...p, currency: 'LKR' } });
  }

  // ---- Categories ----
  const categories = [
    { id: 'seed-cat-1', name: 'CINNAMON',         image: '/images/products/cinnamon.png', href: '/shop/cinnamon',     sortOrder: 1 },
    { id: 'seed-cat-2', name: 'CLOVE',            image: '/images/products/clove.png',    href: '/shop/clove',        sortOrder: 2 },
    { id: 'seed-cat-3', name: 'CARDAMOM',         image: '/images/products/cardamom.png', href: '/shop/cardamom',     sortOrder: 3 },
    { id: 'seed-cat-4', name: 'BLACK PEPPER',     image: '/images/products/pepper.png',   href: '/shop/black-pepper', sortOrder: 4 },
    { id: 'seed-cat-5', name: 'AGARWOOD PERFUME', image: '/images/products/perfume.png',  href: '/shop/perfumes',     sortOrder: 5 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
  }

  // ---- Testimonials ----
  const testimonials = [
    { id: 'seed-test-1', quote: "The quality is unmatched. The aroma, the packaging, the taste—everything speaks premium. Aromavitae brings the true essence of Sri Lanka to the world.", author: 'Sarah M.', location: 'Australia',      rating: 5, sortOrder: 1 },
    { id: 'seed-test-2', quote: "I've tried many cinnamon brands but nothing comes close to AromaVitae's Ceylon Cinnamon. The fragrance alone tells you it's the real deal. Absolutely love it!", author: 'James R.', location: 'United Kingdom', rating: 5, sortOrder: 2 },
    { id: 'seed-test-3', quote: 'The Ceylon Oud perfume is divine. It\'s subtle, long-lasting, and truly unique. I get compliments every time I wear it. A hidden gem from Sri Lanka!', author: 'Amira K.', location: 'UAE',           rating: 5, sortOrder: 3 },
    { id: 'seed-test-4', quote: 'Ordered the gift set for my mother and she was absolutely thrilled. The presentation is gorgeous and the quality of spices is outstanding. Will order again!', author: 'David L.', location: 'Canada',        rating: 5, sortOrder: 4 },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.upsert({ where: { id: t.id }, update: t, create: t });
  }

  // ---- Singletons ----
  const singletons: Record<string, unknown> = {
    hero: {
      slides: [
        { heading: 'The True Aroma\nof Ceylon Heritage',  subheading: "From the lush lands of Sri Lanka comes nature's finest spices and timeless agarwood perfumes — crafted with passion, purity, and centuries of tradition.", image: '/images/hero/hero-banner.png', ctaPrimary: { label: 'EXPLORE COLLECTION', href: '/shop' }, ctaSecondary: { label: 'SHOP NOW', href: '/shop' } },
        { heading: "Ceylon's Finest\nSpice Collection",   subheading: 'Premium cinnamon, cardamom, clove, and black pepper — hand-picked from the spice gardens of Ceylon for unmatched purity and flavour.', image: '/images/hero/hero-banner.png', ctaPrimary: { label: 'DISCOVER SPICES', href: '/spices' }, ctaSecondary: { label: 'VIEW ALL', href: '/shop' } },
        { heading: 'Timeless Agarwood\nPerfumes',         subheading: 'Experience the mystique of Sri Lankan agarwood — rare, luxurious, and crafted into perfumes that captivate the senses.', image: '/images/hero/hero-banner.png', ctaPrimary: { label: 'EXPLORE PERFUMES', href: '/perfumes' }, ctaSecondary: { label: 'LEARN MORE', href: '/heritage' } },
      ],
      autoPlayMs: 6000,
    },
    story: {
      ourStory: {
        eyebrow: 'OUR STORY',
        heading: 'Rooted in Nature.\nRefined for Today.',
        body: "Aromavitae is a celebration of Sri Lanka's rich natural heritage. From the spice gardens of Ceylon to the rare agarwood forests, we source the finest gifts of nature and craft them with care, to bring purity, authenticity, and timeless luxury to your life.",
        ctaLabel: 'DISCOVER OUR STORY',
        ctaHref: '/our-story',
      },
      heritage: {
        eyebrow: 'HERITAGE & CRAFTSMANSHIP',
        heading: 'The Pride of Sri Lanka',
        body: "For generations, our artisans and farmers have perfected the art of cultivating, harvesting, and crafting the world's finest spices and agarwood.",
        badges: [
          { icon: 'book',  label: 'Traditional Knowledge' },
          { icon: 'leaf',  label: 'Sustainable Practices' },
          { icon: 'shield', label: 'Ethical Sourcing' },
        ],
        ctaLabel: 'LEARN MORE ABOUT OUR HERITAGE',
        ctaHref: '/heritage',
      },
    },
    navbar: {
      brand: { name: 'AROMAVITAE', tagline: "Nature's Finest. Ceylon's Pride." },
      links: [
        { label: 'HOME', href: '/' },
        { label: 'SHOP', href: '/shop', children: [
          { label: 'All Products', href: '/shop' },
          { label: 'Spices', href: '/shop/spices' },
          { label: 'Perfumes', href: '/shop/perfumes' },
          { label: 'Gift Sets', href: '/shop/gift-sets' },
        ]},
        { label: 'PERFUMES', href: '/perfumes' },
        { label: 'SPICES', href: '/spices' },
        { label: 'GIFT SETS', href: '/gift-sets' },
        { label: 'OUR STORY', href: '/our-story' },
        { label: 'HERITAGE', href: '/heritage' },
        { label: 'JOURNAL', href: '/journal' },
        { label: 'CONTACT', href: '/contact' },
      ],
      cta: { label: 'SHOP NOW', href: '/shop' },
    },
    footer: {
      brand: {
        name: 'AROMAVITAE',
        tagline: "Nature's Finest. Ceylon's Pride.",
        description: 'Premium spices and Sri Lankan agarwood perfumes, crafted with tradition, purity, and passion.',
      },
      columns: [
        { title: 'SHOP', links: [
          { label: 'All Products', href: '/shop' },
          { label: 'Spices', href: '/shop/spices' },
          { label: 'Perfumes', href: '/shop/perfumes' },
          { label: 'Gift Sets', href: '/shop/gift-sets' },
          { label: 'New Arrivals', href: '/shop/new' },
          { label: 'Best Sellers', href: '/shop/best-sellers' },
        ]},
        { title: 'CUSTOMER CARE', links: [
          { label: 'Shipping & Delivery', href: '/shipping' },
          { label: 'Returns & Refunds', href: '/returns' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Track Your Order', href: '/track' },
          { label: 'Terms & Conditions', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
        ]},
        { title: 'ABOUT', links: [
          { label: 'Our Story', href: '/our-story' },
          { label: 'Heritage', href: '/heritage' },
          { label: 'Sustainability', href: '/sustainability' },
          { label: 'Journal', href: '/journal' },
          { label: 'Contact Us', href: '/contact' },
        ]},
      ],
      contact: { phone: '+94 11 234 5678', email: 'info@aromavitae.lk', location: 'Colombo, Sri Lanka' },
      newsletter: { title: 'STAY CONNECTED', body: 'Subscribe for exclusive offers, new arrivals & stories.' },
      social: [
        { label: 'Facebook',  href: '#' },
        { label: 'Instagram', href: '#' },
        { label: 'YouTube',   href: '#' },
        { label: 'LinkedIn',  href: '#' },
      ],
      payments: ['VISA', 'MC', 'PayPal', 'AMEX', 'Maestro'],
      legal: { copyright: '© 2025 Aromavitae (Pvt) Ltd. All Rights Reserved.' },
    },
    announcement: {
      messages: [
        'Rooted in Tradition. Refined for Today.',
        'Premium Spices & Sri Lankan Agarwood Perfumes',
        'Worldwide Shipping',
        '100% Natural',
        'Export Quality',
      ],
    },
    giftSetsBanner: {
      eyebrow: 'THE PERFECT GIFT OF NATURE',
      heading: 'Premium Gift Sets',
      body: 'Elegantly curated gift sets featuring our finest spices and agarwood perfumes.',
      image: '/images/products/cardamom.png',
      ctaLabel: 'EXPLORE GIFT SETS',
      ctaHref: '/gift-sets',
    },
  };

  for (const [key, data] of Object.entries(singletons)) {
    await prisma.singleton.upsert({
      where: { key },
      update: { data: data as object },
      create: { key, data: data as object },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
