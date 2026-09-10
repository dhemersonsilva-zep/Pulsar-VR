import stationVr from "@/assets/station-vr.jpg";
import stationConsole from "@/assets/station-console.jpg";
import stationPc from "@/assets/station-pc.jpg";
import prodMouse from "@/assets/prod-mouse.jpg";
import prodKeyboard from "@/assets/prod-keyboard.jpg";
import prodHeadset from "@/assets/prod-headset.jpg";
import prodMousepad from "@/assets/prod-mousepad.jpg";

export const WHATSAPP_NUMBER = "5542999413305";

export function whatsappLink(mensagem: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export function precoBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Dados reais do negócio. Sem endereço de rua confirmado ainda — mantenha
 * `enderecoCompleto: null` até ter o endereço real; a UI mostra um aviso
 * "em breve" em vez de inventar uma rua/número.
 */
export const BUSINESS = {
  nome: "Pulsar VR",
  cidade: "Guarapuava",
  estado: "PR",
  enderecoCompleto: null as string | null,
  horario: "Segunda a sábado, 14h às 23h",
  instagram: "@pulsarvr",
  instagramUrl: "https://instagram.com/pulsarvr",
  telefoneExibicao: "(42) 99941-3305",
  googleMapsBuscaUrl: "https://www.google.com/maps/search/?api=1&query=Pulsar+VR+Guarapuava+PR",
  // Embed no nível da cidade — sem endereço exato ainda, então não fixamos um pino de rua.
  osmEmbedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=-51.5245%2C-25.4235%2C-51.4245%2C-25.3535&layer=mapnik&marker=-25.3935%2C-51.4745",
};

export type Accent = "cyan" | "pink" | "green";

export type Station = {
  id: string;
  nome: string;
  specs: string;
  descricao: string;
  precoHora: number;
  imagem: string;
  accent: Accent;
  /**
   * Quantas unidades físicas existem dessa estação (headsets/consoles/PCs).
   * PLACEHOLDER — ajuste para o número real de equipamentos; hoje assumimos
   * 1 unidade por estação, então cada horário fica "lotado" após 1 reserva.
   */
  capacidade: number;
  idadeRecomendada: string;
};

export const stations: Station[] = [
  {
    id: "vr",
    nome: "Realidade Virtual",
    specs: "Meta Quest 3 · área 3x3m",
    descricao:
      "Imersão total com headset de última geração e sensores de movimento. Mais de 50 títulos disponíveis.",
    precoHora: 69.9,
    imagem: stationVr,
    accent: "cyan",
    capacidade: 1,
    idadeRecomendada: "12+",
  },
  {
    id: "ps5",
    nome: "PlayStation 5",
    specs: 'TV 4K 55" · DualSense',
    descricao:
      "Jogue os últimos lançamentos em 4K em TVs OLED. Multiplayer local para até 4 players.",
    precoHora: 44.9,
    imagem: stationConsole,
    accent: "pink",
    capacidade: 1,
    idadeRecomendada: "Livre",
  },
  {
    id: "pc",
    nome: "PC Gamer Pro",
    specs: "RTX 4070 · 240Hz",
    descricao:
      "Periféricos premium e monitor de alta taxa. A melhor performance da região para eSports.",
    precoHora: 54.9,
    imagem: stationPc,
    accent: "green",
    capacidade: 1,
    idadeRecomendada: "Livre",
  },
];

/** Títulos exclusivos/típicos de cada plataforma, a partir da lista real de `jogos`. */
export const jogosPorEstacao: Record<string, string[]> = {
  vr: ["Beat Saber", "Half-Life: Alyx"],
  ps5: ["EA FC 25", "Spider-Man 2", "Gran Turismo 7"],
  pc: ["Valorant", "Counter-Strike 2", "Cyberpunk 2077"],
};

/**
 * Pacotes calculados a partir dos preços reais por hora (nada fixo/inventado).
 * `duracaoHoras`/`pessoas` são o cenário padrão mostrado; o preço final real
 * sempre é calculado no fluxo de reserva. Ajuste `descontoPercent` quando o
 * desconto de squad for definido — hoje está em 0 (sem desconto aplicado).
 */
export const DESCONTO_SQUAD_PERCENT = 0;

export type Pacote = {
  id: string;
  nome: string;
  tagline: string;
  pessoas: number;
  duracaoHoras: number;
  estacaoRefId: string;
  destaque?: boolean;
  sobConsulta?: boolean;
};

export const pacotes: Pacote[] = [
  {
    id: "solo",
    nome: "Solo",
    tagline: "Pra jogar sozinho, no seu ritmo.",
    pessoas: 1,
    duracaoHoras: 1,
    estacaoRefId: "pc",
  },
  {
    id: "duo",
    nome: "Duo",
    tagline: "Você e mais uma pessoa, mesma estação.",
    pessoas: 2,
    duracaoHoras: 1,
    estacaoRefId: "ps5",
  },
  {
    id: "squad",
    nome: "Squad",
    tagline: "Grupos de até 4 pessoas. Melhor custo-benefício.",
    pessoas: 4,
    duracaoHoras: 1,
    estacaoRefId: "ps5",
    destaque: true,
  },
  {
    id: "aniversario",
    nome: "Aniversário",
    tagline: "Experiência para grupos — orçamento sob consulta.",
    pessoas: 6,
    duracaoHoras: 2,
    estacaoRefId: "vr",
    sobConsulta: true,
  },
];

export function precoPacote(pacote: Pacote) {
  const estacao = stations.find((s) => s.id === pacote.estacaoRefId) ?? stations[0]!;
  const bruto = estacao.precoHora * pacote.duracaoHoras * pacote.pessoas;
  const desconto = bruto * (DESCONTO_SQUAD_PERCENT / 100);
  return bruto - desconto;
}

export type Produto = {
  id: string;
  nome: string;
  detalhe: string;
  preco: number;
  imagem: string;
};

export const produtos: Produto[] = [
  {
    id: "mouse",
    nome: "Mouse Pulsar X2 Elite",
    detalhe: "26K DPI · sem fio",
    preco: 499,
    imagem: prodMouse,
  },
  {
    id: "teclado",
    nome: "Teclado Mecânico 60%",
    detalhe: "Switch red silencioso",
    preco: 680,
    imagem: prodKeyboard,
  },
  {
    id: "headset",
    nome: "Headset 7.1 Surround",
    detalhe: "Áudio espacial · mic boom",
    preco: 350,
    imagem: prodHeadset,
  },
  {
    id: "mousepad",
    nome: "Mousepad Extended",
    detalhe: "900x400mm · borda costurada",
    preco: 120,
    imagem: prodMousepad,
  },
];

export const jogos = [
  "Valorant",
  "Beat Saber",
  "EA FC 25",
  "Spider-Man 2",
  "Half-Life: Alyx",
  "Cyberpunk 2077",
  "Counter-Strike 2",
  "Gran Turismo 7",
];

export const horarios = [
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

/* --- Pulsar Créditos (programa de fidelidade) --- */

/** Cada real gasto na Pulsar vira 1 crédito. */
export const CREDITOS_POR_REAL = 1;

/** Por quantos dias um crédito continua válido antes de expirar. */
export const CREDITOS_VALIDADE_DIAS = 30;

/** A partir de quantas pessoas a reserva conta como grupo. */
export const CREDITOS_GRUPO_MINIMO = 3;

/** Multiplicador de créditos numa reserva de grupo. */
export const CREDITOS_MULTIPLICADOR_GRUPO = 1.5;

export type Recompensa = {
  id: string;
  /** Quantos créditos a troca custa. Como 1 crédito = R$ 1, também é o gasto. */
  creditos: number;
  titulo: string;
  detalhe: string;
  /** Horas de jogo que a troca dá. 0 quando a recompensa não é tempo de jogo. */
  horasGratis: number;
  /** Estações válidas para a troca; `null` = qualquer uma. */
  estacoesIds: string[] | null;
  /** Preenchido só nas trocas que são desconto em vez de tempo de jogo. */
  descontoPercent?: number;
  accent: "cyan" | "pink" | "purple" | "green" | "orange";
  destaque?: boolean;
};

/**
 * Catálogo de trocas. Os créditos são acumulados e gastos aqui — não é uma
 * escada cumulativa: quem troca 500 créditos por 3h consome os 500.
 *
 * PLACEHOLDER — os degraus (50/100/200/300/500/1000) e as recompensas vieram
 * do dono; o retorno real de cada troca é calculado a partir dos preços de
 * `stations`, então mexer no preço de uma estação reajusta os percentuais
 * sozinho. Valide a margem antes de divulgar: as trocas devolvem entre 23% e
 * 34% do que foi gasto (ver `retornoRecompensaPercent`).
 */
export const recompensas: Recompensa[] = [
  {
    id: "desconto",
    creditos: 50,
    titulo: "5% de desconto",
    detalhe: "Abate 5% em qualquer reserva. A troca mais rápida pra quem não quer esperar.",
    horasGratis: 0,
    estacoesIds: null,
    descontoPercent: 5,
    accent: "cyan",
  },
  {
    id: "meia-hora",
    creditos: 100,
    titulo: "30 min de jogo",
    detalhe: "Meia hora grátis na estação que você escolher — VR, PS5 ou PC.",
    horasGratis: 0.5,
    estacoesIds: null,
    accent: "cyan",
  },
  {
    id: "hora-console",
    creditos: 200,
    titulo: "1h de PS5 ou PC",
    detalhe: "Uma hora inteira no PlayStation 5 ou no PC Gamer Pro.",
    horasGratis: 1,
    estacoesIds: ["ps5", "pc"],
    accent: "pink",
  },
  {
    id: "hora-vr",
    creditos: 300,
    titulo: "1h de Realidade Virtual",
    detalhe: "Uma hora no Meta Quest 3, a estação mais cara da casa.",
    horasGratis: 1,
    estacoesIds: ["vr"],
    accent: "pink",
  },
  {
    id: "tres-horas",
    creditos: 500,
    titulo: "3h de jogo",
    detalhe: "Uma tarde inteira, na estação que quiser. É a troca que mais rende por crédito.",
    horasGratis: 3,
    estacoesIds: null,
    accent: "purple",
    destaque: true,
  },
  {
    id: "evento",
    creditos: 1000,
    titulo: "Benefício especial + evento",
    detalhe: "Convite para um evento fechado da Pulsar e o benefício exclusivo do mês.",
    horasGratis: 0,
    estacoesIds: null,
    accent: "orange",
  },
];

/** Preço/hora médio entre as estações válidas para uma troca. */
export function precoHoraMedioEstacoes(ids: string[] | null) {
  const lista = ids ? stations.filter((s) => ids.includes(s.id)) : stations;
  const alvo = lista.length > 0 ? lista : stations;
  return alvo.reduce((acc, s) => acc + s.precoHora, 0) / alvo.length;
}

/** Quanto a recompensa vale em reais, aos preços atuais das estações. */
export function valorRecompensa(recompensa: Recompensa) {
  return recompensa.horasGratis * precoHoraMedioEstacoes(recompensa.estacoesIds);
}

/**
 * Quanto do gasto volta como jogo grátis, em %. Como 1 crédito = R$ 1, o
 * percentual é direto: R$ 169,70 em jogo por 500 créditos = 34% de volta.
 */
export function retornoRecompensaPercent(recompensa: Recompensa) {
  if (recompensa.creditos <= 0) return 0;
  return Math.round((valorRecompensa(recompensa) / recompensa.creditos) * 100);
}

/** A troca com o melhor retorno por crédito — destacada na seção. */
export function melhorRetornoPercent() {
  return Math.max(...recompensas.map(retornoRecompensaPercent));
}

/** Quantos créditos uma reserva rende, já com o bônus de grupo. */
export function creditosDaReserva(valor: number, pessoas: number) {
  const multiplicador = pessoas >= CREDITOS_GRUPO_MINIMO ? CREDITOS_MULTIPLICADOR_GRUPO : 1;
  return Math.floor(valor * CREDITOS_POR_REAL * multiplicador);
}
