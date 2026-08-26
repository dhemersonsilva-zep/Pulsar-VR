import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // limite do arquivo original, antes de comprimir

async function comprimirImagem(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function BannerUpload({
  value,
  onChange,
  label = "Banner",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  async function handleFile(file: File | undefined) {
    setErro(null);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErro("Use uma imagem JPEG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErro("Imagem muito grande (máximo 8MB).");
      return;
    }
    setProcessando(true);
    try {
      const dataUrl = await comprimirImagem(file);
      onChange(dataUrl);
    } catch {
      setErro("Não foi possível processar essa imagem. Tente outra.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div>
      <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>

      {value ? (
        <div className="relative aspect-video w-full overflow-hidden border border-border">
          <img src={value} alt="Prévia do banner" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Remover banner"
            className="absolute right-2 top-2 flex size-8 items-center justify-center bg-black/60 text-white transition-colors hover:bg-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processando}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-border text-muted-foreground transition-colors hover:border-neon-cyan hover:text-neon-cyan disabled:opacity-50"
        >
          <ImagePlus className="size-6" />
          <span className="text-xs">
            {processando ? "Processando…" : "Escolher imagem (opcional)"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
    </div>
  );
}
