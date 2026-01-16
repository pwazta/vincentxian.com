/**
 * Experience section content component for About modal tab
 * Displays work experience cards
 */
import * as React from "react";
import { Briefcase } from "lucide-react";
import { ExperienceCard } from "~/features/shared/components/ExperienceCard";
import logoLyra from "~/assets/images/experience/logo_lyra.webp";
import logoMykaion from "~/assets/images/experience/logo_mykaion.webp";

export function ExperienceContent() {
  const experiences = [
    {
      image: logoLyra,
      imageAlt: "Lyra Logo",
      title: "Lyra",
      role: "Forward Deployed Engineer",
      dates: "Sep 2025 - Present",
      description:
        "Lyra is a top-tier digital product studio partnering with startups and fast-growing companies to design, develop, and launch exceptional digital experiences. We collaborate with innovative teams from companies like Soma Capital, 88Rising, Paraform, and various YC-backed startups to craft products that are intuitive, visually striking, and built with care.",
    },
    {
      image: logoMykaion,
      imageAlt: "MyKaion Logo",
      title: "MyKaion",
      role: "Software Engineer (Contract)",
      dates: "Sep 2025 - Dec 2025",
      description:
        "MyKaion is an IVF patient-centric platform that connects families, clinics, lawyers, and specialists, guiding parties through legal and medical workflows throughout their fertility journeys. Solo delivered the full 0→1 platform, designing the system architecture and implementing full-stack features.",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header - matches card layout: invisible spacer for image, then centered title */}
      <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4">
        <div className="hidden md:block w-[120px] flex-shrink-0" />
        <div className="flex-1 flex items-center gap-2 justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2
                className="text-2xl font-semibold mb-1"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-mono)",
                  textShadow:
                    "2px 2px 0px color-mix(in srgb, var(--primary) 50%, transparent)",
                }}
              >
                experience
              </h2>
              <Briefcase className="size-7 mb-2 ml-2 text-primary" />
            </div>
            <p className="text-sm text-foreground/60">
              Here&apos;s what I&apos;ve been up to. Feel free to reach out!
            </p>
          </div>
        </div>
      </div>

      {/* Experience Cards */}
      <div className="space-y-2">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.title} {...exp} />
        ))}
      </div>
    </div>
  );
}
