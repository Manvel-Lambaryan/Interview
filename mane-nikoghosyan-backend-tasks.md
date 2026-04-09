# Mane Nikoghosyan — Backend Implementation Tasks (Click Tracking & Analytics)

Այս փաստաթուղթը նկարագրում է **միայն** Mane Nikoghosyan-ի պատասխանատվության դաշտը՝ ըստ իրականացման տրամաբանական հերթականության։ Տեխնիկական անունները (endpoint-ներ, դաշտեր) համընկնում են `README.md`-ի հետ։

---

## Կատարման վիճակ (ստուգված workspace-ում, `README.md`-ի հետ համաձայնեցված)

| Փուլ | Վիճակ | Նշում |
| --- | --- | --- |
| **0 — Նախապատրաստում** | ✅ | Mane-ի clicks մասը տեղափոխված/միացված է runnable backend-ի ներսում՝ `Manvelbackend/src/modules/clicks/`, route/validation/service շերտերով |
| **1 — Click entity** | ✅ | Prisma schema + migration ավելացված են runnable backend-ում՝ `Manvelbackend/prisma/schema.prisma`, `Manvelbackend/prisma/migrations/20260409170000_add_clicks/migration.sql` |
| **2 — POST /urls/:short_code/click** | ✅ | Կա route/controller/service/repository chain՝ `Manvelbackend/src/modules/clicks/` |
| **3 — GET /urls/:short_code/analytics** | ✅ | Իրականացված է total count aggregation-ով |
| **4 — GET /urls/:short_code/analytics/daily** | ✅ | Իրականացված է DB grouping + ascending date order-ով |
| **5 — GET /urls/:short_code/analytics/devices** | ✅ | Իրականացված է device grouping-ով |
| **6 — GET /users/:id/analytics** | ✅ | Միացված է `Manvelbackend/src/modules/users/` router/controller-ի հետ |
| **7 — GET /urls/top** | ✅ | Իրականացված է DB aggregation query-ով և top 5 limit-ով |
| **8 — Bonus** | ✅ | `from` / `to` query filtering-ը ավելացված է analytics endpoint-ներին |
| **9 — Integration with redirect** | ✅ | Redirect flow-ի click recording-ը live ստուգվել է աշխատող backend-ով |

**Արագ ցուցակ (endpoint priority).** 1 (entity) ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ · 7 ✅ · 8 ✅

---

## Կապը մյուս մասի հետ (կարճ)

- `Click.short_url_id`-ը հղվում է Manvel-ի `ShortURL.id`-ին։
- `GET /urls/:short_code` redirect-ի ժամանակ պետք է գրանցվի click-ը Mane-ի մասում։
- Integration-ի պայմանավորված կետը հիմա արդեն իրական կանչելի flow է `Manvelbackend/src/modules/urls/urls.controller.js`-ում (`recordRedirectClick(...)`)։

---

## Փուլ 0 — Նախապատրաստում ✅

1. Համաձայնեցրու նույն DB/schema contract-ը Manvel-ի մասի հետ, որպեսզի `clicks.short_url_id` FK-ն ճիշտ հղվի `short_urls.id`-ին։
2. Սահմանիր, թե click recording-ը կատարվելու է.
   `POST /urls/:short_code/click` endpoint-ով,
   կամ redirect controller-ից ուղիղ service/repository կանչով։
3. Եթե analytics-ը լինելու է նույն backend project-ի ներսում, սահմանիր modules/validation/routes կառուցվածքը մինչև implementation-ը։

---

## Փուլ 1 — Տվյալների մոդել և սխեմա ✅

### 1.1 Click ✅

| Դաշտ | Պահանջ |
| --- | --- |
| `id` | Primary key |
| `short_url_id` | FK → `ShortURL.id` |
| `clicked_at` | Timestamp, ավտոմատ current time |
| `ip_address` | Պարտադիր |
| `country` | Nullable |
| `device` | Nullable կամ enum-ով վերահսկվող արժեք |

**Task-եր.**

1. ✅ Սահմանիր `Click` աղյուսակը migration-ով — `Manvelbackend/prisma/migrations/20260409170000_add_clicks/migration.sql`։
2. ✅ `device`-ի համար ավելացրու enum/սահմանափակ արժեքներ — `click_device` enum և `src/modules/clicks/click.types.ts` (`mobile`, `desktop`, `tablet`, `unknown`)։
3. ✅ `clicked_at`-ը ավտոմատ set արա DB default-ով — `DEFAULT CURRENT_TIMESTAMP`։
4. ✅ Ավելացրու index-ներ analytics query-ների համար — `short_url_id`, `clicked_at`, `(short_url_id, clicked_at)`։
5. ✅ FK delete քաղաքականություն — `ON DELETE CASCADE`։

---

## Փուլ 2 — API — Click գրանցում ✅

### `POST /urls/:short_code/click` — Record a click event

**Հերթական task-եր.**

1. Գտիր `short_code`-ով համապատասխան `ShortURL`-ը։
2. Եթե `short_code`-ը գոյություն չունի — վերադարձրու **404 Not Found**։
3. Հավաքիր click metadata-ն.
   `short_url_id`՝ գտնված URL-ից,
   `ip_address`՝ request-ից,
   `country`՝ optional,
   `device`՝ միայն `mobile | desktop | tablet | unknown` արժեքներից։
