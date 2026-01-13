/**
 * Loading screen component for 3D scene with progress tracking and Enter button
 * Used in: PortfolioScene to show loading progress while resources load
 */
"use client";

import * as React from "react";
import { useProgress } from "@react-three/drei";
import { Button } from "~/features/shared/components/ui/button";
import { Lightbulb } from "lucide-react";

type SceneLoaderProps = { onLoaded?: () => void; onEnterClick?: () => void }

export function SceneLoader({ onLoaded, onEnterClick }: SceneLoaderProps) {
  const { progress, active } = useProgress();
  const [showEnterButton, setShowEnterButton] = React.useState(false);
  const [isHiding, setIsHiding] = React.useState(false);
  const [maxProgressSeen, setMaxProgressSeen] = React.useState(0);
  const buttonTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasStartedTimerRef = React.useRef(false);

  /** Track maximum progress to prevent showing 0% if progress resets */
  React.useEffect(() => {
    if (progress > maxProgressSeen) setMaxProgressSeen(progress);
  }, [progress, maxProgressSeen]);

  /** Handle completion - separate effect that only runs when we reach 100% */
  React.useEffect(() => {
    const reachedHundred = (!active && progress === 100) || maxProgressSeen === 100;
    
    if (reachedHundred && !hasStartedTimerRef.current) {
      hasStartedTimerRef.current = true;
      setMaxProgressSeen(100);

      buttonTimerRef.current = setTimeout(() => {
        setShowEnterButton(true);
      }, 1200);
    }

    return () => {
      if (buttonTimerRef.current && !hasStartedTimerRef.current) {
        clearTimeout(buttonTimerRef.current);
      }
    };
  }, [active, progress, maxProgressSeen]);

  const handleEnter = () => {
    if (isHiding) return;
    setIsHiding(true);
    onEnterClick?.();

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      onLoaded?.();
    }, 600);
  };

  const displayProgress = Math.max(maxProgressSeen, progress);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500 ease-out"
      style={{ opacity: isHiding ? 0 : 1, transitionDuration: "600ms" }}
    >
      <div className="flex flex-col items-center gap-4">
        {!showEnterButton ? (
          <>
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20"></div>
              <div
                className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary"
                style={{
                  animationDuration: "1s",
                }}
              ></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-foreground">Hold on, give me a second...</p>
              <div className="h-2 w-48 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(displayProgress)}%</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
            <p className="text-lg font-medium text-foreground">Ready to explore?</p>
            <Button
              onClick={handleEnter}
              className="px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 cursor-pointer"
              style={{
                animation: "pop-in 0.5s ease-out",
              }}
            >
              Enter
            </Button>
          </div>
        )}
      </div>

      {/* Tip at bottom center */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-500 delay-300" style={{ fontFamily: "var(--font-mono)", animation: "float 3s ease-in-out infinite" }}>
        <Lightbulb className="h-4 w-4 text-primary" />
        <span>Tip: Click and drag to explore!</span>
      </div>
    </div>
  );
}

