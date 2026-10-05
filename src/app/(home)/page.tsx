/**
 * Home Page - 3D Portfolio Entry Point
 * Used in: Next.js routing
 */
"use client";

import * as React from "react";
import { Navbar } from "~/features/home/components/Navbar";
import { PortfolioScene } from "~/features/home/components/PortfolioScene";
import { ModalFrame } from "~/features/shared/components/ModalFrame";
import { playSound } from "~/lib/sounds";
import { SoftwareContent } from "~/app/(home)/_components/SoftwareContent";
import { ArtsContent } from "~/app/(home)/_components/ArtsContent";
import { AboutContent } from "~/app/(home)/_components/AboutContent";
import { ContactContent } from "~/app/(home)/_components/ContactContent";

export default function Home() {
  const [softwareOpen, setSoftwareOpen] = React.useState(false);
  const [artsOpen, setArtsOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [sceneReady, setSceneReady] = React.useState(false);
  const [userInteracted, setUserInteracted] = React.useState(false);

  const isAnyDialogOpen = softwareOpen || artsOpen || aboutOpen || contactOpen;

  const sceneReadyRef = React.useRef(false);
  const pendingSectionRef = React.useRef<string | null>(null);

  // Show exactly the hash's section ("" closes all)
  const openSection = React.useCallback((slug: string) => {
    setSoftwareOpen(slug === "software");
    setArtsOpen(slug === "arts");
    setAboutOpen(slug === "about");
    setContactOpen(slug === "contact");
  }, []);

  // Sync modals from hash; defer until entered so none opens over the loader. hashchange handles live edits
  React.useEffect(() => {
    const syncFromHash = () => {
      const slug = window.location.hash.slice(1);
      if (sceneReadyRef.current) openSection(slug);
      else if (slug) pendingSectionRef.current = slug;
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [openSection]);

  // Mirror open modal to hash, post-entry only so the deep link survives load (replaceState = no reload)
  React.useEffect(() => {
    if (!sceneReady) return;
    const active = softwareOpen ? "#software" : artsOpen ? "#arts" : aboutOpen ? "#about" : contactOpen ? "#contact" : "";
    if (active === window.location.hash) return;
    window.history.replaceState(null, "", active || window.location.pathname + window.location.search);
  }, [sceneReady, softwareOpen, artsOpen, aboutOpen, contactOpen]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Navbar
        onSoftwareClick={() => { playSound("click"); setSoftwareOpen(true); }}
        onArtsClick={() => { playSound("click"); setArtsOpen(true); }}
        onAboutClick={() => { playSound("click"); setAboutOpen(true); }}
        onContactClick={() => { playSound("click"); setContactOpen(true); }}
        sceneReady={sceneReady}
        userInteracted={userInteracted}
      />
      <div className="h-full w-full">
        <PortfolioScene
          onSoftwareClick={() => setSoftwareOpen(true)}
          onArtsClick={() => setArtsOpen(true)}
          onAboutClick={() => setAboutOpen(true)}
          onContactClick={() => setContactOpen(true)}
          isDialogOpen={isAnyDialogOpen}
          onReady={() => {
            sceneReadyRef.current = true;
            setSceneReady(true);
            if (pendingSectionRef.current) {
              openSection(pendingSectionRef.current);
              pendingSectionRef.current = null;
            }
          }}
          onUserInteract={() => setUserInteracted(true)}
        />
      </div>

        <ModalFrame
          open={softwareOpen}
          onOpenChange={setSoftwareOpen}
          title="Software"
        >
          <SoftwareContent />
        </ModalFrame>

        <ModalFrame open={artsOpen} onOpenChange={setArtsOpen} title="Arts">
          <ArtsContent />
        </ModalFrame>

        <ModalFrame
          open={aboutOpen}
          onOpenChange={setAboutOpen}
          title="About"
        >
          <AboutContent />
        </ModalFrame>

        <ModalFrame
          open={contactOpen}
          onOpenChange={setContactOpen}
          title="Contact"
          className="max-w-[680px]"
        >
          <ContactContent />
        </ModalFrame>
      </div>
  );
}
