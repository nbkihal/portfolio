/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH FOR ALL SITE CONTENT
 * ─────────────────────────────────────────────────────────────────────────
 *  Every word, link, project, and service on the site is defined here.
 *  Components read from these exports and never hardcode copy.
 *
 *  To edit the site, change the values below — you should not need to touch
 *  any component. See README.md → "Editing content".
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ------------------------------------------------------------------ types */

export type IconKey =
  | "code"
  | "sparkles"
  | "layout"
  | "workflow"
  | "mail"
  | "linkedin"
  | "github";

export interface CTA {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  title: string;
  description: string;
  icon: IconKey;
  cta: CTA;
}

/** How prominently a project card renders in the bento grid. */
export type ProjectSize = "lg" | "md";

export interface Project {
  id: string;
  title: string;
  /** One-line summary shown on the card. */
  description: string;
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  size: ProjectSize;
  /** Expanded case-study view: problem → build → outcome. */
  caseStudy: {
    problem: string;
    build: string;
    outcome: string;
  };
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: IconKey;
  /** Text shown next to the icon (e.g. the handle or address). */
  handle: string;
}

/* ------------------------------------------------------------------- site */

export const site = {
  name: "Kihal Ayoub",
  /** Used in <title> and social meta. */
  title: "Kihal Ayoub — Freelance Full-Stack & AI Developer",
  description:
    "Freelance software engineer building fast, AI-powered web experiences — from idea to production. Full-stack platforms, LLM-integrated products, and bold landing pages.",
  /** Update to your deployed domain (used for canonical + OG URLs). */
  url: "https://ayoub.dev",
  locale: "en",
} as const;

/* ------------------------------------------------------------- navigation */

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

/* -------------------------------------------------------------------- hero */

export const hero = {
  /** Full name — rendered as the main hero title (highlighted). */
  name: "Kihal Ayoub",
  /** Opening words shown before the name in the big hero title. */
  greeting: "Hi, I'm",
  /** Short role line shown in the availability badge. */
  role: "Full-Stack & AI Developer",
  /**
   * The "hook" — short lines shown one at a time with a typewriter animation
   * under the name. Keep each punchy; they cycle on a loop.
   */
  taglines: [
    "I turn ambitious ideas into products that actually ship.",
    "Full-stack platforms, AI-integrated tools, and interfaces that don't look like everyone else's.",
    "I make ideas boot — on the first try. Usually.",
  ],
  subheadline:
    "Software engineering student at ESI Algiers and freelance developer. From idea to production — fast.",
  primaryCta: { label: "Start a Project", href: "#contact" } satisfies CTA,
  secondaryCta: { label: "See My Work", href: "#projects" } satisfies CTA,
  /** Square portrait served from /public. */
  photoSrc: "/kihal-ayoub.png",
  photoAlt: "Kihal Ayoub",
};

/* ------------------------------------------------------------------- about */

export const about = {
  heading: "About",
  paragraphs: [
    "I'm Kihal Ayoub — a software engineering student at ESI (École Supérieure d'Informatique) in Algiers, and a freelance developer who ships real products, not just class assignments.",
    "I've built AI-integrated tools, full-stack platforms, and multi-agent systems. I care about two things on every project: does it work flawlessly, and does it look like nothing else out there.",
  ],
  highlights: [
    "ESI Algiers — Software Engineering",
    "Freelance developer",
    "AI & full-stack",
    "From idea to production",
  ],
};

/* ---------------------------------------------------------------- services */

export const services: Service[] = [
  {
    title: "Full-Stack Web Development",
    description: "From database design to deployed product.",
    icon: "code",
    cta: { label: "Get a quote", href: "#contact" },
  },
  {
    title: "AI-Integrated Products",
    description: "LLM-powered tools, automation, and intelligent features.",
    icon: "sparkles",
    cta: { label: "Get a quote", href: "#contact" },
  },
  {
    title: "Landing Pages & Business Sites",
    description: "Fast, conversion-focused, on-brand.",
    icon: "layout",
    cta: { label: "Get a quote", href: "#contact" },
  },
  {
    title: "Data & Automation Scripts",
    description: "Cleanup, validation, and processing pipelines.",
    icon: "workflow",
    cta: { label: "Get a quote", href: "#contact" },
  },
];

/* ---------------------------------------------------------------- projects */
/* Order = visual impact. `size: "lg"` cards take extra width in the grid.   */

