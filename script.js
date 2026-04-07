;(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    searchEndpoint: 'https://search.kyou.id/v1/search',
    tagContainerSelector: '.td-tags.td-post-small-box.clearfix',
    tagLinkSelector: '.td-tags.td-post-small-box.clearfix a',
    mountAfterSelector: '.td-tags.td-post-small-box.clearfix',
    widgetId: 'kaori-kyou-widget',
    maxSourceTags: 50,
    maxValidTags: 50,
    bannedKeywords: ['seiyu'],
    validationLimit: 12,
    resultLimit: 40,
    fallbackRenderLimit: 40,
    minResultsToShow: 1,
    timeoutMs: 8000,
    randomPoolSize: 40,
    randomSort: 'newest',
    autoSlideMs: 5000,
    searchPageBaseUrl: 'https://kyou.id/search'
  };

  var userConfig = window.KaoriKyouWidgetConfig || {};
  var config = extend({}, DEFAULT_CONFIG, userConfig);

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
    injectStyles();
    showSkeleton();

    if (!tags.length) {
      loadFallbackResults();
      return;
    }

    validateTags(tags)
      .then(function (validTags) {
        if (!validTags.length) {
          return loadFallbackPayload();
        }

        return searchWithFallbacks(validTags);
      })
      .then(function (payload) {
        hideSkeleton();
        if (!payload || !payload.items || payload.items.length < config.minResultsToShow) {
          return;
        }

        mountWidget(payload.validTags, payload.items, payload.query || '');
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

        mountWidget([], items, payload && payload.query ? payload.query : '');
      })
      .catch(function (error) {
        hideSkeleton();
        if (window.console && typeof window.console.warn === 'function') {
          console.warn('[KaoriKyouWidget] Failed to load fallback results.', error);
        }
      });
  }

  function searchWithFallbacks(validTags) {
    var query = validTags.join(' ');

    return searchByTags(validTags).then(function (items) {
      if (items.length) {
        return {
          validTags: validTags,
          items: items,
          query: query
        };
      }

      return searchEachTag(validTags).then(function (fallbackItems) {
        if (fallbackItems.length) {
          return {
            validTags: validTags,
            items: fallbackItems,
            query: query
          };
        }

        return loadFallbackPayload();
      });
    });
  }

  function searchEachTag(validTags) {
    var uniqueUrls = Object.create(null);
    var mergedItems = [];
    var chain = Promise.resolve();

    validTags.forEach(function (tag) {
      chain = chain.then(function () {
        if (mergedItems.length >= config.resultLimit) {
          return null;
        }

        return searchRequest(tag, config.resultLimit).then(function (items) {
          items.forEach(function (item) {
            if (!item || !item.url || uniqueUrls[item.url]) {
              return;
            }

            uniqueUrls[item.url] = true;
            mergedItems.push(item);
          });
        });
      });
    });

    return chain.then(function () {
      return mergedItems.slice(0, config.resultLimit);
    });
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

        var key = text.toLowerCase();
        if (seen[key]) {
          return null;
        }

        seen[key] = true;
        return text;
      })
      .filter(Boolean)
      .slice(0, config.maxSourceTags);
  }

  function validateTags(tags) {
    var queue = tags.map(function (tag) {
      return searchRequest(tag, config.validationLimit)
        .then(function (items) {
          return items.length ? tag : null;
        })
        .catch(function () {
          return null;
        });
    });

    return Promise.all(queue).then(function (results) {
      return results.filter(Boolean).slice(0, config.maxValidTags);
    });
  }

  function searchByTags(validTags) {
    var query = validTags.join(' ');
    return searchRequest(query, config.resultLimit);
  }

  function searchRequest(query, limit) {
    var url = buildSearchUrl(query, limit);
    return fetchWithTimeout(url, config.timeoutMs)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Search request failed with status ' + response.status);
        }

        return response.json();
      })
      .then(function (payload) {
        return extractItems(payload, limit);
      });
  }

  function buildSearchUrl(query, limit) {
    var url = new URL(config.searchEndpoint);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));
    return url.toString();
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
    }).finally(function () {
      window.clearTimeout(timer);
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

    var series = firstString([
      Array.isArray(source.series) ? source.series[0] : '',
      source.series,
      source.product_line,
      source.franchise
    ]);

    return {
      title: title,
      url: url,
      image: image,
      manufacturer: manufacturer,
      series: series
    };
  }

  function fetchRandomMitsuhaItems() {
    return fetchRandomMitsuhaPage()
      .then(function (payload) {
        var items = extractItems(payload, config.randomPoolSize);
        if (items.length) {
          return items;
        }

        return searchRequest('', config.resultLimit);
      })
      .catch(function () {
        return searchRequest('', config.resultLimit);
      });
  }

  function fetchRandomMitsuhaPage() {
    return fetchSearchPayload({
      q: '',
      sold: 'false',
      ordertype: 'PO,ready',
      sort: config.randomSort,
      page: '1,1',
      excludeFilters: 'true'
    }).then(function (payload) {
      var totalItems = getTotalItems(payload);
      var pageSize = config.randomPoolSize;
      var maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
      var randomPage = Math.max(1, Math.floor(Math.random() * maxPage) + 1);

      return fetchSearchPayload({
        q: '',
        sold: 'false',
        ordertype: 'PO,ready',
        sort: config.randomSort,
        page: randomPage + ',' + pageSize,
        excludeFilters: 'true'
      });
    });
  }

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

  function getTotalItems(payload) {
    var total = payload && payload.data && payload.data.total_items;
    if (typeof total === 'number' && total >= 0) {
      return total;
    }

    return 0;
  }

  function isAllowedItem(source) {
    if (!source || typeof source !== 'object') {
      return false;
    }

    if (source.is_adult) {
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

    return true;
  }

  function mountWidget(validTags, items, query) {
    hideSkeleton();

    if (document.getElementById(config.widgetId)) {
      return;
    }

    var anchor = document.querySelector(config.mountAfterSelector);
    var widget = document.createElement('aside');
    widget.id = config.widgetId;
    widget.className = 'kaori-kyou-widget';

    widget.innerHTML = [
      '<div class="kaori-kyou-widget__body">' + renderCarousel(items, query) + '</div>'
    ].join('');

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(widget, anchor.nextSibling);
    } else {
      document.body.appendChild(widget);
    }

    bindCarousel(widget);
  }

  function showSkeleton() {
    if (document.getElementById(config.widgetId) || document.getElementById(config.widgetId + '-skeleton')) {
      return;
    }

    var anchor = document.querySelector(config.mountAfterSelector);
    var skeleton = document.createElement('aside');
    skeleton.id = config.widgetId + '-skeleton';
    skeleton.className = 'kaori-kyou-widget kaori-kyou-widget--skeleton';
    skeleton.innerHTML = [
      '<div class="kaori-kyou-widget__body">',
      '  <div class="kaori-kyou-widget__skeleton-grid">',
      '    <div class="kaori-kyou-widget__skeleton-card"></div>',
      '    <div class="kaori-kyou-widget__skeleton-card"></div>',
      '    <div class="kaori-kyou-widget__skeleton-card"></div>',
      '    <div class="kaori-kyou-widget__skeleton-card"></div>',
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

  function renderCarousel(items, query) {
    var pages = fillLastPageWithCta(chunkItems(items, 4), query);

    return [
      '<div class="kaori-kyou-widget__carousel" data-page="0">',
      '  <div class="kaori-kyou-widget__track">' + renderPages(pages) + '</div>',
      renderCarouselControls(pages.length),
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
        if (item && item.type === 'cta') {
          return renderCtaCard(item.url);
        }

        if (item && item.isPlaceholder) {
          return '<div class="kaori-kyou-widget__card kaori-kyou-widget__card--placeholder" aria-hidden="true"></div>';
        }

        var imageHtml = item.image
          ? '<div class="kaori-kyou-widget__thumb"><img src="' + escapeAttribute(item.image) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy"></div>'
          : '<div class="kaori-kyou-widget__thumb kaori-kyou-widget__thumb--empty"></div>';

        var manufacturerHtml = item.manufacturer
          ? '<div class="kaori-kyou-widget__meta">' + escapeHtml(item.manufacturer) + '</div>'
          : '';

        var seriesHtml = item.series
          ? '<div class="kaori-kyou-widget__meta kaori-kyou-widget__meta--muted">' + escapeHtml(item.series) + '</div>'
          : '';

        return [
          '<a class="kaori-kyou-widget__card" href="' + escapeAttribute(item.url) + '" target="_blank" rel="noopener sponsored">',
          imageHtml,
          '  <div class="kaori-kyou-widget__overlay">',
          '    <div class="kaori-kyou-widget__content">',
          '      <div class="kaori-kyou-widget__card-title">' + escapeHtml(item.title) + '</div>',
          manufacturerHtml,
          seriesHtml,
          '    </div>',
          '  </div>',
          '</a>'
        ].join('');
      })
      .join('');
  }

  function renderCtaCard(url) {
    return [
      '<a class="kaori-kyou-widget__card kaori-kyou-widget__card--cta" href="' + escapeAttribute(url) + '" target="_blank" rel="noopener sponsored">',
      '<span class="kaori-kyou-widget__cta-pill">Lihat Kyou &#8594;</span>',
      '</a>'
    ].join('');
  }

  function renderCarouselControls(pageCount) {
    if (pageCount <= 1) {
      return '';
    }

    return [
      '<button class="kaori-kyou-widget__nav kaori-kyou-widget__nav--prev" type="button" aria-label="Previous">&#8249;</button>',
      '<button class="kaori-kyou-widget__nav kaori-kyou-widget__nav--next" type="button" aria-label="Next">&#8250;</button>',
      '<div class="kaori-kyou-widget__dots">' + renderDots(pageCount) + '</div>'
    ].join('');
  }

  function renderDots(pageCount) {
    var html = '';
    for (var i = 0; i < pageCount; i += 1) {
      html += '<button class="kaori-kyou-widget__dot' + (i === 0 ? ' is-active' : '') + '" type="button" data-index="' + i + '" aria-label="Go to slide ' + (i + 1) + '"></button>';
    }

    return html;
  }

  function bindCarousel(widget) {
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
    var currentPage = 0;
    var autoSlideTimer = null;

    if (pageCount <= 1) {
      return;
    }

    function updatePage(index) {
      currentPage = (index + pageCount) % pageCount;
      track.style.transform = 'translateX(-' + currentPage * 100 + '%)';
      carousel.setAttribute('data-page', String(currentPage));

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

  function chunkItems(items, size) {
    var chunks = [];

    for (var i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    return chunks;
  }

  function fillLastPageWithCta(pages, query) {
    if (!pages.length) {
      return [];
    }

    var result = pages.map(function (page) {
      return page.slice();
    });
    var lastPage = result[result.length - 1];

    if (lastPage.length === 4) {
      return result;
    }

    while (lastPage.length < 3) {
      lastPage.push({ isPlaceholder: true });
    }

    lastPage.push({
      type: 'cta',
      url: buildSearchPageUrl(query)
    });

    return result;
  }

  function buildSearchPageUrl(query) {
    var url = new URL(config.searchPageBaseUrl);

    if (query) {
      url.searchParams.set('q', query);
    }

    url.searchParams.set('sold', 'false');
    url.searchParams.set('sort', 'kyou_search_score');
    return url.toString();
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

  function injectStyles() {
    if (document.getElementById(config.widgetId + '-styles')) {
      return;
    }

    var style = document.createElement('style');
    style.id = config.widgetId + '-styles';
    style.textContent = [
      '.kaori-kyou-widget{width:280px;max-width:100%;height:280px;box-sizing:border-box;overflow:hidden;border-radius:16px;background:#fff;margin:18px 0;font-family:Arial,sans-serif;box-shadow:0 14px 28px rgba(17,24,39,.14)}',
      '.kaori-kyou-widget__body{position:relative;padding:8px;height:100%;box-sizing:border-box;background:#fff7f2}',
      '.kaori-kyou-widget--skeleton .kaori-kyou-widget__body{padding:8px}',
      '.kaori-kyou-widget__skeleton-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,1fr);gap:8px;height:100%}',
      '.kaori-kyou-widget__skeleton-card{border-radius:14px;background:linear-gradient(90deg,#f3e6df 25%,#fff5f0 50%,#f3e6df 75%);background-size:200% 100%;animation:kaoriKyouSkeleton 1.2s ease-in-out infinite}',
      '.kaori-kyou-widget__carousel{position:relative;height:100%;overflow:hidden}',
      '.kaori-kyou-widget__track{display:flex;height:100%;transition:transform .28s ease}',
      '.kaori-kyou-widget__page{flex:0 0 100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-content:start}',
      '.kaori-kyou-widget__card{position:relative;display:block;color:inherit;text-decoration:none;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 8px 18px rgba(15,23,42,.08);transition:transform .2s ease,box-shadow .2s ease;aspect-ratio:1 / 1}',
      '.kaori-kyou-widget__card:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(15,23,42,.12)}',
      '.kaori-kyou-widget__card--placeholder{background:transparent;box-shadow:none;pointer-events:none}',
      '.kaori-kyou-widget__card--cta{display:flex;align-items:center;justify-content:center;background:transparent;box-shadow:none}',
      '.kaori-kyou-widget__cta-pill{display:inline-flex;align-items:center;justify-content:center;max-width:88px;min-height:28px;padding:0 12px;border-radius:999px;background:#111827;color:#fff;font-size:10px;font-weight:700;line-height:1.1;text-align:center;box-shadow:0 8px 18px rgba(15,23,42,.16)}',
      '.kaori-kyou-widget__thumb{width:100%;height:100%;overflow:hidden;background:#ffd4bf}',
      '.kaori-kyou-widget__thumb--empty{background:linear-gradient(135deg,#ffd8c2,#ffefe5)}',
      '.kaori-kyou-widget__thumb img{display:block;width:100%;height:100%;object-fit:cover}',
      '.kaori-kyou-widget__overlay{position:absolute;left:0;right:0;bottom:0;padding:8px;background:linear-gradient(180deg,rgba(17,24,39,0) 0%,rgba(17,24,39,.88) 58%,rgba(17,24,39,.96) 100%)}',
      '.kaori-kyou-widget__content{min-width:0}',
      '.kaori-kyou-widget__card-title{font-size:11px;font-weight:700;line-height:1.25;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      '.kaori-kyou-widget__meta{margin-top:4px;font-size:9px;line-height:1.25;color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.kaori-kyou-widget__meta--muted{margin-top:2px;color:rgba(255,255,255,.74)}',
      '.kaori-kyou-widget__nav{position:absolute;top:50%;transform:translateY(-50%);width:22px;height:22px;border:0;border-radius:999px;background:rgba(17,24,39,.7);color:#fff;font-size:15px;line-height:22px;text-align:center;cursor:pointer;z-index:2}',
      '.kaori-kyou-widget__nav--prev{left:6px}',
      '.kaori-kyou-widget__nav--next{right:6px}',
      '.kaori-kyou-widget__dots{position:absolute;left:0;right:0;bottom:2px;display:flex;justify-content:center;gap:5px}',
      '.kaori-kyou-widget__dot{width:6px;height:6px;padding:0;border:0;border-radius:999px;background:#fdba8c;cursor:pointer}',
      '.kaori-kyou-widget__dot.is-active{width:16px;background:#f97316}',
      '@keyframes kaoriKyouSkeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}',
      '@media (max-width:480px){.kaori-kyou-widget{width:100%;height:auto}.kaori-kyou-widget__body{height:auto;min-height:280px}.kaori-kyou-widget__page{grid-template-columns:repeat(2,minmax(0,1fr))}}'
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
