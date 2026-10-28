import {
  siClaude,
  siCss,
  siDart,
  siDjango,
  siDocker,
  siFirebase,
  siFlutter,
  siGit,
  siGithub,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siLangchain,
  siNextdotjs,
  siNodedotjs,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  type SimpleIcon,
} from "simple-icons";

/**
 * Brand logos (from Simple Icons) for the tech names used in
 * content/site-data.ts → `techStack`. Add an entry here to make a new
 * name available there.
 */
export const techIcons = {
  "Next.js": siNextdotjs,
  React: siReact,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  "Node.js": siNodedotjs,
  Python: siPython,
  Django: siDjango,
  Flutter: siFlutter,
  Dart: siDart,
  "Tailwind CSS": siTailwindcss,
  "Three.js": siThreedotjs,
  HTML5: siHtml5,
  CSS: siCss,
  Firebase: siFirebase,
  Supabase: siSupabase,
  Docker: siDocker,
  LangChain: siLangchain,
  Gemini: siGooglegemini,
  Claude: siClaude,
  Git: siGit,
  GitHub: siGithub,
  Vite: siVite,
  Vitest: siVitest,
  Vercel: siVercel,
} satisfies Record<string, SimpleIcon>;

export type TechName = keyof typeof techIcons;
