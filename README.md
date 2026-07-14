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

```html
<script src="https://cdn.jsdelivr.net/gh/scizturn/Kaori-Kyou-Widget@master/script.js"></script>
```

The widget mounts itself automatically after the element matched by `mountAfterSelector`.

## Deployment

**`script.js` is a loader. The widget is `kaori-widget.js`.**

That split exists because of one header. WordPress loads `script.js` from jsDelivr, that URL is not
ours to change, and jsDelivr serves it as:

```
cache-control: public, max-age=604800, s-maxage=43200
```

A reader who has already opened one Kaori article keeps their copy for **seven days** without
touching the network, and jsDelivr only re-resolves `@master` to a commit every **12 hours** on top
of that. Neither can be purged — not by us, not by jsDelivr, not by Cloudflare. The header is
already in the reader's browser.

So the file at that URL can never be the thing we ship. It has to be something we are content to
have frozen for a week — a loader that should essentially never change again. The widget lives on
kyoucdn.id instead, where we own the cache headers and can purge in seconds.

```
WordPress ──▶ jsDelivr /script.js          (frozen ~7 days; never changes again)
                   │
                   ▼
              kyoucdn.id /kaori-widget.js  (the real widget; purgeable)
                   │  on error
                   ▼
              jsDelivr /kaori-widget.js    (the copy in this repo, as a safety net)
```

**To ship a change:** edit `kaori-widget.js`, upload it to `https://kyoucdn.id/kaori-widget.js`,
purge that path in Cloudflare.
Push to `master` as well, so the fallback copy stays current.

Do **not** put the widget back into `script.js` to save a request. That request is what buys the
ability to deploy — and to roll back — at all. Without it, a bad release is stuck in front of
readers for a week.

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
| `titleSelector` | `'h1.entry-title'` | Headline, mined for franchises nobody tagged |
| `headerImageUrl` | kyoucdn `kyou-header.webp` | Animated wordmark; replaces the whole header line |
| `mountAfterSelector` | `'.td-tags'` | Widget inserts itself after this element |
| `widgetId` | `'kaori-kyou-widget'` | HTML id applied to the widget element |
| `maxSourceTags` | `50` | Max tags collected from the page |
| `bannedKeywords` | `['seiyu']` | Tags containing these words are ignored |
| `genericTags` | `['anime', 'berita', …]` | Article-describing words; trimmed off tags, never searched |
| `stopWords` | `['yang', 'dari', …]` | Filler; used only to mine the headline, never to trim a tag |
| `maxProbeQueries` | `18` | Max tags probed per wave |
| `maxMinedQueries` | `6` | Max headline candidates probed |
| `maxSeriesFetch` | `6` | Max franchises whose products are fetched |
| `longTagWords` | `5` | A tag this long keeps only its first three words |
| `minCandidateLength` | `4` | Shorter candidates are too ambiguous to search |
| `minMinedWordLength` | `6` | Min length for a lone word mined from the headline |
| `minSeriesShare` | `0.6` | Share of a tag's matches that must agree on one series |
| `minSeriesTotal` | `10` | Matches needed before that consensus counts |
| `strengthSampleSize` | `8` | How deep a franchise's best-sellers are sampled to rank it |
| `seriesSort` | `'kyou_search_score'` | Sort within a resolved franchise (popularity) |
| `resultLimit` | `40` | Max search results fetched |
| `fallbackRenderLimit` | `40` | Max items shown in fallback mode |
| `minResultsToShow` | `1` | Minimum results required to render the widget |
| `minTagResults` | `12` | Below this, relevant items are topped up with random ones |
| `timeoutMs` | `8000` | Network request timeout in milliseconds |
| `randomPoolSize` | `40` | Pool size for random fallback items |
| `randomSort` | `'kyou_search_score'` | Sort order for fallback items (popularity) |
| `autoSlideMs` | `5000` | Auto-slide interval in milliseconds |
| `oripaEnabled` | `true` | Show the Kyou Oripa banner carousel below the products |
| `oripaLabel` | `'Kyou Oripa is now Live'` | Heading above the banner carousel |
| `oripaTagline` | `'~ A New Way to Collect ~'` | Second line under the heading; empty string hides it |
| `oripaBadgeUrl` | kyoucdn `oripa-badge.webp` | Animated card-pack badge, one in each top corner of the gold panel |
| `oripaImageWidth` | `520` | Width requested from the Cloudflare image resizer |
| `oripaCarouselLimit` | `12` | Max banners in the carousel |
| `maxOripaSearches` | `8` | Max tags put to the banner search |
| `oripaMinLoneHitScore` | `100` | Min score for a banner matched by only one tag |
| `oripaUtmParams` | `utm_campaign=kyou-oripa` | UTM params appended to the banner link |

> `searchEndpoint`, `oripaEndpoint`, `oripaSearchEndpoint`, and `oripaBannerBaseUrl` are managed internally.

