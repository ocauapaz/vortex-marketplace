# Plano — Marketplace de Economia Circular (Vortex 2026)

Desafio: plataforma de desapego universitário. API REST + PWA responsivo.
Prazo: 15 dias. Repositório público único (monorepo).

---

## 1. Decisões de arquitetura

| Camada | Escolha | Por quê |
|---|---|---|
| Backend | Ruby on Rails 8.1 (`--api`) | Pedido do dev. CRUD + JSON com quase zero boilerplate. |
| Banco | SQLite em volume Fly (`/rails/storage`) | Padrão oficial do Rails 8, persistente, sem serviço extra. Atende o requisito mínimo e o bônus "banco real". |
| Auth | `has_secure_password` + JWT (gem `jwt`) | Bônus do edital. Token evita cookie cross-origin (GitHub Pages ↔ Fly). |
| Frontend | React 19 + Vite + TypeScript | TS é bônus. Vite gera build estático para Pages. |
| Estilo | Tailwind CSS | Responsividade desktop→mobile sem CSS custom espalhado. |
| Animação | Motion (`motion/react`) + GSAP ScrollTrigger | Motion: estado/transição de componente e página. GSAP: narrativa de scroll da landing. Nunca os dois no mesmo elemento. |
| PWA | `vite-plugin-pwa` (Workbox) | Gera `manifest.webmanifest` + Service Worker + runtime cache. Não escrever SW à mão. |
| Deploy API | Fly.io (`fly deploy --remote-only`) | Sem Docker local. |
| Deploy Front | GitHub Pages via GitHub Actions | Pedido do dev. |

**Ceilings assumidos (documentar no README):**
- SQLite = 1 máquina, sem escala horizontal. Trocar por Postgres é mudar `database.yml` + gem, se a banca exigir.
- Imagem do anúncio é uma **URL** (o próprio edital pede "URL de imagem simulada"). Sem upload, sem Active Storage.
- Categorias são constante no código, não tabela. Nunca mudam em runtime.

---

## 2. Estrutura do repositório

```
VortexProject/                 # repo próprio, público (submódulo de Projects, como o Nui)
├── README.md                  # descrição, setup, stack, Diário de Bordo da IA, links de produção
├── api/                       # Rails 8 API-only
│   ├── app/
│   │   ├── controllers/api/v1/    # listings, auth, stats, me
│   │   ├── models/                # user.rb, listing.rb
│   │   └── serializers/           # POROs simples (hash), sem gem
│   ├── config/
│   ├── db/
│   ├── test/                      # request tests (minitest)
│   ├── Dockerfile                 # gerado pelo Rails 8
│   └── fly.toml
├── web/                       # React + Vite + TS
│   ├── src/
│   │   ├── pages/             # Landing, Login, Explore, NewListing, MyListings
│   │   ├── components/
│   │   ├── lib/api.ts         # fetch wrapper + token
│   │   └── hooks/
│   ├── public/icons/          # ícones PWA 192/512
│   └── vite.config.ts
└── .github/workflows/deploy-pages.yml
```

---

## 3. Modelo de dados

```
User     id, name, email (unique), password_digest, course, timestamps
Listing  id, user_id, title, description, category, kind(enum: sale|donation),
         price_cents (null quando donation), image_url, timestamps
```

`CATEGORIES = %w[Livros Engenharia Computação Saúde Móveis Eletrônicos Outros]` — constante em `Listing`.

**Validações:** title (3..80), description (≤ 600), category ∈ CATEGORIES, kind presente,
price_cents obrigatório e > 0 quando `sale`, ausente quando `donation`, image_url formato http(s).

---

## 4. API (todas as rotas sob `/api/v1`)

| Método | Rota | Auth | Retorno |
|---|---|---|---|
| POST | `/auth/signup` | — | `{ token, user }` |
| POST | `/auth/login` | — | `{ token, user }` (rate-limited) |
| GET | `/me` | ✔ | `{ user }` |
| GET | `/me/listings` | ✔ | anúncios do usuário |
| GET | `/listings` | — | lista + filtros `category`, `kind`, `q`, `page` |
| GET | `/listings/:id` | — | anúncio |
| POST | `/listings` | ✔ | criado (201) |
| PATCH | `/listings/:id` | ✔ dono | atualizado |
| DELETE | `/listings/:id` | ✔ dono | 204 |
| GET | `/stats` | — | `{ listings, donations, users, categories }` para a landing |

**Erros padronizados:** `{ "error": "mensagem", "details": { campo: [...] } }` com 400/401/403/404/422.
Um `rescue_from` no `ApplicationController` cobre tudo — sem `begin/rescue` espalhado.

`rate_limit to: 10, within: 1.minute` (nativo do Rails 8) em login e signup. Sem gem.

---

## 5. Telas

1. **Landing (`/`)** — desktop-rich: hero com animação GSAP no scroll, seção "como funciona",
   estatísticas reais vindas de `/stats`, vitrine dos últimos 8 anúncios com filtro por categoria,
   CTAs "Anunciar item" / "Explorar".
2. **Explorar (`/explorar`)** — grid de anúncios, filtros (categoria, doação/venda, busca), paginação.
3. **Login / Cadastro (`/entrar`)** — form único com toggle.
4. **Novo anúncio (`/anunciar`)** — form validado, preview da imagem pela URL.
5. **Meus anúncios (`/meus-anuncios`)** — lista + excluir/editar.

Roteamento: `BrowserRouter` com `basename` do repo + cópia de `index.html` para `404.html` no build
(fallback SPA do GitHub Pages). Uma linha no script de build, sem HashRouter feio.

---

## 6. Cronograma (15 dias)

