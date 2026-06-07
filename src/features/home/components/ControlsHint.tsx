/**
 * Header lightbulb toggle that drops a compact 3D-controls panel.
 * Auto-opens once after the scene loads (first visit), retracts on first camera drag or timeout.
 * Used in: Navbar.
 */
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Mouse, MousePointerClick, Hand, ZoomIn, Move } from "lucide-react";
import { Button } from "~/features/shared/components/ui/button";
import { playSound } from "~/lib/sounds";

const STORAGE_KEY = "vinx-controls-tip-seen";
const AUTO_COLLAPSE_MS = 7000;

type Row = { icon: React.ComponentType<{ className?: string }>; input: string; action: string };

const DESKTOP_ROWS: Row[] = [
  { icon: Mouse, input: "drag", action: "look around" },
  { icon: Mouse, input: "right-drag", action: "pan" },
  { icon: Mouse, input: "scroll", action: "zoom" },
  { icon: MousePointerClick, input: "click", action: "explore" },
];

const TOUCH_ROWS: Row[] = [
  { icon: Hand, input: "drag", action: "look" },
  { icon: ZoomIn, input: "pinch", action: "zoom" },
  { icon: Move, input: "two-finger", action: "move" },
  { icon: MousePointerClick, input: "tap", action: "explore" },
];

type ControlsHintProps = { ready: boolean; userInteracted: boolean };

export function ControlsHint({ ready, userInteracted }: ControlsHintProps) {
  const [isTouch, setIsTouch] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const fallbackRef = React.useRef<NodeJS.Timeout | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  /** Set on first collapse so a later manual reopen isn't auto-collapsed again. */
  const onboardingDoneRef = React.useRef(false);
  const onboardingStartedRef = React.useRef(false);

  const clearFallback = React.useCallback(() => {
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const collapse = React.useCallback(() => {
    clearFallback();
    onboardingDoneRef.current = true;
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, [clearFallback]);

  React.useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    return clearFallback;
  }, [clearFallback]);

  /** Auto-open once after the scene loads, first visit only. */
  React.useEffect(() => {
    if (!ready || onboardingStartedRef.current) return;
    onboardingStartedRef.current = true;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      onboardingDoneRef.current = true;
      return;
    }
    setOpen(true);
    fallbackRef.current = setTimeout(collapse, AUTO_COLLAPSE_MS);
  }, [ready, collapse]);

  /** Retract on the first camera drag. */
  React.useEffect(() => {
    if (userInteracted && open && !onboardingDoneRef.current) collapse();
  }, [userInteracted, open, collapse]);

  /** Retract on any click outside. */
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) collapse();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, collapse]);

  const toggle = () => {
    playSound("click");
    if (open) {
      collapse();
    } else {
      onboardingDoneRef.current = true;
      window.localStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
    }
  };

  const rows = isTouch ? TOUCH_ROWS : DESKTOP_ROWS;

  return (
    <div ref={containerRef} className="relative">
      <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={open ? "Hide controls" : "Show controls"}
          aria-expanded={open}
          className="hover:bg-accent/10 cursor-pointer"
        >
          <motion.span
            className="inline-flex"
            animate={{ rotate: open ? -12 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Lightbulb className="h-5 w-5" />
          </motion.span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2"
          >
            <motion.div
              initial={{ scale: 0.9, rotate: -4, y: -4 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "top right" }}
              className="w-max border border-foreground bg-background opacity-90 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 bg-primary px-2 py-1">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="h-3 w-3 text-white" />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-white">Controls</span>
                </span>
                <button
                  onClick={() => { playSound("click"); collapse(); }}
                  aria-label="Close"
                  className="cursor-pointer opacity-90 transition-opacity hover:opacity-100 focus:outline-none"
                >
                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}>
                    <Image src="/close-box.svg" alt="Close" width={16} height={16} className="h-4 w-4 brightness-0 invert" />
                  </motion.div>
                </button>
              </div>
              <div
                className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-2.5 py-2 text-[11px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {rows.map((row) => (
                  <React.Fragment key={row.action}>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <row.icon className="h-3.5 w-3.5 shrink-0" />
                      {row.input}
                    </span>
                    <span className="text-foreground">{row.action}</span>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
