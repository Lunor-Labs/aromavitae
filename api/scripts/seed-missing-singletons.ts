/**
 * Idempotent, non-destructive singleton seeder.
 *
 * Inserts the full seed content for any singleton key that does NOT already
 * exist in the DB. Rows that already exist (i.e. anything the admin has
 * customized) are left untouched. Safe to run in any environment.
 *
 * Run: `npx tsx scripts/seed-missing-singletons.ts` (from api/).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STORAGE_BASE = process.env.S3_PUBLIC_URL ?? '';
const asset = (path: string) => `${STORAGE_BASE}/${path}`;

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
      { label: 'facebook',  href: '#' },
      { label: 'instagram', href: '#' },
      { label: 'youtube',   href: '#' },
      { label: 'linkedin',  href: '#' },
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
    image: asset('products/cardamom.png'),
    ctaLabel: 'EXPLORE GIFT SETS',
    ctaHref: '/gift-sets',
  },
};

async function main() {
  console.log('Checking singleton rows...');
  let inserted = 0;
  let skipped = 0;
  for (const [key, data] of Object.entries(singletons)) {
    const existing = await prisma.singleton.findUnique({ where: { key } });
    if (existing) {
      console.log(`  [skip]   ${key} (already exists)`);
      skipped++;
      continue;
    }
    await prisma.singleton.create({ data: { key, data: data as object } });
    console.log(`  [insert] ${key}`);
    inserted++;
  }
  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
