# Manvel Lambaryan — Backend Implementation Tasks (URL Shortener)

Այս փաստաթուղթը նկարագրում է **միայն** Manvel Lambaryan-ի պատասխանատվության դաշտը՝ ըստ իրականացման տրամաբանական հերթականության։ Տեխնիկական անունները (endpoint-ներ, դաշտեր) համընկնում են `README.md`-ի հետ։

---

## Կատարման վիճակ (ստուգված `backend/`-ում, codebase-ի հետ համաձայնեցված)

| Փուլ | Վիճակ | Նշում |
| --- | --- | --- |
| **0 — Նախապատրաստում** | ✅ | Node 20+ / Express, `backend/package.json`; `backend/src/config/env.js` (Zod — `DATABASE_URL`, `PORT`, `NODE_ENV`); `backend/.gitignore` (`node_modules`, `.env`, …); PostgreSQL + Prisma (`backend/prisma/`, migrations) |
| **1.1 — User** | ✅ | `users` աղյուսակ, `email` unique, app-ում email validation (`zod`), migration `20260409134000_init_users` |
| **1.2 — ShortURL** | ✅ | `short_urls`, FK → `users`, `short_code` unique, user delete → **CASCADE** (տես `schema.prisma` / migration `20260409135349_add_short_urls`) |
| **1.3 — Tag** | ✅ | `tags`, `name` unique, migration `20260409144158_add_tags` |
| **1.4 — ShortURL_Tag** | ✅ | `short_url_tags`, composite PK `(short_url_id, tag_id)`, `@@index([tag_id])`, migration `20260409144955_add_short_url_tags` |
| **2 — Short code** | ✅ | `backend/src/lib/shortCode.js` — `generateShortCode()` (6 նիշ `a-zA-Z0-9`, `crypto.randomInt`), `withUniqueShortCode()` — P2002 `short_code`-ի վրա retry |
| **3 — POST /users** | ✅ | `POST /users` → 201, conflict 409 (`P2002`), validation |
| **4** | ✅ | `POST /urls`, `GET /urls/:short_code` (302, 404, 410); `user_id` body-ում |
| **5** | ✅ | `GET /users/:id/urls` — 404 user-ի չլինելիս, 200 JSON զանգված, `id`-ի UUID validation |
| **6 — DELETE** | ✅ | `DELETE /urls/:short_code` — 404, **204 No Content** (hard delete; `short_url_tags` CASCADE) |
| **7 — Tags** | ✅ | `POST/GET /urls/:short_code/tags`; body՝ `tag_name` **կամ** `tag_id` (`.strict()`); կրկնակի → **409**; կցում → **201** + `{ id, name }` |
| **8 — Bonus** | ❌ | `GET /urls?tag=:name` |
| **9 — DoD** | ⏳ | Տես ստորև checkbox-ները |

**Արագ ցուցակ (endpoint priority).** 1 ✅ · 2 (lib) ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ · 7 ✅ · 8 ❌

---

## Կապը մյուս մասի հետ (կարճ)

- `GET /urls/:short_code` redirect-ից **հետո** (կամ նույն request-ի մեջ, համաձայնեցված կերպով) Mane-ի կողմից պետք է արձանագրվի click-ը (`ShortURL`-ի `id`-ով)։ Սա **պայմանավորված** վարք է՝ նախապես համաձայնեցրեք hook-ի տեղը (middleware, event, ուղղակի կանչ)։
- Այս task-երի շրջանակում դու կառուցում ես `User`, `ShortURL`, `Tag`, `ShortURL_Tag` և համապատասխան API-ները։

---

## Փուլ 0 — Նախապատրաստում ✅

1. ✅ Ընտրիր stack-ը (օր. Node/Express, Nest, Go, Python/FastAPI և այլն) և dependency management-ը։
2. ✅ Սահմանիր `.env` կառուցվածքը (DB connection, port, secret keys եթե պետք լինեն) — **գաղտնաբառեր չգրել repo-ում**։
3. ✅ Ավելացրու `.gitignore` (node_modules, .env, build artifacts) եթե դեռ չկա։ (`backend/.gitignore`)
4. ✅ Պայմանավորվիր DB-ի մասին (PostgreSQL / SQLite dev / այլ) և migration tool-ի հետ (օր. Prisma, Drizzle, Alembic, migrate)։

---

## Փուլ 1 — Տվյալների մոդել և սխեմա

### 1.1 User ✅

| Դաշտ | Պահանջ |
| --- | --- |
| `id` | Primary key (UUID կամ auto-increment — ընտրիր մեկը և հետևողական եղիր) |
| `name` | Պարտադիր տող |
| `email` | Պարտադիր, **յուրահատուկ** ամբողջ համակարգում |
| `created_at` | Timestamp, ստեղծման պահ |

**Task-եր.**