export const projects: Project[] = [
  {
    id: "traveleo",
    title: "Traveleo — Travel Agency Platform",
    description:
      "Full-stack travel agency platform with a Django backend and a Dockerized deployment — built as a real product simulation, not a toy app.",
    tech: ["Django", "Python", "JavaScript", "Docker"],
    githubUrl: "https://github.com/Dali-MDB/Traveleo",
    size: "lg",
    caseStudy: {
      problem:
        "A travel agency needs more than a brochure site — it needs real data models, working flows, and a deployment story a team can actually run.",
      build:
        "Built collaboratively as a full-stack product: a Django/Python backend powering the core logic and data, a JavaScript frontend, all containerized with Docker for reproducible environments.",
      outcome:
        "A working, Dockerized platform delivered as a realistic product simulation rather than a class toy — deployable and team-runnable from a single setup.",
    },
  },
  {
    id: "refactoring-swarm",
    title: "Refactoring Swarm — Multi-Agent AI System",
    description:
      "Four specialized LLM agents — Auditor, Fixer, Tester, Documenter — that collaborate to autonomously analyze and refactor Python codebases.",
    tech: ["Python", "LangChain", "Google Gemini API", "AST"],
    githubUrl: "https://github.com/Erraid7/Refactoring-Swarm-Equipe-24",
    size: "md",
    caseStudy: {
      problem:
        "Refactoring legacy Python is tedious and risky — it needs auditing, safe edits, tests, and docs, usually spread across several people.",
      build:
        "A multi-agent system where four specialized LLM agents (Auditor, Fixer, Tester, Documenter) coordinate over a shared codebase — LangChain for orchestration, Google Gemini for reasoning, and Python's AST for precise, structure-aware edits.",
      outcome:
        "An autonomous pipeline that analyzes and refactors Python codebases end to end, with each agent owning a distinct stage of the workflow.",
    },
  },
  {
    id: "ai-cv-generator",
    title: "AI-Powered CV Generator",
    description:
      "Commercial-ready static site that uses the Anthropic API to generate tailored CVs, localized for the French/Algerian market with DZD pricing.",
    tech: ["HTML", "CSS", "JavaScript", "Anthropic API"],
    size: "md",
    caseStudy: {
      problem:
        "Job seekers in the French/Algerian market need CVs tailored per application — fast, localized, and priced for the local market.",
      build:
        "A commercial-ready static site integrating the Anthropic API to generate tailored CVs on demand, with localized DZD pricing and a real monetization roadmap.",
      outcome:
        "A ship-ready product aimed at a specific market, with pricing and monetization designed in from the start rather than bolted on.",
    },
  },
  {
    id: "earth-globe",
    title: "Interactive 3D Earth Globe",
    description:
      "Self-contained Three.js globe with real textures, city markers, and touch/zoom controls — the same engine powering this site's hero.",
    tech: ["Three.js", "WebGL"],
    size: "md",
    caseStudy: {
      problem:
        "3D on the web is often heavy and fragile — a globe needs to look real, run smoothly, and handle touch without a mountain of dependencies.",
      build:
        "A self-contained Three.js build with real Earth textures, city markers, and full touch/zoom controls — engineered to drop into any page.",
      outcome:
        "The same engine that powers the hero section of this site — proof the 3D you're looking at is mine.",
    },
  },
  {
    id: "rahbaraan-org-chart",
    title: "RAHBARAAN Org Chart System",
    description:
      "SVG organizational charts generated for a real Algerian digital-solutions company's formal tender documents.",
    tech: ["SVG", "Data Visualization"],
    size: "md",
    caseStudy: {
      problem:
        "Formal tender documents demand clean, precise org charts — the kind you can't fake with a screenshot of a slide.",
      build:
        "Programmatically generated SVG organizational charts for a real Algerian digital-solutions company, built to slot directly into formal tender documents.",
      outcome:
        "Delivered as production artifacts for real business paperwork — client work, not a demo.",
    },
  },
];

/* ------------------------------------------------------------ testimonials */
/*
 * Intentionally empty. The Testimonials section renders a subtle
 * "coming soon" state while this array is empty and DOES NOT show
 * fabricated quotes. To publish real testimonials, add entries here —
 * see README.md → "Adding testimonials".
 *
 * Example shape (uncomment and replace with a real quote):
 *
 *   {
 *     quote: "Ayoub delivered exactly what we needed, ahead of schedule.",
 *     name: "Full Name",
 *     role: "Role, Company",
 *   },
 */
export const testimonials: Testimonial[] = [];

export const testimonialsPlaceholder = "Client feedback coming soon.";

/* ----------------------------------------------------------------- contact */

export const contact = {
  heading: "Let's build something",
  subheading:
    "Have a project in mind? Tell me what you're trying to ship and I'll get back to you.",
  /**
   * TODO: replace with your real address before launch.
   * This placeholder will not receive mail.
   */
  email: "nb_kihal@esi.dz",
  /**
   * TODO: create a form at https://formspree.io and paste its endpoint here.
   * Until then the form falls back to a mailto: link. See README.
   */
  formspreeEndpoint: "https://formspree.io/f/xnnkqkvj",
  socials: [
    {
      label: "Email",
      href: "mailto:nb_kihal@esi.dz",
      icon: "mail",
      handle: "nb_kihal@esi.dz",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/kihal-ayoub-219b39298",
      icon: "linkedin",
      handle: "in/kihal-ayoub",
    },
    {
      label: "GitHub",
      href: "https://github.com/nbkihal",
      icon: "github",
      handle: "@nbkihal",
    },
  ] satisfies SocialLink[],
};

