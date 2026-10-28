import {
  Briefcase,
  CalendarDays,
  Code2,
  Flag,
  Github,
  GraduationCap,
  LayoutTemplate,
  Linkedin,
  Mail,
  Palette,
  Rocket,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { IconKey } from "@/content/site-data";

/**
 * Maps the string icon keys used in content/site-data.ts to Lucide
 * components, so the content file stays free of imports/JSX.
 */
export const icons: Record<IconKey, LucideIcon> = {
  code: Code2,
  sparkles: Sparkles,
  layout: LayoutTemplate,
  workflow: Workflow,
  mail: Mail,
  linkedin: Linkedin,
  github: Github,
  graduation: GraduationCap,
  palette: Palette,
  users: Users,
  calendar: CalendarDays,
  flag: Flag,
  rocket: Rocket,
  briefcase: Briefcase,
};
