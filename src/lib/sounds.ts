/**
 * Sound effects manager using Howler.js
 * Used in: Various components for UI feedback sounds
 */
import { Howl, Howler } from "howler";

let soundsInitialized = false;
let sounds: {
  pop: Howl;
  click: Howl;
  whoosh: Howl;
  wind: Howl;
} | null = null;

function initSounds() {
  if (soundsInitialized) return;
  soundsInitialized = true;

  sounds = {
    pop: new Howl({ src: ["/sounds/pop.mp3"], volume: 0.1 }),
    click: new Howl({ src: ["/sounds/click.mp3"], volume: 1 }),
    whoosh: new Howl({ src: ["/sounds/whoosh.mp3"], volume: 0.6 }),
    wind: new Howl({ src: ["/sounds/wind.mp3"], volume: 0.8, loop: true }),
  };
}

let isMuted = false; // Start unmuted by default
let hasEnteredScene = false; // Track if user has entered the scene

export function playSound(name: "pop" | "click" | "whoosh") {
  if (typeof window === "undefined") return;
  initSounds();
  if (!isMuted && sounds) {
    sounds[name].play();
  }
}

export function startAmbient() {
  if (typeof window === "undefined") return;
  initSounds();
  hasEnteredScene = true;
  if (!isMuted && sounds && !sounds.wind.playing()) {
    sounds.wind.play();
  }
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  initSounds();
  isMuted = muted;
  Howler.mute(muted);
  if (muted && sounds) {
    sounds.wind.stop();
  } else if (!muted && hasEnteredScene && sounds && !sounds.wind.playing()) {
    // Resume ambient wind if user has entered the scene and unmutes
    sounds.wind.play();
  }
}

export function getMuted() {
  return isMuted;
}
