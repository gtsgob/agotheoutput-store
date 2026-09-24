(() => {
  "use strict";
  const COUNTER_ROOT = "https://hits.sh/gtsgob.github.io/agotheoutput-store";
  const DEFAULT_CAMPAIGN = "ao_launch_001";
  const clean = (value, fallback) => {
    const s = String(value || fallback || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
    return s || fallback;
  };
  const params = new URLSearchParams(location.search);
  const priorSource = sessionStorage.getItem("ao_source");
  const priorCampaign = sessionStorage.getItem("ao_campaign");
  const source = clean(params.get("utm_source") || params.get("src") || priorSource || "direct", "direct");
  const campaign = clean(params.get("utm_campaign") || params.get("campaign") || priorCampaign || DEFAULT_CAMPAIGN, DEFAULT_CAMPAIGN);
  sessionStorage.setItem("ao_source", source);
  sessionStorage.setItem("ao_campaign", campaign);
  const key = (event, sku = "store") => COUNTER_ROOT + "/" + campaign + "/" + source + "/" + clean(event, "event") + "/" + clean(sku, "store") + ".svg";
  const hit = (event, sku = "store") => {
    const img = new Image(1, 1);
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.src = key(event, sku) + "?view=total&label=ao&cb=" + Date.now() + Math.random().toString(36).slice(2);
  };
  const landingKey = "ao_landing_" + campaign + "_" + source;
  if (!sessionStorage.getItem(landingKey)) { hit("landing"); sessionStorage.setItem(landingKey, "1"); }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.45) continue;
        const sku = entry.target.dataset.sku;
        if (!sku) continue;
        const seenKey = "ao_product_view_" + campaign + "_" + source + "_" + sku;
        if (!sessionStorage.getItem(seenKey)) { hit("product-view", sku); sessionStorage.setItem(seenKey, "1"); }
        obs.unobserve(entry.target);
      }
    }, { threshold: [0.45] });
    document.querySelectorAll(".product-card[data-sku]").forEach(card => observer.observe(card));
  }
  document.querySelectorAll('.product-card[data-sku] a[href^="https://buy.stripe.com/"]').forEach(link => {
    const card = link.closest(".product-card[data-sku]");
    const sku = card ? card.dataset.sku : "unknown";
    link.addEventListener("pointerdown", () => hit("checkout-click", sku), { passive: true });
  });
  window.AGOTHEOUTPUT_ATTRIBUTION = Object.freeze({ campaign, source });
})();