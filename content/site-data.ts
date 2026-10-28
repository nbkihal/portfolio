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

import type { TechName } from "@/lib/tech-icons";

/* ------------------------------------------------------------------ types */

export type IconKey =
  | "code"
  | "sparkles"
  | "layout"
  | "workflow"
  | "mail"
  | "linkedin"
  | "github"
  | "graduation"
  | "palette"
  | "users"
  | "calendar"
  | "flag"
  | "rocket"
  | "briefcase"
  | "medical"
  | "clock";

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

/** Filters on the /projects page. */
export type ProjectCategory =
  "Web" | "Mobile" | "AI" | "Games" | "Client & pro";

/** A screenshot, shown inside a laptop or phone mockup. */
export interface ProjectShot {
  /** Path under /public, e.g. "/projects/logic/home.webp". */
  src: string;
  alt: string;
  /** Desktop shots go in a laptop frame, mobile shots in a phone frame. */
  device: "laptop" | "phone";
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
  categories: ProjectCategory[];
  /**
   * Screenshots, best first. The first laptop + first phone shot form the
   * card cover; all of them appear in the project page's gallery.
   */
  shots?: ProjectShot[];
  /** Expanded case-study view: problem → build → outcome. */
  caseStudy: {
    problem: string;
    build: string;
    outcome: string;
  };
}

/** One line the intro particles spell. */
export interface IntroPhrase {
  text: string;
  /** Author, shown as a caption under quotes. */
  by?: string;
  /** Render in a monospace font (for code snippets). */
  code?: boolean;
}

/** One stop on the Parcours roadmap. */
export interface Milestone {
  /** Short label shown on the roadmap node (a year, a season, "Now"…). */
  period: string;
  title: string;
  /** Where it happened — school, club, client… */
  place: string;
  description: string;
  icon: IconKey;
  tags?: string[];
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
  { label: "About", href: "/#about" },
  { label: "Parcours", href: "/#parcours" },
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
];

/* ------------------------------------------------------------------- intro */

/**
 * What the particles spell, in order — dev words, sentences and quotes.
 * Clicking (or waiting) morphs to the next one; longer lines stay up
 * longer and wrap onto up to three lines. `by` is shown as a caption
 * under quotes, and `code: true` renders in a monospace font.
 */
const introPhrases: IntroPhrase[] = [
  { text: "Hello, World!", code: true },
  { text: "Talk is cheap. Show me the code.", by: "Linus Torvalds" },
  { text: "git push origin main", code: true },
  {
    text: "Simplicity is prerequisite for reliability.",
    by: "Edsger W. Dijkstra",
  },
  { text: "</>", code: true },
  {
    text: "First, solve the problem. Then, write the code.",
    by: "John Johnson",
  },
  { text: "It works on my machine.", by: "Every developer, ever" },
  { text: "Make it work, make it right, make it fast.", by: "Kent Beck" },
  { text: "while (alive) { code(); }", code: true },
  { text: "Code never lies, comments sometimes do.", by: "Ron Jeffries" },
  {
    text: "Programs must be written for people to read.",
    by: "Harold Abelson",
  },
];

export const intro = {
  /** Interactive particle intro shown before the hero. */
  eyebrow: "Interactive · made of light",
  phrases: introPhrases,
  hint: "Move your cursor through the light · click to morph",
  cta: { label: "Enter the portfolio", href: "/#top" } satisfies CTA,
};

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
  primaryCta: { label: "Start a Project", href: "/#contact" } satisfies CTA,
  secondaryCta: { label: "See My Work", href: "/#projects" } satisfies CTA,
  /** Tech chips that orbit the portrait. Keep to ~6 short labels. */
  orbit: ["Next.js", "Python", "Django", "LLM agents", "Three.js", "Docker"],
  /** Small floating badges pinned to the portrait. */
  portraitBadges: {
    top: "Software Engineering · ESI",
    bottom: "Open to freelance",
  },
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
    {
      label: "ESI Algiers",
      detail: "Software Engineering",
      icon: "graduation",
    },
    {
      label: "Freelance",
      detail: "Real clients, real deadlines",
      icon: "briefcase",
    },
    {
      label: "AI & full-stack",
      detail: "LLM agents to deployed platforms",
      icon: "sparkles",
    },
    {
      label: "Idea → production",
      detail: "Scoped, built, shipped",
      icon: "rocket",
    },
  ] satisfies { label: string; detail: string; icon: IconKey }[],
};

