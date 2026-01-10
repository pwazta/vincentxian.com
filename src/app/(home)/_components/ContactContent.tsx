/**
 * Contact section content component
 * Used in: Portfolio modal for Contact section
 */
import * as React from "react";

export function ContactContent() {
  return (
    <div className="space-y-4">
      <p className="text-foreground/90">
        Get in touch! I&apos;m always open to discussing new projects, creative
        opportunities, or just saying hello.
      </p>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Contact Methods:</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Email: placeholder@example.com</li>
          <li>LinkedIn: placeholder</li>
          <li>GitHub: placeholder</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Availability:</h3>
        <p className="text-muted-foreground">
          Currently available for freelance projects and collaborations.
        </p>
      </div>
    </div>
  );
}

