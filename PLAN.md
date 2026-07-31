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
| Identidade | UNIFOR + Vortex | Azul `#044CF4` e navy `#002969` da unifor.br, roxo `#170D29`/violeta `#6F4BEF`/ciano `#12CEE4` do vortex.unifor.br. Fontes: Rubik (Vortex) nos títulos, Open Sans (UNIFOR) no corpo. |
| Animação | Motion (`motion/react`) + GSAP ScrollTrigger | Motion: transição de página, reveal de seção e entrada dos cards. GSAP: parallax do herói e contadores das estatísticas. Nunca os dois no mesmo elemento. |
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

### Fase 1 — Backend núcleo (Dias 2–4) — ✅ concluída
- [x] models + migrations + validações + seeds (6 usuários, 31 anúncios)
- [x] `ListingsController` CRUD + filtros + paginação, `StatsController`, serializers, `rescue_from`
- [x] auth JWT (`JsonWebToken` + helpers na `ApplicationController`), `has_secure_password`, rate limit, rack-cors
- [x] **Check:** 39 testes / 98 asserções verdes, rubocop e brakeman limpos
- Decisão: o JWT é assinado com `secret_key_base` — sem `JWT_SECRET` separado para configurar no Fly.

### Fase 2 — Deploy da API (Dia 5) — ✅ concluída
- [x] App `vortex-marketplace-api` em `gru`, volume `vortex_data` (1GB) montado em `/rails/storage`
- [x] Secrets `RAILS_MASTER_KEY` e `FRONTEND_ORIGIN` (`http://localhost:5173,https://ocauapaz.github.io`)
- [x] `fly deploy --remote-only` — no ar em **https://vortex-marketplace-api.fly.dev**
- [x] Verificado: `/api/v1/stats` 200, login + `/me` com JWT, dados sobrevivem a restart da máquina
- Seeds rodaram sozinhas: o `bin/docker-entrypoint` do Rails 8 chama `db:prepare`, que semeia
  quando o banco acabou de ser criado. Não precisa de `fly ssh console`.
- `HTTP_PORT=8080`: o container roda como uid 1000 e não tem permissão para escutar na 80.

### Fase 3 — Frontend funcional (Dias 6–9) — ✅ concluída
- [x] Tailwind v4, layout base, `lib/api.ts`, rotas com `BrowserRouter` + basename
- [x] Explorar com filtros na URL, busca com debounce, paginação, estados de loading/erro/vazio
- [x] Login/Cadastro, rota protegida, Novo anúncio com prévia ao vivo, Meus anúncios
- [x] Landing (herói, estatísticas, como funciona, vitrine com filtro)
- [x] Identidade refeita na linguagem UNIFOR + Vortex
- [x] Animações adiantadas da Fase 4: reveals com Motion, parallax e contadores com GSAP
- Decisão: `useAsync` faz stale-while-revalidate. A primeira versão descartava os dados
  ao trocar de filtro e a grade piscava em branco entre uma resposta e outra.

### Fase 4 — PWA + polimento (Dias 10–12) — ✅ concluída
- [x] `vite-plugin-pwa` (generateSW): manifest válido, ícones 192/512 + maskable + apple-touch,
      precache de 19 arquivos (702 KiB), `navigateFallback` para as rotas do SPA
- [x] `NetworkFirst` para `/api/v1/` e `CacheFirst` para imagens — **verificado com a API derrubada**:
      a vitrine recarregou com 12 cards e "31 resultados" vindos do cache
- [x] Aviso de offline no topo quando `navigator.onLine` é falso
- [x] Motion (transições, reveals, stagger) e GSAP (parallax, contadores), com `prefers-reduced-motion`
- [x] 375px sem overflow horizontal, barra inferior de app aparecendo só no mobile
- Armadilha: `urlPattern` de RegExp que não casa desde o **início** da URL é ignorado pelo Workbox
  em requisições cross-origin — e a API sempre é cross-origin. As regras usam função.
- Pendente para a Fase 5: instalar no celular de verdade e rodar o Lighthouse.

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
