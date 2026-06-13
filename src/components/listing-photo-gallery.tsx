"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { photoUrl } from "@/lib/format";

type GalleryPhoto = {
  id: string;
  path: string;
};

export function ListingPhotoGallery({
  photos,
  title,
  labels,
}: {
  photos: GalleryPhoto[];
  title: string;
  labels: {
    open: string;
    close: string;
    previous: string;
    next: string;
    image: string;
  };
}) {
  const galleryPhotos = useMemo(
    () => (photos.length ? photos : [{ id: "fallback", path: "/seed/marketplace-cars.png" }]),
    [photos],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const selectedPhoto = galleryPhotos[selectedIndex] ?? galleryPhotos[0];
  const fullscreenPhoto = fullscreenIndex !== null ? galleryPhotos[fullscreenIndex] : null;

  const wrappedIndex = useCallback((index: number) => {
    return (index + galleryPhotos.length) % galleryPhotos.length;
  }, [galleryPhotos.length]);

  function openFullscreen(index: number) {
    setSelectedIndex(wrappedIndex(index));
    setFullscreenIndex(wrappedIndex(index));
  }

  const closeFullscreen = useCallback(() => {
    setFullscreenIndex(null);
  }, []);

  const moveFullscreen = useCallback((direction: 1 | -1) => {
    setFullscreenIndex((current) => {
      const nextIndex = wrappedIndex((current ?? selectedIndex) + direction);
      setSelectedIndex(nextIndex);
      return nextIndex;
    });
  }, [selectedIndex, wrappedIndex]);

  function moveSelected(direction: 1 | -1) {
    setSelectedIndex((current) => wrappedIndex(current + direction));
  }

  useEffect(() => {
    if (fullscreenIndex === null) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeFullscreen();
      }
      if (event.key === "ArrowLeft") {
        moveFullscreen(-1);
      }
      if (event.key === "ArrowRight") {
        moveFullscreen(1);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeFullscreen, fullscreenIndex, moveFullscreen]);

  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="group relative block w-full bg-white/35">
        <Image
          src={photoUrl(selectedPhoto.path)}
          alt={title}
          width={1400}
          height={875}
          priority
          className="aspect-[16/10] w-full object-cover"
        />
        {galleryPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => moveSelected(-1)}
              aria-label={labels.previous}
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/60 text-slate-950 shadow-sm backdrop-blur transition hover:bg-white/85"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => moveSelected(1)}
              aria-label={labels.next}
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/60 text-slate-950 shadow-sm backdrop-blur transition hover:bg-white/85"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => openFullscreen(selectedIndex)}
          className="absolute bottom-3 right-3 inline-flex h-10 items-center gap-2 rounded-full bg-slate-950/75 px-3 text-sm font-black text-white shadow-sm backdrop-blur transition hover:bg-cyan-800/85"
          aria-label={`${labels.open}: ${title}`}
        >
          <Expand className="h-4 w-4" aria-hidden="true" />
          {selectedIndex + 1} / {galleryPhotos.length}
        </button>
      </div>

      {galleryPhotos.length > 1 && (
        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-5 lg:grid-cols-7">
          {galleryPhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`${labels.image} ${index + 1}`}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border bg-white/35 transition ${
                index === selectedIndex
                  ? "border-cyan-700 ring-2 ring-cyan-200"
                  : "border-white/70 hover:border-cyan-300"
              }`}
            >
              <Image
                src={photoUrl(photo.path)}
                alt=""
                fill
                sizes="(min-width: 1024px) 120px, (min-width: 640px) 20vw, 33vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-50 grid bg-slate-950/90 p-3 text-white backdrop-blur-md sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={`${labels.open}: ${title}`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-black">
              {title} · {(fullscreenIndex ?? 0) + 1} / {galleryPhotos.length}
            </p>
            <button
              type="button"
              onClick={closeFullscreen}
              aria-label={labels.close}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative min-h-0">
            <Image
              src={photoUrl(fullscreenPhoto.path)}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />

            {galleryPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => moveFullscreen(-1)}
                  aria-label={labels.previous}
                  className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-sm backdrop-blur transition hover:bg-cyan-700 sm:left-4"
                >
                  <ChevronLeft className="h-7 w-7" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFullscreen(1)}
                  aria-label={labels.next}
                  className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-sm backdrop-blur transition hover:bg-cyan-700 sm:right-4"
                >
                  <ChevronRight className="h-7 w-7" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
