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

const ABOUT_TABS = new Set(["about", "experience", "activities"]);

export default function Home() {
  const [softwareOpen, setSoftwareOpen] = React.useState(false);
  const [artsOpen, setArtsOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [sceneReady, setSceneReady] = React.useState(false);
  const [userInteracted, setUserInteracted] = React.useState(false);
  const [aboutTab, setAboutTab] = React.useState("about");

  const isAnyDialogOpen = softwareOpen || artsOpen || aboutOpen || contactOpen;

  const sceneReadyRef = React.useRef(false);
  const pendingHashRef = React.useRef<string | null>(null);

  // Apply a hash like "about/experience" to the modal + sub-tab state ("" closes all)
  const applyHash = React.useCallback((raw: string) => {
    const [section, sub] = raw.split("/");
    setSoftwareOpen(section === "software");
    setArtsOpen(section === "arts");
    setAboutOpen(section === "about");
    setContactOpen(section === "contact");
    if (section === "about") setAboutTab(sub && ABOUT_TABS.has(sub) ? sub : "about");
  }, []);

  // Sync modals from hash; defer until entered so none opens over the loader. hashchange handles live edits
  React.useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.slice(1);
      if (sceneReadyRef.current) applyHash(raw);
      else if (raw) pendingHashRef.current = raw;
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [applyHash]);

  // Mirror open modal to hash, post-entry only so the deep link survives load (replaceState = no reload)
  React.useEffect(() => {
    if (!sceneReady) return;
    const active = softwareOpen ? "#software"
      : artsOpen ? "#arts"
      : aboutOpen ? (aboutTab === "about" ? "#about" : `#about/${aboutTab}`)
      : contactOpen ? "#contact"
      : "";
    if (active === window.location.hash) return;
    window.history.replaceState(null, "", active || window.location.pathname + window.location.search);
  }, [sceneReady, softwareOpen, artsOpen, aboutOpen, contactOpen, aboutTab]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Navbar
        onSoftwareClick={() => { playSound("click"); setSoftwareOpen(true); }}
        onArtsClick={() => { playSound("click"); setArtsOpen(true); }}
        onAboutClick={() => { playSound("click"); setAboutTab("about"); setAboutOpen(true); }}
        onContactClick={() => { playSound("click"); setContactOpen(true); }}
        sceneReady={sceneReady}
        userInteracted={userInteracted}
      />
      <div className="h-full w-full">
        <PortfolioScene
          onSoftwareClick={() => setSoftwareOpen(true)}
          onArtsClick={() => setArtsOpen(true)}
          onAboutClick={() => { setAboutTab("about"); setAboutOpen(true); }}
          onContactClick={() => setContactOpen(true)}
          isDialogOpen={isAnyDialogOpen}
          onReady={() => {
            sceneReadyRef.current = true;
            setSceneReady(true);
            if (pendingHashRef.current) {
              applyHash(pendingHashRef.current);
              pendingHashRef.current = null;
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
          <AboutContent activeTab={aboutTab} onTabChange={setAboutTab} />
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
