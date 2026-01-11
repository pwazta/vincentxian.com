/**
 * Software section content component
 * Used in: Portfolio modal for Software section
 */
import * as React from "react";
import { Code } from "lucide-react";
import { ProjectCard } from "~/features/shared/components/ProjectCard";
import { ScrollArea } from "~/features/shared/components/ui/scroll-area";

export function SoftwareContent() {
  const projects = [
    {
      title: "Personal Portfolio Website",
      description:
        "You're looking at it! - a three.js website powered by React Three Fiber and T3 stack, featuring a retro low-poly 3D environment I modeled myself. This interactive portfolio showcases all my work across software development, game design, and 3D art.",
      images: [
        {
          src: "/portfolio_website.webp",
          alt: "Personal Portfolio Website",
        },
      ],
      technologies: ["NextJS", "React Three Fiber", "T3", "GSAP"],
      links: [],
    },
    {
      title: "Whisker Isles",
      description:
        "A task-oriented life simulator where you play as a cat on a tropical island, completing tasks by farming, fishing, and foraging to gather resources for your family cafe's grand opening. Features a dynamic economy with markets and quest systems, progressively challenging daily objectives, and NPC animals you can befriend through dialogue.",
      images: [
        {
          src: "/whisker_isles_farming.webp",
          alt: "Whisker Isles",
        },
        {
          src: "/whisker_isles_trading_and_quests.webp",
          alt: "Whisker Isles",
        },
        {
          src: "/whisker_isles_fishing.webp",
          alt: "Whisker Isles",
        },
      ],
      technologies: ["Unreal Engine", "Blueprints"],
      links: [],
    },
    {
      title: '"East of Loving" — Strategy Game',
      description:
        "A comedy-driven topdown game built in Unity using C# featuring turn-based PVE combat, smart inventory and dynamic item / enemy logic. Features fully handmade 2D graphics, VFX and UI with bone animations modelled in Unity.",
      images: [
        {
          src: "/EoL_1.webp",
          alt: "East of Loving Strategy Game",
        },
        {
          src: "/EoL_2.webp",
          alt: "East of Loving Strategy Game",
        },
      ],
      technologies: ["C#", "Unity", "Photoshop"],
      links: [],
    },
    {
      title: "Endless Wave Survival Game",
      description:
        "A proof of concept for an endless survival PVE game developed in C# Godot with extensive upgrade systems, economy and equipment progression. This ongoing passion project explores complex enemy AI with unique pathfinding and state-based behaviours including tracking, circling, patrolling and flock behaviour. Visuals and UI are hand-drawn and animated in Photoshop.",
      images: [],
      technologies: ["C#", "Godot", "Photoshop"],
      links: [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 justify-center">
        <h2
          className="text-2xl font-semibold mb-1"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-mono)",
            textShadow:
              "2px 2px 0px color-mix(in srgb, var(--primary) 50%, transparent)",
          }}
        >
          my projects
        </h2>
        <Code className="size-7 mb-2 ml-2 text-primary" />
      </div>

      {/* Projects List */}
      <ScrollArea className="h-[500px] w-full">
        <div className="space-y-2 pr-4">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

