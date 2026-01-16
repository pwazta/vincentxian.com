/**
 * Sound toggle button component for muting/unmuting audio
 * Used in: Navbar
 */
"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { getMuted, setMuted, playSound } from "~/lib/sounds";

export function SoundToggle() {
  const [muted, setMutedState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMutedState(getMuted());
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const handleToggle = () => {
    const newMuted = !muted;
    setMutedState(newMuted);
    setMuted(newMuted);

    // Play click sound when unmuting (setMuted handles ambient resume)
    if (!newMuted) {
      playSound("click");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="hover:bg-accent/10 cursor-pointer"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
}