The white Kyou wordmark and the Oripa token coin are **embedded in the script** as data URIs, not
linked. The widget runs on someone else's page, so a third-party image host going down would blank
them on every Kaori article at once — and it saves two requests. Set `headerLogoUrl` /
`oripaTokenIcon` to serve them from a CDN instead.

### Animated header

The animated wordmark **replaces the whole header line** — it spells out "#RayakanHobimu Bersama
Kyou" itself, so `headerText` and `headerLogoUrl` survive only as its alt text. Set
`headerImageUrl: ''` to go back to text plus the still logo.

```js
window.KaoriKyouWidgetConfig = {
  headerImageUrl: 'https://kyoucdn.id/static/assets/kyou-header.webp'
};
```

This one is a **URL, not a data URI**: at ~69 KB it would dominate the script and be parsed
synchronously, where an `<img>` is fetched off the critical path and cached across every article on
the site. That matters more than the first-load byte count — `script.js` ships often, and an
inlined animation would be re-downloaded on every code change, while a separate image survives them.

**A URL that 404s falls back to the text header**, so pointing this at a CDN path before the file
is uploaded degrades instead of breaking (the logo is embedded in the script, so the text header
always renders).

### Assets

Both animations are served from `https://kyoucdn.id/static/assets/`. Neither is kept in this repo —
the CDN is the source of truth, and a second copy here would only drift out of date.

| file | size | note |
|---|---|---|
| `kyou-header.webp` | 69 KB | re-encoded from a **727 KB** GIF |
| `oripa-badge.webp` | 28 KB | re-encoded from a **3.33 MB** GIF |

Both were GIFs, and both were enormous for what they contain. WebP also has real alpha, which
matters twice over:

- The **wordmark** GIF is white on 1-bit transparency, so its edges went jagged on the orange
  header. WebP keeps them smooth.
- The **badge** GIF is matted onto **solid black** with no transparency at all, which would have
  dropped a black square into the corner of the gold panel. It keys out cleanly because its frames
  are bimodal — pure black background, content never darker than luminance 189, and nothing in
  between — so there is no glow left to leave a dark halo.

A URL that 404s degrades rather than breaks: the header reverts to text plus the still logo (both
embedded in the script), and a missing badge is removed from the DOM rather than left as a broken
image in the corner.

### Reduced motion

An animation looping forever beside an article is exactly what `prefers-reduced-motion` exists to
stop, and honouring it needs **no extra assets**: the header falls back to the text and the logo,
and the badge, being decoration, is simply not rendered.

## Oripa Banner

Below the product carousel the widget renders a **swipeable carousel of Kyou Oripa banners**
(`oripaCarouselLimit`, default 12), each linking to `https://oripa.kyou.id/banner/<id>` and chipped
with its category. Paging is native CSS scroll-snap, so a touch swipe works with no JS at all and
the arrows only nudge `scrollLeft`.

Page tags are put to `GET /v1/banners/search`, and every hit is confirmed against
`GET /v1/banners` — the only endpoint that reports `remaining_count`, so it still decides what is
actually drawable (`active`, not `is_internal`, `remaining_count > 0`).

### What gets randomised is the *category*, not the banner

Production runs 44 banners across only three categories — Pokémon TCG (23), Hobby (17), One Piece
TCG (4). Filling a carousel with random banners would shuffle three unrelated card games onto one
shelf. So with nothing to match on, **one category is drawn** and the carousel is filled from it:
the shelf reads as all-Pokémon or all-Hobby, and the four One Piece banners get the same odds of
being shown as the twenty-three Pokémon ones.

A tag hit outranks the group — it is the only evidence the article is about a banner at all — so
matched banners lead even when they sit in another category (an article about Luffy surfaces the
One Piece pools *and* the Shonen Jump one). A category with fewer banners than the limit simply
shows fewer; padding One Piece out with Pokémon would defeat the point of drawing a category.

### Why the name cannot be matched

**Matching on the banner name cannot work**, which is why the search endpoint is used at all. The
Hobby names are marketing flavour text that never spell out their series: *Winning Live* is Uma
Musume, *Inter-Knot Premium Commission* is Zenless Zone Zero, *Millenium Special* is Blue Archive,
*Wish Upon Teyvat* is Genshin. No tag will ever substring-match those. The search index knows what
is inside each pool and resolves all of them correctly.

Two traps in that API:

- **The `score` is not comparable across queries.** A correct `pokemon` hit scores ~17 while a bogus
  `gundam` → *Miku for You* hit scores ~51, so a flat threshold cannot separate them. What does:
  a query matching **several** banners is corroborated by the spread itself (every `pokemon` hit is
  a Pokémon banner), while a **lone** hit is only trusted above `oripaMinLoneHitScore`. That single
  rule keeps every correct match in testing and drops the `gundam` false positive, which falls
  through to a random category instead.
