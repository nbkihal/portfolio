# Ayoub's Portfolio — Full Content + Master Build Prompt

Goal: attract freelance clients. Tone: bold & creative. Hero: interactive 3D globe.

---

## 1. FULL CONTENT (edit freely, then paste into the prompt below)

### Hero
- **Name:** Ayoub
- **Headline:** "I build fast, AI-powered web experiences — from idea to production."
- **Subheadline:** "4th-year Software Engineering student at ESI Algiers. Freelance developer. I turn ambitious ideas into shipped products."
- **CTA buttons:** "Start a Project" (→ contact) / "See My Work" (→ projects)
- **Visual:** interactive 3D wireframe globe rotating behind the text, mouse-reactive

### About
> I'm Ayoub — a software engineering student at ESI (École Supérieure d'Informatique) in Algiers, and a freelance developer who ships real products, not just class assignments. I've built AI-integrated tools, full-stack platforms, and multi-agent systems, and I lead HR and event operations at ESI's Scientific Club (CSE). I care about two things on every project: does it work flawlessly, and does it look like nothing else out there.

### Services (no pricing — "contact for quote")
1. **Full-Stack Web Development** — from database design to deployed product
2. **AI-Integrated Products** — LLM-powered tools, automation, intelligent features
3. **Landing Pages & Business Sites** — fast, conversion-focused, on-brand
4. **Data & Automation Scripts** — cleanup, validation, and processing pipelines

### Projects (case-study cards — pick order by visual impact)

1. **Traveleo — Travel Agency Platform**
   Full-stack travel agency website with backend (Django/Python) + frontend, Dockerized. Built collaboratively as a real product simulation, not a toy app.
   `Django · Python · JavaScript · Docker`
   → github.com/Dali-MDB/Traveleo

2. **Refactoring Swarm — Multi-Agent AI System**
   A multi-agent system where 4 specialized LLM agents (Auditor, Fixer, Tester, Documenter) collaborate to autonomously analyze and refactor Python codebases, powered by Google Gemini and LangChain.
   `Python · LangChain · Google Gemini API · AST`
   → github.com/Erraid7/Refactoring-Swarm-Equipe-24

3. **AI-Powered CV Generator**
   Commercial-ready static site targeting French/Algerian markets. Integrates the Anthropic API to generate tailored CVs, with localized DZD pricing and a real monetization roadmap.
   `HTML · CSS · JS · Anthropic API`

4. **Interactive 3D Earth Globe**
   Self-contained Three.js build with real textures, city markers, and touch/zoom controls — the same engine powering this site's hero section.
   `Three.js · WebGL`

5. **RAHBARAAN Org Chart System**
   SVG organizational charts generated for a real Algerian digital solutions company's formal tender documents.
   `SVG · Data Visualization`

*(Optional secondary/GitHub-only mentions if you want a denser grid: Discord bot for CSE's Data Hack 2k26, ESI-RUN transport GUI app.)*

### Involvement / Leadership
> **Club Scientifique de l'ESI (CSE)** — Design Department → Responsable RH → Lead Event. Currently running for CSE President, 2026/2027 season, with a full reform platform built around club diagnostics and internal restructuring.

### Testimonials
Placeholder section, structured and ready — reach out to 2-3 past clients/collaborators (e.g. RAHBARAAN contact, Traveleo teammates who can speak to your role) for a short quote + name + role. Until then, keep the section hidden or show it as "Client feedback coming soon."

### Contact
- Email link
- LinkedIn: linkedin.com/in/kihal-ayoub-219b39298
- GitHub: github.com/nbkihal
- Simple contact form (Formspree, no backend)

---

## 2. MASTER BUILD PROMPT (copy everything below into Claude Code / Cursor)

```
Build a bold, creative freelance-developer portfolio site.

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Framer Motion for animations
- shadcn/ui for base components
- Lucide React for icons
- react-three-fiber + drei for the hero's interactive 3D globe
- Deploy target: Vercel

## Architecture (must stay editable)
- ALL content (text, projects, services, links) lives in `content/site-data.ts`
  as typed exports — never hardcoded inside components.
- One component per section in `components/sections/`, each pulling only from
  `content/site-data.ts`.
- Theme tokens (colors, fonts) centralized via CSS variables in
  `app/globals.css` + `tailwind.config.ts`.
- Dark mode by default, bold accent color (electric blue or violet), toggle via next-themes.

## Sections, in order
1. Hero — full-viewport, interactive 3D wireframe globe (react-three-fiber, mouse-reactive
   rotation, lazy-loaded and paused off-screen), name, headline, subheadline, two CTAs
   ("Start a Project", "See My Work")
2. About — short bio, no resume dump
3. Services — 4 cards (Full-Stack Dev, AI-Integrated Products, Landing Pages, Automation),
   no pricing shown, each with a one-line description and a "Get a quote" link to Contact
4. Projects — bento-grid, each card: title, one-line description, tech badges, GitHub link;
   clicking expands to a case-study view (problem → build → stack → outcome)
5. Involvement — single highlighted block for CSE leadership trajectory
6. Testimonials — component built now but data-driven from an empty/placeholder array;
   render nothing (or a subtle "coming soon" state) until real entries are added to
   content/site-data.ts — do NOT fabricate quotes
7. Contact — email, LinkedIn, GitHub links + simple Formspree contact form, no backend

## Design direction
- Bold & creative, not corporate-minimal: strong accent color, confident type scale,
  asymmetric layout touches in the Projects bento-grid
- Subtle scroll-reveal animations (Framer Motion, triggered once per section)
- Mobile-first, test at 375px
- Fast: next/image everywhere, 3D scene code-split and paused when off-screen

## Content
Populate `content/site-data.ts` with the final copy below (not placeholders —
this is real, ready-to-ship content):

[PASTE SECTION 1 CONTENT FROM ABOVE HERE]

## Deliverable
Full working Next.js project + README covering: local dev, how to edit
content/site-data.ts, how to add real testimonials later, how to deploy to Vercel.
```

---

Everything above is edit-first: change any line in Section 1, then re-paste that block into the prompt's content area before you run it.
