/**
 * 2D navbar component for portfolio navigation with collapsible menu
 * Used in: Home page layout
 */
"use client";

import * as React from "react";
// import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      {/* <Image
        src="/logo.svg"
        alt="vx.dev"
        width={40}
        height={40}
        className="h-8 w-auto"
        priority
      /> */}
      
      {/* Collapsible menu buttons - slide in horizontally with Framer Motion */}
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex items-center gap-4"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.05 }}
              >
                <Button variant="ghost" onClick={onAboutClick} className="hover:bg-accent/10 whitespace-nowrap cursor-pointer">
                  About
                </Button>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
              >
                <Button variant="ghost" onClick={onSoftwareClick} className="hover:bg-accent/10 whitespace-nowrap cursor-pointer">
                  Software
                </Button>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.15 }}
              >
                <Button variant="ghost" onClick={onArtsClick} className="hover:bg-accent/10 whitespace-nowrap cursor-pointer">
                  Arts
                </Button>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
              >
                <Button variant="ghost" onClick={onContactClick} className="hover:bg-accent/10 whitespace-nowrap cursor-pointer">
                  Contact
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-accent/10 cursor-pointer"
          aria-label="Toggle menu"
        >
          <motion.div
            key={isOpen ? "open" : "closed"}
            initial={{ rotate: isOpen ? 0 : -180 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.div>
        </Button>
      </div>
    </nav>
  );
}