/* ---------------------------------------------------------------- parcours */
/*
 * The roadmap, oldest first. `period` is free text — swap in real years
 * (e.g. "2022", "2024 – 25") whenever you like.
 */

export const parcours: Milestone[] = [
  {
    period: "Start",
    title: "Joined ESI Algiers",
    place: "École Supérieure d'Informatique",
    description:
      "Started a software engineering degree at one of Algeria's top computer-science schools — algorithms, systems, and a lot of late-night debugging.",
    icon: "graduation",
    tags: ["Software Engineering"],
  },
  {
    period: "Builds",
    title: "First real products",
    place: "Team & personal projects",
    description:
      "Shipped Traveleo, a Dockerized Django travel platform, and Refactoring Swarm, a four-agent LLM system that refactors Python codebases on its own.",
    icon: "code",
    tags: ["Django", "Docker", "LangChain", "Gemini"],
  },
  {
    period: "CSE",
    title: "Responsable RH",
    place: "Club Scientifique de l'ESI",
    description:
      "Led human resources for the school's scientific club — recruiting new members, onboarding them, and keeping a large volunteer team motivated and organised.",
    icon: "users",
    tags: ["HR", "Recruiting", "Leadership"],
  },
  {
    period: "Freelance",
    title: "Client work",
    place: "Freelance developer",
    description:
      "SVG org charts for RAHBARAAN's tender documents, a commercial-ready AI CV generator, and a live registration portal for a Quranic school.",
    icon: "briefcase",
    tags: ["Clients", "Anthropic API", "Supabase"],
  },
  {
    period: "Internship",
    title: "Medical documents, rebuilt",
    place: "4th-year ESI internship",
    description:
      "Built the front-end that reconstructs medical documents from API data — layout, tables, images — and generates the final PDF on demand for web and mobile.",
    icon: "medical",
    tags: ["React", "TypeScript", "pdf-lib"],
  },
  {
    period: "Wecan",
    title: "Staff Pro v2",
    place: "Wecan Services",
    description:
      "Leading the secure rebuild of a multi-company HR attendance app used in production — web, Android and iOS — without disrupting its current users.",
    icon: "clock",
    tags: ["Firebase", "SaaS", "PWA"],
  },
  {
    period: "Next",
    title: "Your project",
    place: "Let's build it together",
    description:
      "The next stop on the roadmap is the one we build together. Tell me what you want to ship.",
    icon: "rocket",
  },
];

/* ------------------------------------------------------------- tech stack */
/* Logos in the scrolling strip under the hero — see lib/tech-icons.ts.     */

export const techStack: TechName[] = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Django",
  "Flutter",
  "Dart",
  "Tailwind CSS",
  "Three.js",
  "HTML5",
  "CSS",
  "Firebase",
  "Supabase",
  "Docker",
  "LangChain",
  "Gemini",
  "Claude",
  "Git",
  "GitHub",
  "Vite",
  "Vitest",
  "Vercel",
];

/* ---------------------------------------------------------------- services */

export const services: Service[] = [
  {
    title: "Full-Stack Web Development",
    description: "From database design to deployed product.",
    icon: "code",
    cta: { label: "Get a quote", href: "/#contact" },
  },
  {
    title: "AI-Integrated Products",
    description: "LLM-powered tools, automation, and intelligent features.",
    icon: "sparkles",
    cta: { label: "Get a quote", href: "/#contact" },
  },
  {
    title: "Landing Pages & Business Sites",
    description: "Fast, conversion-focused, on-brand.",
    icon: "layout",
    cta: { label: "Get a quote", href: "/#contact" },
  },
  {
    title: "Data & Automation Scripts",
    description: "Cleanup, validation, and processing pipelines.",
    icon: "workflow",
    cta: { label: "Get a quote", href: "/#contact" },
  },
];

/* ---------------------------------------------------------------- projects */
/* Order = visual impact. `size: "lg"` cards take extra width in the grid.   */
/* The home page shows the first `featuredProjectCount`; /projects shows all. */

export const featuredProjectCount = 5;

