import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { PerfilQualidade } from "@/lib/webgl";

/**
 * Cena 3D da nave do HUB, em Three.js puro.
 *
 * Por que não React Three Fiber: o R3F 9 exige `react >=19 <19.3` e o projeto
 * resolve react@19.3.0 — a instalação falha no peer. Three puro também evita
 * o drei (~300 kB) e deixa os hotspots como HTML de verdade, projetado a
 * partir das coordenadas 3D. Isso é melhor para acessibilidade: são botões
 * reais, focáveis por teclado, não malhas.
 *
 * Nada aqui é importado no bundle principal — o módulo só é carregado sob
 * demanda por `Nave3D.tsx`, depois da montagem no cliente.
 */

export const CAMINHO_GLB = "/models/nave-pulsar.glb";

/** Onde cada zona fica ancorada, em coordenadas do modelo reenquadrado. */
export const ANCORAS: Record<string, [number, number, number]> = {
  ponte: [0, 0.28, -1.15],
  estatisticas: [0, 0.42, -0.15],
  jogos: [0, 0.1, 0.5],
  cofre: [0, -0.25, 0.05],
  conquistas: [-1.15, 0.05, 0.2],
  squad: [1.15, 0.05, 0.2],
  ranking: [0, 0.02, 1.25],
};

const COR_CIANO = new THREE.Color("#5ee7f5");
const COR_MAGENTA = new THREE.Color("#e0409a");
const COR_ROXO = new THREE.Color("#8b3ff0");

export type Cena = {
  montar: (container: HTMLElement) => void;
  destruir: () => void;
  /** Converte as âncoras 3D em coordenadas de tela (px, relativas ao canvas). */
  projetarAncoras: () => Record<string, { x: number; y: number; visivel: boolean }>;
  definirZonaAtiva: (id: string | null) => void;
  definirPausado: (pausado: boolean) => void;
  /** Fonte da nave em uso, para o relatório na UI. */
  origemDoModelo: () => "glb" | "procedural";
};

type Opcoes = {
  perfil: PerfilQualidade;
  reduzirMovimento: boolean;
  aoProgredir: (pct: number) => void;
  aoFalhar: (erro: unknown) => void;
};

/* --------------------------------------------------------------------------
 * Nave procedural
 * ----------------------------------------------------------------------- */

/**
 * Nave construída em código: zero asset para baixar, zero questão de licença
 * (a geometria é nossa) e some do orçamento de rede. Serve como a nave padrão
 * e como fallback caso o .glb não exista ou falhe.
 */
