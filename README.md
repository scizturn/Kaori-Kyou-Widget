# Kaori Nusantara Widget

A lightweight, zero-dependency JavaScript widget that displays related product recommendations in a responsive carousel. Designed to be embedded on any webpage with minimal configuration.

## Features

- Auto-collects page tags and searches for related products
- Responsive carousel with adaptive column layout (2 / 3 / 4 columns)
- Detects container size changes via `ResizeObserver` — works even when moved between containers
- Skeleton loading state while data is being fetched
- Graceful fallback to random products when tags yield no results
- Timeout-safe — all network requests abort cleanly and fall through to fallback
- No dependencies, no build step required

## Installation

Include the script at the bottom of your page:

```html
<script src="kaori-nusantara.js"></script>
```

The widget will mount itself automatically after the element matched by `mountAfterSelector`.

## Configuration

Override defaults by defining `window.KaoriKyouWidgetConfig` **before** the script loads:

```html
<script>
  window.KaoriKyouWidgetConfig = {
    autoSlideMs: 4000,
    bannedKeywords: ['seiyu', 'example'],
    maxSourceTags: 20
  };
</script>
<script src="kaori-nusantara.js"></script>
```

### Available Options

| Option | Default | Description |
|---|---|---|
| `tagContainerSelector` | `'.td-tags'` | Selector for the tag container element |
| `tagLinkSelector` | `'.td-tags a'` | Selector for individual tag links |
| `mountAfterSelector` | `'.td-tags'` | Widget inserts itself after this element |
| `widgetId` | `'kaori-kyou-widget'` | HTML id applied to the widget element |
| `maxSourceTags` | `50` | Max tags collected from the page |
| `maxValidTags` | `50` | Max tags used after validation |
| `bannedKeywords` | `['seiyu']` | Tags containing these words are ignored |
| `validationLimit` | `12` | Results required per tag to consider it valid |
| `resultLimit` | `40` | Max search results fetched |
| `fallbackRenderLimit` | `40` | Max items shown in fallback mode |
| `minResultsToShow` | `1` | Minimum results required to render the widget |
| `minTagResults` | `12` | Threshold to trigger per-tag fallback search |
| `timeoutMs` | `8000` | Network request timeout in milliseconds |
| `randomPoolSize` | `40` | Pool size for random fallback items |
| `randomSort` | `'newest'` | Sort order for fallback items |
| `autoSlideMs` | `5000` | Auto-slide interval in milliseconds |

> `searchEndpoint` and `searchPageBaseUrl` are managed internally.

## How It Works

1. **Tag collection** — Reads anchor tags from `tagLinkSelector` on the current page
2. **Validation** — Each tag is queried; tags with no results are dropped
3. **Search** — Validated tags are combined into a single query
4. **Per-tag fallback** — If combined results are below threshold, each tag is queried individually
5. **Random fallback** — If all tag searches yield too few results, random available products are shown
6. **Render** — Results are rendered as a paginated carousel

## Responsive Layout

The carousel automatically adjusts its column count based on the widget's actual rendered width:

| Widget width | Layout |
|---|---|
| `< 460px` | 2 columns × 2 rows (4 items/page) |
| `460px – 639px` | 3 columns × 2 rows (6 items/page) |
| `≥ 640px` | 4 columns × 2 rows (8 items/page) |

Layout recalculates via `ResizeObserver` whenever the widget's size changes — including when moved to a different container or when the viewport is resized or rotated.

## Browser Support

Requires a browser with `Promise` and `fetch` support. `ResizeObserver` is used when available (all modern browsers); older browsers fall back to `window resize` / `orientationchange` listeners. `AbortController` is used when available for clean request cancellation.

## License

Internal use only.
