/**
 * About section content component with tabbed layout
 * Used in: Portfolio modal for About section
 * Tabs: About | Experience | Activities
 * Desktop: Vertical tabs on right with separator
 * Mobile: Horizontal tabs below header
 */
import * as React from "react";
import Image from "next/image";
import { Badge } from "~/features/shared/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/features/shared/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/features/shared/components/ui/tabs";
import { Sticker } from "lucide-react";
import { SocialLinks } from "~/features/shared/components/SocialLinks";
import headshotImage from "~/assets/images/profile/headshot.webp";
import { ExperienceContent } from "./ExperienceContent";
import { ActivitiesContent } from "./ActivitiesContent";

function AboutMeContent() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Image only */}
      <div className="flex-shrink-0 flex justify-center md:justify-start mt-0 md:mt-5">
        <Image
          src={headshotImage}
          alt="Profile"
          width={220}
          height={220}
          className="rounded-full object-cover"
          style={{ width: "220px", height: "220px" }}
          placeholder="blur"
          priority
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 space-y-4">
        {/* Header and Paragraphs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <h2
              className="text-2xl font-semibold mb-1"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                textShadow:
                  "2px 2px 0px color-mix(in srgb, var(--primary) 50%, transparent)",
              }}
            >
              hello world!
            </h2>
            <Sticker className="size-7 mb-2 ml-2 text-primary" />
          </div>

          <p className="text-foreground/90">
            I&apos;m Vincent, a{" "}
            <span
              style={{
                backgroundColor: "var(--secondary)",
                padding: "2px 6px",
                borderRadius: "2px",
                display: "inline-block",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              software engineer, game-dev and 3D artist
            </span>{" "}
            based in Sydney. I specialize in full-stack development, with
            experience in game design, and study Computer Science & Fine Arts
            (Animation / 3DVis) at UNSW.
          </p>
          <p className="text-foreground/90">
            Whether it&apos;s designing AI systems in Unity, crunching code
            deadlines in NextJS, or animating and modelling in Maya, I&apos;m
            always experimenting and pushing myself to learn something new. I
            seek to create innovative, engaging experiences that others can
            enjoy — and I&apos;m excited to share that passion with the world.
          </p>
        </div>

        {/* Tech Stack Section - Centered */}
        <div>
          <h3 className="text-center text-lg font-semibold text-foreground mb-0">
            Tech Stack
          </h3>
          <div className="space-y-2 mt-2">
            <div className="flex flex-wrap items-center gap-1 justify-center">
              <span className="text-sm font-medium text-foreground">
                Languages:
              </span>
              <Badge>C#</Badge>
              <Badge>C++</Badge>
              <Badge>Typescript</Badge>
              <Badge>Java</Badge>
              <Badge>Python</Badge>
              <Badge>HTML</Badge>
              <Badge>CSS</Badge>
            </div>
            <Accordion type="single" collapsible className="w-full p-0">
              <AccordionItem value="tech" className="border-none p-0">
                <div className="flex flex-wrap items-center gap-1 justify-center">
                  <AccordionTrigger className="text-sm font-medium text-foreground py-0 px-0 hover:no-underline h-auto [&>svg]:ml-1 cursor-pointer">
                    Tech:
                  </AccordionTrigger>
                  <Badge>T3 Stack</Badge>
                  <Badge>NextJS</Badge>
                  <Badge>React</Badge>
                  <Badge>Tailwind</Badge>
                  <Badge>Prisma</Badge>
                  <Badge>Framer Motion</Badge>
                </div>
                <AccordionContent>
                  <div className="flex flex-wrap items-center gap-1 justify-center mt-2">
                    <span className="text-sm font-medium text-foreground invisible">
                      Tech:
                    </span>
                    <span className="w-4 h-4 invisible" aria-hidden="true" />
                    <Badge>Bootstrap</Badge>
                    <Badge>Unity</Badge>
                    <Badge>Godot</Badge>
                    <Badge>Unreal Engine</Badge>
                    <Badge>Maya</Badge>
                    <Badge>Substance Painter</Badge>
                    <Badge>Adobe Suite</Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Social Media Links - Centered */}
        <SocialLinks className="mb-2" />
      </div>
    </div>
  );
}

export function AboutContent() {
  return (
    <Tabs defaultValue="about" className="w-full">
      {/* Mobile: Horizontal tabs */}
      <TabsList className="md:hidden w-full flex justify-center gap-1 bg-transparent mb-4">
        <TabsTrigger
          value="about"
          className="px-4 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
        >
          About
        </TabsTrigger>
        <TabsTrigger
          value="experience"
          className="px-4 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
        >
          Experience
        </TabsTrigger>
        <TabsTrigger
          value="activities"
          className="px-4 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
        >
          Activities
        </TabsTrigger>
      </TabsList>

      {/* Desktop: Content + Vertical tabs on right */}
      <div className="flex">
        {/* Tab content area */}
        <div className="flex-1 min-w-0">
          <TabsContent value="about" className="mt-0">
            <AboutMeContent />
          </TabsContent>
          <TabsContent value="experience" className="mt-0">
            <ExperienceContent />
          </TabsContent>
          <TabsContent value="activities" className="mt-0">
            <ActivitiesContent />
          </TabsContent>
        </div>

        {/* Desktop: Vertical separator + tabs on right */}
        <div className="hidden md:flex items-stretch ml-4">
          {/* Vertical separator */}
          <div className="w-px bg-accent/30 mr-3" />

          {/* Vertical tabs */}
          <TabsList className="flex flex-col h-full justify-start gap-2 bg-transparent p-0">
            <TabsTrigger
              value="about"
              className="px-2 py-3 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none rounded-r-md"
              style={{ writingMode: "vertical-rl" }}
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="px-2 py-3 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none rounded-r-md"
              style={{ writingMode: "vertical-rl" }}
            >
              Experience
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="px-2 py-3 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none rounded-r-md"
              style={{ writingMode: "vertical-rl" }}
            >
              Activities
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
    </Tabs>
  );
}
