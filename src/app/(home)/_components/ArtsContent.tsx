/**
 * Arts section content component
 * Used in: Portfolio modal for Arts section
 */
import * as React from "react";
import { Palette } from "lucide-react";
import { ProjectCard } from "~/features/shared/components/ProjectCard";
import { ScrollArea } from "~/features/shared/components/ui/scroll-area";
import reverie1Image from "~/assets/images/projects/reverie_1.webp";
import reverie2Image from "~/assets/images/projects/reverie_2.webp";
import reverie3Image from "~/assets/images/projects/reverie_3.webp";
import steampunkCityPlazaImage from "~/assets/images/projects/steampunk_city_plaza.webp";
import steampunkCityStreetsImage from "~/assets/images/projects/steampunk_city_streets.webp";
import steampunkCityFactoryImage from "~/assets/images/projects/steampunk_city_factory.webp";
import library1Image from "~/assets/images/projects/3DVis_Library_1.webp";
import library2Image from "~/assets/images/projects/3DVis_Library_2.webp";
import libraryWireframe1Image from "~/assets/images/projects/3DVis_Library_Wireframe_1.webp";
import libraryWireframe2Image from "~/assets/images/projects/3DVis_Library_Wireframe_2.webp";

export function ArtsContent() {
  const artworks = [
    {
      title: "Reverie - 3D Cinematic",
      description:
        "A 3D cinematic that drifts through a contemporary cityscape overtaken by nature and time, built to convey hyperfixation through a focus on the smaller details. I aim to construct the often incomplete sense of nostalgia and tranquillity, focusing on material details through camerawork and framing as the actual subject rather than forms of environmental storytelling.",
      details:
        "It treats hyperfixation not as an uncontrollable instinct but as something that can be intentionally directed, even within artificial spaces that hold no such feeling on their own. Built in Maya and UE5, Reverie represents a work I've wanted to create for a long time, and it is one I hope has been able to recreate this ethereal feeling of hyperfixation, and to let others experience this sensation from a similar perspective. Please contact me for the full cinematic! :)",
      images: [
        {
          src: reverie1Image,
          alt: "Reverie 3D cinematic Scene 2",
        },
        {
          src: reverie2Image,
          alt: "Reverie 3D cinematic Scene 5",
        },
        {
          src: reverie3Image,
          alt: "Reverie 3D cinematic Scene 8",
        },
      ],
      technologies: ["Maya", "Substance Painter", "Unreal Engine", "Premiere Pro"],
      links: [],
    },
    {
      title: "Steampunk Cityscape Environment",
      description:
        "A steampunk cityscape environment combining Victorian-era aesthetics with retro-futuristic steam-powered technology. The playable Unreal Engine map features a central winding street through a multi-story city with overhanging bridges and mechanical infrastructure, set at night with soft amber lighting guiding players toward a memorial plaza.",
      images: [
        {
          src: steampunkCityPlazaImage,
          caption: "Plaza with animated globe showcasing the central memorial area",
          alt: "Steampunk Cityscape Plaza",
        },
        {
          src: steampunkCityStreetsImage,
          caption: "Winding streets through the multi-story steampunk city",
          alt: "Steampunk Cityscape Streets",
        },
        {
          src: steampunkCityFactoryImage,
          caption: "Factory district with mechanical infrastructure and steam-powered technology",
          alt: "Steampunk Cityscape Factory",
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
          src: library1Image,
          alt: "Antique Library Environment Render 1",
        },
        {
          src: library2Image,
          alt: "Antique Library Environment Render 2",
        },
        {
          src: libraryWireframe1Image,
          alt: "Antique Library Environment Wireframe 1",
        },
        {
          src: libraryWireframe2Image,
          alt: "Antique Library Environment Wireframe 2",
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
      <ScrollArea className="h-[60vh] md:h-[500px] w-full">
        <div className="space-y-2 pr-4">
          {artworks.map((artwork) => (
            <ProjectCard key={artwork.title} {...artwork} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

