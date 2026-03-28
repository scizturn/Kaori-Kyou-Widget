# Kyou Kaori Embed

Embeddable sidebar widget for Kaori pages that matches article topic/tags to Kyou product data.

Main file:
- `Kyou-Embed.js`

## Features

- Shadow DOM widget (isolated from host CSS)
- Default size `280 x 280` (square)
- Big-image carousel (1 full-canvas item per slide)
- Auto-slide horizontal carousel
- Kaori article context flow:
  - read `articleId/context`
  - fetch Kaori article
  - build payload `{ title, tags, category }`
  - call Kyou API
  - render widget
- Item fields displayed:
  - item name (title)
  - image
  - manufacturer
  - series (description with manufacturer)
- Item title sanitization:
  - removes bracket tags like `[Promo] [Mono Goods] ...`

## Project Files

- `Kyou-Embed.js`  
  Production embed script.
- `test-payload.html`  
  Local tester to inspect payload, call APIs, and preview widget.
- `README-integration.md`  
  Integration notes.
- `README-custom-api-id.md`  
  API customization notes.

## Basic Embed Usage

```html
<script
  src="https://your-cdn.com/Kyou-Embed.js"
  data-article-id="12345"
  data-context="news"
  data-kaori-api-base="https://api.kaori.com"
  data-kaori-article-path="/articles/{id}"
  data-kyou-api-base="https://search.kyou.id/v1/search"
  data-kyou-mode="mitsuha-search"
  data-kyou-search-path=""
  data-widget-width="280"
  data-widget-height="280"
></script>
```

## Config (`data-*`)

- `data-article-id` article ID
- `data-context` page context
- `data-tags` optional tags override (comma-separated)
- `data-kaori-api-base` Kaori API base
- `data-kaori-article-path` default `/articles/{id}`
- `data-kyou-api-base` Kyou API base
- `data-kyou-mode`:
  - `mitsuha-search` (GET query search)
  - `recommendation` (POST recommendation payload)
- `data-kyou-search-path` extra search path (usually empty if base already ends with `/search`)
- `data-kyou-recommend-path` default `/recommendations`
- `data-api-key` optional bearer token
- `data-max-items` max carousel items (default `3`)
- `data-widget-width` default `280`
- `data-widget-height` default `280`
- `data-target` optional CSS selector mount target

## API Contracts

### Kaori API (article context)

Request:
- `GET {kaoriApiBase}/articles/{id}`

Expected response:

```json
{
  "data": {
    "title": "Article Title",
    "tags": ["anime", "figure"],
    "category": "news"
  }
}
```

### Kyou API

#### Mode: `mitsuha-search`

Request:
- `GET {kyouApiBase}{kyouSearchPath}?q=...&sort=kyou_search_score&sold=false&excludeFilters=true&page=1,12`

Expected item fields:

```json
{
  "id": 123,
  "name": "Item Name",
  "icon_link": "https://...",
  "image_link": "https://...",
  "manufacturer": "Good Smile Company",
  "series": ["Blue Archive"],
  "characters": ["Shiroko"]
}
```

#### Mode: `recommendation`

Request:
- `POST {kyouApiBase}{kyouRecommendPath}`

Payload:

```json
{
  "articleId": "12345",
  "context": "news",
  "title": "Article Title",
  "tags": ["anime", "figure"],
  "category": "news"
}
```

## Local Testing

1. Open `test-payload.html` in browser.
2. Fill Kaori and Kyou API base URLs.
3. Click:
   - `Build Payload`
   - `Call Kaori`
   - `Call Kyou`
   - `Load Widget`
4. Compare payload and API responses with rendered widget.

