/**
 * Arts section content component
 * Used in: Portfolio modal for Arts section
 */
import * as React from "react";
import { Palette } from "lucide-react";
import { ProjectCard } from "~/features/shared/components/ProjectCard";
import { ScrollArea } from "~/features/shared/components/ui/scroll-area";

export function ArtsContent() {
  const artworks = [
    {
      title: "Steampunk Cityscape Environment",
      description:
        "A steampunk cityscape environment combining Victorian-era aesthetics with retro-futuristic steam-powered technology. The playable Unreal Engine map features a central winding street through a multi-story city with overhanging bridges and mechanical infrastructure, set at night with soft amber lighting guiding players toward a memorial plaza.",
      images: [
        {
          src: "/steampunk_city_plaza.webp",
          caption: "Plaza with animated globe showcasing the central memorial area",
          alt: "Steampunk Cityscape Environment",
        },
        {
          src: "/steampunk_city_streets.webp",
          caption: "Winding streets through the multi-story steampunk city",
          alt: "Steampunk Cityscape Environment",
        },
        {
          src: "/steampunk_city_factory.webp",
          caption: "Factory district with mechanical infrastructure and steam-powered technology",
          alt: "Steampunk Cityscape Environment",
        },
      ],
      technologies: ["Maya", "Substance Painter", "Unreal Engine"],
      links: [],
    },
    {
      title: "Antique Library Environment",
      description:
        "A fully custom-modeled 3D environment of an antique library room inspired by Gothic Revival and traditional European architecture. Set in a warm forest climate of 1800s Europe, the scene captures a quiet sunset with books and materials strewn across tables, emphasizing rich wooden textures and yellow-hued lighting to evoke peaceful, warm solitude.",
      images: [
        {
          src: "/3DVis_Library_1.webp",
          alt: "Antique Library Environment",
        },
        {
          src: "/3DVis_Library_2.webp",
          alt: "Antique Library Environment",
        },
        {
          src: "/3DVis_Library_Wireframe_1.webp",
          alt: "Antique Library Environment",
        },
        {
          src: "/3DVis_Library_Wireframe_2.webp",
          alt: "Antique Library Environment",
        },
      ],
      technologies: ["Maya", "Photoshop"],
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
          my artworks
        </h2>
        <Palette className="size-7 mb-2 ml-2 text-primary" />
      </div>

      {/* Artworks List */}
      <ScrollArea className="h-[500px] w-full">
        <div className="space-y-2 pr-4">
          {artworks.map((artwork) => (
            <ProjectCard key={artwork.title} {...artwork} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