### Fase 0 — Setup (Dia 1) — ✅ toolchain concluído
- [x] Ruby 3.4.10 + DevKit (MSYS2/gcc), Rails 8.1.3.1, Bundler 2.6.9, flyctl 0.4.71
- [x] `flyctl` e `gh` já autenticados
- [ ] `git init` no VortexProject, repo público no GitHub, submódulo no workspace Projects
- [ ] `rails new api --api --skip-action-mailer --skip-action-mailbox --skip-action-text --skip-active-storage --skip-action-cable --skip-jbuilder`
- [ ] `npm create vite@latest web -- --template react-ts`

### Fase 1 — Backend núcleo (Dias 2–4)
- Dia 2: models + migrations + validações + seeds (~30 anúncios realistas para a landing não ficar vazia).
- Dia 3: `ListingsController` CRUD + filtros + `StatsController`. Serializers. `rescue_from`.
- Dia 4: auth JWT (concern `Authenticable`, ~25 linhas), `has_secure_password`, rate limit, rack-cors.
- **Check:** request tests minitest cobrindo CRUD, filtros, 401 sem token, 403 de não-dono, 422 de validação.

### Fase 2 — Deploy da API (Dia 5)
- `fly launch --no-deploy`, `fly volumes create data --size 1`, mount em `/rails/storage`.
- Secrets: `RAILS_MASTER_KEY`, `JWT_SECRET`, `FRONTEND_ORIGIN`.
- `fly deploy --remote-only`. Rodar seeds em produção via `fly ssh console`.
- **Deploy cedo, não no fim.** Descobrir problema de CORS/volume no dia 5 é barato; no dia 14 é fatal.

### Fase 3 — Frontend funcional (Dias 6–9)
- Dia 6: Tailwind, layout base, `lib/api.ts` (fetch + token no localStorage), rotas.
- Dia 7: Explorar + card de anúncio + filtros + estados de loading/erro/vazio.
- Dia 8: Login/Cadastro + rota protegida + Novo anúncio + Meus anúncios.
- Dia 9: Landing completa (hero, stats, vitrine, CTAs) — conteúdo antes de animação.

### Fase 4 — PWA + polimento (Dias 10–12)
- Dia 10: `vite-plugin-pwa` — manifest, ícones 192/512, SW com precache do shell +
  `NetworkFirst` para `GET /api/v1/listings` (bônus offline). Testar instalação real no celular.
- Dia 11: Motion — transições de página, entrada dos cards em stagger, feedback de botões.
  Respeitar `prefers-reduced-motion`.
- Dia 12: GSAP + ScrollTrigger só na landing — parallax do hero, reveal das seções, contador de stats.
- **Check:** Lighthouse (PWA instalável + performance), teste em viewport 375px e 1440px.

### Fase 5 — Deploy front, README e vídeo (Dias 13–15)
- Dia 13: workflow `deploy-pages.yml`, `base` do Vite = `/nome-do-repo/`, 404.html, `VITE_API_URL`
  como variável do Actions. Ajustar `FRONTEND_ORIGIN` no Fly com a URL final do Pages.
- Dia 14: README completo — descrição, setup passo a passo (back e front), stack, links de produção
  e **Diário de Bordo da IA** (ferramentas, 3 prompts reais colados, link de chat, reflexão crítica
  sobre um erro real da IA). Esse item é obrigatório e tem nota pesada — não deixar para o dia 15.
- Dia 15: gravar o vídeo de **6 minutos exatos** e revisar tudo.

---

## 7. Roteiro do vídeo (6 min, cronometrado)

| Tempo | Conteúdo | Preparação |
|---|---|---|
| 0:00–1:00 | Pitch: quem sou + problema do desapego no campus + proposta | Script escrito e ensaiado |
| 1:00–3:00 | Demo: landing no desktop → celular → criar anúncio → instalar PWA na home | Seeds já carregados, celular espelhado na tela |
| 3:00–5:00 | Código: árvore de pastas, `routes.rb`, `ListingsController`, concern de auth, config do SW, `lib/api.ts` | Abas do VS Code abertas na ordem antes de gravar |
| 5:00–6:00 | IA: abrir o Diário de Bordo, mostrar 1 prompt forte e o erro que corrigi | README aberto no navegador |

Gravar em 2–3 takes por bloco e cortar. Ensaiar uma vez cronometrado antes.

---

## 8. Cobertura do edital

**Obrigatórios:** API REST ✔ · CRUD de anúncios ✔ · persistência ✔ · JSON ✔ · React ✔ ·
manifest + Service Worker ✔ · responsividade ✔ · README + Diário ✔ · repo público ✔ · vídeo ✔

**Bônus cobertos:** JWT ✔ · validação e erros robustos ✔ · banco real ✔ · cache offline no SW ✔ ·
TypeScript ✔ · UI polida com transições ✔ · deploy real de API e front ✔

**Fora de escopo (deliberado):** upload de imagem, chat entre usuários, favoritos, notificações push,
painel admin, i18n, testes E2E. Nada disso é pedido nem pontua.

---

## 9. Riscos

| Risco | Mitigação |
|---|---|
| ~~Ruby/Rails não instalado~~ | Resolvido no Dia 1. |
| CORS entre Pages e Fly | Resolvido no dia 5, não no fim. `FRONTEND_ORIGIN` por env. |
| SPA quebrar em rota profunda no Pages | `404.html` + `basename` já no dia 13. |
| Máquina do Fly dormindo → primeira request lenta | Aceitável; avisar no vídeo ou manter `min_machines_running = 1`. |
| Vídeo estourar 6 min | Ensaio cronometrado no dia 15 pela manhã. |
