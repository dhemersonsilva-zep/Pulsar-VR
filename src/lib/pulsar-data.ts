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
