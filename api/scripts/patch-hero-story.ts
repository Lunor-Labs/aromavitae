/**
 * Idempotent patch: rewrite absolute Supabase URLs on the hero/story
 * singletons back to relative /images/... paths.
 *
 * Background: hero/story assets are served from Next.js public/ (see
 * scripts/sync-storage.mjs which skips those subdirs). If the DB was
 * seeded before that contract existed, hero.slides[].image and
 * story.ourStory.image may still hold full Supabase URLs, which 404 in
 * production because those objects were never uploaded.
 *
 * Safe to re-run — if nothing needs changing, no write happens.
 *
 * Usage:
 *   # local
 *   npm run patch:hero-story
 *   # prod
 *   DATABASE_URL=<prod-url> npx tsx scripts/patch-hero-story.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_HERO_STORY_RE = /^https?:\/\/.*\/aromavitae\/(hero|story)\/(.+)$/i;

function rewrite(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const m = url.match(SUPABASE_HERO_STORY_RE);
  if (!m) return null;
  return `/images/${m[1]}/${m[2]}`;
}

type HeroSlide = { image?: string; [k: string]: unknown };
type HeroData = { slides?: HeroSlide[]; [k: string]: unknown };
type StoryData = { ourStory?: { image?: string; [k: string]: unknown }; [k: string]: unknown };

function patchHero(data: HeroData): { data: HeroData; changed: number } {
  if (!Array.isArray(data.slides)) return { data, changed: 0 };
  let changed = 0;
  const slides = data.slides.map((s) => {
    const next = rewrite(s.image);
    if (next && next !== s.image) {
      changed++;
      return { ...s, image: next };
    }
    return s;
  });
  return { data: { ...data, slides }, changed };
}

function patchStory(data: StoryData): { data: StoryData; changed: number } {
  const current = data.ourStory?.image;
  const next = rewrite(current);
  if (!next || next === current) return { data, changed: 0 };
  return {
    data: { ...data, ourStory: { ...data.ourStory, image: next } },
    changed: 1,
  };
}

async function patchSingleton(
  key: 'hero' | 'story',
  patcher: (d: any) => { data: any; changed: number },
) {
  const row = await prisma.singleton.findUnique({ where: { key } });
  if (!row) {
    console.log(`[${key}] not found — skipping`);
    return;
  }
  const { data: nextData, changed } = patcher(row.data as any);
  if (changed === 0) {
    console.log(`[${key}] already clean — no changes`);
    return;
  }
  await prisma.singleton.update({ where: { key }, data: { data: nextData } });
  console.log(`[${key}] rewrote ${changed} URL(s) → /images/${key}/…`);
}

async function main() {
  await patchSingleton('hero', patchHero);
  await patchSingleton('story', patchStory);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
