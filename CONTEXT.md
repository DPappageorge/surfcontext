# SurfContext Documentation Site

The official documentation and specification site for SurfContext -- the open standard for AI-readable project documentation (ARDS v3.0).

## Key Files

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/spec/page.tsx` | ARDS v3.0 specification |
| `app/getting-started/page.tsx` | Quick start guide |
| `app/tools/page.tsx` | Tools and integrations |
| `app/layout.tsx` | Root layout with nav, footer, theme |
| `components/` | Shared components (nav, footer, code-block, theme) |
| `surfcontext.json` | SurfContext manifest (dogfooding) |

## Architecture

Static documentation site built with Next.js App Router. All pages are statically generated at build time. No backend, no database, no authentication.

```
app/               --> Next.js App Router pages (static)
components/        --> Shared UI components
public/            --> Static assets
```

## Stack & Development

**Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
**Package manager**: npm
**Run locally**: `npm run dev`
**Build**: `npm run build`
**Lint**: `npm run lint`

## Conventions

- Dark mode by default with light mode toggle
- All pages are server components (static generation)
- CodeBlock component for all code examples with copy buttons
- Tailwind CSS custom properties for theming (--background, --foreground, etc.)
- No heavy images or external dependencies
- Mobile responsive design
