/**
 * 2D navbar component for portfolio navigation
 * Used in: Home page layout
 */
"use client";

import * as React from "react";
import { Button } from "~/features/shared/components/ui/button";

type NavbarProps = {
  onCodingClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
};

export function Navbar({
  onCodingClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-accent/20 bg-background/80 backdrop-blur-sm px-6 py-4">
      <div className="text-xl font-semibold text-foreground">Your Name</div>
      <div className="flex gap-4">
        <Button
          variant="ghost"
          onClick={onCodingClick}
          className="hover:bg-accent/10"
        >
          Coding
        </Button>
        <Button
          variant="ghost"
          onClick={onArtsClick}
          className="hover:bg-accent/10"
        >
          Arts
        </Button>
        <Button
          variant="ghost"
          onClick={onAboutClick}
          className="hover:bg-accent/10"
        >
          About
        </Button>
        <Button
          variant="ghost"
          onClick={onContactClick}
          className="hover:bg-accent/10"
        >
          Contact
        </Button>
      </div>
    </nav>
  );
}

