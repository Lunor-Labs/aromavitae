import { z } from 'zod';

const linkSchema = z.object({ label: z.string().min(1), href: z.string().min(1) });

const heroSlideSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().min(1),
  image: z.string().min(1),
  ctaPrimary: linkSchema,
  ctaSecondary: linkSchema,
});

const heroSchema = z.object({
  slides: z.array(heroSlideSchema).min(1),
  autoPlayMs: z.number().int().positive().default(6000),
});

const storyPanelSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

const storySchema = z.object({
  ourStory: storyPanelSchema,
  heritage: storyPanelSchema.extend({
    badges: z
      .array(z.object({ icon: z.string(), label: z.string() }))
      .min(1),
  }),
});

const navLinkSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    label: z.string().min(1),
    href: z.string().min(1),
    children: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  })
);

const navbarSchema = z.object({
  brand: z.object({ name: z.string().min(1), tagline: z.string() }),
  links: z.array(navLinkSchema).min(1),
  cta: linkSchema,
});

const footerSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string(),
    description: z.string(),
  }),
  columns: z
    .array(
      z.object({
        title: z.string().min(1),
        links: z.array(linkSchema).min(1),
      })
    )
    .min(1),
  contact: z.object({
    phone: z.string(),
    email: z.string(),
    location: z.string(),
  }),
  newsletter: z.object({ title: z.string(), body: z.string() }),
  social: z.array(linkSchema),
  payments: z.array(z.string()),
  legal: z.object({ copyright: z.string() }),
});

const announcementSchema = z.object({
  messages: z.array(z.string().min(1)).min(1),
});

const giftSetsBannerSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  image: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

export const singletonSchemas = {
  hero: heroSchema,
  story: storySchema,
  navbar: navbarSchema,
  footer: footerSchema,
  announcement: announcementSchema,
  giftSetsBanner: giftSetsBannerSchema,
} as const;

export type SingletonKey = keyof typeof singletonSchemas;

export const SINGLETON_KEYS: readonly SingletonKey[] = Object.keys(
  singletonSchemas
) as SingletonKey[];

export function isSingletonKey(key: string): key is SingletonKey {
  return (SINGLETON_KEYS as readonly string[]).includes(key);
}
