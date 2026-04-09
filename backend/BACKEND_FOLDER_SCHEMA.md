# URL Shortener — Node.js folder & file schema

Այս փաստաթուղթը նկարագրում է **ամբողջական** backend կառուցվածքը `README.md`-ի և `manvel-lambaryan-backend-tasks.md`-ի հիման վրա (Users, ShortURLs, Tags, Clicks, Analytics, redirect↔click hook)։ Նպատակը՝ մեկ անգամ սահմանել մոդուլները, validation-ը, middleware-ները, logging-ը և error handling-ը, որպեսզի հետագայում ֆայլեր չփոխարինվեն «նորից ավելացնելով»։

**Stack ենթադրություն (փոփոխելի).** Node.js (ESM `.js`) + HTTP framework (Express/Fastify) + PostgreSQL + migration tool (Prisma/Drizzle/Knex) + request validation (Zod/Joi) + structured logging (Pino)։

---

## Root (`backend/`)

| Path | Նպատակ |
|------|--------|
| `package.json` | Dependencies, scripts (`dev`, `build`, `start`, `test`, `migrate`, `lint`) |
| `jsconfig.json` | (ըստ ցանկության) path / editor hints JavaScript-ի համար |
| `.env.example` | `PORT`, `DATABASE_URL`, `LOG_LEVEL`, (ըստ անհրաժեշտության `NODE_ENV`) — **առանց գաղտնաբառերի** |
| `.gitignore` | `node_modules`, `.env`, `dist`, coverage, logs |
| `README.md` | (ըստ ցանկության) տեղային գործարկում, migrate, env |
| `BACKEND_FOLDER_SCHEMA.md` | Այս ֆայլը — կառուցվածքի քարտեզ |

---

## Source (`src/`)

### Entry & app bootstrap

| Path | Նպատակ |
|------|--------|
| `src/main.js` | Պրոցեսի մուտք — load env, connect DB, start server |
| `src/app.js` | HTTP app factory (router-ների կցում, global middleware-ներ, **առանց** listen) — unit/integration test-երի համար |

---

### Config (`src/config/`)

| Path | Նպատակ |
|------|--------|
| `src/config/env.js` | Վավերացված env (սխալ config-ի դեպքում process exit կամ հստակ սխալ) |
| `src/config/logger.js` | Pino (կամ այլ) logger instance, log level |
| `src/config/database.js` | DB client singleton / pool կարգավորում (կամ re-export ORM client) |

---

### Database (`database/` repo root-ում կամ `src/db/`)

Ընտրիր **մեկ** մոտեցում և պահիր մեկ տեղում.

**Տարբերակ A — Prisma**

| Path | Նպատակ |
|------|--------|
| `prisma/schema.prisma` | `User`, `ShortURL`, `Tag`, `ShortURLTag` (junction), `Click` — կապերը README-ի հետ |
| `prisma/migrations/` | Գեներացված migration-ներ |
| `prisma/seed.js` | (ըստ ցանկության) dev տվյալներ |

**Տարբերակ B — Drizzle/Knex**

| Path | Նպատակ |
|------|--------|
| `src/db/schema/` | `users.js`, `short_urls.js`, `tags.js`, `short_url_tags.js`, `clicks.js` |
| `migrations/` | SQL կամ tool-ի migration ֆայլեր |
| `src/db/client.js` | Կապ client-ի հետ |

**Ընդհանուր**

| Path | Նպատակ |
|------|--------|
| `src/db/index.js` | Public exports (queries-ի մուտքի կետ, եթի պետք է) |

---

### Domain types (DTO / plain types, առանց framework-ի կախվածության)

| Path | Նպատակ |
|------|--------|
| `src/types/domain/user.types.js` | User presentation types |
| `src/types/domain/url.types.js` | ShortURL, redirect response |
| `src/types/domain/tag.types.js` | Tag, junction |
| `src/types/domain/click.types.js` | `device`: `mobile \| desktop \| tablet \| unknown` |
| `src/types/domain/analytics.types.js` | Daily/device aggregates, top URLs |
| `src/types/http/http.types.js` | Pagination, query params types |
| `src/types/express.js` | (Express) JSDoc typedefs կամ `// @ts-check` — `requestId` և այլն |