1. ✅ Սահմանիր `User` աղյուսակը / մոդելը migration-ով։
2. ✅ Ավելացրու `email`-ի unique constraint։
3. ✅ (Կամայական բայց խորհուրդ է տրվում) Email format validation application շերտում։

### 1.2 ShortURL ✅

| Դաշտ | Պահանջ |
| --- | --- |
| `id` | PK |
| `user_id` | FK → `User.id` |
| `original_url` | Պարտադիր (վավեր URL validation app շերտում) |
| `short_code` | Պարտադիր, **յուրահատուկ** ամբողջ համակարգում |
| `created_at` | Timestamp |
| `expires_at` | Nullable timestamp |

**Task-եր.**

1. ✅ Սահմանիր `ShortURL` աղյուսակը FK-ով `User`-ին։
2. ✅ `short_code`-ի վրա unique index։
3. ✅ Սահմանիր `ON DELETE` քաղաքականությունը `user` ջնջելիս — ընտրություն՝ **CASCADE** (user-ի ջնջման ժամանակ ջնջվում են նրա բոլոր `short_urls`-ը)։

### 1.3 Tag ✅

| Դաշտ | Պահանջ |
| --- | --- |
| `id` | PK |
| `name` | Պարտադիր (կարող ես unique դարձնել tag name-ը, եթե համակարգում մեկ անուն = մեկ tag) |

**Task-եր.**

1. ✅ Սահմանիր `Tag` աղյուսակը (`schema.prisma`, migration `20260409144158_add_tags`)։
2. ✅ `name`-ի unique constraint migration-ով (`tags_name_key`)։

### 1.4 ShortURL_Tag (many-to-many) ✅

| Դաշտ | Պահանջ |
| --- | --- |
| `short_url_id` | FK → `ShortURL.id` |
| `tag_id` | FK → `Tag.id` |

**Task-եր.**

1. ✅ Սահմանիր junction աղյուսակը composite primary key `(short_url_id, tag_id)` կամ surrogate `id` + **unique** `(short_url_id, tag_id)` — README-ի պահանջը՝ *նույն tag-ը երկու անգամ նույն short URL-ին չի կարող կպչել*։ *(իրականացված է composite PK-ով `short_url_tags` աղյուսակում, migration `20260409144955_add_short_url_tags`)*
2. ✅ Ավելացրու անհրաժեշտ index-ներ lookup-ների համար։ *(կա `@@index([tag_id])` — tag-ով filter/JOIN-ների համար)*

---

## Փուլ 2 — Short code գեներացիա ✅

1. ✅ Իրականացրու ֆունկցիա, որը գեներացնում է **6 նիշ** (օր. `a-zA-Z0-9`) — `generateShortCode()` (`backend/src/lib/shortCode.js`)։
2. ✅ **Միակության** ապահովում՝ insert-ի ժամանակ collision-ի դեպքում նորից գեներացիա (կամ DB-ում retry loop) մինչև հաջողություն — `withUniqueShortCode(attempt)` (Prisma `P2002` `short_code`-ի վրա → նոր code)։
3. ✅ Մի վստահի միայն հավանականությամբ՝ production-ում պարտադիր է unique constraint-ի հետ համակցված retry — DB-ում `short_urls.short_code` @unique + retry loop։

---

## Փուլ 3 — API — User ✅

### `POST /users` — Register a user

**Հերթական task-եր.**

1. ✅ Request body-ում ընդունիր `name`, `email` (և չափերի/форматի validation)։
2. ✅ Եթե `email` արդեն գոյություն ունի — վերադարձրու **409 Conflict** (կամ համաձայնեցված այլ կոդ, բայց պետք է consistent լինի)։
3. ✅ Հաջողության դեպքում — **201 Created** և response body-ում user-ի ներկայացում (առնվազն `id`, `name`, `email`, `created_at`)։

---

## Փուլ 4 — API — Short URL ստեղծում և redirect ✅

### `POST /urls` — Create a short URL

**Նախապայմաններ (ընտրիր մեկ մոտեցում և փաստաթղթագրիր).**

- Auth header / API key, կամ
- Request body-ում `user_id`, կամ
- Session — **պետք է համաձայնեցված լինի թիմում**։

**Հերթական task-եր.**

1. Վավերացրու `original_url` և optional `expires_at` (եթե փոխանցվում է)։
2. Կապի `user_id`-ը (որպես ներկա user)։
3. Գեներացրու `short_code` (Փուլ 2)։
4. Պահպանիր DB-ում։
5. Վերադարձրու **201** և ստեղծված ռեսուրսի ներկայացում (`short_code`, `original_url`, `expires_at`, …)։

### `GET /urls/:short_code` — Redirect to original URL

**Հերթական task-եր.**

