import { about } from "@/content/site-data";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

export function About() {
  return (
    <Section id="about">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <SectionHeading
            eyebrow="About"
            title={
              <>
                Real products,
                <br />
                not class assignments.
              </>
            }
            className="mb-0"
          />

          <div className="flex flex-col gap-6">
            {about.paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.15}>
              <ul className="mt-2 flex flex-wrap gap-2">
                {about.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Badge variant="brand" className="px-3 py-1 text-sm">
                      {highlight}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