4. Մի փորձիր client-ից պարտադրել `clicked_at` — այն պետք է auto-set արվի։
5. Պահպանիր click record-ը DB-ում։
6. Վերադարձրու հաջող response (օր. **201 Created** կամ թիմում համաձայնեցված այլ consistent կոդ)։

**Նշում.** Եթե redirect flow-ի մեջ այս endpoint-ը չի կանչվելու HTTP-ով, նույն business logic-ը միևնույն է պետք է պահել service/repository շերտում։

---

## Փուլ 3 — API — Total analytics ✅

### `GET /urls/:short_code/analytics`

**Հերթական task-եր.**

1. Գտիր `short_code`-ը։
2. Եթե չկա — **404**։
3. Հաշվիր տվյալ URL-ի բոլոր click-երի ընդհանուր քանակը DB aggregation-ով։
4. Վերադարձրու **200 OK** և count-ի ներկայացում (օր. `{ "total_clicks": number }`)։

---

## Փուլ 4 — API — Daily analytics ✅

### `GET /urls/:short_code/analytics/daily`

**Հերթական task-եր.**

1. Վավերացրու `short_code`-ը և գտիր URL-ը։
2. Եթե չկա — **404**։
3. Group արա click-երը ըստ օրվա DB query-ով։
4. Արդյունքը վերադարձրու **date ascending** կարգով։
5. Response-ը դարձրու հստակ JSON զանգված կամ object list (օր. `{ date, clicks }[]`)։

**README պահանջ.** sorting-ը պետք է լինի ascending ըստ ամսաթվի։

---

## Փուլ 5 — API — Device analytics ✅

### `GET /urls/:short_code/analytics/devices`

**Հերթական task-եր.**

1. Ստուգիր `short_code`-ը։
2. Եթե չկա — **404**։
3. Group արա click-երը ըստ `device` արժեքի DB aggregation-ով։
4. Վերադարձրու յուրաքանչյուր device type-ի count-ը։
5. Հաշվի առ `unknown` արժեքը որպես լիարժեք կատեգորիա։

---

## Փուլ 6 — API — User aggregate analytics ✅

### `GET /users/:id/analytics`

**Հերթական task-եր.**

1. Գտիր `User`-ը `id`-ով կամ JOIN-ով համոզվիր, որ user-ը գոյություն ունի։
2. Եթե user չկա — **404**։
3. Հաշվիր այդ user-ի բոլոր short URL-ների click-երի ընդհանուր քանակը։
4. Query-ն արա DB aggregation-ով (`users -> short_urls -> clicks`)։
5. Վերադարձրու **200 OK** և ընդհանուր clicks count-ը։

---

## Փուլ 7 — API — Top URLs ✅

### `GET /urls/top`

**Հերթական task-եր.**

1. DB մակարդակում հաշվիր ամենաշատ click ունեցող short URL-ները։
2. Վերադարձրու միայն **top 5** արդյունքը։
3. Sorting-ը և limiting-ը արա query-ի մեջ, ոչ թե app code-ում։
4. Արդյունքում ցանկալի է վերադարձնել առնվազն `short_code` և clicks count։

**README պահանջ.** Top URLs endpoint-ը պետք է օգտագործի aggregation, ոչ թե app-level sorting։

---

## Փուլ 8 — Bonus ✅

### `GET /urls/:short_code/analytics?from=DATE&to=DATE`

1. Ավելացրու query validation `from` / `to` դաշտերի համար։
2. Եթե `short_code` չկա — **404**։
3. Ֆիլտրիր analytics-ը տրված date range-ով DB query-ում։
4. Սահմանիր՝ range-ը inclusive է, թե exclusive, և պահիր consistent behavior։

---

## Փուլ 9 — Վերջնական ստուգում (Definition of Done) ✅

- [x] `Click` entity-ն migration-ով ստեղծված է և կապված է `ShortURL`-ին FK-ով։
- [x] `clicked_at`-ը auto-set է արվում current timestamp-ով։
- [x] `device` արժեքները սահմանափակված են `mobile`, `desktop`, `tablet`, `unknown` enum-ով։
- [x] `POST /urls/:short_code/click` endpoint-ը գրանցում է click event և վերադարձնում է consistent HTTP response։
- [x] Բոլոր analytics endpoint-ները աշխատում են DB aggregation-ով։
- [x] `GET /urls/:short_code/analytics/daily` արդյունքները sort են date ascending-ով։
- [x] `GET /urls/top` endpoint-ը վերադարձնում է top 5 most clicked short URLs և app-level sorting չի անում։
- [x] Redirect ↔ click integration-ը միացված է Manvel-ի `GET /urls/:short_code` flow-ի հետ։

**Live verification summary.** `npm ci`, `prisma generate`, `prisma migrate deploy`, local app startup (`PORT=3001`) և happy-path + 404 HTTP checks-ը հաջողությամբ անցել են։

---

## Հավելված — Endpoint-ների արագ ցուցակ (առաջնահերթություն իրականացման)

1. ✅ `POST /urls/:short_code/click`
2. ✅ `GET /urls/:short_code/analytics`
3. ✅ `GET /urls/:short_code/analytics/daily`
4. ✅ `GET /urls/:short_code/analytics/devices`
5. ✅ `GET /users/:id/analytics`
6. ✅ `GET /urls/top`
7. ✅ (Bonus) `GET /urls/:short_code/analytics?from=DATE&to=DATE`

Այս հերթականությամբ կարող ես նախ ավարտել click ingestion-ը, հետո կառուցել analytics aggregation-ները, և վերջում միացնել redirect integration-ը։
