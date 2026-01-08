/**
 * 2D navbar component for portfolio navigation with collapsible menu
 * Used in: Home page layout
 */
"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "~/features/shared/components/ui/button";

type NavbarProps = {
  onSoftwareClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
};

export function Navbar({
  onSoftwareClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        isOpen
          ? "bg-background/80 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="text-xl font-semibold text-foreground">vx</div>
      
      {/* Collapsible menu buttons - slide in horizontally */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-4 transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen
              ? "max-w-[500px] opacity-100"
              : "max-w-0 opacity-0 pointer-events-none"
          }`}
        >
          <Button
            variant="ghost"
            onClick={onSoftwareClick}
            className="hover:bg-accent/10 whitespace-nowrap"
          >
            Software
          </Button>
          <Button
            variant="ghost"
            onClick={onArtsClick}
            className="hover:bg-accent/10 whitespace-nowrap"
          >
            Arts
          </Button>
          <Button
            variant="ghost"
            onClick={onAboutClick}
            className="hover:bg-accent/10 whitespace-nowrap"
          >
            About
          </Button>
          <Button
            variant="ghost"
            onClick={onContactClick}
            className="hover:bg-accent/10 whitespace-nowrap"
          >
            Contact
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-accent/10"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
    </nav>
  );
}

