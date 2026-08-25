# Ayoub — Portfolio

A bold, creative freelance-developer portfolio built to attract clients. Full-viewport interactive 3D globe hero, bento-grid case studies, and a fully data-driven content layer.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · react-three-fiber + drei · next-themes · Lucide · deployed on Vercel.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

> Requires Node 18.18+ (Node 20+ recommended).

---

## Before you launch — 2 placeholders to replace

Both live in **`content/site-data.ts`**:

1. **Your email** — search for `your-email@example.com` (appears in `contact.email` and the Email social link) and replace with your real address.
2. **The contact form endpoint** — see [Wiring up the contact form](#wiring-up-the-contact-form) below.

Until the Formspree endpoint is set, the contact form **falls back to opening the visitor's email client** (a `mailto:` to your address) instead of failing silently — so nothing breaks, it's just not a true no-backend form yet.

---

## Editing content

**All copy, projects, services, and links live in one file: [`content/site-data.ts`](content/site-data.ts).** Components never hardcode text — they read from these typed exports. You should never need to touch a component to change wording.

| Want to change...        | Edit this export       |
| ------------------------ | ---------------------- |
| Name, headline, CTAs     | `hero`                 |
| Bio + highlight chips    | `about`                |
| The 4 service cards      | `services`             |
| Projects / case studies  | `projects`             |
| CSE leadership block     | `involvement`          |
| Testimonials             | `testimonials`         |
| Email, socials, form     | `contact`              |
| Nav menu items           | `navLinks`             |
| `<title>` / SEO meta     | `site`                 |

### Adding a project

Push a new object onto the `projects` array. Each project drives both the card and its expandable case-study modal:

```ts
{
  id: "my-project",
  title: "My Project — Short Tagline",
  description: "One-line summary shown on the card.",
  tech: ["Next.js", "TypeScript"],
  githubUrl: "https://github.com/you/repo", // optional
  liveUrl: "https://example.com",           // optional
  size: "md",                                // "lg" = wide feature card, "md" = normal
  caseStudy: {
    problem: "What needed solving.",
    build: "What you built and how.",
    outcome: "The result.",
  },
},
```

Card order = display order (arrange by visual impact). Mark one card `size: "lg"` to anchor the bento grid.

### Adding testimonials

The Testimonials section is **data-driven and starts empty** — it renders a subtle "coming soon" state and **never shows fabricated quotes**. When you have a real quote, add an entry to the `testimonials` array in `content/site-data.ts`:

```ts
export const testimonials: Testimonial[] = [
  {
    quote: "Ayoub delivered exactly what we needed, ahead of schedule.",
    name: "Full Name",
    role: "Role, Company",
  },
];
```

The section automatically switches from the placeholder to a card grid as soon as the array has entries. Good people to ask: the RAHBARAAN contact, or Traveleo teammates who can speak to your role.

---

## Wiring up the contact form

The form uses [Formspree](https://formspree.io) — no backend required.

1. Create a free Formspree account and a new form.
2. Copy your form endpoint — it looks like `https://formspree.io/f/abcdwxyz`.
3. In `content/site-data.ts`, set `contact.formspreeEndpoint` to that URL.

That's it. Submissions now POST to Formspree and the form shows inline success/error states. (Formspree emails you each submission and handles spam filtering.)

---

## Theming & design tokens

- **Dark mode is the default**, with a light theme and a toggle (via `next-themes`).
- Colors are CSS variables defined in [`app/globals.css`](app/globals.css) (`:root` for light, `.dark` for dark) and mapped to Tailwind in [`tailwind.config.ts`](tailwind.config.ts).
- The **accent color is electric violet** (`--brand`) with a **cyan** secondary. To rebrand, change the `--brand` / `--cyan` HSL values in `app/globals.css` — everything (buttons, globe glow, highlights) follows. The 3D globe's colors are set near the top of [`components/globe-canvas.tsx`](components/globe-canvas.tsx) (`BRAND` / `CYAN` constants) — update those to match.
- Fonts: **Space Grotesk** (display/headings) + **Inter** (body), loaded via `next/font` in [`app/layout.tsx`](app/layout.tsx).

---

## The 3D globe

- Lives in [`components/globe-canvas.tsx`](components/globe-canvas.tsx) (the react-three-fiber scene) and [`components/hero-globe.tsx`](components/hero-globe.tsx) (the loader/wrapper).
- **Code-split** (`next/dynamic`, `ssr: false`) so it never blocks first paint or runs on the server.
- **Paused when off-screen** via `IntersectionObserver` (the render loop stops once the hero scrolls away) to save CPU/GPU/battery.
- **Respects `prefers-reduced-motion`** (auto-rotation stops) and is wrapped in an **error boundary** so a WebGL failure degrades gracefully instead of crashing the page.

---

## Project structure

```
app/
  layout.tsx          # fonts, metadata, theme provider, navbar + footer
  page.tsx            # section composition (order lives here)
  globals.css         # design tokens (light/dark) + base styles
components/
  sections/           # one component per page section
    hero, about, services, projects, involvement, testimonials, contact
  ui/                 # shadcn-style primitives (button, card, badge, input…)
  globe-canvas.tsx    # the react-three-fiber 3D scene
  hero-globe.tsx      # dynamic import + visibility gating + error boundary
  navbar.tsx, footer.tsx, theme-*.tsx, reveal.tsx, section.tsx, contact-form.tsx
content/
  site-data.ts        # ← ALL content lives here
lib/
  utils.ts            # cn() class merger
  icons.ts            # IconKey → Lucide component registry
```

---

## Deploying to Vercel

1. Push this repo to GitHub (`git init && git add . && git commit && git push`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — no configuration needed. Click **Deploy**.
4. (Optional) Add your custom domain in the project's **Domains** settings, then update `site.url` in `content/site-data.ts` so SEO/OG metadata points at the real domain.

Every push to the default branch redeploys automatically.
