import { describe, it, expect } from 'vitest';
import {
  heading,
  badge,
  codeBlock,
  inlineCode,
  list,
  table,
  link,
  blockquote,
  hr,
  joinSections,
  tableOfContents,
  titleCase,
  escapeMarkdown,
} from '../../src/utils/markdown.js';

describe('markdown utilities', () => {
  describe('heading', () => {
    it('should generate h1', () => {
      expect(heading(1, 'Title')).toBe('# Title');
    });

    it('should generate h2', () => {
      expect(heading(2, 'Subtitle')).toBe('## Subtitle');
    });

    it('should generate h6', () => {
      expect(heading(6, 'Deep')).toBe('###### Deep');
    });
  });

  describe('badge', () => {
    it('should generate a badge without link', () => {
      expect(badge('alt text', 'https://img.shields.io/badge/test')).toBe(
        '![alt text](https://img.shields.io/badge/test)',
      );
    });

    it('should generate a badge with link', () => {
      expect(badge('alt', 'https://img.shields.io/badge/test', 'https://example.com')).toBe(
        '[![alt](https://img.shields.io/badge/test)](https://example.com)',
      );
    });
  });

  describe('codeBlock', () => {
    it('should generate a code block without language', () => {
      expect(codeBlock('const x = 1;')).toBe('```\nconst x = 1;\n```');
    });

    it('should generate a code block with language', () => {
      expect(codeBlock('const x = 1;', 'typescript')).toBe('```typescript\nconst x = 1;\n```');
    });
  });

  describe('inlineCode', () => {
    it('should wrap text in backticks', () => {
      expect(inlineCode('npm install')).toBe('`npm install`');
    });
  });

  describe('list', () => {
    it('should generate a bullet list', () => {
      expect(list(['Item 1', 'Item 2', 'Item 3'])).toBe('- Item 1\n- Item 2\n- Item 3');
    });

    it('should handle a single item', () => {
      expect(list(['Only item'])).toBe('- Only item');
    });

    it('should handle empty list', () => {
      expect(list([])).toBe('');
    });
  });

  describe('table', () => {
    it('should generate a markdown table', () => {
      const result = table(
        ['Name', 'Version'],
        [
          ['React', '19.0.0'],
          ['Vue', '3.5.0'],
        ],
      );
      expect(result).toContain('| Name | Version |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| React | 19.0.0 |');
      expect(result).toContain('| Vue | 3.5.0 |');
    });
  });

  describe('link', () => {
    it('should generate a markdown link', () => {
      expect(link('GitHub', 'https://github.com')).toBe('[GitHub](https://github.com)');
    });
  });

  describe('blockquote', () => {
    it('should generate a blockquote', () => {
      expect(blockquote('Quote text')).toBe('> Quote text');
    });

    it('should handle multiline blockquotes', () => {
      expect(blockquote('Line 1\nLine 2')).toBe('> Line 1\n> Line 2');
    });
  });

  describe('hr', () => {
    it('should generate a horizontal rule', () => {
      expect(hr()).toBe('---');
    });
  });

  describe('joinSections', () => {
    it('should join sections with double newlines', () => {
      expect(joinSections(['Section 1', 'Section 2'])).toBe('Section 1\n\nSection 2');
    });

    it('should filter out empty sections', () => {
      expect(joinSections(['Section 1', '', '   ', 'Section 2'])).toBe('Section 1\n\nSection 2');
    });
  });

  describe('tableOfContents', () => {
    it('should generate a table of contents', () => {
      const result = tableOfContents([
        { title: 'Installation', id: 'installation' },
        { title: 'Quick Start', id: 'quick-start' },
      ]);
      expect(result).toContain('- [Installation](#installation)');
      expect(result).toContain('- [Quick Start](#quick-start)');
    });
  });

  describe('titleCase', () => {
    it('should convert kebab-case to title case', () => {
      expect(titleCase('my-awesome-package')).toBe('My Awesome Package');
    });

    it('should convert snake_case to title case', () => {
      expect(titleCase('my_awesome_package')).toBe('My Awesome Package');
    });

    it('should handle camelCase', () => {
      expect(titleCase('myPackage')).toBe('My Package');
    });

    it('should handle single word', () => {
      expect(titleCase('react')).toBe('React');
    });
  });

  describe('escapeMarkdown', () => {
    it('should escape special markdown characters', () => {
      const result = escapeMarkdown('Hello *world* [link]');
      expect(result).toContain('\\*');
      expect(result).toContain('\\[');
      expect(result).toContain('\\]');
    });
  });
});
