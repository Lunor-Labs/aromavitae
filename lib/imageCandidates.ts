import { getImageProps } from "next/image";

/**
 * The `srcSet`/`sizes` that a `fill` `<Image>` with these props will render.
 *
 * The carousels warm the next slide before sliding onto it. Once the image
 * optimizer is on, the URL an `<Image>` actually requests is
 * `/_next/image?url=…&w=…&q=…`, not the source URL — so a warm-up that fetched
 * the bare source would download the full-size original *in addition to* the
 * variant the carousel goes on to display. Feeding the browser the same
 * candidate list the `<Image>` will render is what keeps the two in one cache
 * entry.
 *
 * `getImageProps` is the supported way to ask for that list; it runs the same
 * code path the component does, so it stays correct if `deviceSizes` or
 * `formats` change in `next.config.ts`.
 */
export function fillImageCandidates(
  src: string,
  sizes: string | undefined
): { src: string; srcSet?: string; sizes?: string } {
  if (!src) return { src };

  const {
    props: { src: resolvedSrc, srcSet },
  } = getImageProps({ src, alt: "", fill: true, sizes });

  return { src: resolvedSrc, srcSet, sizes };
}
