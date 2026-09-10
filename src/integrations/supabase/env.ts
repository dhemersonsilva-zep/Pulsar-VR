/**
 * Saneamento das variáveis de ambiente do Supabase.
 *
 * Motivo de existir: em 10/09/2026 a `SUPABASE_URL` de produção foi salva na
 * Vercel como `[https://...` (colada em formato de link markdown). O
 * `createClient` lança "Invalid supabaseUrl" ANTES de qualquer consulta, então
 * TODA server function que fala com o banco morreu de uma vez — inclusive a
 * criação de reserva. E como as outras funções engolem erro, o site seguiu
 * mostrando a agenda inteira livre sem registrar nada.
 *
 * Um caractere colado errado não pode derrubar o sistema de vendas. Aqui
 * removemos os invólucros mais comuns de copiar/colar antes de entregar o
 * valor ao SDK. Isso NÃO substitui arrumar a variável — só evita que o erro
 * seja fatal.
 */

/** Tira espaços, aspas, colchetes, parênteses e chaves das pontas. */
export function limparEnv(valor: string | undefined): string | undefined {
  if (typeof valor !== "string") return valor;
  const limpo = valor
    .trim()
    .replace(/^[[({<"'`]+/, "")
    .replace(/[\])}>"'`]+$/, "")
    .trim();
  return limpo.length > 0 ? limpo : undefined;
}

/**
 * Além de limpar, valida que sobrou uma URL http(s). Avisa no log quando
 * precisou consertar, para o problema não ficar invisível.
 */
export function limparUrlSupabase(valor: string | undefined): string | undefined {
  const limpo = limparEnv(valor);
  if (!limpo) return undefined;

  if (limpo !== valor?.trim()) {
    console.warn(
      `[Supabase] SUPABASE_URL tinha caracteres extras nas pontas e foi corrigida em tempo de execução. Ajuste a variável de ambiente para "${limpo}".`,
    );
  }

  if (!/^https?:\/\//i.test(limpo)) {
    console.error(`[Supabase] SUPABASE_URL não parece uma URL http(s): "${limpo}"`);
  }

  return limpo;
}
