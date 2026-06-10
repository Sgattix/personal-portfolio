import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import fs from "fs";
import { ImageZoom } from "../kibo-ui/image-zoom";

function ProjectCarousel({ id }: { id: string }) {
  // Read images synchronously from public folder. Guard against missing folder.
  let images: string[] = [];
  try {
    images = fs
      .readdirSync(`public/assets/images/${id}`)
      .map((img) => `/assets/images/${id}/${img}`);
  } catch {
    // no images found — leave images empty and UI will render fallback
    console.warn(`No images found for project ${id}`);
    images = [];
  }

  return (
    <Carousel className="rounded-lg flex items-center justify-center gap-5 max-h-96">
      <CarouselPrevious aria-label="Previous" variant={"ghost"} />
      <CarouselContent>
        {images.length > 0 ? (
          images.map((src, index) => (
            <CarouselItem key={index}>
              <div
                className={`aspect-video w-full flex items-center justify-center 
                  ${images.length > 1 ? "p-4" : ""} 
                  ${images.length === 1 ? "h-full" : ""}
                  // Add a grid background so that smaller images are easier to see
                  bg-gradient-to-br from-blue-700/30 to-neutral-800/50
                  rounded-md overflow-hidden
                `}
              >
                <ImageZoom>
                  <Image
                    src={src}
                    alt={`${id} image ${index + 1}`}
                    width={5000}
                    height={5000}
                    className="w-auto h-full object-scale-down"
                    priority={index === 0}
                  />
                </ImageZoom>
              </div>
            </CarouselItem>
          ))
        ) : (
          <CarouselItem className="relative h-64 flex items-center justify-center bg-muted/20 rounded-md">
            <div className="text-center text-sm text-muted-foreground">
              No images available
            </div>
          </CarouselItem>
        )}
      </CarouselContent>
      <CarouselNext aria-label="Next" variant={"ghost"} />
    </Carousel>
  );
}

export default ProjectCarousel;
