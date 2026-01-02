/**
 * Arts section content component
 * Used in: Portfolio modal for Arts section
 */
import * as React from "react";

export function ArtsContent() {
  return (
    <div className="space-y-4">
      <p className="text-foreground/90">
        Explore my creative work and artistic projects. This section features
        visual design, illustrations, and digital art.
      </p>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Featured Works:</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Artwork placeholder 1</li>
          <li>Artwork placeholder 2</li>
          <li>Artwork placeholder 3</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Mediums:</h3>
        <p className="text-muted-foreground">
          Digital art, 3D modeling, graphic design, and more...
        </p>
      </div>
    </div>
  );
}

