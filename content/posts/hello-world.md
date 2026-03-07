---
title: Hello World
slug: hello-world
excerpt: 'A test post to verify the markdown blog pipeline — code blocks, lists, tables, and typography.'
publishedAt: 2026-03-07T12:56:26-06:00
tags:
  - meta
relatedProjects:
  - bio
---

This is a test post to verify the markdown-based blog pipeline works end to end.

## Code blocks

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const result = greet('world');
console.log(result);
```

And a short bash snippet:

```bash
npm run build && npm run preview
```

## Inline formatting

You can use **bold**, _italic_, **_bold italic_**, ~~strikethrough~~, and `inline code` just fine. Here's a [link to GitHub](https://github.com) and some `longer inline code that might wrap` in narrow viewports.

## Lists

Unordered:

- First item
- Second item with `inline code`
- Third item

Ordered:

1. Step one
2. Step two
3. Step three

Nested:

- Parent item
  - Child item
  - Another child
    - Grandchild
- Back to top level

---

## Blockquotes

> A single-line quote.

> A multi-line blockquote that spans
> more than one line to test how
> wrapping behaves.
>
> With a second paragraph inside.

### Heading level 3

This section tests h3 rendering. No bottom border like h1/h2.

## Table

| Tool     | Purpose          | Status |
| -------- | ---------------- | ------ |
| Vite     | Build tooling    | Active |
| Tailwind | Styling          | Active |
| Shiki    | Syntax highlight | New    |

## Image

![Placeholder alt text](https://placehold.co/600x200/1a1a1a/5A97F2?text=Test+Image)

## Final notes

That covers the main markdown elements. A paragraph at the end to check spacing after various block elements above.
