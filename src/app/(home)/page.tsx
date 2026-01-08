/**
 * Home Page - 3D Portfolio Entry Point
 * Used in: Next.js routing
 */
"use client";

import * as React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "~/features/shared/components/LoadingSpinner";
import { Navbar } from "~/features/home/components/Navbar";
import { PortfolioScene } from "~/features/home/components/PortfolioScene";
import { ModalFrame } from "~/features/shared/components/ModalFrame";
import { SoftwareContent } from "~/features/home/components/SoftwareContent";
import { ArtsContent } from "~/features/home/components/ArtsContent";
import { AboutContent } from "~/features/home/components/AboutContent";
import { ContactContent } from "~/features/home/components/ContactContent";

export default function Home() {
  const [softwareOpen, setSoftwareOpen] = React.useState(false);
  const [artsOpen, setArtsOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Navbar
        onSoftwareClick={() => setSoftwareOpen(true)}
        onArtsClick={() => setArtsOpen(true)}
        onAboutClick={() => setAboutOpen(true)}
        onContactClick={() => setContactOpen(true)}
      />
      <div className="h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <PortfolioScene
            showGrid={true}
            onSoftwareClick={() => setSoftwareOpen(true)}
            onArtsClick={() => setArtsOpen(true)}
            onAboutClick={() => setAboutOpen(true)}
            onContactClick={() => setContactOpen(true)}
          />
        </Suspense>
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
        >
          <ContactContent />
        </ModalFrame>
      </div>
  );
}