function construirNaveProcedural(perfil: PerfilQualidade): THREE.Group {
  const grupo = new THREE.Group();
  const seg = perfil.segmentos;

  const casco = new THREE.MeshStandardMaterial({
    color: 0x181d33,
    metalness: 0.72,
    roughness: 0.42,
  });
  const cascoClaro = new THREE.MeshStandardMaterial({
    color: 0x2e3757,
    metalness: 0.85,
    roughness: 0.45,
  });
  const neonCiano = new THREE.MeshStandardMaterial({
    color: 0x0a1a1f,
    emissive: COR_CIANO,
    emissiveIntensity: 2.4,
    metalness: 0.4,
    roughness: 0.25,
  });
  const neonMagenta = new THREE.MeshStandardMaterial({
    color: 0x1a0a14,
    emissive: COR_MAGENTA,
    emissiveIntensity: 2.1,
    metalness: 0.4,
    roughness: 0.25,
  });
  const vidro = new THREE.MeshStandardMaterial({
    color: 0x0b1a2a,
    emissive: COR_CIANO,
    emissiveIntensity: 0.5,
    metalness: 1,
    roughness: 0.08,
    transparent: true,
    opacity: 0.85,
  });

  // Fuselagem central
  const fuselagem = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.5, 6, seg), casco);
  fuselagem.rotation.x = Math.PI / 2;
  fuselagem.scale.set(1, 1, 0.55);
  grupo.add(fuselagem);

  // Bico / ponte de comando
  const bico = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, seg), cascoClaro);
  bico.position.z = -1.32;
  bico.rotation.x = -Math.PI / 2;
  bico.scale.set(1, 1, 0.55);
  grupo.add(bico);

  const cupula = new THREE.Mesh(new THREE.SphereGeometry(0.22, seg, seg / 2), vidro);
  cupula.position.set(0, 0.16, -1.05);
  cupula.scale.set(1, 0.55, 1.5);
  grupo.add(cupula);

  // Asas
  for (const lado of [-1, 1]) {
    const asa = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.9), casco);
    asa.position.set(lado * 0.92, 0, 0.18);
    asa.rotation.z = lado * 0.12;
    asa.rotation.y = lado * -0.22;
    grupo.add(asa);

    // Faixa neon na borda da asa
    const faixa = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.035, 0.09), neonCiano);
    faixa.position.set(lado * 0.92, 0.05, 0.6);
    faixa.rotation.z = lado * 0.12;
    faixa.rotation.y = lado * -0.22;
    grupo.add(faixa);

    // Ponta da asa
    const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, seg / 2), cascoClaro);
    ponta.position.set(lado * 1.62, 0, 0.0);
    ponta.rotation.x = -Math.PI / 2;
    grupo.add(ponta);

    // Motores
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.75, seg), casco);
    motor.position.set(lado * 0.52, -0.04, 0.85);
    motor.rotation.x = Math.PI / 2;
    grupo.add(motor);

    const jato = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.035, 0.4, seg / 2), neonMagenta);
    jato.position.set(lado * 0.52, -0.04, 1.32);
    jato.rotation.x = Math.PI / 2;
    grupo.add(jato);
  }

  // Espinha dorsal iluminada
  const espinha = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 1.75), neonCiano);
  espinha.position.set(0, 0.3, -0.05);
  grupo.add(espinha);

  // Anel do cofre, na barriga
  const anel = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, seg), neonMagenta);
  anel.position.set(0, -0.26, 0.05);
  anel.rotation.x = Math.PI / 2;
  grupo.add(anel);

  // Aletas superiores
  for (const lado of [-1, 1]) {
    const aleta = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.52), cascoClaro);
    aleta.position.set(lado * 0.26, 0.3, 0.75);
    aleta.rotation.x = 0.3;
    grupo.add(aleta);
  }

  grupo.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = perfil.sombras;
      o.receiveShadow = perfil.sombras;
    }
  });

  return grupo;
}

/** Centraliza e escala qualquer modelo para caber numa esfera de raio ~1,8. */
function reenquadrar(objeto: THREE.Object3D) {
  const caixa = new THREE.Box3().setFromObject(objeto);
  const tamanho = caixa.getSize(new THREE.Vector3());
  const centro = caixa.getCenter(new THREE.Vector3());
  const maior = Math.max(tamanho.x, tamanho.y, tamanho.z) || 1;
  const escala = 5.9 / maior;

  objeto.position.sub(centro);
  const wrapper = new THREE.Group();
  wrapper.add(objeto);
  wrapper.scale.setScalar(escala);
  return wrapper;
}

function construirEstrelas(quantidade: number): THREE.Points {
  const posicoes = new Float32Array(quantidade * 3);
  const cores = new Float32Array(quantidade * 3);

  // PRNG determinístico: mesma cena em qualquer carregamento, sem Math.random.
  let semente = 20260910;
  const rnd = () => {
    semente = (semente * 1664525 + 1013904223) % 4294967296;
    return semente / 4294967296;
  };

  const paleta = [COR_CIANO, COR_ROXO, new THREE.Color("#ffffff")];

  for (let i = 0; i < quantidade; i++) {
    const raio = 18 + rnd() * 42;
    const theta = rnd() * Math.PI * 2;
    const phi = Math.acos(2 * rnd() - 1);
    posicoes[i * 3] = raio * Math.sin(phi) * Math.cos(theta);
    posicoes[i * 3 + 1] = raio * Math.sin(phi) * Math.sin(theta);
    posicoes[i * 3 + 2] = raio * Math.cos(phi);

    const cor = paleta[Math.floor(rnd() * paleta.length)] ?? COR_CIANO;
    const brilho = 0.4 + rnd() * 0.6;
    cores[i * 3] = cor.r * brilho;
    cores[i * 3 + 1] = cor.g * brilho;
    cores[i * 3 + 2] = cor.b * brilho;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(posicoes, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(cores, 3));

  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  );
}

