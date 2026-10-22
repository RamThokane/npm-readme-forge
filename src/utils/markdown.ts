// ─── Markdown Utility Functions ──────────────────────────────────────────────

/**
 * Generate a markdown heading.
 */
export function heading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): string {
  return `${'#'.repeat(level)} ${text}`;
}

/**
 * Generate a shields.io badge in markdown.
 */
export function badge(alt: string, imageUrl: string, linkUrl?: string): string {
  const img = `![${alt}](${imageUrl})`;
  return linkUrl ? `[${img}](${linkUrl})` : img;
}

/**
 * Generate a fenced code block.
 */
export function codeBlock(code: string, lang = ''): string {
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

/**
 * Generate an inline code span.
 */
export function inlineCode(text: string): string {
  return `\`${text}\``;
}

/**
 * Generate a bullet list.
 */
export function list(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

/**
 * Generate a markdown table.
 */
export function table(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `${headerRow}\n${separator}\n${dataRows}`;
}

/**
 * Generate a markdown link.
 */
export function link(text: string, url: string): string {
  return `[${text}](${url})`;
}

/**
 * Generate a blockquote.
 */
export function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

/**
 * Generate a horizontal rule.
 */
export function hr(): string {
  return '---';
}

/**
 * Join multiple sections with double newlines.
 */
export function joinSections(sections: string[]): string {
  return sections.filter((s) => s.trim().length > 0).join('\n\n');
}

/**
 * Generate a table of contents from section headings.
 */
export function tableOfContents(sections: { title: string; id: string }[]): string {
  const items = sections.map((s) => {
    const anchor = s.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `- [${s.title}](#${anchor})`;
  });
  return items.join('\n');
}

/**
 * Convert a package name to a display-friendly title.
 * e.g., "my-awesome-package" → "My Awesome Package"
 */
export function titleCase(text: string): string {
  return text
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Escape special markdown characters in text.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
}