export const projects: Project[] = [
  {
    id: "staff-pro",
    title: "Staff Pro v2 — HR Attendance SaaS",
    description:
      "Secure rebuild of WeCheckin, a multi-company HR attendance platform in production — employee app on web, Android and iOS, plus HR and SaaS admin consoles.",
    tech: ["JavaScript", "Firebase", "Vite", "PWA", "Vitest"],
    size: "lg",
    categories: ["Web", "Mobile", "Client & pro"],
    shots: [
      {
        src: "/projects/staff-pro/admin-login.webp",
        alt: "WeCheckin administration portal sign-in",
        device: "laptop",
      },
      {
        src: "/projects/staff-pro/employee-app.webp",
        alt: "WeCheckin RH employee app sign-in screen",
        device: "phone",
      },
    ],
    caseStudy: {
      problem:
        "A production HR app that companies rely on every day for clock-ins, schedules, overtime and payroll had grown hard to maintain and needed hardening — without any downtime for its users.",
      build:
        "A parallel v2 for Wecan Services: code split by page and role (employee PWA, HR console, SaaS console for client companies), geofenced clock-in zones, business rules for schedules, overtime and payroll covered by unit tests, an AI voice-call module, and a separate staging Firebase project with anonymised data.",
      outcome:
        "Every legacy function is tracked by an inventory check and compared against the live version's behaviour, so the rebuild can go to production once validated, with no surprises for current users.",
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
    categories: ["AI"],
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
    id: "logic",
    title: "Logic — Circuit Puzzle Game",
    description:
      "Educational Boolean-logic puzzle game: drag gates onto a board, wire them up and match a target truth table — 63 stages, from a NOT gate to a tiny ALU.",
    tech: ["Flutter", "Dart"],
    githubUrl: "https://github.com/nbkihal/Logic",
    size: "md",
    categories: ["Mobile", "Games"],
    shots: [
      {
        src: "/projects/logic/home.webp",
        alt: "Logic home screen with the START button",
        device: "phone",
      },
      {
        src: "/projects/logic/desktop.webp",
        alt: "Logic running in a desktop browser",
        device: "laptop",
      },
      {
        src: "/projects/logic/levels.webp",
        alt: "Level list for the first chapter, First Signals",
        device: "phone",
      },
      {
        src: "/projects/logic/solved.webp",
        alt: "Level solved with three stars",
        device: "phone",
      },
    ],
    caseStudy: {
      problem:
        "Digital logic is usually taught with static diagrams. Students learn faster when they can build circuits themselves and see them work or fail right away.",
      build:
        "A Flutter app on one codebase for Android, iOS and Web: a circuit simulation engine kept separate from the UI, a canvas where you place, move and wire gates with undo, a live truth-table tester, sound, saved progress and scoring.",
      outcome:
        "Sixty-three stages in eleven chapters — universality from NAND and NOR, everyday wiring puzzles, decoders, arithmetic, black boxes to reverse-engineer and gate-budget challenges — fully playable.",
    },
  },
  {
    id: "medical-documents",
    title: "Medical Document Reconstruction",
    description:
      "Internship front-end that rebuilds medical documents from API data — text, tables, images and shapes — and generates the final PDF on demand for web and mobile.",
    tech: ["React", "TypeScript", "pdf-lib", "Tailwind CSS", "Vitest"],
    size: "md",
    categories: ["Web", "Client & pro"],
    shots: [
      {
        src: "/projects/medical-documents/preview.webp",
        alt: "Document preview with source, generation time and PDF export",
        device: "laptop",
      },
      {
        src: "/projects/medical-documents/mobile.webp",
        alt: "Reconstructed discharge summary on a phone",
        device: "phone",
      },
      {
        src: "/projects/medical-documents/page-1.webp",
        alt: "First page of a reconstructed hospital discharge summary",
        device: "laptop",
      },
      {
        src: "/projects/medical-documents/page-2.webp",
        alt: "Laboratory results table rebuilt from API data",
        device: "laptop",
      },
    ],
    caseStudy: {
      problem:
        "A digital medical platform extracts and translates documents through separate services. Someone has to turn that structured data back into a faithful, readable document.",
      build:
        "During my 4th-year ESI internship, I built a React + TypeScript front-end that reads the document structure from an external API and rebuilds each page — text, tables, images and shapes — keeping the original layout, then generates the PDF with pdf-lib.",
      outcome:
        "Documents are never stored on a server: each one is generated on demand for preview or download, on web and mobile, and stamped with its generation time and source document.",
    },
  },
  {
    id: "quran-school-portal",
    title: "Quranic School — Registration Portal",
    description:
      "Arabic, right-to-left website and online registration for a mosque's Quranic school, backed by Supabase with locked-down access rules.",
    tech: ["HTML", "CSS", "JavaScript", "Supabase"],
    liveUrl: "https://mosque-registration-portail.vercel.app",
    size: "md",
    categories: ["Web", "Client & pro"],
    shots: [
      {
        src: "/projects/quran-school-portal/hero.webp",
        alt: "Quranic school landing page in Arabic",
        device: "laptop",
      },
      {
        src: "/projects/quran-school-portal/mobile.webp",
        alt: "The Quranic school site on a phone",
        device: "phone",
      },
      {
        src: "/projects/quran-school-portal/section-2.webp",
        alt: "About the school section",
        device: "laptop",
      },
      {
        src: "/projects/quran-school-portal/section-3.webp",
        alt: "Classes section of the school site",
        device: "laptop",
      },
    ],
    caseStudy: {
      problem:
        "A mosque's Quranic school was handling registrations on paper and needed a simple, trustworthy way for families to sign up online, in Arabic.",
      build:
        "A fully right-to-left site presenting the school and its classes, with a registration form that saves submissions and uploaded files to Supabase. Access rules let visitors submit, but never read, other people's data.",
      outcome:
        "Live on Vercel. Registration can be opened or closed for each season without any code changes.",
    },
  },
  {
    id: "traveleo",
    title: "Traveleo — Travel Agency Platform",
    description:
      "Full-stack travel agency platform with a Django backend and a Dockerized deployment — built as a real product simulation, not a toy app.",
    tech: ["Django", "Python", "JavaScript", "Docker"],
    githubUrl: "https://github.com/Dali-MDB/Traveleo",
    size: "lg",
    categories: ["Web"],
    shots: [
      {
        src: "/projects/traveleo/home.webp",
        alt: "Traveleo home page with flight search",
        device: "laptop",
      },
      {
        src: "/projects/traveleo/mobile.webp",
        alt: "Traveleo home page on a phone",
        device: "phone",
      },
      {
        src: "/projects/traveleo/destinations.webp",
        alt: "Popular destinations on Traveleo",
        device: "laptop",
      },
    ],
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
    id: "ai-cv-generator",
    title: "AI-Powered CV Generator",
    description:
      "Commercial-ready static site that uses the Anthropic API to generate tailored CVs, localized for the French/Algerian market with DZD pricing.",
    tech: ["HTML", "CSS", "JavaScript", "Anthropic API"],
    size: "md",
    categories: ["Web", "AI"],
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
    id: "2048-stages",
    title: "2048 Stages — Mobile Puzzle Game",
    description:
      "A reworked take on 2048 in Flutter: stage-based progression, an endless mode, daily challenges, unlockable skins, medals and a bold poster-style design.",
    tech: ["Flutter", "Dart"],
    githubUrl: "https://github.com/nbkihal/2048-game",
    size: "md",
    categories: ["Mobile", "Games"],
    shots: [
      {
        src: "/projects/2048-stages/game.webp",
        alt: "2048 game in progress on stage 1",
        device: "phone",
      },
      {
        src: "/projects/2048-stages/home.webp",
        alt: "2048 home with daily challenge, stages and endless mode",
        device: "phone",
      },
      {
        src: "/projects/2048-stages/stages.webp",
        alt: "Stage select with targets and rules",
        device: "phone",
      },
      {
        src: "/projects/2048-stages/skins.webp",
        alt: "Unlockable tile skins",
        device: "phone",
      },
    ],
    caseStudy: {
      problem:
        "Classic 2048 is fun for ten minutes and then repeats itself. It has no goals, no progression and no reason to come back tomorrow.",
      build:
        "A Flutter rebuild with a clean game engine (moves, merge rules, spawning) and several modes on top: hand-designed stages, endless play, a daily challenge, tools, medals and unlockable skins, plus sound and saved progress.",
      outcome:
        "A complete mobile game with its own design language, where 2048 becomes a series of goals instead of one endless grind.",
    },
  },
  {
    id: "earth-globe",
    title: "Interactive 3D Earth Globe",
    description:
      "Self-contained Three.js globe with real textures, city markers, and touch/zoom controls — the same engine powering this site's hero.",
    tech: ["Three.js", "WebGL"],
    size: "md",
    categories: ["Web"],
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
    categories: ["Client & pro"],
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
  email: "[EMAIL_ADDRESS]",
  /**
   * TODO: create a form at https://formspree.io and paste its endpoint here.
   * Until then the form falls back to a mailto: link. See README.
   */
  formspreeEndpoint: "https://formspree.io/f/mjybnoap",
  socials: [
    {
      label: "Email",
      href: "mailto:[EMAIL_ADDRESS]",
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
