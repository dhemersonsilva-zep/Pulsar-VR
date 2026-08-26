import type { ReactNode } from "react";
import { Reveal } from "@/components/site/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  accent = "cyan",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  accent?: "cyan" | "purple" | "pink" | "orange" | "green";
}) {
  const accentClass = {
    cyan: "text-neon-cyan",
    purple: "text-neon-purple",
    pink: "text-neon-pink",
    orange: "text-neon-orange",
    green: "text-neon-green",
  }[accent];

  return (
    <Reveal className={`mb-12 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <span className={`mb-3 block font-mono text-xs uppercase tracking-[0.3em] ${accentClass}`}>
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}
