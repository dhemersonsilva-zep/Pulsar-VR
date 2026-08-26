import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/pulsar-data";

export function WhatsappFab() {
  return (
    <a
      href={whatsappLink("Olá! Vi o site da Pulsar VR e queria saber mais.")}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-6 right-6 z-50"
      aria-label="Falar no WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp opacity-25 blur-xl transition-opacity group-hover:opacity-50" />
      <span className="relative flex items-center gap-3 rounded-full bg-whatsapp py-4 pl-4 pr-4 text-background shadow-2xl transition-transform hover:scale-105 sm:pr-6">
        <MessageCircle className="size-6" />
        <span className="hidden text-sm font-bold tracking-tight sm:inline">
          Dúvidas? Chame agora!
        </span>
      </span>
    </a>
  );
}