---

### Errors (`src/errors/`)

| Path | Նպատակ |
|------|--------|
| `src/errors/AppError.js` | Base class — `statusCode`, `code`, `isOperational` |
| `src/errors/codes.js` | Սիմվոլիկ error code-ներ (CONFLICT_EMAIL, NOT_FOUND_URL, GONE_EXPIRED, …) |
| `src/errors/httpStatus.js` | (ըստ ցանկության) ánhամակարգելի map error→response |

---

### Logging (`src/logging/`)

| Path | Նպատակ |
|------|--------|
| `src/logging/logger.js` | Re-export config logger |
| `src/logging/requestContext.js` | (ըստ ցանկության) requestId / async context |

---

### Middleware (`src/middleware/`)

| Path | Նպատակ |
|------|--------|
| `src/middleware/errorHandler.js` | Կենտրոնացված սխալներ — `AppError`, validation errors, անհայտ → 500 |
| `src/middleware/notFoundHandler.js` | 404 անհայտ route-ների համար |
| `src/middleware/requestId.js` | `X-Request-Id` header |
| `src/middleware/requestLogger.js` | HTTP request/response log (method, path, status, duration) |
| `src/middleware/validateBody.js` / `validateQuery.js` | Ընդհանուր wrapper Zod/Joi schema-ների համար |

---

### Validation schemas (`src/validation/`)

Յուրաքանչյուր feature-ի **input** սխեմաներ (body/query/params) — մեկ տեղում, controller-ից առանձին.

| Path | Նպատակ |
|------|--------|
| `src/validation/users.schema.js` | `POST /users` — name, email |
| `src/validation/urls.schema.js` | `POST /urls` — original_url, expires_at, user_id (ըստ թիմային որոշման) |
| `src/validation/tags.schema.js` | `POST .../tags` — tag_id կամ tag_name |
| `src/validation/clicks.schema.js` | `POST .../click` — device enum, IP-ի աղբյուր |
| `src/validation/analytics.schema.js` | `from`/`to` query date range (bonus) |
| `src/validation/params.schema.js` | `short_code`, `id` params |

---

### Integrations (Mane ↔ Manvel hook)

| Path | Նպատակ |
|------|--------|
| `src/integrations/clickRecording.js` | Interface `recordClick(shortUrlId, meta)` + implementation (DB insert into `Click`) |
| `src/integrations/index.js` | Export — `GET /urls/:short_code` handler-ը redirect-ից առաջ/հետո կանչում է այստեղ |

README-ի պահանջը՝ redirect-ից հետո/միևնույն request-ում click գրանցում — **մեկ** կանչելի կետ։

---

### Modules — feature-based (`src/modules/`)

Յուրաքանչյուր մոդուլ՝ **routes → controller → service → repository** (կամ thin controller + service միայն, եթի ORM-ը պարզ է)։

#### `src/modules/users/`

| Path | Նպատակ |
|------|--------|
| `users.routes.js` | `POST /users` |
| `users.controller.js` | HTTP կոդեր, 201/409 |
| `users.service.js` | Բիզնես կանոններ |
| `users.repository.js` | DB — create user, find by email/id |

#### `src/modules/urls/`

| Path | Նպատակ |
|------|--------|
| `urls.routes.js` | `POST /urls`, `GET /urls/:short_code`, `DELETE /urls/:short_code`, `GET /urls` (bonus tag filter) |
| `urls.controller.js` | 302 redirect, 404, 410, կանչ `clickRecording` |
| `urls.service.js` | short_code գեներացիա + retry, expires ստուգում |
| `urls.repository.js` | CRUD short_url, find by code, list by user, filter by tag (JOIN) |

#### `src/modules/tags/`

| Path | Նպատակ |
|------|--------|
| `tags.routes.js` | Nest under `/urls/:short_code/tags` կամ mount `urls`-ից |
| `tags.controller.js` | |
| `tags.service.js` | Duplicate tag → 409, նոր Tag ստեղծում |
| `tags.repository.js` | Junction insert, list by short_url |

