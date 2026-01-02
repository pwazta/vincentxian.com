/**
 * About section content component
 * Used in: Portfolio modal for About section
 */
import * as React from "react";

export function AboutContent() {
  return (
    <div className="space-y-4">
      <p className="text-foreground/90">
        Hi! I&apos;m a developer and artist passionate about creating beautiful,
        functional experiences at the intersection of technology and design.
      </p>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Background:</h3>
        <p className="text-muted-foreground">
          Placeholder text about background, education, and interests.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Interests:</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>3D graphics and interactive experiences</li>
          <li>Web development and modern frameworks</li>
          <li>Creative coding and digital art</li>
        </ul>
      </div>
    </div>
  );
}

