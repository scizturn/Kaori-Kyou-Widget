;(function () {
  'use strict';

  // The Kyou wordmark, white, inlined at 3x its 32px display height. It is embedded rather
  // than linked because the widget runs on someone else's page: a third-party image host
  // going down would blank the logo on every Kaori article at once, and this costs one
  // fewer request. Override headerLogoUrl to serve it from a CDN instead.
  var KYOU_LOGO_WHITE = 'data:image/png;base64,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';

  // Oripa's own token coin, lifted from oripa.kyou.id/ds/logo/token.png and inlined at 3x its
  // 12px display height, for the same reason as the wordmark above.
  var ORIPA_TOKEN_ICON = 'data:image/png;base64,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';

  var DEFAULT_CONFIG = {
    searchEndpoint: 'https://search.kyou.id/v1/search',
    tagContainerSelector: '.td-tags',
    tagLinkSelector: '.td-tags a',
    mountAfterSelector: '#kaori-widget-anchor',
    widgetId: 'kaori-kyou-widget',
    maxSourceTags: 50,
    bannedKeywords: ['seiyu'],
    bannedItemKeywords: ['PVC Figure 1/4'],
    titleSelector: 'h1.entry-title',
    resultLimit: 40,
    fallbackRenderLimit: 40,
    minResultsToShow: 1,
    minTagResults: 12,
    timeoutMs: 8000,
    randomPoolSize: 40,
    randomMaxPage: 5,
    randomSort: 'kyou_search_score',
    autoSlideMs: 5000,
    // Matching queries are cheap and parallelise (15 at once in ~170ms). Queries that match
    // NOTHING do not: each costs ~150-600ms of wall time and they serialise server-side, so
    // the budget below is really a budget on how many dead ends the widget may pay for.
    maxProbeQueries: 18,
    maxMinedQueries: 6,
    maxSeriesFetch: 6,
    // Mitsuha ANDs every term, so a tag this long can never match in full and only its head
    // is worth searching.
    longTagWords: 5,
    // Within an already-pure `series=` result set, popularity is exactly what to surface.
    seriesSort: 'kyou_search_score',
    // A franchise is ranked on the popularity of its best-selling merch, sampled this deep.
    strengthSampleSize: 8,
    // A candidate shorter than this is too ambiguous to trust: the tag "LAM" (an
    // illustrator) exactly matches a character named Lam, and "fx" (from "fx sudirman")
    // is a substring of half the catalogue.
    minCandidateLength: 4,
    // A lone word mined out of a headline needs to be this long to be worth a query.
    minMinedWordLength: 6,
    // Share of a tag's matches that must agree on one series, and how many matches that
    // consensus needs before it means anything. Without the floor, any 1-item match is
    // trivially "100% one series" -- which is how "Exhibition Zone" resolved to Honkai.
    minSeriesShare: 0.6,
    minSeriesTotal: 10,
    // Tags that describe the article rather than a product Kyou sells. Searching them
    // returns a popular-but-unrelated grab bag, so they never reach the search.
    genericTags: [
      'anime', 'manga', 'figure', 'figur', 'game', 'games', 'gaming', 'karakter',
      'character', 'ulang', 'tahun', 'indonesia', 'jepang', 'japan', 'berita', 'news',
      'event', 'konser', 'concert', 'tiket', 'ticket', 'harga', 'info', 'steam',
      'merchandise', 'cosplay', 'nendoroid', 'idol', 'musik', 'music', 'video',
      'opening', 'jakarta', 'surabaya', 'bandung', 'esports', 'tournament', 'turnamen',
      'review', 'preview', 'trailer', 'season', 'episode', 'film', 'movie', 'novel',
      'komik', 'cd', 'dvd'
    ],
    // Filler words used ONLY to mine a headline -- never to trim a tag. The distinction is
    // load-bearing: "virtual" is noise in the headline "Talenta Virtual Arpina Helios" (it
    // resolves to VSPO's "Virtual eSport Project"), but it is the franchise in the tag
    // "Virtual Singer", which is a Project Sekai unit.
    stopWords: [
      'virtual',
      'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'ini', 'itu', 'ada', 'apa', 'akan',
      'bakal', 'sudah', 'resmi', 'hadir', 'gelar', 'mulai', 'saja', 'juga', 'untuk',
      'pada', 'dengan', 'kali', 'lebih', 'inilah', 'baru', 'catat', 'simak', 'detail',
      'benefit', 'sukses', 'ramaikan', 'sambangi', 'temani', 'bersiaplah', 'rayakan',
      'sambut', 'jelang', 'genap', 'mengenal', 'mendiskusikan', 'berkarier', 'berpisah',
      'berakhir', 'meriah', 'spesial', 'satu', 'dua', 'tiga', 'kalian', 'kita', 'para',
      'lalu', 'versi', 'terbaru', 'tanggal', 'tayang', 'solusi', 'cepat', 'aman', 'top',
      'grup', 'bubar', 'talenta', 'acara', 'kegiatan', 'lomba', 'rekomendasi',
      'populer', 'kalangan', 'pembaca', 'buku', 'perkembangan', 'prediksi', 'juara',
      'dunia', 'dekade', 'platform', 'layar', 'pilihan', 'staf', 'gim', 'diskon', 'pc',
      'dijual', 'rilis', 'update', 'hingga', 'bersama', 'the', 'and', 'for', 'with',
      'are', 'you', 'this', 'that', 'from'
    ],
    headerText: '#RayakanHobimu Bersama {logo}',
    // The animated wordmark replaces the header line entirely -- headerText/headerLogoUrl are
    // then only used for its alt text. A URL rather than an inlined data URI because at ~69KB
    // it would dominate this script and be parsed synchronously, where an <img> is fetched off
    // the critical path and cached across every article on the site. If it fails to load, the
    // header falls back to text plus the still logo; see bindHeaderFallback.
    headerImageUrl: 'https://kyoucdn.id/static/assets/kyou-header.webp',
    headerHref: 'https://kyou.id',
    headerLogoUrl: KYOU_LOGO_WHITE,
    headerLogoAlt: 'Kyou',
    headerLogoHeight: 32,
    utmParams: {
      utm_source: 'kaori',
      utm_medium: 'widget',
      utm_campaign: 'kyou-recs'
    },
    oripaEnabled: true,
    oripaEndpoint: 'https://kaede.kyou.id/v1/banners',
    oripaSearchEndpoint: 'https://kaede.kyou.id/v1/banners/search',
    oripaBannerBaseUrl: 'https://oripa.kyou.id/banner/',
    oripaLabel: 'Kyou Oripa is now Live',
    oripaTagline: '~ A New Way to Collect ~',
    // Animated card-pack badge in the top-left corner of the gold panel. Purely decorative, so
    // it simply disappears if it fails to load rather than leaving a broken image behind.
    oripaBadgeUrl: 'https://kyoucdn.id/static/assets/oripa-badge.webp',
    oripaImageWidth: 520,
    oripaTokenIcon: ORIPA_TOKEN_ICON,
    maxOripaSearches: 8,
    // Max banners in the carousel. A category with fewer than this simply shows fewer --
    // One Piece TCG only has four banners, and padding it out with Pokemon would defeat
    // the point of drawing a category in the first place.
    oripaCarouselLimit: 12,
    // A banner matched by a single tag is only trusted above this score; see
    // matchedOripaBanners.
    oripaMinLoneHitScore: 100,
    oripaUtmParams: {
      utm_source: 'kaori',
      utm_medium: 'widget',
      utm_campaign: 'kyou-oripa'
    }
  };

  var userConfig = window.KaoriKyouWidgetConfig || {};
  var config = extend({}, DEFAULT_CONFIG, userConfig);
  var widgetState = null;
  var pageTags = [];

  if (document.getElementById(config.widgetId)) {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var tags = collectTags();
    pageTags = tags;
    injectStyles();
    showSkeleton();

    if (!tags.length) {
      loadFallbackResults();
      return;
    }

    searchWithFallbacks(tags)
      .then(function (payload) {
        if (!payload || !payload.items || payload.items.length < config.minResultsToShow) {
          loadFallbackResults();
          return;
        }

        hideSkeleton();
        mountWidget(payload.items);
      })
      .catch(function (error) {
        hideSkeleton();
        if (window.console && typeof window.console.warn === 'function') {
          console.warn('[KaoriKyouWidget] Failed to render widget.', error);
        }
      });
  }

  function loadFallbackResults() {
    loadFallbackPayload()
      .then(function (payload) {
        hideSkeleton();
        var items = payload && payload.items ? payload.items : [];
        if (!items || items.length < config.minResultsToShow) {
          return;
        }

        mountWidget(items);
      })
      .catch(function (error) {
        hideSkeleton();
        if (window.console && typeof window.console.warn === 'function') {
          console.warn('[KaoriKyouWidget] Failed to load fallback results.', error);
        }
      });
  }

  function searchWithFallbacks(validTags) {
    return resolveArticle(validTags)
      .catch(function () {
        return [];
      })
      .then(function (items) {
        if (items.length >= config.minTagResults) {
          return { validTags: validTags, items: items };
        }

        // A niche franchise still beats a random grab bag -- Kyou stocks only 11 Magic
        // Knight Rayearth products -- so its items lead and the carousel is topped up
        // rather than thrown away.
        return loadFallbackPayload().then(function (payload) {
          return {
            validTags: validTags,
            items: mergeUnique(items, payload.items).slice(0, config.resultLimit)
          };
        });
      });
  }

  // Mitsuha matches product NAMES and ANDs every term, so a text hit proves nothing and a
  // miss proves nothing either: "garena" quietly spell-corrects to "garren" and hits Kamen
  // Rider, while "Ultraman di RTV" matches zero products even though Kyou stocks 363
  // Ultraman items. Neither can be untangled by looking at product names.
  //
  // So nothing is matched by name. Every candidate is first resolved to a CANONICAL SERIES
  // using the `filters` facet Mitsuha returns beside its results -- that facet is computed
  // over the entire match set rather than the returned page, so a single 1-item probe
  // reveals the true series distribution of thousands of matches. Items are then fetched
  // with `series=<exact facet value>`, a real server-side filter that comes back 100% pure.
  function resolveArticle(tags) {
    var split = partitionTags(tags);
    var probes = split.minimal.slice(0, config.maxProbeQueries);

    return probeAll(probes)
      .then(function (results) {
        var resolved = Object.create(null);
        var failed = [];
        var outcome = Object.create(null);

        results.forEach(function (probe, index) {
          var tag = probes[index];
          var hit = gateTag(tag, probe);
          outcome[tag] = { hit: !!hit, empty: !probe || probe.total <= 0 };

          if (hit) {
            addResolved(resolved, hit, tag);
          } else {
            failed.push(tag);
          }
        });

        var second = worthProbing(split.derived, outcome)
          .concat(minedCandidates(failed, tags))
          .slice(0, config.maxProbeQueries);

        if (!second.length) {
          return resolved;
        }

        return probeAll(second).then(function (results2) {
          results2.forEach(function (probe, index) {
            var hit = gateMined(second[index], probe);
            if (hit && !resolved[hit.series]) {
              addResolved(resolved, hit, second[index]);
            }
          });

          return resolved;
        });
      })
      .then(fetchResolvedSeries);
  }

  // Mitsuha ANDs every term, so a tag that contains all the words of a shorter tag can only
  // ever match a subset of it. That makes most of an article's tags redundant before a single
  // request is sent: the Ultraman article carries six tags and every one of them contains
  // "Ultraman", and the FFNS article stacks `free fire` under `Free Fire Nusantara Series`
  // under `free fire nusantara series 2026 fall`.
  function partitionTags(tags) {
    var minimal = [];
    var derived = [];

    tags.slice().sort(function (a, b) {
      return wordsOf(a).length - wordsOf(b).length;
    }).forEach(function (tag) {
      var parent = null;

      minimal.forEach(function (candidate) {
        if (!parent && coversWords(tag, candidate)) {
          parent = candidate;
        }
      });

      if (parent) {
        derived.push({ tag: tag, parent: parent });
      } else {
        minimal.push(tag);
      }
    });

    return { minimal: minimal, derived: derived };
  }

  // A derived tag is only worth a query when its parent matched *something* but failed to
  // resolve -- then the extra words may pin down a franchise the parent was too vague to name.
  // If the parent matched nothing, AND semantics guarantee the longer tag matches nothing
  // either, and a query that matches nothing is the expensive kind.
  function worthProbing(derived, outcome) {
    return derived.filter(function (entry) {
      var parent = outcome[entry.parent];
      return parent && !parent.hit && !parent.empty;
    }).map(function (entry) {
      return entry.tag;
    });
  }

  function coversWords(tag, other) {
    var words = wordsOf(tag);

    return wordsOf(other).every(function (word) {
      return words.indexOf(word) !== -1;
    });
  }

  function wordsOf(value) {
    return foldText(value).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean);
  }

  function probeAll(candidates) {
    return Promise.all(candidates.map(probeCandidate));
  }

  function probeCandidate(candidate) {
    return fetchSearchPayload({ q: candidate, page: '1,1' })
      .then(function (payload) {
        var data = (payload && payload.data) || payload || {};
        var filters = data.filters || {};

        return {
          total: Number(data.total_items) || 0,
          series: filters.series || [],
          characters: filters.characters || [],
          corrected: data.corrected_query || ''
        };
      })
      .catch(function () {
        return null;
      });
  }

  // A tag is trusted only when Kyou's own metadata backs it up, in descending order of
  // proof: it names a series outright, or it *is* a character, or its matches
  // overwhelmingly agree on one series -- which is how the alias "makeine" resolves to
  // "Make Heroine ga Oosugiru!". Anything else is a coincidence and the tag is dropped.
  function gateTag(candidate, probe) {
    if (!probe || probe.total <= 0 || !probe.series.length) {
      return null;
    }

    var folded = foldText(candidate);
    var named = namedSeries(folded, probe.series);
    if (named) {
      return { series: named, character: '' };
    }

    if (namesCharacter(folded, probe.characters)) {
      return { series: probe.series[0].filter, character: candidate };
    }

    // Mitsuha silently spell-corrects. A correction that rewrites the word is exactly how
    // the tag "garena" became "garren" and dragged in a Kamen Rider figure, so only a tag
    // that literally exists in the catalogue earns the consensus rule below.
    if (probe.corrected && foldText(probe.corrected) !== folded) {
      return null;
    }

    if (probe.total >= config.minSeriesTotal &&
        probe.series[0].count / probe.total >= config.minSeriesShare) {
      return { series: probe.series[0].filter, character: '' };
    }

    return null;
  }

  // Mined candidates are guesses rather than editorial tags, so they have to clear a higher
  // bar: naming a series outright, with no consensus and no character rule. Consensus would
  // let the headline word "Grand" resolve to Fate/Grand Order, and the character rule would
  // let the publisher's own name, KAORI, resolve to Kaori Miyazono.
  function gateMined(candidate, probe) {
    if (!probe || probe.total <= 0 || !probe.series.length) {
      return null;
    }

    var folded = foldText(candidate);
    if (probe.corrected && foldText(probe.corrected) !== folded) {
      return null;
    }

    var named = namedSeries(folded, probe.series);
    return named ? { series: named, character: '' } : null;
  }

  function namedSeries(foldedCandidate, seriesFacet) {
    var match = null;

    seriesFacet.slice(0, 3).forEach(function (entry) {
      var folded = foldText(entry.filter);
      if (match || !folded) {
        return;
      }

      if (folded.indexOf(foldedCandidate) !== -1 || foldedCandidate.indexOf(folded) !== -1) {
        match = entry.filter;
      }
    });

    return match;
  }

  // Exact, never a substring: "suzuki" is a substring of the character "Suzuki Iruma", and
  // that alone was enough for a voice-actor tag to hand a Polar Opposites article over to
  // Mairimashita! Iruma-kun.
  function namesCharacter(foldedCandidate, characterFacet) {
    return characterFacet.slice(0, 8).some(function (entry) {
      return foldText(entry.filter) === foldedCandidate;
    });
  }

  function addResolved(resolved, hit, candidate) {
    if (!resolved[hit.series]) {
      resolved[hit.series] = { series: hit.series, character: '' };
    }

    if (hit.character && !resolved[hit.series].character) {
      resolved[hit.series].character = hit.character;
    }
  }

  // Every probe that matches nothing is expensive -- see the note above fetchSearchPayload --
  // so mining stays deliberately small. It exists for the one franchise the editorial tags
  // leave invisible: the one nobody tagged. "Dari Rayearth Sampai Makeine" is tagged
  // `makeine` but never `rayearth`, leaving 11 Magic Knight Rayearth products unreachable.
  function minedCandidates(failedTags, tags) {
    var candidates = titleCandidates(tags);
    var seen = Object.create(null);
    tags.forEach(function (tag) {
      seen[foldText(tag)] = true;
    });

    return candidates.filter(function (candidate) {
      var key = foldText(candidate);
      if (!key || key.length < config.minCandidateLength || seen[key]) {
        return false;
      }

      seen[key] = true;
      return true;
    }).slice(0, config.maxMinedQueries);
  }

  // Tags are cut down to something searchable *before* anything is searched, which is both
  // cheaper and more accurate, because Mitsuha ANDs every term:
  //
  //   * Leading and trailing filler is dropped. "Ultraman 2026" and "Ultraman di RTV" match
  //     zero products as written; trimmed to "Ultraman" they match 363. This also collapses
  //     an article's near-duplicate tags into one query -- the FFNS article separately
  //     carries `FFNS`, `ffns 2026`, `ffns 2026 fall` and `ffns 2026 gall`.
  //   * A very long tag keeps only its head, because it can never match in full anyway:
  //     "jojo's bizarre adventure all star battle r" returns nothing, while its first three
  //     words return 772 JoJo products.
  //
  // Only the edges are cut, never the middle, so a franchise is never sliced in half.
  function trimTag(tag) {
    var words = tag.split(/\s+/).filter(Boolean);
    var start = 0;
    var end = words.length;

    while (start < end && isNoiseWord(words[start])) {
      start += 1;
    }

    while (end > start && isNoiseWord(words[end - 1])) {
      end -= 1;
    }

    var trimmed = words.slice(start, end);
    if (trimmed.length >= config.longTagWords) {
      trimmed = trimmed.slice(0, 3);
    }

    return trimmed.join(' ');
  }

  function titleCandidates(tags) {
    var node = document.querySelector(config.titleSelector);
    var title = node ? normalizeTag(node.textContent || '') : '';
    if (!title) {
      return [];
    }

    var covered = tags.map(foldText).join(' | ');
    var runs = [];
    var run = [];

    title.split(/[^0-9A-Za-zÀ-ɏ'’]+/).forEach(function (word) {
      if (!word || isTitleNoise(word) || foldText(word).length < 3) {
        if (run.length) {
          runs.push(run);
          run = [];
        }
        return;
      }

      run.push(word);
    });

    if (run.length) {
      runs.push(run);
    }

    var candidates = [];
    runs.forEach(function (words) {
      [3, 2, 1].forEach(function (size) {
        for (var i = 0; i + size <= words.length; i += 1) {
          var phrase = words.slice(i, i + size).join(' ');
          var folded = foldText(phrase);

          // A lone short word out of a headline is nearly always a false friend: "Grand"
          // resolves to Fate/Grand Order and "Final" to Final Fantasy.
          if (!folded || covered.indexOf(folded) !== -1) {
            continue;
          }

          if (size === 1 && folded.length < config.minMinedWordLength) {
            continue;
          }

          candidates.push(phrase);
        }
      });
    });

    return candidates;
  }

  // Trimming a tag may only drop what describes the *article* -- a year, or a word like
  // "anime" / "tiket" / "konser". Grammatical filler is deliberately not dropped here: it is
  // fine to strip "Virtual" out of a headline, and wrong to strip it out of "Virtual Singer".
  function isNoiseWord(word) {
    var folded = foldText(word);
    if (!folded || /^\d+$/.test(folded)) {
      return true;
    }

    return isListed(config.genericTags, folded);
  }

  function isTitleNoise(word) {
    return isNoiseWord(word) || isListed(config.stopWords, foldText(word));
  }

  function isListed(list, folded) {
    return (list || []).some(function (entry) {
      return foldText(entry) === folded;
    });
  }

  // `series=` is an exact, case-sensitive server-side filter, and the facet hands over the
  // exact string it wants, so the result set is on-topic without a single client-side check.
  // That is also what finally makes `sort=kyou_search_score` safe: on a text query it was
  // catastrophic (searching "gundam" returned three Hatsune Miku figures first, because the
  // score is static per-item popularity, not per-query relevance), but inside an
  // already-pure franchise it does exactly what a shop wants -- best-sellers first.
  function fetchResolvedSeries(resolved) {
    var keys = Object.keys(resolved).slice(0, config.maxSeriesFetch);
    if (!keys.length) {
      return [];
    }

    return Promise.all(keys.map(function (key) {
      return fetchSeriesEntry(resolved[key]);
    })).then(function (entries) {
      return rankSeries(entries.filter(Boolean));
    });
  }

  function fetchSeriesEntry(entry) {
    return seriesRequest(entry.series, '')
      .then(function (items) {
        // Ranking always uses the franchise's own weight, never the narrowed set, so an
        // article about a single character is not punished for being specific: MEIKO and
        // KAITO rank under the full weight of Vocaloid while still showing MEIKO and KAITO.
        var strength = popularityOf(items);

        // A franchise whose best-sellers all score zero has nothing anyone wants, and every
        // such match here was a coincidence: "pandora esports" resolved to the series
        // "Pandora to Akubi", "harmonia" (a VTuber agency) to a Key visual novel.
        if (!strength) {
          return null;
        }

        if (!entry.character) {
          return { series: entry.series, items: items, strength: strength };
        }

        // The character's own merch leads and the franchise tops the rest up, because
        // most of it is usually sold out: Kyou lists 83 Kureiji Ollie products and only 3
        // are still buyable, which is not enough to fill even one row on its own.
        return seriesRequest(entry.series, entry.character).then(function (scoped) {
          return {
            series: entry.series,
            items: mergeUnique(scoped, items),
            strength: strength
          };
        });
      })
      .catch(function () {
        return null;
      });
  }

  function popularityOf(items) {
    return items.slice(0, config.strengthSampleSize).reduce(function (total, item) {
      return total + (Number(item.score) || 0);
    }, 0);
  }

  function rankSeries(entries) {
    entries.sort(function (a, b) {
      return b.strength - a.strength;
    });

    var merged = [];
    entries.forEach(function (entry) {
      merged = mergeUnique(merged, entry.items);
    });

    return merged.slice(0, config.resultLimit);
  }

  function seriesRequest(series, query) {
    return fetchSearchPayload({
      q: query,
      series: series,
      sort: config.seriesSort,
      page: '1,' + config.resultLimit
    }).then(function (payload) {
      return extractItems(payload, config.resultLimit);
    });
  }

  function mergeUnique() {
    var seenUrls = Object.create(null);
    var merged = [];

    for (var i = 0; i < arguments.length; i += 1) {
      (arguments[i] || []).forEach(function (item) {
        if (!item || !item.url || seenUrls[item.url]) {
          return;
        }

        seenUrls[item.url] = true;
        merged.push(item);
      });
    }

    return merged;
  }

  function loadFallbackPayload() {
    return fetchRandomMitsuhaItems().then(function (items) {
      return {
        validTags: [],
        items: items.slice(0, config.fallbackRenderLimit),
        query: ''
      };
    });
  }

  function collectTags() {
    var links = Array.prototype.slice.call(document.querySelectorAll(config.tagLinkSelector));
    var seen = Object.create(null);

    return links
      .map(function (link) {
        var text = normalizeTag(link.textContent || '');
        if (!text || containsBannedKeyword(text)) {
          return null;
        }

        text = trimTag(text);
        if (!text || isGenericTag(text)) {
          return null;
        }

        var key = foldText(text);
        if (seen[key]) {
          return null;
        }

        seen[key] = true;
        return text;
      })
      .filter(Boolean)
      .slice(0, config.maxSourceTags);
  }

  // A tag made of nothing but article-describing words ("anime", "berita", "2026") would
  // otherwise burn a probe and drag in an unrelated grab bag: `game` matches 1870 products
  // that are only 22% one series, `anime` 741 that are only 14%.
  function isGenericTag(tag) {
    var folded = foldText(tag);
    var words = folded.replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean);
    if (!words.length || folded.length < config.minCandidateLength) {
      return true;
    }

    return words.every(function (word) {
      return /^\d+$/.test(word) || isListed(config.genericTags, word);
    });
  }

  // Used only for the random fallback pool, where no `series=` filter exists to keep the
  // results honest -- so no `sort` is passed and Mitsuha's default relevance order stands.
  function searchRequest(query, limit) {
    return fetchSearchPayload({
      q: query,
      page: '1,' + (limit || config.resultLimit)
    }).then(function (payload) {
      return extractItems(payload, limit);
    });
  }

  function buildMitsuhaQueryUrl(params) {
    var url = new URL(config.searchEndpoint);
    var keys = Object.keys(params);

    keys.forEach(function (key) {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        return;
      }

      url.searchParams.set(key, String(params[key]));
    });

    return url.toString();
  }

  function fetchWithTimeout(url, timeoutMs) {
    if (typeof AbortController === 'undefined') {
      return fetch(url, { credentials: 'omit' });
    }

    var controller = new AbortController();
    var timer = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    return fetch(url, {
      credentials: 'omit',
      signal: controller.signal
    }).then(function (response) {
      window.clearTimeout(timer);
      return response;
    }, function (error) {
      window.clearTimeout(timer);
      throw error;
    });
  }

  function extractItems(payload, limit) {
    var list = findResultList(payload);
    return list
      .filter(isAllowedItem)
      .map(mapItem)
      .filter(function (item) {
        return item && item.title && item.url;
      })
      .slice(0, limit || config.resultLimit);
  }

  function findResultList(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    var candidates = [
      payload && payload.items,
      payload && payload.results,
      payload && payload.data,
      payload && payload.hits,
      payload && payload.documents,
      payload && payload.response && payload.response.items,
      payload && payload.response && payload.response.results,
      payload && payload.data && payload.data.items,
      payload && payload.data && payload.data.results,
      payload && payload.data && payload.data.hits
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(candidates[i])) {
        return candidates[i];
      }
    }

    return [];
  }

  function mapItem(source) {
    if (!source || typeof source !== 'object') {
      return null;
    }

    var title = firstString([
      source.name,
      source.item_name,
      source.title,
      source.headline,
      source.post_title
    ]);
    title = stripTitlePrefix(title);

    var url = firstString([
      source.url,
      source.link,
      source.permalink,
      source.id && source.slug && ('https://kyou.id/items/' + source.id + '/' + trimSlashes(source.slug)),
      source.slug && ('https://search.kyou.id/' + trimSlashes(source.slug))
    ]);

    var image = resolveImage(source);

    var manufacturer = firstString([
      source.manufacturer,
      source.brand,
      source.maker
    ]);

    var seriesList = toStringList(source.series);
    var series = firstString([
      seriesList[0],
      source.product_line,
      source.franchise
    ]);

    return {
      title: title,
      url: url,
      image: image,
      manufacturer: manufacturer,
      series: series,
      // Not rendered: Kyou's static popularity score, which is what ranks one resolved
      // franchise above another. See popularityOf.
      score: Number(source.search_score) || 0
    };
  }

  function toStringList(value) {
    var values = Array.isArray(value) ? value : [value];

    return values.filter(function (entry) {
      return typeof entry === 'string' && entry.trim();
    }).map(function (entry) {
      return entry.trim();
    });
  }

  function fetchRandomMitsuhaItems() {
    return fetchRandomMitsuhaPage()
      .then(function (payload) {
        var items = extractItems(payload, config.randomPoolSize);
        if (items.length) {
          return items;
        }

        return searchRequest('', config.resultLimit).catch(function () {
          return [];
        });
      })
      .catch(function () {
        return searchRequest('', config.resultLimit).catch(function () {
          return [];
        });
      });
  }

  function fetchRandomMitsuhaPage() {
    var maxPage = Math.max(1, Number(config.randomMaxPage) || 1);
    var randomPage = Math.floor(Math.random() * maxPage) + 1;

    return fetchSearchPayload({
      q: '',
      sold: 'false',
      ordertype: 'PO,ready',
      sort: config.randomSort,
      page: randomPage + ',' + config.randomPoolSize,
      excludeFilters: 'true'
    });
  }

  // A query that matches nothing is the expensive one. `q=naruto` (1460 hits) answers in
  // ~40ms and fifteen of them run concurrently in ~170ms; `q=ffns` (0 hits) takes ~575ms
  // cold and ~150ms warm, and fifteen of *those* take ~2900ms because they serialise
  // server-side instead of running in parallel. Mitsuha reports ~5ms of work either way, so
  // the cost is invisible in `response_time` -- it is almost certainly the spell-correction
  // pass that only runs when there is nothing to return (it is what rewrites "garena" to
  // "garren"). Nothing here can fix that, so the widget simply budgets its dead ends.
  function fetchSearchPayload(params) {
    var url = buildMitsuhaQueryUrl(params);

    return fetchWithTimeout(url, config.timeoutMs)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Search request failed with status ' + response.status);
        }

        return response.json();
      });
  }


  function isAllowedItem(source) {
    if (!source || typeof source !== 'object') {
      return false;
    }

    if (source.is_adult) {
      return false;
    }

    if (source.is_showcast === true || source.is_showcast === 'true' || source.is_showcase === true || source.is_showcase === 'true') {
      return false;
    }

    if (source.sold === true || source.sold === 'true') {
      return false;
    }

    if (source.is_available === false || source.is_available === 0 || source.is_available === '0') {
      return false;
    }

    if (source.order_type === 'ready' && Number(source.slot) === 0) {
      return false;
    }

    if (source.order_type === 'PO') {
      if (!source.deadline && Number(source.slot) === 0) {
        return false;
      }

      if (source.deadline) {
        var deadline = new Date(source.deadline);
        if (!isNaN(deadline.getTime()) && deadline.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
          return false;
        }
      }
    }

    if (config.bannedItemKeywords && config.bannedItemKeywords.length) {
      var itemName = firstString([
        source.name,
        source.item_name,
        source.title,
        source.headline,
        source.post_title
      ]).toLowerCase();

      if (config.bannedItemKeywords.some(function (kw) {
        return itemName.indexOf(String(kw).toLowerCase()) !== -1;
      })) {
        return false;
      }
    }

    return true;
  }

  function mountWidget(items) {
    hideSkeleton();

    if (document.getElementById(config.widgetId)) {
      return;
    }

    widgetState = {
      items: items,
      firstItemIndex: 0,
      lastPageItemCount: null
    };

    var anchor = document.querySelector(config.mountAfterSelector);
    var widget = document.createElement('aside');
    widget.id = config.widgetId;
    widget.className = 'kaori-kyou-widget';
    widget.innerHTML = renderHeader() + '<div class="kaori-kyou-widget__body"></div>';

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(widget, anchor.nextSibling);
    } else {
      document.body.appendChild(widget);
    }

    renderCarouselInto(widget);
    bindResizeHandler(widget);
    bindHeaderFallback(widget);
    loadOripaBanner(widget);
  }

  // The banner carousel is appended as a sibling of __body, never inside it:
  // renderCarouselInto replaces __body.innerHTML on every resize, which would wipe it.
  function loadOripaBanner(widget) {
    if (!config.oripaEnabled || !widget) {
      return;
    }

    pickOripaBanners(pageTags)
      .then(function (banners) {
        if (!banners.length || !document.body.contains(widget)) {
          return;
        }

        if (widget.querySelector('.kaori-kyou-widget__oripa')) {
          return;
        }

        widget.insertAdjacentHTML('beforeend', renderOripaCarousel(banners));
        bindOripaCarousel(widget);
        bindOripaBadgeFallback(widget);
      })
      .catch(function (error) {
        if (window.console && typeof window.console.warn === 'function') {
          console.warn('[KaoriKyouWidget] Oripa banner unavailable.', error);
        }
      });
  }

  function fetchOripaBanners() {
    return fetchWithTimeout(config.oripaEndpoint, config.timeoutMs)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Oripa request failed with status ' + response.status);
        }

        return response.json();
      })
      .then(function (payload) {
        var entries = (payload && payload.data) || [];
        return entries
          .map(function (entry) {
            return entry && entry.banner;
          })
          .filter(isAvailableOripaBanner);
      });
  }

  function isAvailableOripaBanner(banner) {
    return !!banner &&
      !!banner.id &&
      !!banner.name &&
      !!banner.image_url &&
      banner.status === 'active' &&
      !banner.is_internal &&
      Number(banner.remaining_count) > 0;
  }

  // Matching page tags against the banner *name* cannot work: the Hobby banners are named
  // in marketing flavour text, so "Winning Live" never spells Uma Musume and "Inter-Knot
  // Premium Commission" never spells Zenless Zone Zero. /v1/banners/search does know what
  // is inside each pool, so the tags are put to it instead and the list request is used
  // only to confirm a banner is still drawable (search omits remaining_count).
  //
  // What gets drawn at random is the CATEGORY, not the banner. Production runs 44 banners
  // across only three of them -- Pokemon TCG (23), Hobby (17), One Piece TCG (4) -- so
  // picking banners at random would shuffle three unrelated card games into one shelf.
  // Drawing a category and filling the carousel from it keeps the shelf coherent, and gives
  // the four One Piece banners the same odds of being shown as the twenty-three Pokemon ones.
  function pickOripaBanners(tags) {
    var searchTags = tags.slice(0, config.maxOripaSearches);

    return Promise.all([
      fetchOripaBanners(),
      Promise.all(searchTags.map(searchOripaBanners))
    ]).then(function (results) {
      var available = results[0];
      var hits = results[1];

      if (!available.length) {
        return [];
      }

      var byId = Object.create(null);
      available.forEach(function (banner) {
        byId[banner.id] = banner;
      });

      // A tag hit outranks the group: it is the only evidence this article is about the
      // banner at all, so it leads even when it sits in another category.
      var matched = matchedOripaBanners(hits, byId);
      var category = matched.length
        ? matched[0].category
        : randomOripaCategory(available);

      var group = shuffle(available.filter(function (banner) {
        return foldText(banner.category) === foldText(category);
      }));

      return dedupeOripaBanners(matched.concat(group)).slice(0, config.oripaCarouselLimit);
    });
  }

  function randomOripaCategory(banners) {
    var categories = [];
    var seen = Object.create(null);

    banners.forEach(function (banner) {
      var key = foldText(banner.category);
      if (key && !seen[key]) {
        seen[key] = true;
        categories.push(banner.category);
      }
    });

    return categories.length
      ? categories[Math.floor(Math.random() * categories.length)]
      : '';
  }

  // The relevance score is not comparable across queries -- a correct "pokemon" hit scores
  // 17 while a bogus "gundam" -> "Miku for You" hit scores 50 -- so a flat threshold cannot
  // separate them. What does: a query that matches several banners is corroborated by the
  // spread itself (every "pokemon" hit is a Pokemon banner), while a lone hit is only
  // trusted when it scores decisively.
  function matchedOripaBanners(hitsPerTag, availableById) {
    var scored = [];
    var byId = Object.create(null);

    hitsPerTag.forEach(function (hits) {
      var drawable = hits.filter(function (hit) {
        return availableById[hit.banner_id];
      });

      if (!drawable.length) {
        return;
      }

      if (drawable.length === 1 && Number(drawable[0].score) < config.oripaMinLoneHitScore) {
        return;
      }

      drawable.forEach(function (hit) {
        var score = Number(hit.score) || 0;
        var entry = byId[hit.banner_id];

        if (entry) {
          entry.score = Math.max(entry.score, score);
          return;
        }

        entry = { banner: availableById[hit.banner_id], score: score };
        byId[hit.banner_id] = entry;
        scored.push(entry);
      });
    });

    return scored
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .map(function (entry) {
        return entry.banner;
      });
  }

  function dedupeOripaBanners(banners) {
    var seen = Object.create(null);

    return banners.filter(function (banner) {
      if (!banner || seen[banner.id]) {
        return false;
      }

      seen[banner.id] = true;
      return true;
    });
  }

  function shuffle(list) {
    var copy = list.slice();

    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }

    return copy;
  }

  function searchOripaBanners(tag) {
    var url = new URL(config.oripaSearchEndpoint);
    url.searchParams.set('q', tag);

    return fetchWithTimeout(url.toString(), config.timeoutMs)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Oripa search failed with status ' + response.status);
        }

        return response.json();
      })
      .then(function (payload) {
        return (payload && payload.results) || [];
      })
      .catch(function () {
        return [];
      });
  }

  // Folds accents so an article tagged "pokemon" matches the "Pokémon Trading Card
  // Game (TCG)" category.
  function foldText(value) {
    var text = String(value || '').toLowerCase();
    return text.normalize ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;
  }

  function renderOripaCarousel(banners) {
    var nav = banners.length > 1
      ? '<button class="kaori-kyou-widget__oripa-nav kaori-kyou-widget__oripa-nav--prev" type="button" aria-label="Banner sebelumnya">&#8249;</button>' +
        '<button class="kaori-kyou-widget__oripa-nav kaori-kyou-widget__oripa-nav--next" type="button" aria-label="Banner berikutnya">&#8250;</button>'
      : '';

    var tagline = config.oripaTagline
      ? '<div class="kaori-kyou-widget__oripa-tagline">' + escapeHtml(config.oripaTagline) + '</div>'
      : '';

    return [
      '<div class="kaori-kyou-widget__oripa">',
      '<div class="kaori-kyou-widget__oripa-head">',
      renderOripaBadge(),
      '<div class="kaori-kyou-widget__oripa-title">' + escapeHtml(config.oripaLabel) + '</div>',
      tagline,
      '</div>',
      '<div class="kaori-kyou-widget__oripa-frame">',
      '<div class="kaori-kyou-widget__oripa-track">' + banners.map(renderOripaSlide).join('') + '</div>',
      nav,
      '</div>',
      '</div>'
    ].join('');
  }

  // Decorative only, and the empty alt says so -- a screen reader announcing "animated card pack"
  // beside a heading that already reads "Kyou Oripa" is pure noise.
  function renderOripaBadge() {
    if (!config.oripaBadgeUrl || prefersReducedMotion()) {
      return '';
    }

    return '<img class="kaori-kyou-widget__oripa-badge" src="' + escapeAttribute(config.oripaBadgeUrl) +
      '" alt="" aria-hidden="true" loading="lazy" decoding="async">';
  }

  function renderOripaSlide(banner) {
    var url = config.oripaBannerBaseUrl + banner.id;
    var image = cfImage(banner.image_url, config.oripaImageWidth);
    var cost = Number(banner.draw_cost) > 0
      ? '<div class="kaori-kyou-widget__oripa-cost">' + escapeHtml(String(banner.draw_cost)) +
        '<img class="kaori-kyou-widget__oripa-coin" src="' + escapeAttribute(config.oripaTokenIcon) +
        '" alt="token" width="12" height="12" loading="lazy" decoding="async"> / pull</div>'
      : '';
    var chip = banner.category
      ? '<span class="kaori-kyou-widget__oripa-chip">' + escapeHtml(oripaCategoryLabel(banner.category)) + '</span>'
      : '';

    return [
      '<a class="kaori-kyou-widget__oripa-slide" href="' + escapeAttribute(appendUtm(url, config.oripaUtmParams)) + '" target="_blank" rel="noopener sponsored nofollow">',
      '<div class="kaori-kyou-widget__oripa-thumb">',
      '<img src="' + escapeAttribute(image) + '" alt="' + escapeAttribute(banner.name) + '" loading="lazy" decoding="async">',
      chip,
      '</div>',
      '<div class="kaori-kyou-widget__oripa-info">',
      '<div class="kaori-kyou-widget__oripa-name">' + escapeHtml(banner.name) + '</div>',
      cost,
      '</div>',
      '</a>'
    ].join('');
  }

  // "Pokémon Trading Card Game (TCG)" does not fit on a 324px card, and the "(TCG)" already
  // says what the dropped words said.
  function oripaCategoryLabel(category) {
    return String(category || '')
      .replace(/\s*trading card game\s*/i, ' ')
      .replace(/\s*card game\s*/i, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // The badge is decoration on someone else's CDN. If it is missing, take it out entirely --
  // a broken-image icon in the corner of the panel is worse than no badge at all.
  function bindOripaBadgeFallback(widget) {
    var badges = widget.querySelectorAll('.kaori-kyou-widget__oripa-badge');

    Array.prototype.forEach.call(badges, function (badge) {
      function drop() {
        if (badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }
      }

      if (badge.complete && !badge.naturalWidth) {
        drop();
        return;
      }

      badge.addEventListener('error', drop);
    });
  }

  // Native scroll-snap does the paging, so a touch swipe works without any JS and the arrows
  // only have to nudge scrollLeft. scroll-behavior:smooth animates it.
  function bindOripaCarousel(widget) {
    var track = widget.querySelector('.kaori-kyou-widget__oripa-track');
    if (!track) {
      return;
    }

    var prev = widget.querySelector('.kaori-kyou-widget__oripa-nav--prev');
    var next = widget.querySelector('.kaori-kyou-widget__oripa-nav--next');

    function step(direction) {
      var slide = track.querySelector('.kaori-kyou-widget__oripa-slide');
      var width = slide ? slide.getBoundingClientRect().width + 8 : track.clientWidth;
      track.scrollLeft += direction * width;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        step(-1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        step(1);
      });
    }
  }

  function cfImage(rawUrl, width) {
    if (!rawUrl || rawUrl.indexOf('/cdn-cgi/image/') !== -1) {
      return rawUrl;
    }

    try {
      var url = new URL(rawUrl);
      if (url.hostname !== 'kyoucdn.id') {
        return rawUrl;
      }

      return url.origin + '/cdn-cgi/image/format=webp,quality=82,width=' + (Number(width) || 520) + url.pathname;
    } catch (e) {
      return rawUrl;
    }
  }

  function renderCarouselInto(widget) {
    if (!widget || !widgetState) {
      return;
    }

    var body = widget.querySelector('.kaori-kyou-widget__body');
    if (!body) {
      return;
    }

    var layout = computePageLayout(widget);
    widget.style.setProperty('--kaori-cols', String(layout.cols));
    widgetState.lastPageItemCount = layout.total;

    body.innerHTML = renderCarousel(widgetState.items, layout.total);
    bindCarousel(widget, layout.total);
  }

  function computePageLayout(widget) {
    var width = 0;
    if (widget) {
      var rect = widget.getBoundingClientRect();
      width = rect.width || widget.offsetWidth || 0;
    }
    if (!width) {
      width = window.innerWidth && window.innerWidth < 324 ? window.innerWidth : 324;
    }

    var cols;
    if (width >= 640) {
      cols = 4;
    } else if (width >= 460) {
      cols = 3;
    } else {
      cols = 2;
    }

    return { cols: cols, rows: 2, total: cols * 2 };
  }

  function bindResizeHandler(widget) {
    var timer = null;

    function onSizeChange() {
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(function () {
        timer = null;
        var layout = computePageLayout(widget);
        if (widgetState && layout.total !== widgetState.lastPageItemCount) {
          renderCarouselInto(widget);
        } else {
          widget.style.setProperty('--kaori-cols', String(layout.cols));
        }
      }, 150);
    }

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(onSizeChange);
      ro.observe(widget);
      return;
    }

    var onResize = function () {
      if (!document.body.contains(widget)) {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        if (mo) { mo.disconnect(); }
        return;
      }
      onSizeChange();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    var mo = null;
    if (typeof MutationObserver !== 'undefined' && widget.parentNode) {
      mo = new MutationObserver(function () {
        if (!document.body.contains(widget)) {
          window.removeEventListener('resize', onResize);
          window.removeEventListener('orientationchange', onResize);
          mo.disconnect();
        }
      });
      mo.observe(widget.parentNode, { childList: true });
    }
  }

  function showSkeleton() {
    if (document.getElementById(config.widgetId) || document.getElementById(config.widgetId + '-skeleton')) {
      return;
    }

    var anchor = document.querySelector(config.mountAfterSelector);
    var skeleton = document.createElement('aside');
    skeleton.id = config.widgetId + '-skeleton';
    skeleton.className = 'kaori-kyou-widget kaori-kyou-widget--skeleton';
    var cardHtml = [
      '<div class="kaori-kyou-widget__skeleton-card">',
      '  <div class="kaori-kyou-widget__skeleton-thumb"></div>',
      '  <div class="kaori-kyou-widget__skeleton-info">',
      '    <div class="kaori-kyou-widget__skeleton-line kaori-kyou-widget__skeleton-line--title"></div>',
      '    <div class="kaori-kyou-widget__skeleton-line kaori-kyou-widget__skeleton-line--brand"></div>',
      '  </div>',
      '</div>'
    ].join('');

    skeleton.innerHTML = [
      '<div class="kaori-kyou-widget__header kaori-kyou-widget__skeleton-header"></div>',
      '<div class="kaori-kyou-widget__body">',
      '  <div class="kaori-kyou-widget__skeleton-grid">',
      cardHtml, cardHtml, cardHtml, cardHtml,
      '  </div>',
      '  <div class="kaori-kyou-widget__skeleton-dots">',
      '    <span></span><span></span><span></span>',
      '  </div>',
      '</div>'
    ].join('');

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(skeleton, anchor.nextSibling);
    } else {
      document.body.appendChild(skeleton);
    }
  }

  function hideSkeleton() {
    var skeleton = document.getElementById(config.widgetId + '-skeleton');
    if (skeleton && skeleton.parentNode) {
      skeleton.parentNode.removeChild(skeleton);
    }
  }

  // Two animations looping forever beside an article someone is reading is exactly what this
  // OS setting exists to stop. No still-frame image is needed to honour it: the header simply
  // falls back to the text and the logo -- both of which are already embedded in this script --
  // and the badge is decoration, so it just goes away. Nothing extra to host.
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function renderHeader() {
    var useImage = config.headerImageUrl && !prefersReducedMotion();
    var content = useImage ? renderHeaderImage() : renderHeaderTextAndLogo();
    if (!content) return '';

    if (config.headerHref) {
      return '<a class="kaori-kyou-widget__header" href="' + escapeAttribute(appendUtm(config.headerHref)) + '" target="_blank" rel="noopener sponsored nofollow">' + content + '</a>';
    }
    return '<div class="kaori-kyou-widget__header">' + content + '</div>';
  }

  // The animation lives on a CDN, so treat it as able to fail. A wrong or not-yet-uploaded
  // headerImageUrl would otherwise leave the header showing nothing but its alt text -- no logo,
  // no wordmark -- and the logo is embedded in this script, so the text header always works.
  function bindHeaderFallback(widget) {
    var image = widget.querySelector('.kaori-kyou-widget__header-anim');
    if (!image) {
      return;
    }

    function useTextHeader() {
      var header = widget.querySelector('.kaori-kyou-widget__header');
      if (header) {
        header.innerHTML = renderHeaderTextAndLogo();
      }
    }

    // A 404 already in the browser cache can fire before this listener is attached.
    if (image.complete && !image.naturalWidth) {
      useTextHeader();
      return;
    }

    image.addEventListener('error', useTextHeader);
  }

  function renderHeaderTextAndLogo() {
    if (!config.headerText) return '';

    var parts = String(config.headerText).split('{logo}');
    var content = '';
    for (var i = 0; i < parts.length; i += 1) {
      content += escapeHtml(parts[i]);
      if (i < parts.length - 1) {
        content += renderHeaderLogo();
      }
    }

    return content;
  }

  // The animated wordmark spells out the whole header line itself, so it replaces the text
  // rather than sitting next to it -- headerText survives only as the alt text.
  function renderHeaderImage() {
    var alt = escapeAttribute(String(config.headerText || 'Kyou').replace('{logo}', config.headerLogoAlt || 'Kyou').trim());

    return '<img class="kaori-kyou-widget__header-anim" src="' + escapeAttribute(config.headerImageUrl) +
      '" alt="' + alt + '" decoding="async">';
  }

  function renderHeaderLogo() {
    if (config.headerLogoUrl) {
      var height = Number(config.headerLogoHeight) || 18;
      return '<img class="kaori-kyou-widget__header-logo" src="' + escapeAttribute(config.headerLogoUrl) + '" alt="' + escapeAttribute(config.headerLogoAlt || '') + '" style="height:' + height + 'px">';
    }
    return escapeHtml(config.headerLogoAlt || 'Kyou');
  }

  function renderCarousel(items, pageItemCount) {
    pageItemCount = pageItemCount || 4;
    var pages = padPages(chunkItems(items, pageItemCount), pageItemCount);
    var startPage = 0;

    if (widgetState && widgetState.firstItemIndex && pages.length) {
      startPage = Math.floor(widgetState.firstItemIndex / pageItemCount);
      if (startPage >= pages.length) {
        startPage = pages.length - 1;
      }
      if (startPage < 0) {
        startPage = 0;
      }
    }

    return [
      '<div class="kaori-kyou-widget__carousel" data-page="' + startPage + '">',
      '  <div class="kaori-kyou-widget__track" style="transform:translateX(-' + (startPage * 100) + '%)">' + renderPages(pages) + '</div>',
      renderCarouselControls(pages.length, startPage),
      '</div>'
    ].join('');
  }

  function renderPages(pages) {
    return pages
      .map(function (pageItems) {
        return '<div class="kaori-kyou-widget__page">' + renderCards(pageItems) + '</div>';
      })
      .join('');
  }

  function renderCards(items) {
    return items
      .map(function (item) {
        if (item.isPlaceholder) {
          return '<div class="kaori-kyou-widget__card kaori-kyou-widget__card--placeholder" aria-hidden="true"></div>';
        }

        var imageHtml = item.image
          ? '<div class="kaori-kyou-widget__thumb"><img src="' + escapeAttribute(item.image) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy"></div>'
          : '<div class="kaori-kyou-widget__thumb kaori-kyou-widget__thumb--empty"></div>';

        var brandHtml = item.series
          ? '<div class="kaori-kyou-widget__brand">' + escapeHtml(item.series) + '</div>'
          : '';

        return [
          '<a class="kaori-kyou-widget__card" href="' + escapeAttribute(appendUtm(item.url)) + '" target="_blank" rel="noopener sponsored nofollow">',
          imageHtml,
          '<div class="kaori-kyou-widget__info">',
          '<div class="kaori-kyou-widget__card-title">' + escapeHtml(item.title) + '</div>',
          brandHtml,
          '</div>',
          '</a>'
        ].join('');
      })
      .join('');
  }

  function renderCarouselControls(pageCount, activeIndex) {
    if (pageCount <= 1) {
      return '';
    }

    return [
      '<button class="kaori-kyou-widget__nav kaori-kyou-widget__nav--prev" type="button" aria-label="Previous">&#8249;</button>',
      '<button class="kaori-kyou-widget__nav kaori-kyou-widget__nav--next" type="button" aria-label="Next">&#8250;</button>',
      '<div class="kaori-kyou-widget__dots">' + renderDots(pageCount, activeIndex || 0) + '</div>'
    ].join('');
  }

  function renderDots(pageCount, activeIndex) {
    activeIndex = activeIndex || 0;
    var html = '';
    for (var i = 0; i < pageCount; i += 1) {
      html += '<button class="kaori-kyou-widget__dot' + (i === activeIndex ? ' is-active' : '') + '" type="button" data-index="' + i + '" aria-label="Go to slide ' + (i + 1) + '"></button>';
    }

    return html;
  }

  function bindCarousel(widget, pageItemCount) {
    pageItemCount = pageItemCount || 4;
    var carousel = widget.querySelector('.kaori-kyou-widget__carousel');
    if (!carousel) {
      return;
    }

    var track = carousel.querySelector('.kaori-kyou-widget__track');
    var pages = carousel.querySelectorAll('.kaori-kyou-widget__page');
    var dots = carousel.querySelectorAll('.kaori-kyou-widget__dot');
    var prev = carousel.querySelector('.kaori-kyou-widget__nav--prev');
    var next = carousel.querySelector('.kaori-kyou-widget__nav--next');
    var pageCount = pages.length;
    var currentPage = Number(carousel.getAttribute('data-page')) || 0;
    var autoSlideTimer = null;

    if (currentPage >= pageCount) {
      currentPage = 0;
    }
    track.style.transform = 'translateX(-' + currentPage * 100 + '%)';

    if (widgetState) {
      widgetState.firstItemIndex = currentPage * pageItemCount;
    }

    if (pageCount <= 1) {
      return;
    }

    function updatePage(index) {
      currentPage = (index + pageCount) % pageCount;
      track.style.transform = 'translateX(-' + currentPage * 100 + '%)';
      carousel.setAttribute('data-page', String(currentPage));

      if (widgetState) {
        widgetState.firstItemIndex = currentPage * pageItemCount;
      }

      Array.prototype.forEach.call(dots, function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentPage);
      });
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        window.clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideTimer = window.setInterval(function () {
        updatePage(currentPage + 1);
      }, config.autoSlideMs);
    }

    prev.addEventListener('click', function () {
      updatePage(currentPage - 1);
      startAutoSlide();
    });

    next.addEventListener('click', function () {
      updatePage(currentPage + 1);
      startAutoSlide();
    });

    Array.prototype.forEach.call(dots, function (dot) {
      dot.addEventListener('click', function () {
        updatePage(Number(dot.getAttribute('data-index')) || 0);
        startAutoSlide();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
    startAutoSlide();
  }

  function padPages(pages, size) {
    if (!pages.length) return pages;
    size = size || 4;
    var result = pages.map(function (p) { return p.slice(); });
    var lastPage = result[result.length - 1];
    while (lastPage.length < size) {
      lastPage.push({ isPlaceholder: true });
    }
    return result;
  }

  function chunkItems(items, size) {
    var chunks = [];

    for (var i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    return chunks;
  }

  function resolveImage(source) {
    var direct = firstString([
      source.icon_link,
      source.image_link,
      source.primary_image,
      source.image,
      source.image_url,
      source.thumbnail,
      source.thumbnail_url,
      source.cover,
      source.cover_image
    ]);

    if (direct) {
      return direct;
    }

    var nested = [
      source.primary_image,
      source.icon_link,
      source.image_link,
      source.image,
      source.thumbnail,
      source.cover,
      source.images && source.images[0],
      source.gallery && source.gallery[0]
    ];

    for (var i = 0; i < nested.length; i += 1) {
      var candidate = nested[i];
      if (!candidate) {
        continue;
      }

      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }

      if (typeof candidate === 'object') {
        var nestedUrl = firstString([
          candidate.url,
          candidate.src,
          candidate.original,
          candidate.medium,
          candidate.large,
          candidate.thumbnail
        ]);

        if (nestedUrl) {
          return nestedUrl;
        }
      }
    }

    return '';
  }

  function injectFont() {
    var fontId = config.widgetId + '-font';
    if (document.getElementById(fontId)) return;

    var preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    var preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    var font = document.createElement('link');
    font.id = fontId;
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(font);
  }

  function injectStyles() {
    if (document.getElementById(config.widgetId + '-styles')) {
      return;
    }

    injectFont();

    var style = document.createElement('style');
    style.id = config.widgetId + '-styles';
    style.textContent = [
      '.kaori-kyou-widget{width:100%;max-width:100%;box-sizing:border-box;border-radius:16px;background:#fff5f0;margin:18px 0;font-family:Nunito,Arial,sans-serif;box-shadow:0 14px 28px rgba(17,24,39,.14);overflow:hidden}',
      '.kaori-kyou-widget__header,a.kaori-kyou-widget__header,a.kaori-kyou-widget__header:link,a.kaori-kyou-widget__header:visited,a.kaori-kyou-widget__header:hover,a.kaori-kyou-widget__header:active{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 14px;background:#fc4c02;color:#fff !important;font-weight:800;font-size:16px;letter-spacing:.2px;text-decoration:none !important;text-align:center;line-height:1.2}',
      '.kaori-kyou-widget__header:hover{background:#e84400}',
      '.kaori-kyou-widget__header-logo{display:inline-block;vertical-align:middle;width:auto;object-fit:contain}',
      // Capped so the 7.6:1 wordmark keeps roughly the height the text header had, instead of
      // growing into a banner on a wide column.
      '.kaori-kyou-widget__header-anim{display:block;width:100%;max-width:380px;height:auto}',
      '.kaori-kyou-widget__body{position:relative;padding:10px;box-sizing:border-box;background:transparent}',
      '.kaori-kyou-widget--skeleton{background:#f9fafb}',
      '.kaori-kyou-widget__skeleton-grid{display:grid;grid-template-columns:repeat(var(--kaori-cols,2),1fr);gap:8px}',
      '.kaori-kyou-widget__skeleton-header{background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:kaoriKyouSkeleton 1.2s ease-in-out infinite;height:40px;padding:0}',
      '.kaori-kyou-widget__skeleton-card{border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column}',
      '.kaori-kyou-widget__skeleton-thumb{width:100%;aspect-ratio:1/1;background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:kaoriKyouSkeleton 1.2s ease-in-out infinite}',
      '.kaori-kyou-widget__skeleton-info{padding:6px 7px 8px;height:58px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px}',
      '.kaori-kyou-widget__skeleton-line{border-radius:4px;background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:kaoriKyouSkeleton 1.2s ease-in-out infinite}',
      '.kaori-kyou-widget__skeleton-line--title{height:10px;width:90%}',
      '.kaori-kyou-widget__skeleton-line--brand{height:8px;width:60%}',
      '.kaori-kyou-widget__skeleton-dots{display:flex;justify-content:center;gap:5px;padding:8px 0 6px}',
      '.kaori-kyou-widget__skeleton-dots span{width:6px;height:6px;border-radius:999px;background:#e5e7eb}',
      '.kaori-kyou-widget__skeleton-dots span:first-child{width:18px;background:#d1d5db}',
      '.kaori-kyou-widget__carousel{overflow:hidden}',
      '.kaori-kyou-widget__track{display:flex;transition:transform .28s ease}',
      '.kaori-kyou-widget__page{flex:0 0 100%;display:grid;grid-template-columns:repeat(var(--kaori-cols,2),1fr);gap:8px}',
      '.kaori-kyou-widget__card,a.kaori-kyou-widget__card:link,a.kaori-kyou-widget__card:visited,a.kaori-kyou-widget__card:hover,a.kaori-kyou-widget__card:active{display:flex;flex-direction:column;color:#111827 !important;text-decoration:none !important;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 2px 8px rgba(15,23,42,.1);transition:transform .2s ease,box-shadow .2s ease}',
      '.kaori-kyou-widget__card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(15,23,42,.15)}',
      '.kaori-kyou-widget__card--placeholder{background:transparent;box-shadow:none;pointer-events:none;visibility:hidden}',
      '.kaori-kyou-widget__card--placeholder::before{content:"";display:block;width:100%;aspect-ratio:1/1}',
      '.kaori-kyou-widget__card--placeholder::after{content:"";display:block;height:58px}',
      '.kaori-kyou-widget__card--cta{display:flex;align-items:center;justify-content:center;min-height:80px;box-shadow:none;background:transparent}',
      '.kaori-kyou-widget__cta-pill{display:inline-flex;align-items:center;justify-content:center;padding:0 14px;height:30px;border-radius:999px;background:#111827;color:#fff;font-size:10px;font-weight:700;box-shadow:0 4px 10px rgba(15,23,42,.2)}',
      '.kaori-kyou-widget__thumb{width:100%;aspect-ratio:1/1;overflow:hidden;background:#f3e6df}',
      '.kaori-kyou-widget__thumb--empty{background:linear-gradient(135deg,#ffd8c2,#ffefe5)}',
      '.kaori-kyou-widget__thumb img{display:block;width:100%;height:100%;object-fit:cover}',
      '.kaori-kyou-widget__info{padding:6px 7px 8px;background:#fff;box-sizing:border-box;height:58px;overflow:hidden}',
      '.kaori-kyou-widget__card-title{font-size:11px;font-weight:700;line-height:1.35;color:#111827;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      '.kaori-kyou-widget__brand{margin-top:3px;font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.kaori-kyou-widget__nav{position:absolute;top:50%;transform:translateY(-50%);width:24px;height:24px;border:0;border-radius:999px;background:rgba(255,255,255,.9);color:#111827;font-size:16px;line-height:24px;text-align:center;cursor:pointer;z-index:2;box-shadow:0 2px 6px rgba(15,23,42,.2)}',
      '.kaori-kyou-widget__nav--prev{left:4px}',
      '.kaori-kyou-widget__nav--next{right:4px}',
      '.kaori-kyou-widget__dots{display:flex;justify-content:center;gap:5px;padding:8px 0 6px}',
      '.kaori-kyou-widget__dot{width:6px;height:6px;padding:0;border:0;border-radius:999px;background:rgba(211, 210, 210, 0.55);cursor:pointer}',
      '.kaori-kyou-widget__dot.is-active{width:18px;background:#fc4c02}',
      // Oripa gets its own gold panel, matching the Kyou Oripa key art. The banner cards are
      // near-black, so they read as cards sitting *on* the gold rather than part of the page.
      '.kaori-kyou-widget__oripa{margin:0 10px 10px;padding:10px;border-radius:14px;box-sizing:border-box;background:linear-gradient(180deg,#fdefb8 0%,#f8d75f 48%,#efab16 100%);box-shadow:inset 0 0 0 1px rgba(120,80,0,.16),0 2px 8px rgba(120,80,0,.16)}',
      // The badge is anchored to the head, not the panel, so it can never spill down over the
      // first banner -- where it would land squarely on that banner's category chip.
      '.kaori-kyou-widget__oripa-head{position:relative;display:flex;flex-direction:column;justify-content:center;min-height:34px;padding:0 0 9px;text-align:center}',
      '.kaori-kyou-widget__oripa-badge{position:absolute;left:0;top:0;width:36px;height:auto;pointer-events:none}',
      '.kaori-kyou-widget__oripa-title{font-size:14px;font-weight:800;line-height:1.25;color:#4a3411;text-shadow:0 1px 0 rgba(255,255,255,.45)}',
      '.kaori-kyou-widget__oripa-tagline{margin-top:2px;font-size:10px;font-weight:700;letter-spacing:.3px;color:#8a6621}',
      '.kaori-kyou-widget__oripa-frame{position:relative}',
      '.kaori-kyou-widget__oripa-track{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}',
      '.kaori-kyou-widget__oripa-track::-webkit-scrollbar{display:none}',
      '.kaori-kyou-widget__oripa-slide,a.kaori-kyou-widget__oripa-slide:link,a.kaori-kyou-widget__oripa-slide:visited,a.kaori-kyou-widget__oripa-slide:hover,a.kaori-kyou-widget__oripa-slide:active{flex:0 0 100%;scroll-snap-align:start;display:block;border-radius:10px;overflow:hidden;background:#101214;color:#fff !important;text-decoration:none !important;box-shadow:0 2px 8px rgba(15,23,42,.12)}',
      '.kaori-kyou-widget__oripa-thumb{position:relative;width:100%;aspect-ratio:850/378;overflow:hidden;background:#101214}',
      '.kaori-kyou-widget__oripa-thumb img{display:block;width:100%;height:100%;object-fit:cover}',
      '.kaori-kyou-widget__oripa-chip{position:absolute;left:8px;top:8px;padding:3px 7px;border-radius:999px;background:rgba(0,0,0,.66);color:#fff;font-size:9px;font-weight:800;letter-spacing:.3px;line-height:1.2}',
      '.kaori-kyou-widget__oripa-info{padding:8px 10px 10px;box-sizing:border-box}',
      '.kaori-kyou-widget__oripa-name{font-size:12px;font-weight:700;line-height:1.35;color:#fff;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}',
      '.kaori-kyou-widget__oripa-cost{display:flex;align-items:center;gap:3px;margin-top:4px;font-size:10px;font-weight:700;color:#cbd5e1}',
      '.kaori-kyou-widget__oripa-coin{display:inline-block;width:12px;height:12px;vertical-align:middle;flex:0 0 auto}',
      '.kaori-kyou-widget__oripa-nav{position:absolute;top:calc(50% - 14px);transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:999px;background:rgba(15,23,42,.65);color:#fff;font-size:15px;line-height:1;cursor:pointer}',
      '.kaori-kyou-widget__oripa-nav:hover{background:rgba(15,23,42,.85)}',
      '.kaori-kyou-widget__oripa-nav--prev{left:6px}',
      '.kaori-kyou-widget__oripa-nav--next{right:6px}',
      '@keyframes kaoriKyouSkeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}',
      '@media (max-width:480px){.kaori-kyou-widget{width:100%}}'
    ].join('');

    document.head.appendChild(style);
  }

  function normalizeTag(value) {
    return value.replace(/^#/, '').replace(/\s+/g, ' ').trim();
  }

  function stripTitlePrefix(value) {
    return String(value || '').replace(/^\s*\[[^\]]+\]\s*/g, '').trim();
  }

  function containsBannedKeyword(value) {
    var normalized = String(value || '').toLowerCase();

    return config.bannedKeywords.some(function (keyword) {
      return normalized.indexOf(String(keyword).toLowerCase()) !== -1;
    });
  }

  function firstString(values) {
    for (var i = 0; i < values.length; i += 1) {
      if (typeof values[i] === 'string' && values[i].trim()) {
        return values[i].trim();
      }
    }

    return '';
  }

  function appendUtm(rawUrl, utmParams) {
    var params = utmParams || config.utmParams;
    if (!rawUrl || !params) {
      return rawUrl;
    }

    try {
      var url = new URL(rawUrl);
      for (var key in params) {
        if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
        var value = params[key];
        if (value === undefined || value === null || value === '') continue;
        if (url.searchParams.has(key)) continue;
        url.searchParams.set(key, String(value));
      }
      return url.toString();
    } catch (e) {
      return rawUrl;
    }
  }

  function trimSlashes(value) {
    return String(value || '').replace(/^\/+|\/+$/g, '');
  }

  function extend(target) {
    for (var i = 1; i < arguments.length; i += 1) {
      var source = arguments[i];
      if (!source) {
        continue;
      }

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
