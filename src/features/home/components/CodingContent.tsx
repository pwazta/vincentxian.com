/**
 * Coding section content component
 * Used in: Portfolio modal for Coding section
 */
import * as React from "react";

export function CodingContent() {
  return (
    <div className="space-y-4">
      <p className="text-foreground/90">
        Welcome to my coding portfolio. Here you&apos;ll find projects showcasing
        my work in software development.
      </p>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Featured Projects:</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Project placeholder 1</li>
          <li>Project placeholder 2</li>
          <li>Project placeholder 3</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Technologies:</h3>
        <p className="text-muted-foreground">
          TypeScript, React, Next.js, Three.js, and more...
        </p>
      </div>
    </div>
  );
}

