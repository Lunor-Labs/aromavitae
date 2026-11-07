interface RichTextProps {
  /** HTML from `convertLexicalToHTML` in lib/content.ts: text is escaped and only the editor's node types are emitted. */
  html: string;
}

export function RichText({ html }: RichTextProps) {
  return (
    <div
      className="text-sm md:text-base text-muted leading-relaxed
                 [&_p]:mb-5 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold
                 [&_h1]:text-charcoal [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:font-heading [&_h2]:text-xl
                 [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3
                 [&_strong]:text-charcoal [&_strong]:font-semibold [&_u]:underline [&_em]:italic
                 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:mb-5 [&_ol]:mb-5
                 [&_li]:mb-1.5 [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
