/**
 * Reusable experience/activity card component with image, title, role, and description
 * Used in: ExperienceContent and ActivitiesContent for About modal tabs
 */
import * as React from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "~/lib/utils";

export interface ExperienceCardProps {
  image: StaticImageData | string;
  imageAlt: string;
  title: string;
  role: string;
  dates?: string;
  description: string;
  className?: string;
}

export function ExperienceCard({image, imageAlt, title, role, dates, description, className}: ExperienceCardProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 rounded transition-colors hover:bg-muted", className)}>
      {/* Left: Image */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <Image
          src={image}
          alt={imageAlt}
          width={120}
          height={120}
          className="object-cover rounded w-[120px] h-[120px]"
          placeholder={typeof image !== "string" ? "blur" : undefined}
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="font-semibold text-foreground text-base md:text-lg">
          {title}
        </h3>
        <p className="text-foreground/70 text-sm">
          {role}
          {dates && <span className="text-foreground/50"> · {dates}</span>}
        </p>
        <p className="text-foreground/90 text-sm mt-2 flex-1">{description}</p>
      </div>
    </div>
  );
}