/* --------------------------------------------------------------------------
 * Cena
 * ----------------------------------------------------------------------- */

export function criarCena({ perfil, reduzirMovimento, aoProgredir, aoFalhar }: Opcoes): Cena {
  const cena = new THREE.Scene();
  cena.fog = new THREE.FogExp2(0x05060d, 0.022);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  const alvoCamera = new THREE.Vector3(0, 0.15, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: perfil.antialias,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  if (perfil.sombras) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }

  /* Luzes — escuro com neon, na identidade da marca */
  cena.add(new THREE.AmbientLight(0x3a4370, 2.1));

  const chave = new THREE.DirectionalLight(0xffffff, 2.8);
  chave.position.set(4, 6, -3);
  chave.castShadow = perfil.sombras;
  if (perfil.sombras) {
    chave.shadow.mapSize.set(1024, 1024);
    chave.shadow.camera.near = 1;
    chave.shadow.camera.far = 24;
  }
  cena.add(chave);

  const preencheCiano = new THREE.PointLight(COR_CIANO, 24, 16, 2);
  preencheCiano.position.set(-3.4, 1.4, 2.4);
  cena.add(preencheCiano);

  const preencheMagenta = new THREE.PointLight(COR_MAGENTA, 20, 16, 2);
  preencheMagenta.position.set(3.4, -1.2, -2.2);
  cena.add(preencheMagenta);

  // Luz de recorte: separa o casco escuro do espaço preto, senão a silhueta
  // vira uma mancha.
  const recorte = new THREE.DirectionalLight(COR_CIANO, 3.2);
  recorte.position.set(-2, -1.5, -5);
  cena.add(recorte);

  const contraRoxo = new THREE.PointLight(COR_ROXO, 22, 24, 2);
  contraRoxo.position.set(0, -2.6, 4);
  cena.add(contraRoxo);

  /* Estrelas */
  const estrelas = construirEstrelas(perfil.estrelas);
  cena.add(estrelas);

  /* Plataforma holográfica sob a nave */
  const disco = new THREE.Mesh(
    new THREE.RingGeometry(2.62, 2.74, Math.max(32, perfil.segmentos)),
    new THREE.MeshBasicMaterial({
      color: COR_CIANO,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    }),
  );
  disco.rotation.x = -Math.PI / 2;
  disco.position.y = -1.95;
  cena.add(disco);

  /* Nave */
  const suporteNave = new THREE.Group();
  // Inclina o conjunto: de frente as asas ficam quase de perfil e a nave some.
  suporteNave.rotation.x = -0.2;
  cena.add(suporteNave);

  let origem: "glb" | "procedural" = "procedural";
  let naveAtual: THREE.Object3D = reenquadrar(construirNaveProcedural(perfil));
  suporteNave.add(naveAtual);

  // Tenta o .glb do cliente. Se não existir (404) ou falhar, a procedural fica.
  let cancelado = false;
  const gltfLoader = new GLTFLoader();
  // Sem setDecoderPath de propósito: o three 0.186 referencia o decodificador
  // Draco com `new URL(..., import.meta.url)`, então o Vite o emite como asset
  // do próprio site. Nenhuma CDN, nenhum arquivo para copiar à mão — e nada é
  // baixado enquanto não existir um GLB comprimido de verdade.
  const draco = new DRACOLoader();
  gltfLoader.setDRACOLoader(draco);

  fetch(CAMINHO_GLB, { method: "HEAD" })
    .then((r) => {
      if (!r.ok) {
        // 404 é o caminho normal enquanto não houver modelo — não é erro.
        aoProgredir(100);
        return null;
      }
      return new Promise<void>((resolve) => {
        gltfLoader.load(
          CAMINHO_GLB,
          (gltf) => {
            if (cancelado) return resolve();
            suporteNave.remove(naveAtual);
            descartar(naveAtual);
            naveAtual = reenquadrar(gltf.scene);
            naveAtual.traverse((o) => {
              if (o instanceof THREE.Mesh) {
                o.castShadow = perfil.sombras;
                o.receiveShadow = perfil.sombras;
              }
            });
            suporteNave.add(naveAtual);
            origem = "glb";
            aoProgredir(100);
            resolve();
          },
          (evento) => {
            if (evento.lengthComputable) {
              aoProgredir(Math.round((evento.loaded / evento.total) * 100));
            }
          },
          (erro) => {
            console.error("[Nave3D] Falha ao carregar o GLB, usando a nave procedural:", erro);
            aoFalhar(erro);
            aoProgredir(100);
            resolve();
          },
        );
      });
    })
    .catch((erro) => {
      console.warn("[Nave3D] GLB indisponível, usando a nave procedural:", erro);
      aoProgredir(100);
    });

  /* Interação */
  const ponteiro = { x: 0, y: 0 };
  const alvoRotacao = { x: 0, y: 0 };
  let distancia = 7.4;
  let distanciaAlvo = 7.4;
  let zonaAtiva: string | null = null;
  let pausado = false;
  /**
   * Enquanto o ponteiro está sobre a cena, a deriva automática para. Sem isso
   * os marcadores de zona ficam se movendo debaixo do cursor e clicar vira uma
   * caçada — quem aponta para a nave quer mirar, não perseguir.
   */
  let ponteiroDentro = false;
  let container: HTMLElement | null = null;
  let animId = 0;
  let observador: ResizeObserver | null = null;
  const relogio = new THREE.Timer();

  function aoMover(e: PointerEvent) {
    if (!container) return;
    ponteiroDentro = true;
    const r = container.getBoundingClientRect();
    ponteiro.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ponteiro.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    // Parallax contido: a nave inclina, não roda desgovernada.
    alvoRotacao.y = ponteiro.x * 0.45;
    alvoRotacao.x = ponteiro.y * 0.22;
  }

  function aoSair() {
    ponteiroDentro = false;
    alvoRotacao.x = 0;
    alvoRotacao.y = 0;
  }

  function aoRolar(e: WheelEvent) {
    e.preventDefault();
    distanciaAlvo = THREE.MathUtils.clamp(distanciaAlvo + e.deltaY * 0.0035, 4.6, 11);
  }

  // Pinça para zoom no toque
  let distanciaPinca = 0;
  function aoTocarInicio(e: TouchEvent) {
    if (e.touches.length === 2) distanciaPinca = distanciaEntre(e.touches);
  }
  function aoTocarMover(e: TouchEvent) {
    if (e.touches.length === 2) {
      const nova = distanciaEntre(e.touches);
      if (distanciaPinca > 0) {
        distanciaAlvo = THREE.MathUtils.clamp(distanciaAlvo * (distanciaPinca / nova), 4.6, 11);
      }
      distanciaPinca = nova;
      e.preventDefault();
    } else if (e.touches.length === 1 && container) {
      const t = e.touches[0]!;
      const r = container.getBoundingClientRect();
      alvoRotacao.y = (((t.clientX - r.left) / r.width) * 2 - 1) * 0.5;
      alvoRotacao.x = (((t.clientY - r.top) / r.height) * 2 - 1) * 0.24;
    }
  }
  function distanciaEntre(toques: TouchList) {
    const [a, b] = [toques[0]!, toques[1]!];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function redimensionar() {
    if (!container) return;
    const l = container.clientWidth;
    const a = container.clientHeight;
    if (l === 0 || a === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, perfil.pixelRatio));
    renderer.setSize(l, a, false);
    camera.aspect = l / a;
    // Em tela estreita, afasta a câmera para a nave não ficar cortada — é o
    // que impede a nave de virar um pontinho no celular.
    distanciaAlvo = l < 640 ? 8.9 : l < 1024 ? 8.0 : 7.4;
    camera.updateProjectionMatrix();
  }

  function animar() {
    animId = requestAnimationFrame(animar);
    if (pausado) return;

    relogio.update();
    const dt = Math.min(relogio.getDelta(), 0.05);
    const t = relogio.getElapsed();

    const derivando = !reduzirMovimento && !ponteiroDentro && !zonaAtiva;
    if (derivando) {
      // Deriva lenta + flutuação: a nave parece viva, sem enjoar.
      suporteNave.rotation.y += dt * 0.09;
      suporteNave.position.y = Math.sin(t * 0.7) * 0.09;
    }
    if (!reduzirMovimento) {
      estrelas.rotation.y += dt * 0.006;
    }

    naveAtual.rotation.y = THREE.MathUtils.lerp(naveAtual.rotation.y, alvoRotacao.y, 0.06);
    naveAtual.rotation.x = THREE.MathUtils.lerp(naveAtual.rotation.x, alvoRotacao.x, 0.06);

    distancia = THREE.MathUtils.lerp(distancia, distanciaAlvo, 0.08);
    camera.position.set(0, 1.35, distancia);
    camera.lookAt(alvoCamera);

    // Pulso nas luzes quando uma zona está em foco
    const foco = zonaAtiva ? 1.35 : 1;
    preencheCiano.intensity = THREE.MathUtils.lerp(preencheCiano.intensity, 24 * foco, 0.08);
    preencheMagenta.intensity = THREE.MathUtils.lerp(preencheMagenta.intensity, 20 * foco, 0.08);
    disco.rotation.z += dt * 0.12;

    renderer.render(cena, camera);
  }

  function descartar(raiz: THREE.Object3D) {
    raiz.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) m.dispose();
      }
    });
  }

  return {
    montar(elemento) {
      container = elemento;
      elemento.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "pan-y";

      redimensionar();
      observador = new ResizeObserver(redimensionar);
      observador.observe(elemento);

      elemento.addEventListener("pointermove", aoMover);
      elemento.addEventListener("pointerleave", aoSair);
      elemento.addEventListener("wheel", aoRolar, { passive: false });
      elemento.addEventListener("touchstart", aoTocarInicio, { passive: true });
      elemento.addEventListener("touchmove", aoTocarMover, { passive: false });

      animar();
    },

    destruir() {
      cancelado = true;
      cancelAnimationFrame(animId);
      observador?.disconnect();
      if (container) {
        container.removeEventListener("pointermove", aoMover);
        container.removeEventListener("pointerleave", aoSair);
        container.removeEventListener("wheel", aoRolar);
        container.removeEventListener("touchstart", aoTocarInicio);
        container.removeEventListener("touchmove", aoTocarMover);
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      }
      descartar(cena);
      estrelas.geometry.dispose();
      (estrelas.material as THREE.Material).dispose();
      draco.dispose();
      renderer.dispose();
      container = null;
    },

    projetarAncoras() {
      const saida: Record<string, { x: number; y: number; visivel: boolean }> = {};
      if (!container) return saida;

      const l = container.clientWidth;
      const a = container.clientHeight;
      const v = new THREE.Vector3();

      for (const [id, pos] of Object.entries(ANCORAS)) {
        v.set(pos[0], pos[1], pos[2]);
        // As âncoras vivem no espaço de `suporteNave`, já reenquadrado.
        // localToWorld aplica matrixWorld, que inclui todos os ancestrais —
        // aplicar de novo em `naveAtual` transformaria duas vezes.
        suporteNave.localToWorld(v);
        v.project(camera);
        saida[id] = {
          x: ((v.x + 1) / 2) * l,
          y: ((1 - v.y) / 2) * a,
          // z fora de [-1,1] = atrás da câmera ou além do far plane
          visivel: v.z > -1 && v.z < 1,
        };
      }
      return saida;
    },

    definirZonaAtiva(id) {
      zonaAtiva = id;
    },

    definirPausado(p) {
      pausado = p;
      // Zera o delta acumulado durante a pausa, senão a nave dá um salto.
      if (!p) relogio.update();
    },

    origemDoModelo() {
      return origem;
    },
  };
}
