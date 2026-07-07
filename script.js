;(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    searchEndpoint: 'https://search.kyou.id/v1/search',
    tagContainerSelector: '.td-tags',
    tagLinkSelector: '.td-tags a',
    mountAfterSelector: '#kaori-widget-anchor',
    widgetId: 'kaori-kyou-widget',
    maxSourceTags: 50,
    bannedKeywords: ['seiyu'],
    bannedItemKeywords: ['PVC Figure 1/4'],
    resultLimit: 40,
    fallbackRenderLimit: 40,
    maxIndividualSearches: 5,
    minResultsToShow: 1,
    minTagResults: 12,
    timeoutMs: 8000,
    randomPoolSize: 40,
    randomMaxPage: 5,
    randomSort: 'kyou_search_score',
    defaultSort: 'kyou_search_score',
    autoSlideMs: 5000,
    headerText: '#RayakanHobimu Bersama {logo}',
    headerHref: 'https://kyou.id',
    headerLogoUrl: 'https://i.ibb.co.com/YFXhS8ZM/Kyou-Putih.png',
    headerLogoAlt: 'Kyou',
    headerLogoHeight: 32,
    utmParams: {
      utm_source: 'kaori',
      utm_medium: 'widget',
      utm_campaign: 'kyou-recs'
    }
  };

  var userConfig = window.KaoriKyouWidgetConfig || {};
  var config = extend({}, DEFAULT_CONFIG, userConfig);
  var widgetState = null;

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
    var query = validTags.join(' ');

    // Per-tag searches run in parallel and are merged in tag-priority order.
    // A single combined "all tags joined" query is intentionally avoided: the
    // backend treats the extra terms as near-AND, so it is both slow (0.5-3.5s)
    // and matches almost nothing, forcing a fallthrough anyway.
    return searchEachTag(validTags)
      .catch(function () {
        return [];
      })
      .then(function (items) {
        if (items.length > config.minTagResults) {
          return {
            validTags: validTags,
            items: items,
            query: query
          };
        }

        return loadFallbackPayload();
      });
  }

  function searchEachTag(validTags) {
    var tagsToSearch = validTags.slice(0, config.maxIndividualSearches);

    var requests = tagsToSearch.map(function (tag) {
      return searchRequest(tag, config.resultLimit).catch(function () {
        return [];
      });
    });

    // Fire all tag requests concurrently, then merge preserving tag order so the
    // first tag's results still rank first.
    return Promise.all(requests).then(function (resultsPerTag) {
      var uniqueUrls = Object.create(null);
      var mergedItems = [];

      for (var i = 0; i < resultsPerTag.length; i += 1) {
        var items = resultsPerTag[i];
        for (var j = 0; j < items.length; j += 1) {
          var item = items[j];
          if (!item || !item.url || uniqueUrls[item.url]) {
            continue;
          }
          uniqueUrls[item.url] = true;
          mergedItems.push(item);
        }
      }

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
    if (config.defaultSort) {
      url.searchParams.set('sort', config.defaultSort);
    }
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

  function renderHeader() {
    if (!config.headerText) return '';

    var parts = String(config.headerText).split('{logo}');
    var content = '';
    for (var i = 0; i < parts.length; i += 1) {
      content += escapeHtml(parts[i]);
      if (i < parts.length - 1) {
        content += renderHeaderLogo();
      }
    }

    if (config.headerHref) {
      return '<a class="kaori-kyou-widget__header" href="' + escapeAttribute(appendUtm(config.headerHref)) + '" target="_blank" rel="noopener sponsored nofollow">' + content + '</a>';
    }
    return '<div class="kaori-kyou-widget__header">' + content + '</div>';
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
      '.kaori-kyou-widget__header,a.kaori-kyou-widget__header,a.kaori-kyou-widget__header:link,a.kaori-kyou-widget__header:visited,a.kaori-kyou-widget__header:hover,a.kaori-kyou-widget__header:active{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 14px;background:#382e2c;color:#fff !important;font-weight:800;font-size:16px;letter-spacing:.2px;text-decoration:none !important;text-align:center;line-height:1.2}',
      '.kaori-kyou-widget__header:hover{background:#382e2c}',
      '.kaori-kyou-widget__header-logo{display:inline-block;vertical-align:middle;width:auto;object-fit:contain}',
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

  function appendUtm(rawUrl) {
    if (!rawUrl || !config.utmParams) {
      return rawUrl;
    }

    try {
      var url = new URL(rawUrl);
      var params = config.utmParams;
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
