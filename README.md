# Pulsar VR

Site da Pulsar VR — arena gamer com VR, PS5 e PC Gamer em Guarapuava/PR. Reservas, loja, squads/impérios e ranking, com pagamento via Mercado Pago (Pix/cartão) e backend em Supabase.

## Deploy

Hospedado na [Netlify](https://www.netlify.com/), com deploy automático a cada push na branch `master` deste repositório (veja `netlify.toml`).

## Desenvolvimento

Você precisa de Node.js e npm — [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Copie `.env.example` para `.env` e preencha as chaves do Supabase e do Mercado Pago antes de rodar localmente.
