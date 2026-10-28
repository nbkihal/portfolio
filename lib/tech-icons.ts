import {
  siAnthropic,
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
  siSvg,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  siWebgl,
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

/** Extra spellings used in project `tech` lists. */
const aliases: Record<string, SimpleIcon> = {
  HTML: techIcons.HTML5,
  "Anthropic API": siAnthropic,
  "Google Gemini API": techIcons.Gemini,
  WebGL: siWebgl,
  SVG: siSvg,
};

/** Logo for a free-form tech label, if one is known. */
export function iconForTech(name: string): SimpleIcon | undefined {
  return techIcons[name as TechName] ?? aliases[name];
}

/**
 * Hover colour for a logo. Near-black brand colours (Next.js, GitHub…)
 * use the text colour instead so they stay visible in dark mode.
 */
export function brandColor(icon: SimpleIcon): string {
  const [r, g, b] = [0, 2, 4].map((i) =>
    parseInt(icon.hex.slice(i, i + 2), 16),
  );
  const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 60;
  return dark ? "hsl(var(--foreground))" : `#${icon.hex}`;
}
