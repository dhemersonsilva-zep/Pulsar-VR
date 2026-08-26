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

export type Accent = "cyan" | "pink" | "green";

export type Station = {
  id: string;
  nome: string;
  specs: string;
  descricao: string;
  precoHora: number;
  imagem: string;
  accent: Accent;
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
  },
];

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
