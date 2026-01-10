/**
 * About section content component
 * Used in: Portfolio modal for About section
 */
import * as React from "react";
import Image from "next/image";
import { Badge } from "~/features/shared/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/features/shared/components/ui/accordion";
import { Sticker } from "lucide-react";

export function AboutContent() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Image only */}
      <div className="flex-shrink-0 flex justify-center md:justify-start mt-0 md:mt-5">
        <Image
          src="/headshot.webp"
          alt="Profile"
          width={220}
          height={220}
          className="rounded-full object-cover"
          style={{ width: "220px", height: "220px" }}
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
            based in Sydney. I&apos;m currently studying Computer Science &
            Fine Arts (Animation / 3DVis) at UNSW with experience in full-stack
            development and game design.
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
                  <Badge>Bootstrap</Badge>
                  <Badge>Prisma</Badge>
                  <Badge>Framer Motion</Badge>
                </div>
                <AccordionContent>
                  <div className="flex flex-wrap items-center gap-1 justify-center mt-2">
                    <span className="text-sm font-medium text-foreground invisible">
                      Tech:
                    </span>
                    <span className="w-4 h-4 invisible" aria-hidden="true" />
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
        <div className="flex justify-center gap-4 mb-2">
          <a
            href="https://github.com/pwazta"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
            aria-label="GitHub"
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              style={{ fill: "var(--primary)" }}
              aria-hidden="true"
            >
              <path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/vincent-xian/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
            aria-label="LinkedIn"
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 382 382"
              xmlns="http://www.w3.org/2000/svg"
              style={{ fill: "var(--primary)" }}
              aria-hidden="true"
            >
              <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

