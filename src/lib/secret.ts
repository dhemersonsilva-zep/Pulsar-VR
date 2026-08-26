/**
 * Hash e verificação de códigos secretos (ex.: chave de edição de squad).
 * Mesmo padrão do `authenticateCronRequest` em
 * `src/integrations/supabase/cron-auth.ts`: sha256 + comparação em tempo
 * constante, nunca guardamos o texto puro.
 */

function normalize(value: string) {
  return value.trim().toUpperCase();
}

export async function hashSecret(value: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(normalize(value), "utf8").digest("hex");
}

export async function verifySecret(provided: string, hash: string): Promise<boolean> {
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  const providedDigest = digest(normalize(provided));
  const expectedDigest = Buffer.from(hash, "hex");
  if (providedDigest.length !== expectedDigest.length) return false;
  return timingSafeEqual(providedDigest, expectedDigest);
}

const EDIT_KEY_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Gera um código amigável tipo `XXXX-XXXX-XXXX`, sem caracteres ambíguos (0/O, 1/I). */
export async function generateEditKey(): Promise<string> {
  const { randomBytes } = await import("node:crypto");
  const bytes = randomBytes(12);
  let raw = "";
  for (const byte of bytes) raw += EDIT_KEY_ALPHABET[byte % EDIT_KEY_ALPHABET.length];
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}