#### `src/modules/clicks/` (Mane)

| Path | Նպատակ |
|------|--------|
| `clicks.routes.js` | `POST /urls/:short_code/click` |
| `clicks.controller.js` | |
| `clicks.service.js` | `clicked_at` auto, device validation |
| `clicks.repository.js` | Insert click |

#### `src/modules/analytics/` (Mane)

| Path | Նպատակ |
|------|--------|
| `analytics.routes.js` | total, daily, devices, user aggregate, top 5, date range bonus |
| `analytics.controller.js` | |
| `analytics.service.js` | Thin — կանչում է repository |
| `analytics.repository.js` | **Aggregation SQL** — group by day/device, top 5, user totals (**առանց** app-level sort մեծ aggregations-ի համար) |

#### `src/modules/health/` (ըստ ցանկության բայց production-ում օգտակար)

| Path | Նպատակ |
|------|--------|
| `health.routes.js` | `GET /health` — DB ping |

---

### Routes composition (`src/routes/`)

| Path | Նպատակ |
|------|--------|
| `src/routes/index.js` | Բոլոր մոդուլների router-ների միավորում, API prefix (`/v1` — ըստ ցանկության) |
| `src/routes/registerRoutes.js` | (ըստ ցանկության) `app.use` կենտրոնացված |

---

### Lib / utilities (`src/lib/`)

| Path | Նպատակ |
|------|--------|
| `src/lib/shortCode.js` | 6 նիշ `a-zA-Z0-9`, retry loop |
| `src/lib/urlValidation.js` | original_url validation |
| `src/lib/asyncHandler.js` | Express async wrapper (եթի պետք է) |

---

## Tests (`tests/` կամ `src/**/*.test.js`)

| Path | Նպատակ |
|------|--------|
| `tests/setup.js` | Test DB, env |
| `tests/integration/users.test.js` | |
| `tests/integration/urls.test.js` | redirect, 410, 404 |
| `tests/integration/tags.test.js` | |
| `tests/integration/clicks.test.js` | |
| `tests/integration/analytics.test.js` | aggregation assertions |
| `tests/unit/shortCode.test.js` | |
| `tests/unit/validation.test.js` | (ըստ ցանկության) |

---

## Scripts (`scripts/`)

| Path | Նպատակ |
|------|--------|
| `scripts/check-env.mjs` | (ըստ ցանկության) CI-ում env validation |

---

## Endpoint → ֆայլեր արագ քարտեզ (README)

| Endpoint | Module / նշում |
|----------|----------------|
| `POST /users` | `modules/users` |
| `POST /urls` | `modules/urls` |
| `GET /urls/:short_code` | `modules/urls` + `integrations/clickRecording` |
| `GET /users/:id/urls` | `modules/urls` repository |
| `DELETE /urls/:short_code` | `modules/urls` — FK `Click` քաղաքականություն |
| `POST/GET .../tags` | `modules/tags` |
| `GET /urls?tag=` | `modules/urls` — JOIN query |
| `POST .../click` | `modules/clicks` |
| `GET .../analytics*` | `modules/analytics` |
| `GET /users/:id/analytics` | `modules/analytics` |
| `GET /urls/top` | `modules/analytics` |

---

## Ամփոփում

- **Models** → DB շերտում (`prisma/schema` կամ `db/schema`), ոչ թե առանձին «անիմաստ» duplicate class-ներ, եթի ORM-ը բավարար է։
- **Validation** → `src/validation/*.schema.js` + middleware.
- **Middleware** → error, notFound, requestId, logging, validate.
- **Logging** → `config/logger` + `middleware/requestLogger`.
- **Errors** → `errors/AppError` + `middleware/errorHandler`.
- **Mane/Manvel կապ** → `integrations/clickRecording` մեկ կետ։

Այս սխեմայից հետո նոր ֆայլերի անհրաժեշտությունը հիմնականում կլինի **նոր feature** կամ **infrastructure** (Redis, rate limit), ոչ թե «մոռացած» infrastructure։