- **`?tags=` and `?category=` are dead.** Every banner ships an empty `tags` array, and `?category=`
  is ignored outright — it returns all 44 regardless of the value passed. The category is read from
  each banner's own `category` field instead.

## How It Works

Nothing is matched by product name. Every tag is first resolved to a **canonical series**, and
only then are products fetched — by that series, server-side.

1. **Tag collection** — Anchor tags from `tagLinkSelector`, trimmed of years and article words,
   then deduplicated: a tag containing all the words of a shorter tag is dropped, because
   Mitsuha ANDs every term and the longer query can only match a subset.
2. **Resolve** — Each surviving tag is probed with a 1-item request. The `filters` facet that
   comes back names the series behind it, and a tag that resolves to nothing is dropped.
3. **Mine the headline** — Anything the tags missed is looked for in the article title.
4. **Fetch** — Each resolved franchise is fetched with `series=<exact name>`, which is a real
   server-side filter, so the results are 100 % on-topic.
5. **Rank** — Franchises are ordered by the summed `kyou_search_score` of their best-sellers,
   so the one Kyou actually sells the most of leads.
6. **Top-up / fallback** — Too few items are topped up with random popular ones; none at all
   falls back entirely.

### Why tags are resolved to a series first

Mitsuha matches product **names** and **ANDs** every term, so a hit proves nothing and a miss
proves nothing either:

- `garena` is silently spell-corrected to `garren` and returns *Kamen Rider **Garren***.
- `one piece` returns a **Takagi-san** figure wearing a "One Piece **Dress**".
- `Ultraman di RTV` returns **zero** products — while Kyou stocks 363 Ultraman items.

Neither can be untangled by reading product names. But every response carries a `filters` facet
that is computed over the **whole match set, not the returned page** — so a single 1-item probe
reveals the true series distribution behind thousands of matches. A tag is trusted when that
facet backs it up: it names a series, or it *is* a character (exactly — `Suzuki` is a substring
of the character *Suzuki Iruma*, which is enough to hijack an article), or ≥ `minSeriesShare` of
its matches agree on one series, which is how the alias `makeine` resolves to
*Make Heroine ga Oosugiru!*.

Products are then fetched with `series=<exact facet value>` and come back pure, so there is no
client-side filtering left to get wrong.

### Secret labels

Two franchises the editorial tags leave invisible, both recovered:

- **Buried inside a tag.** The Ultraman article is tagged `Ultraman di RTV`, `Ultraman 2026` and
  `Ultraman Teo di RTV` — every one matches nothing. Trimmed, they collapse to `Ultraman`: 363
  products, one query.
- **Never tagged at all.** *"Dari Rayearth Sampai Makeine"* is tagged `makeine` but never
  `rayearth`, leaving 11 *Magic Knight Rayearth* products unreachable. The headline is mined for
  it.

Mined candidates are guesses, not editorial tags, so they must clear a higher bar: naming a
series outright, no consensus and no character rule. Otherwise the headline word `Grand` resolves
to *Fate/**Grand** Order*, and the publisher's own name, `KAORI`, resolves to *Kaori Miyazono*.

### Notes on the search API

- **A query that matches nothing is the expensive one.** `q=naruto` (1460 hits) answers in ~40 ms
  and fifteen of them run concurrently in ~170 ms. `q=ffns` (0 hits) takes ~575 ms cold, and
  fifteen of *those* take ~2900 ms, because they **serialise** server-side instead of running in
  parallel. Mitsuha reports ~5 ms of work either way, so the cost is invisible in `response_time`
  — it is almost certainly the spell-correction pass, which only runs when there is nothing to
  return. The widget cannot fix this; it only budgets how many dead ends it will pay for. **Fixing
  it server-side would make every number in this section a non-issue.**
- **Concurrency collapses past ~20 requests in flight**: 20 parallel probes take ~245 ms, 22 take
  over a second.
- **`sort=kyou_search_score` is only safe once the result set is already pure.** On a text query
  it is a *static per-item popularity score* — the same item scores `271` for `hatsune miku`,
  `vocaloid` and `figure` alike — so searching `gundam` that way returns three Hatsune Miku
  figures before a single Gundam. Inside a `series=`-filtered set it does exactly what a shop
  wants: best-sellers first.
- **`limit` is ignored.** Page size is set via `page=<page>,<size>`; a bare request returns 30.
- **The `series=` filter is exact and case-sensitive** (`series=Gundam` works, `gundam` returns
  nothing). The facet hands over the exact string, which is what makes it usable at all.
- **`characters=` does not exist** and is *silently ignored* — passing it returns the entire
  196 k-item catalogue. A character is scoped with `q=<name>&series=<name>` instead.
- The series facet is capped at **10 entries**, so it is a top-10, not a vocabulary.

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
