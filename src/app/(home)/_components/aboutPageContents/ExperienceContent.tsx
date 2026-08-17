/**
 * Experience section content component for About modal tab
 * Displays work experience cards
 */
import * as React from "react";
import { Briefcase } from "lucide-react";
import { ExperienceCard } from "~/features/shared/components/ExperienceCard";
import { ScrollArea } from "~/features/shared/components/ui/scroll-area";
import logoLyra from "~/assets/images/experience/logo_lyra.webp";
import logoParaform from "~/assets/images/experience/logo_paraform.webp";
import logoCorveris from "~/assets/images/experience/logo_corveris.webp";
import logoPolar from "~/assets/images/experience/logo_polar.webp";
import logoChakra from "~/assets/images/experience/logo_chakra.webp";
import logoMykaion from "~/assets/images/experience/logo_mykaion.webp";

export function ExperienceContent() {
  const experiences = [
    {
      image: logoLyra,
      imageAlt: "Lyra Logo",
      title: "Lyra",
      role: "Forward Deployed Engineer",
      dates: "Aug 2025 - Aug 2026",
      description:
        "Lyra is a top-tier digital product studio partnering with startups and fast-growing companies to design, develop, and launch exceptional digital experiences, working with teams from Soma Capital, 88Rising, Paraform, and various YC-backed startups.",
    },
    {
      image: logoParaform,
      imageAlt: "Paraform Logo",
      title: "Paraform",
      role: "Software Engineer",
      dates: "May 2026 - Aug 2026",
      description:
        "Paraform is the leading online recruiting marketplace connecting companies, recruiters, and candidates; worked across the hiring manager experience to drive engagement and efficiency.",
      details:
        "Overhauled a long manual job creation form into an AI-assisted intake flow, parsing a job description straight into the structured fields needed. Built a classifier with regex fallback evaluating which messages need a reply, plus its cronjob, backend storage, and a consolidated messages interface surfacing actions required, driving response-time down 22%. Consolidated 7 legacy email and notification systems into a unified engine respecting user preferences, with lint enforced toggle grouping and no duplicate or missed sends.",
    },
    {
      image: logoCorveris,
      imageAlt: "Corveris Logo",
      title: "Corveris",
      role: "Software Engineer",
      dates: "Mar 2026 - May 2026",
      description:
        "Corveris builds OneReport, an AI intake and workflow agent for public safety, turning non-emergency community reports into actionable department-specific reports.",
      details:
        "Overhauled the public-facing reporting flow with a consolidated design system. Generalised department-onboarding from a hardcoded charge-list into a config driven statute layer, mapping each department's statutes and offence classifications onto one canonical schema that drives classification, routing and reporting. Centralised export behind pluggable output mappers, including an Evidence.com integration, and rebuilt the department configuration screens.",
    },
    {
      image: logoPolar,
      imageAlt: "Polar Logo",
      title: "Polar",
      role: "Software Engineer (Contract)",
      dates: "Jan 2026",
      description:
        "Polar is an AI browser that autonomously runs internet tasks and automations from quick lookups to hours-long research inside integrated browsers. Owned testing and evaluation, running WebArena benchmarks against leading frontier models like Claude, Perplexity Comet, Codex and Manus.",
    },
    {
      image: logoChakra,
      imageAlt: "Chakra Labs Logo",
      title: "Chakra Labs",
      role: "Software Engineer",
      dates: "Dec 2025 - Mar 2026",
      description:
        "Chakra Labs engineers high-fidelity trajectories and environments for frontier AI research. Built production grade clones of complex consumer apps for training automation, including Canva and a full Gmail clone.",
    },
    {
      image: logoMykaion,
      imageAlt: "MyKaion Logo",
      title: "MyKaion",
      role: "Software Engineer",
      dates: "Aug 2025 - Dec 2025",
      description:
        "MyKaion is an IVF patient-centric platform connecting families, clinics, lawyers, and specialists through their fertility journeys; solo delivered the full 0→1 platform.",
      details:
        "Designed the system architecture and built its two core flows: legal document workflows, where paperwork is drafted, passed between parties for signing, and routed back for review, and an integrated appointments system.",
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
      <ScrollArea className="h-[60vh] md:h-[500px] w-full">
        <div className="space-y-2 pr-4">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.title} {...exp} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
