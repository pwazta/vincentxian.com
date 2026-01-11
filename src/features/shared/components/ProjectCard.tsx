/**
 * Reusable project card component with image, title, description, tech stack, and links
 * Used in: SoftwareContent and other portfolio sections
 */
import * as React from "react";
import Image from "next/image";
import { Badge } from "~/features/shared/components/ui/badge";
import { ExternalLink, ZoomIn, ImageOff } from "lucide-react";
import { cn } from "~/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots, type CarouselApi } from "~/features/shared/components/ui/carousel";
import { ImageGalleryModal, type ImageGalleryImage } from "~/features/shared/components/ImageGalleryModal";

export interface ProjectCardProps {
  title: string;
  description: string;
  images: ImageGalleryImage[];
  technologies: string[];
  links?: Array<{
    url: string;
    label: string;
  }>;
  className?: string;
}

export function ProjectCard({title, description, images, technologies, links = [], className}: ProjectCardProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <>
      <div
        className={cn(
          "flex gap-4 p-4 rounded transition-colors hover:bg-muted",
          className
        )}
      >
        {/* Left: Image Carousel or Placeholder */}
        <div className="flex-shrink-0 flex flex-col gap-2">
          {images.length > 0 ? (
            <Carousel setApi={setApi} className="w-[300px]">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div
                      className="relative cursor-pointer group rounded overflow-hidden"
                      onClick={() => setIsGalleryOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsGalleryOpen(true);
                        }
                      }}
                      aria-label="View image gallery"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={300}
                        height={169}
                        quality={100}
                        className="object-cover transition-all group-hover:blur-xs"
                        style={{ width: "300px", height: "169px" }}
                      />
                      {/* Hover overlay with magnify icon */}
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="size-8" style={{ color: "var(--primary)" }} />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselDots count={images.length} currentIndex={current} onDotClick={(index) => api?.scrollTo(index)} />
                  <CarouselNext className="static translate-y-0" />
                </div>
              )}
            </Carousel>
          ) : (
            <div className="w-[300px] h-[169px] rounded bg-muted/50 flex items-center justify-center">
              <ImageOff className="size-12 text-muted-foreground/40" />
            </div>
          )}
        </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        <p className="text-foreground/90 text-sm mb-3 flex-1">{description}</p>
        <div className="flex items-center justify-between gap-4 mt-auto">
          
          {/* Tech stack badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {technologies.map((tech) => (
              <Badge key={tech} className="text-xs">{tech}</Badge>
            ))}
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 transition-opacity"
                  aria-label={link.label}
                >
                  <ExternalLink className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <ImageGalleryModal images={images} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} initialIndex={current} projectTitle={title} />
    </>
  );
}

