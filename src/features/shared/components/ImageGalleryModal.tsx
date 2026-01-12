/**
 * Full-screen image gallery modal with navigation
 * Used in: ProjectCard component for viewing project images
 */
"use client";

import * as React from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogTitle, DialogDescription } from "~/features/shared/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";
import { useIsMobile } from "~/features/shared/hooks/use-mobile";

export interface ImageGalleryImage {
  src: string | StaticImageData;
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
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const goToPrevious = React.useCallback(() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)), [images.length]);
  const goToNext = React.useCallback(() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)), [images.length]);

  React.useEffect(() => {
    if (isOpen) setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [initialIndex, isOpen, images.length]);

  // Preload adjacent images for faster navigation
  React.useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const preloadImage = (index: number) => {
      const img = images[index];
      if (!img) return;
      const imageSrc = typeof img.src === "string" ? img.src : img.src.src;
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = imageSrc;
      document.head.appendChild(preloadLink);
    };

    // Preload next and previous images
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;

    preloadImage(nextIndex);
    preloadImage(prevIndex);
  }, [currentIndex, isOpen, images]);

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
            "fixed left-[50%] top-[50%] z-[100]",
            "max-w-[95vw] max-h-[95vh]",
            "border border-[var(--foreground)] bg-background shadow-xl p-0 flex flex-col",
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
          <div className="bg-primary text-white px-2 md:px-3 flex items-center justify-between relative h-10 md:h-12 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1 md:gap-2 text-white hover:opacity-80 transition-opacity min-w-0 flex-shrink-0"
              aria-label="Back to projects"
            >
              <ArrowLeft className="size-4 md:size-5 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium truncate">Back to projects</span>
            </button>
            {projectTitle && (
              <h2 className="text-sm md:text-lg font-semibold text-white absolute left-1/2 -translate-x-1/2 max-w-[40%] truncate hidden md:block">
                {projectTitle}
              </h2>
            )}
            <DialogPrimitive.Close className="opacity-90 hover:opacity-100 transition-opacity focus:outline-none disabled:pointer-events-none cursor-pointer flex-shrink-0">
              <Image src="/close-box.svg" alt="Close" width={28} height={28} className="h-6 w-6 md:h-8 md:w-8 brightness-0 invert" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Main image container - 16:9 aspect ratio, fills to max viewport space */}
          <div className="flex items-stretch relative bg-background" style={{ aspectRatio: '16/9', width: 'min(95vw, calc((95vh - 4.5rem) * 16 / 9))', height: 'min(95vh - 4.5rem, calc(95vw * 9 / 16))' }}>
            {/* Left column: Clickable previous area */}
            {images.length > 1 && !isMobile && (
              <button onClick={goToPrevious} className="flex items-center justify-center w-12 flex-shrink-0 border-r border-accent/20 bg-background hover:bg-muted transition-colors cursor-pointer" aria-label="Previous image">
                <ChevronLeft className="size-6" style={{ color: "var(--primary)" }} />
              </button>
            )}

            {/* Center: Image + Dots with padding wrapper */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-w-0 px-2">
              <div className="relative w-full flex-1 flex items-center justify-center">
                <Image
                  src={currentImage.src}
                  alt={currentImage.alt}
                  fill
                  className="object-contain"
                  priority
                  quality={100}
                  sizes="95vw"
                  placeholder={typeof currentImage.src !== "string" ? "blur" : undefined}
                />
              </div>

              {/* Dots indicator - no top padding, only bottom padding */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 md:gap-3 pb-2 flex-shrink-0">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn("h-2.5 w-2.5 md:h-2 md:w-2 rounded-full transition-all cursor-pointer", index === currentIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")}
                      style={index === currentIndex ? { backgroundColor: "var(--primary)" } : undefined}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right column: Clickable next area */}
            {images.length > 1 && !isMobile && (
              <button onClick={goToNext} className="flex items-center justify-center w-12 flex-shrink-0 border-l border-accent/20 bg-background hover:bg-muted transition-colors cursor-pointer" aria-label="Next image">
                <ChevronRight className="size-6" style={{ color: "var(--primary)" }} />
              </button>
            )}
          </div>

          {/* Footer with caption */}
          <div className="min-h-[36px] md:h-[42px] px-3 md:px-6 py-2 md:py-0 flex items-center justify-center border-t border-accent/20 bg-background flex-shrink-0">
            {currentImage.caption && (
              <p className="text-xs md:text-sm text-foreground/90 text-center line-clamp-2 md:truncate w-full">
                {currentImage.caption}
              </p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

