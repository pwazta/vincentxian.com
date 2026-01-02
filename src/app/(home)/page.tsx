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
import { CodingContent } from "~/features/home/components/CodingContent";
import { ArtsContent } from "~/features/home/components/ArtsContent";
import { AboutContent } from "~/features/home/components/AboutContent";
import { ContactContent } from "~/features/home/components/ContactContent";

export default function Home() {
  const [codingOpen, setCodingOpen] = React.useState(false);
  const [artsOpen, setArtsOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="relative h-screen w-screen overflow-hidden bg-background">
        <Navbar
          onCodingClick={() => setCodingOpen(true)}
          onArtsClick={() => setArtsOpen(true)}
          onAboutClick={() => setAboutOpen(true)}
          onContactClick={() => setContactOpen(true)}
        />
        <div className="h-full w-full pt-16">
          <PortfolioScene
            onCodingClick={() => setCodingOpen(true)}
            onArtsClick={() => setArtsOpen(true)}
            onAboutClick={() => setAboutOpen(true)}
            onContactClick={() => setContactOpen(true)}
          />
        </div>

        <ModalFrame
          open={codingOpen}
          onOpenChange={setCodingOpen}
          title="Coding"
        >
          <CodingContent />
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
    </Suspense>
  );
}
