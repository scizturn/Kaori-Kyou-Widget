(() => {
  "use strict";

  const DEFAULTS = {
    kaoriApiBase: "",
    kaoriArticlePath: "/articles/{id}",
    kyouApiBase: "https://search.kyou.id/v1/search",
    kyouRecommendPath: "/recommendations",
    kyouMode: "mitsuha-search",
    kyouSearchPath: "",
    articleId: "",
    context: "",
    title: "Kyou Picks",
    widgetWidth: 280,
    widgetHeight: 280,
    maxItems: 10,
    timeoutMs: 7000,
    retries: 1,
  };

  function getCurrentScript() {
    if (document.currentScript) return document.currentScript;
    const scripts = document.querySelectorAll("script[src]");
    for (let i = scripts.length - 1; i >= 0; i -= 1) {
      const src = scripts[i].getAttribute("src") || "";
      if (src.includes("Kyou-Embed.js")) return scripts[i];
    }
    return null;
  }

  function readMeta(name, attr = "name") {
    const el = document.querySelector(`meta[${attr}="${name}"]`);
    return el ? el.getAttribute("content") : "";
  }

  function parseTags(input) {
    if (Array.isArray(input)) return input.map(String).map((x) => x.trim()).filter(Boolean);
    if (typeof input !== "string") return [];
    return input.split(",").map((x) => x.trim()).filter(Boolean);
  }

  function toNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function toString(value, fallback = "") {
    if (value == null) return fallback;
    return String(value);
  }

  function sanitizeUrl(url) {
    if (!url || typeof url !== "string") return "";
    try {
      const u = new URL(url, window.location.origin);
      if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
      return "";
    } catch {
      return "";
    }
  }

  function sanitizeItemName(name) {
    return toString(name, "")
      .replace(/\[[^\]]*]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function mergeConfig(script) {
    const globalCfg = window.KyouEmbedConfig || {};
    const data = script?.dataset || {};

    return {
      ...DEFAULTS,
      ...globalCfg,
      ...data,
      maxItems: toNumber(data.maxItems ?? globalCfg.maxItems, DEFAULTS.maxItems),
      timeoutMs: toNumber(data.timeoutMs ?? globalCfg.timeoutMs, DEFAULTS.timeoutMs),
      retries: toNumber(data.retries ?? globalCfg.retries, DEFAULTS.retries),
      widgetWidth: toNumber(data.widgetWidth ?? globalCfg.widgetWidth, DEFAULTS.widgetWidth),
      widgetHeight: toNumber(data.widgetHeight ?? globalCfg.widgetHeight, DEFAULTS.widgetHeight),
      title: toString(data.title ?? globalCfg.title, DEFAULTS.title),
      kyouMode: toString(data.kyouMode ?? globalCfg.kyouMode, DEFAULTS.kyouMode),
      kyouSearchPath: toString(data.kyouSearchPath ?? globalCfg.kyouSearchPath, DEFAULTS.kyouSearchPath),
    };
  }

  function resolveArticleId(script, cfg) {
    return (
      script?.dataset?.articleId ||
      cfg.articleId ||
      readMeta("kaori:article_id") ||
      readMeta("article:id") ||
      readMeta("og:article:id", "property") ||
      new URLSearchParams(window.location.search).get("articleId") ||
      ""
    );
  }

  function resolveContext(script, cfg) {
    return (
      script?.dataset?.context ||
      cfg.context ||
      readMeta("kaori:context") ||
      readMeta("article:section") ||
      readMeta("og:section", "property") ||
      window.location.pathname ||
      ""
    );
  }

  function resolvePageTags(script) {
    const fromScript = parseTags(script?.dataset?.tags || "");
    if (fromScript.length) return fromScript;
    const fromKeywords = parseTags(readMeta("keywords"));
    if (fromKeywords.length) return fromKeywords;
    return parseTags(readMeta("article:tag", "property"));
  }

  function fallbackArticleFromPage(script) {
    return {
      title:
        readMeta("og:title", "property") ||
        readMeta("twitter:title") ||
        document.title ||
        "",
      tags: resolvePageTags(script),
      category:
        readMeta("article:section") ||
        readMeta("og:section", "property") ||
        "",
    };
  }

  function normalizeArticle(raw) {
    const data = raw && typeof raw === "object" ? raw : {};
    return {
      title: toString(data.title || data.headline || ""),
      tags: parseTags(data.tags || data.keywords || []),
      category: toString(data.category || data.topic || data.section || ""),
    };
  }

  function normalizeProducts(raw, cfg) {
    const list =
      raw?.products ||
      raw?.items ||
      raw?.recommendations ||
      raw?.data?.products ||
      raw?.data?.items ||
      [];

    if (!Array.isArray(list)) return [];

    const pickFirst = (value) => {
      if (Array.isArray(value)) return toString(value[0] || "");
      return toString(value || "");
    };

    return list.slice(0, cfg.maxItems).map((item) => ({
      name: sanitizeItemName(item?.name || item?.title || "Untitled") || "Untitled",
      image: sanitizeUrl(item?.image || item?.icon_link || item?.image_link || item?.imageUrl || ""),
      manufacturer: toString(item?.manufacturer || item?.manuf || item?.maker || item?.brand || "-"),
      series: pickFirst(item?.series || item?.series_name || item?.franchise) || "-",
      characterName: pickFirst(item?.characters || item?.character_name || item?.character || item?.characterName) || "-",
      url:
        sanitizeUrl(item?.url || item?.link || item?.permalink || "") ||
        sanitizeUrl(item?.id ? `https://kyou.id/items/${item.id}` : ""),
    }));
  }

  async function requestJson(url, init, cfg) {
    let lastErr = null;
    const attempts = Math.max(1, cfg.retries + 1);

    for (let i = 0; i < attempts; i += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), cfg.timeoutMs);

      try {
        const res = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body.slice(0, 120)}`);
        }

        return await res.json();
      } catch (err) {
        clearTimeout(timeoutId);
        lastErr = err;
      }
    }

    throw lastErr || new Error("Request failed");
  }

  async function fetchKaoriArticle(cfg, articleId, headers, script) {
    const base = toString(cfg.kaoriApiBase).replace(/\/$/, "");
    if (!base) return fallbackArticleFromPage(script);

    const path = toString(cfg.kaoriArticlePath, DEFAULTS.kaoriArticlePath).replace(
      "{id}",
      encodeURIComponent(articleId)
    );
    const url = `${base}${path}`;
    const data = await requestJson(url, { method: "GET", headers }, cfg);
    return normalizeArticle(data?.data || data);
  }

  async function fetchKyouRecommendations(cfg, payload, headers) {
    const base = toString(cfg.kyouApiBase).replace(/\/$/, "");
    if (!base) throw new Error("Missing data-kyou-api-base");

    if (toString(cfg.kyouMode).toLowerCase() === "mitsuha-search") {
      const query = (Array.isArray(payload.tags) && payload.tags[0]) || payload.title || payload.category || "";
      const params = new URLSearchParams({
        q: query,
        sort: "kyou_search_score",
        sold: "false",
        excludeFilters: "true",
        page: `1,${Math.max(12, cfg.maxItems * 4)}`,
      });
      const searchPath = toString(cfg.kyouSearchPath);
      const url = `${base}${searchPath}?${params.toString()}`;
      const data = await requestJson(url, { method: "GET", headers }, cfg);
      return normalizeProducts(data, cfg);
    }

    const url = `${base}${toString(cfg.kyouRecommendPath, DEFAULTS.kyouRecommendPath)}`;
    const data = await requestJson(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(payload),
      },
      cfg
    );

    return normalizeProducts(data, cfg);
  }

  function createMount(script) {
    const selector = script?.dataset?.target || "";
    if (selector) {
      const node = document.querySelector(selector);
      if (node) return node;
    }

    const mount = document.createElement("div");
    if (script?.parentNode) script.parentNode.insertBefore(mount, script.nextSibling);
    return mount;
  }

  function createRenderer(mount, cfg) {
    const root = mount.attachShadow({ mode: "open" });
    const host = document.createElement("section");
    let carouselTimer = null;

    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .kyou-widget {
        width: ${cfg.widgetWidth}px;
        height: ${cfg.widgetHeight}px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        box-sizing: border-box;
        background: #ffffff;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif;
        position: relative;
      }
      .kyou-carousel {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }
      .kyou-track {
        width: 100%;
        height: 100%;
        display: flex;
        transition: transform 500ms ease;
        will-change: transform;
      }
      .kyou-slide {
        min-width: 100%;
        width: 100%;
        height: 100%;
      }
      .kyou-item {
        width: 100%;
        height: 100%;
        display: block;
        text-decoration: none;
        color: inherit;
        position: relative;
        background: #0f172a;
      }
      .kyou-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        background: #334155;
      }
      .kyou-overlay {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 10px;
        background: linear-gradient(180deg, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.86) 56%, rgba(2, 6, 23, 0.95) 100%);
      }
      .kyou-name {
        margin: 0 0 4px;
        font-size: 13px;
        line-height: 1.25;
        font-weight: 700;
        color: #ffffff;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .kyou-desc {
        margin: 0;
        font-size: 11px;
        line-height: 1.35;
        color: #dbeafe;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .kyou-dots {
        position: absolute;
        right: 8px;
        top: 8px;
        display: flex;
        gap: 4px;
      }
      .kyou-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(255,255,255,0.4);
      }
      .kyou-dot.active {
        background: #ffffff;
      }
      .kyou-state {
        padding: 12px 10px;
        font-size: 12px;
        color: #6b7280;
      }
      .kyou-state.err { color: #b91c1c; }
    `;

    root.appendChild(style);
    root.appendChild(host);

    function clearCarouselTimer() {
      if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
      }
    }

    function renderState(text, isError) {
      clearCarouselTimer();
      host.innerHTML = "";
      const box = document.createElement("div");
      box.className = "kyou-widget";

      const state = document.createElement("div");
      state.className = `kyou-state${isError ? " err" : ""}`;
      state.textContent = text;

      box.appendChild(state);
      host.appendChild(box);
    }

    function renderProducts(items) {
      clearCarouselTimer();
      host.innerHTML = "";
      const box = document.createElement("div");
      box.className = "kyou-widget";

      const carousel = document.createElement("div");
      carousel.className = "kyou-carousel";
      const track = document.createElement("div");
      track.className = "kyou-track";
      const dots = document.createElement("div");
      dots.className = "kyou-dots";

      items.forEach((p) => {
        const slide = document.createElement("div");
        slide.className = "kyou-slide";
        const link = document.createElement("a");
        link.className = "kyou-item";
        link.href = p.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.className = "kyou-img";
        img.alt = p.name;
        img.loading = "lazy";
        if (p.image) img.src = p.image;
        img.referrerPolicy = "no-referrer";
        img.onerror = () => {
          img.style.background = "#334155";
          img.removeAttribute("src");
        };

        const overlay = document.createElement("div");
        overlay.className = "kyou-overlay";

        const name = document.createElement("p");
        name.className = "kyou-name";
        name.textContent = p.name;

        const desc = document.createElement("p");
        desc.className = "kyou-desc";
        desc.textContent = `${p.manufacturer} • ${p.series}`;

        overlay.appendChild(name);
        overlay.appendChild(desc);

        link.appendChild(img);
        link.appendChild(overlay);
        slide.appendChild(link);
        track.appendChild(slide);

        const dot = document.createElement("span");
        dot.className = "kyou-dot";
        dots.appendChild(dot);
      });

      carousel.appendChild(track);
      if (items.length > 1) carousel.appendChild(dots);
      box.appendChild(carousel);
      host.appendChild(box);

      let current = 0;
      const dotNodes = Array.from(dots.children);
      function updateCarousel(index) {
        current = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        dotNodes.forEach((d, i) => d.classList.toggle("active", i === index));
      }
      updateCarousel(0);

      if (items.length > 1) {
        carouselTimer = setInterval(() => {
          const next = (current + 1) % items.length;
          updateCarousel(next);
        }, 3500);
      }
    }

    return {
      renderLoading() {
        renderState("Loading recommendations...", false);
      },
      renderEmpty() {
        renderState("No matched products.", false);
      },
      renderError() {
        renderState("Widget failed to load.", true);
      },
      renderProducts,
      renderMissingArticleId() {
        renderState("Missing article ID", true);
      },
    };
  }

  async function init() {
    const script = getCurrentScript();
    const cfg = mergeConfig(script);
    const mount = createMount(script);
    const renderer = createRenderer(mount, cfg);

    const articleId = resolveArticleId(script, cfg);
    if (!articleId) {
      renderer.renderMissingArticleId();
      return;
    }

    const context = resolveContext(script, cfg);

    const headers = {};
    const apiKey = script?.dataset?.apiKey || window.KyouEmbedConfig?.apiKey;
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    renderer.renderLoading();

    try {
      let article;
      try {
        article = await fetchKaoriArticle(cfg, articleId, headers, script);
      } catch {
        article = fallbackArticleFromPage(script);
      }

      const pageTags = resolvePageTags(script);

      const recommendationPayload = {
        articleId,
        context,
        title: article.title || document.title || "",
        tags: pageTags.length ? pageTags : article.tags,
        category: article.category || "",
      };

      const products = await fetchKyouRecommendations(cfg, recommendationPayload, headers);
      if (!products.length) {
        renderer.renderEmpty();
        return;
      }

      renderer.renderProducts(products);
    } catch (err) {
      console.error("[Kyou Embed]", err);
      renderer.renderError();
    }
  }

  init();
})();
