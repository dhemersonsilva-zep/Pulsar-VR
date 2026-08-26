import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type GalleryImage = { src: string; alt: string };

/**
 * Lightbox acessível (foco preso, ESC fecha via Radix Dialog) com navegação
 * por teclado (setas) e clique. `activeIndex === null` mantém fechado.
 */
export function Lightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = activeIndex !== null;
  const current = activeIndex !== null ? images[activeIndex] : null;

  useEffect(() => {
    if (!open || activeIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") onNavigate((activeIndex! + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((activeIndex! - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, activeIndex, images.length, onNavigate]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl border-border bg-background/95 p-0 sm:rounded-none">
        <DialogTitle className="sr-only">{current?.alt ?? "Imagem da galeria"}</DialogTitle>
        {current && (
          <div className="relative">
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-[80vh] w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={() => onNavigate((activeIndex! - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-neon-cyan hover:text-primary-foreground"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={() => onNavigate((activeIndex! + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-neon-cyan hover:text-primary-foreground"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
