import { ArrowUpRight } from "lucide-react";

import { contact } from "@/content/site-data";
import { icons } from "@/lib/icons";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";

export function Contact() {
  return (
    <Section id="contact">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title={contact.heading}
              description={contact.subheading}
            />

            <Reveal delay={0.1}>
              <ul className="flex flex-col gap-3">
                {contact.socials.map((social) => {
                  const Icon = icons[social.icon];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target={
                          social.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          social.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-brand/50"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                          <Icon className="size-5" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            {social.label}
                          </span>
                          <span className="font-medium">{social.handle}</span>
                        </span>
                        <ArrowUpRight className="ml-auto size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
