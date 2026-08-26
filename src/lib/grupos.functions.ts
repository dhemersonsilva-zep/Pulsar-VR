import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateEditKey, hashSecret, verifySecret } from "@/lib/secret";
import type { TablesUpdate } from "@/integrations/supabase/types";

type SupabaseAdmin = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

const TIPO = z.enum(["squad", "imperio"]);
const MAX_BANNER_BASE64_CHARS = 4_500_000; // ~3MB binário em base64

function slugify(nome: string) {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 40);
  return base || "grupo";
}

async function randomSuffix() {
  const { randomBytes } = await import("node:crypto");
  return randomBytes(3).toString("hex");
}

function decodeBannerDataUrl(dataUrl: string) {
  const match = /^data:(image\/(jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, , base64] = match;
  const buffer = Buffer.from(base64!, "base64");
  if (buffer.byteLength > 3 * 1024 * 1024) return null;
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
  return { mime: mime!, ext, buffer };
}

function bannerUrl(admin: SupabaseAdmin, path: string | null) {
  if (!path) return null;
  return admin.storage.from("banners").getPublicUrl(path).data.publicUrl;
}

const criarGrupoSchema = z.object({
  tipo: TIPO,
  nome: z.string().trim().min(2).max(40),
  tamanho: z.number().int().min(1).max(8),
  telefone: z.string().min(8).max(25),
  bannerBase64: z.string().max(MAX_BANNER_BASE64_CHARS).optional(),
});

/** Cria um squad ou império. Retorna o código de edição UMA vez só — não é recuperável depois. */
export const criarGrupo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => criarGrupoSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const editKey = await generateEditKey();
    const editKeyHash = await hashSecret(editKey);
    const tamanho = data.tipo === "imperio" ? 1 : data.tamanho;

    let grupo: { id: string; slug: string } | null = null;
    let lastError: unknown = null;
    for (let tentativa = 0; tentativa < 3 && !grupo; tentativa++) {
      const slug = `${slugify(data.nome)}-${await randomSuffix()}`;
      const { data: inserted, error } = await supabaseAdmin
        .from("grupos")
        .insert({
          tipo: data.tipo,
          nome: data.nome,
          slug,
          tamanho,
          telefone_criador: data.telefone,
          edit_key_hash: editKeyHash,
        })
        .select("id, slug")
        .single();
      if (error) {
        lastError = error;
        continue;
      }
      grupo = inserted;
    }

    if (!grupo) {
      console.error("Erro ao criar grupo", lastError);
      throw new Error("Não foi possível criar agora. Tente novamente.");
    }

    if (data.bannerBase64) {
      const decoded = decodeBannerDataUrl(data.bannerBase64);
      if (decoded) {
        const path = `${data.tipo}/${grupo.id}.${decoded.ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("banners")
          .upload(path, decoded.buffer, { contentType: decoded.mime, upsert: true });
        if (uploadError) {
          console.error("Erro ao subir banner", uploadError);
        } else {
          await supabaseAdmin.from("grupos").update({ banner_path: path }).eq("id", grupo.id);
        }
      }
    }

    return { slug: grupo.slug, editKey };
  });

const slugSchema = z.object({ tipo: TIPO, slug: z.string().min(1).max(90) });

/** Perfil público — nunca retorna o hash da chave de edição nem o telefone. */
export const buscarGrupoPorSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => slugSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: grupo, error } = await supabaseAdmin
      .from("grupos")
      .select(
        "id, tipo, nome, slug, tamanho, banner_path, total_minutos_jogados, jogos_realizados, created_at",
      )
      .eq("tipo", data.tipo)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error || !grupo) return null;

    const { count } = await supabaseAdmin
      .from("grupos")
      .select("id", { count: "exact", head: true })
      .eq("tipo", data.tipo)
      .gt("total_minutos_jogados", grupo.total_minutos_jogados);

    const { banner_path, ...publico } = grupo;
    return {
      ...publico,
      bannerUrl: bannerUrl(supabaseAdmin, banner_path),
      posicao: (count ?? 0) + 1,
    };
  });

const atualizarGrupoSchema = z.object({
  tipo: TIPO,
  slug: z.string().min(1).max(90),
  editKey: z.string().min(4).max(30),
  nome: z.string().trim().min(2).max(40).optional(),
  bannerBase64: z.string().max(MAX_BANNER_BASE64_CHARS).optional(),
});

/** Atualiza nome/banner — exige o código de edição mostrado na criação. */
export const atualizarGrupo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => atualizarGrupoSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: grupo, error } = await supabaseAdmin
      .from("grupos")
      .select("id, edit_key_hash")
      .eq("tipo", data.tipo)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error || !grupo) throw new Error("Não encontramos esse squad/império.");

    const valido = await verifySecret(data.editKey, grupo.edit_key_hash);
    if (!valido) throw new Error("Código de edição inválido.");

    const updates: TablesUpdate<"grupos"> = {};
    if (data.nome) updates.nome = data.nome;

    if (data.bannerBase64) {
      const decoded = decodeBannerDataUrl(data.bannerBase64);
      if (decoded) {
        const path = `${data.tipo}/${grupo.id}.${decoded.ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("banners")
          .upload(path, decoded.buffer, { contentType: decoded.mime, upsert: true });
        if (uploadError) console.error("Erro ao subir banner", uploadError);
        else updates.banner_path = path;
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from("grupos").update(updates).eq("id", grupo.id);
    }

    return { ok: true };
  });

const rankingSchema = z.object({
  tipo: TIPO,
  limit: z.number().int().min(1).max(50).optional().default(10),
});

/** Top N por horas jogadas reais (só reservas pagas contam). */
export const listarRanking = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => rankingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: grupos, error } = await supabaseAdmin
      .from("grupos")
      .select("slug, nome, tamanho, banner_path, total_minutos_jogados, jogos_realizados")
      .eq("tipo", data.tipo)
      .order("total_minutos_jogados", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(data.limit);

    if (error) {
      console.error("Erro ao listar ranking", error);
      return [];
    }

    return (grupos ?? []).map((g, i) => {
      const { banner_path, ...resto } = g;
      return { ...resto, posicao: i + 1, bannerUrl: bannerUrl(supabaseAdmin, banner_path) };
    });
  });

const buscaGruposSchema = z.object({
  tipo: TIPO,
  busca: z.string().trim().max(60).optional(),
});

/** Busca leve por nome, usada para vincular uma reserva a um squad/império existente. */
export const listarGruposParaVincular = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => buscaGruposSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("grupos")
      .select("id, nome")
      .eq("tipo", data.tipo)
      .order("nome")
      .limit(20);

    if (data.busca) query = query.ilike("nome", `%${data.busca}%`);

    const { data: grupos, error } = await query;
    if (error) {
      console.error("Erro ao buscar grupos", error);
      return [];
    }
    return grupos ?? [];
  });
