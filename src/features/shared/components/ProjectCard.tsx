/**
 * Reusable project card component with image, title, description, tech stack, and links
 * Used in: SoftwareContent and other portfolio sections
 */
import * as React from "react";
import Image from "next/image";
import { Badge } from "~/features/shared/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";

export interface ProjectCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  technologies: string[];
  links?: Array<{
    url: string;
    label: string;
  }>;
  className?: string;
}

export function ProjectCard({title, description, imageSrc, imageAlt, technologies, links = [], className}: ProjectCardProps) {
  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded transition-colors hover:bg-muted",
        className
      )}
    >
      {/* Left: Image */}
      <div className="flex-shrink-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={240}
          height={135}
          className="rounded object-cover"
          style={{ width: "240px", height: "135px" }}
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title */}
        <h3 className="font-semibold text-foreground text-lg">
          {title}
        </h3>

        {/* Description */}
        <p className="text-foreground/90 text-sm mb-3 flex-1">
          {description}
        </p>

        {/* Bottom row: Tech stack and Links */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          {/* Tech stack badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {technologies.map((tech) => (
              <Badge key={tech} className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 transition-opacity"
                  aria-label={link.label}
                >
                  <ExternalLink className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

