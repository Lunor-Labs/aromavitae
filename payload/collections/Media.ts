import { randomUUID } from "node:crypto";
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Media",
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  hooks: {
    beforeOperation: [
      // Give every upload a fresh name so a URL is never reused for different
      // bytes: replacing a picture with one of the same filename would
      // otherwise keep serving the old optimized copy for a year (see
      // `minimumCacheTTL` in next.config.ts).
      ({ operation, req }) => {
        if ((operation === "create" || operation === "update") && req.file) {
          req.file.name = `${randomUUID().slice(0, 8)}-${req.file.name}`;
        }
      },
    ],
  },
  fields: [
    {
      name: "alt",
      label: "Alt text",
      type: "text",
      admin: { description: "Describe the picture for screen readers and search engines." },
    },
  ],
  upload: {
    // next/image refuses remote SVG (dangerouslyAllowSVG is off), so only raster formats
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    adminThumbnail: "thumbnail",
    imageSizes: [{ name: "thumbnail", width: 400 }],
  },
};
