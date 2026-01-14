/**
 * Activities section content component for About modal tab
 * Displays extracurricular/volunteer activity cards
 */
import * as React from "react";
import { Users } from "lucide-react";
import { ExperienceCard } from "~/features/shared/components/ExperienceCard";
import logoCgsoc from "~/assets/images/experience/logo_cgsoc.webp";
import logoCadets from "~/assets/images/experience/logo_cadets.webp";

export function ActivitiesContent() {
  const activities = [
    {
      image: logoCgsoc,
      imageAlt: "Computer Graphics Society Logo",
      title: "Computer Graphics Society (CGSoc)",
      role: "Game Development Committee",
      dates: "Mar 2025 - Dec 2025",
      description:
        "The UNSW Computer Graphics Society exists to unite students passionate about the creative and technical potential of computer graphics and interactive techniques. Fostering a collaborative and supportive environment where students in relevant programs and beyond can refine their skills, connect with peers, exhibit their work, and prepare for industry success.",
    },
    {
      image: logoCadets,
      imageAlt: "Australian Army Cadets Logo",
      title: "Australian Army Cadets (AAC)",
      role: "Cadet Under Officer (CUO)",
      dates: "5 years",
      description:
        "The Australian Army Cadets is a youth military organisation partnered with the Australian Defence Force, fostering discipline and teamwork through field exercises, instructional activities, and ceremonial events. Attained the highest rank of Cadet Under Officer, directly overseeing training and safety for a unit of over 150 cadets.",
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
                activities
              </h2>
              <Users className="size-7 mb-2 ml-2 text-primary" />
            </div>
            <p className="text-sm text-foreground/60">
              Volunteering and extracurriculars I&apos;ve been involved in.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-2">
        {activities.map((activity) => (
          <ExperienceCard key={activity.title} {...activity} />
        ))}
      </div>
    </div>
  );
}
