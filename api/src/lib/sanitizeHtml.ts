import sanitizeHtml from 'sanitize-html';

// Mirrors exactly what the admin rich-text editor's toolbar can produce
// (paragraphs, bold, italic, underline, H1/H2) — nothing else is ever
// rendered as raw HTML on the public blog, so nothing else needs to survive.
export function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2'],
    allowedAttributes: {},
  });
}