1. Գտիր `short_code`-ով `ShortURL`։
2. **Չկա** — **404 Not Found**։
3. **Կա**, բայց `expires_at` սահմանված է և **ընթացիկ ժամանակը անցել է** — **410 Gone** (README պահանջ)։
4. **Կա և վավեր է** — **302/301 redirect** `Location: original_url`։
5. **Կոորդինացիա Mane-ի հետ.** redirect-ից առաջ/հետո click-ի գրանցումը — մեկ ընդհանուր պայմանավորված hook (այս task-ը blocking չէ Manvel-ի մնացած մասերի համար, բայց integration-ի համար պարտադիր)։

---

## Փուլ 5 — API — User-ի URL-ների ցուցակ ✅

### `GET /users/:id/urls`

**Հերթական task-եր.**

1. ✅ Եթե `User` `id`-ով չկա — **404**։
2. ✅ Վերադարձրու այդ user-ի բոլոր `ShortURL`-երը (ըստ անհրաժեշտության pagination — bonus, README-ում պարտադիր չէ)։
3. ✅ **200 OK** և զանգված JSON։

---

## Փուլ 6 — API — Ջնջում ✅

### `DELETE /urls/:short_code`

**Հերթական task-եր.**

1. ✅ Գտիր `short_code`-ով։
2. ✅ Չկա — **404**։
3. ✅ Կա — ջնջիր (կամ soft delete, եթե թիմը այդպես է որոշել — README-ում hard delete է ենթադրվում)։
4. ✅ Հիշիր FK-երը Mane-ի `Click`-ի հետ — ջնջումը կարող է պահանջել CASCADE կամ նախապես click-երի քաղաքականություն (համաձայնեցրու)։ *(ներկա սխեմայում `Click` չկա; `short_url_tags` → CASCADE `schema.prisma`-ում)*
5. ✅ **204 No Content** (ընտրություն՝ հետևողական)։

---

## Փուլ 7 — API — Tags ✅

### `POST /urls/:short_code/tags` — Attach a tag

**Հերթական task-եր.**

1. ✅ Եթե `short_code` չկա — **404**։
2. ✅ Request body՝ **կամ** `{ "tag_name": string }` **կամ** `{ "tag_id": uuid }` (`z.union` + `.strict()` — երկուսը միասին չեն)։
3. ✅ `tag_name` — `Tag` find-or-create (`upsert` անունով); `tag_id` — պետք է գոյություն ունենա, հակառակ դեպքում **404** (`NOT_FOUND_TAG`)։
4. ✅ **Կրկնակի tag նույն URL-ին** — **409 Conflict** (`CONFLICT_TAG_DUPLICATE`, Prisma `P2002` junction-ում)։
5. ✅ **201 Created** + `{ "id", "name" }`։

### `GET /urls/:short_code/tags` — List tags

**Հերթական task-եր.**

1. ✅ Չկա `short_code` — **404**։
2. ✅ **200** — `{ id, name }[]` (name-ով **asc**)։

---

## Փուլ 8 — Bonus ❌

### `GET /urls?tag=:name`

1. Վերադարձրու բոլոր `ShortURL`-երը, որոնք կապված են տրված `name`-ով tag-ին։
2. Ուղղի DB query-ով (JOIN), ոչ թե N+1 filter-ով app memory-ում մեծ տվյալների համար։

---

## Փուլ 9 — Վերջնական ստուգում (Definition of Done)

- [ ] Բոլոր endpoint-ները README-ի աղյուսակին համապատասխան են։ *(կան նաև փուլ 7 tag endpoint-ները; մնացածը՝ փուլ 8 bonus)*
- [x] `short_code` auto-generated, 6 նիշ, unique։
- [x] `GET /urls/:short_code` — 404 / 410 / redirect վարքը ճիշտ է։
- [x] Նույն short URL-ին նույն tag-ը երկու անգամ չի կպչում — **DB**-ում `short_url_tags` composite PK + **409** `POST .../tags`-ում կրկնակիի համար։
- [x] HTTP կոդերը և validation-ը հստակ են։ *(կիրառված է `POST /users`, `GET /users/:id/urls` և URL endpoint-ների համար; մնացածը՝ փուլ 6–7)*
- [ ] (Թիմային) Redirect + click գրանցման hook-ը համաձայնեցված է Mane-ի հետ։

---

## Հավելված — Endpoint-ների արագ ցուցակ (առաջնահերթություն իրականացման)

1. ✅ `POST /users`
2. ✅ `POST /urls` (+ short code generation)
3. ✅ `GET /urls/:short_code` (redirect + 404/410)
4. ✅ `GET /users/:id/urls`
5. ✅ `DELETE /urls/:short_code`
6. ✅ `POST /urls/:short_code/tags`
7. ✅ `GET /urls/:short_code/tags`
8. ❌ (Bonus) `GET /urls?tag=:name`

Այս հերթականությամբ կարող ես աստիճանաբար integration test անել՝ յուրաքանչյուր փուլ ավարտելուց հետո։
