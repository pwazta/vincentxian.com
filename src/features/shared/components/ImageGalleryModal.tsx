/**
 * Full-screen image gallery modal with navigation
 * Used in: ProjectCard component for viewing project images
 */
"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogTitle, DialogDescription } from "~/features/shared/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";

export interface ImageGalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ImageGalleryModalProps {
  images: ImageGalleryImage[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  projectTitle?: string;
}

export function ImageGalleryModal({images, isOpen, onClose, initialIndex = 0, projectTitle}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const goToPrevious = React.useCallback(() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)), [images.length]);
  const goToNext = React.useCallback(() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)), [images.length]);

  React.useEffect(() => {
    if (isOpen) setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [initialIndex, isOpen, images.length]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  if (images.length === 0) return null;
  
  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[100] min-w-[820px] w-[90%] max-w-[1300px] h-[750px] border border-[var(--foreground)] bg-background shadow-xl p-0 flex flex-col",
            "-translate-x-1/2 -translate-y-1/2",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
          onPointerDownOutside={(e) => {
            if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='button']")) {
              e.preventDefault();
            }
          }}
        >
          <DialogTitle className="sr-only">{projectTitle ?? "Image Gallery"} - Image {currentIndex + 1} of {images.length}</DialogTitle>
          <DialogDescription className="sr-only">{currentImage.caption ?? currentImage.alt}</DialogDescription>
          <div className="bg-primary text-white px-3 flex items-center justify-between relative h-12">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
              aria-label="Back to projects"
            >
              <ArrowLeft className="size-5" />
              <span className="text-sm font-medium">Back to projects</span>
            </button>
            {projectTitle && (
              <h2 className="text-lg font-semibold text-white">
                {projectTitle}
              </h2>
            )}
            <DialogPrimitive.Close className="opacity-90 hover:opacity-100 transition-opacity focus:outline-none disabled:pointer-events-none cursor-pointer">
              <Image src="/close-box.svg" alt="Close" width={32} height={32} className="h-8 w-8 brightness-0 invert" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Main image container */}
          <div className="flex-1 flex items-stretch relative bg-background">
            {/* Left column: Clickable previous area */}
            {images.length > 1 && (
              <button onClick={goToPrevious} className="flex items-center justify-center px-4 border-r border-accent/20 hover:bg-muted transition-colors cursor-pointer" aria-label="Previous image">
                <ChevronLeft className="size-6" style={{ color: "var(--primary)" }} />
              </button>
            )}
            <div className="flex-1 flex flex-col items-center justify-center relative p-2">
              <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                <Image src={currentImage.src} alt={currentImage.alt} fill className="object-contain" priority quality={100} sizes="(max-width: 1500px) 100vw, 1500px" />
              </div>
              
              {/* Dots indicator - centered below image */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-4 mb-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn("h-2 w-2 rounded-full transition-all cursor-pointer", index === currentIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")}
                      style={index === currentIndex ? { backgroundColor: "var(--primary)" } : undefined}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right column: Clickable next area */}
            {images.length > 1 && (
              <button onClick={goToNext} className="flex items-center justify-center px-4 border-l border-accent/20 hover:bg-muted transition-colors cursor-pointer" aria-label="Next image">
                <ChevronRight className="size-6" style={{ color: "var(--primary)" }} />
              </button>
            )}
          </div>

          {/* Footer with caption */}
          <div className="h-[42px] px-6 flex items-center justify-center border-t border-accent/20 bg-background">
            {currentImage.caption && <p className="text-sm text-foreground/90 text-center truncate w-full">{currentImage.caption}</p>}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

