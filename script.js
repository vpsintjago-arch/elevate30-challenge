/* =========================================================
   INSTELLINGEN – alleen dit blok hoef je aan te passen
   ========================================================= */
const CONFIG = {
  // Stripe-betaallinks. Plak hier de links tussen de aanhalingstekens.
  stripeEarlyBird: "",   // betaallink €99 (early bird t/m 30 november)
  stripeRegular: "",     // betaallink €149 (vanaf 1 december)

  // Datums (Nederlandse tijd)
  earlyBirdEnds: "2026-11-30T23:59:59+01:00",
  challengeStart: "2027-01-04T00:00:00+01:00",

  priceEarly: "€99",
  priceRegular: "€149",
};
/* ========================================================= */

(function () {
  const root = document.documentElement;
  const now = () => new Date();
  const ebEnd = new Date(CONFIG.earlyBirdEnds);
  const start = new Date(CONFIG.challengeStart);
  const isEarly = () => now() < ebEnd;

  /* ---- Taal ---- */
  function getLang() {
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "en" || p === "nl") return p;
    try { return localStorage.getItem("e30-lang") || "nl"; } catch (e) { return "nl"; }
  }
  function setLang(l) {
    root.setAttribute("lang", l);
    try { localStorage.setItem("e30-lang", l); } catch (e) {}
    document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
    document.querySelectorAll("a[data-keep-lang]").forEach(a => {
      const base = a.getAttribute("href").split("?")[0];
      a.setAttribute("href", base + "?lang=" + l);
    });
  }
  setLang(getLang());
  document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* ---- Prijs & early bird ---- */
  function applyPricing() {
    const early = isEarly();
    document.querySelectorAll("[data-price]").forEach(el => el.textContent = early ? CONFIG.priceEarly : CONFIG.priceRegular);
    document.querySelectorAll(".eb-only").forEach(el => el.style.display = early ? "" : "none");
    document.querySelectorAll(".post-eb").forEach(el => el.style.display = early ? "none" : "");
  }
  applyPricing();

  /* ---- Inschrijfknoppen ---- */
  const toast = document.getElementById("toast");
  document.querySelectorAll("[data-cta]").forEach(btn => {
    btn.addEventListener("click", e => {
      const link = isEarly() ? CONFIG.stripeEarlyBird : CONFIG.stripeRegular;
      if (link) { btn.setAttribute("href", link); return; }
      e.preventDefault();
      if (toast) {
        toast.textContent = root.lang === "en" ? "Sign-ups open very soon!" : "Inschrijven opent binnenkort!";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
      }
    });
  });

  /* ---- Countdown ---- */
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    const target = isEarly() ? ebEnd : start;
    let diff = Math.max(0, target - now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    document.querySelectorAll("[data-cd]").forEach(el => {
      const k = el.dataset.cd;
      el.textContent = k === "d" ? d : pad(k === "h" ? h : k === "m" ? m : s);
    });
    document.querySelectorAll("[data-cd-mini]").forEach(el => el.textContent = d + "d " + pad(h) + (root.lang === "en" ? "h " : "u ") + pad(m) + "m");
    if (isEarly() !== (document.body.dataset.early === "1")) { document.body.dataset.early = isEarly() ? "1" : "0"; applyPricing(); }
  }
  document.body.dataset.early = isEarly() ? "1" : "0";
  tick(); setInterval(tick, 1000);

  /* ---- Weken voorsprong ---- */
  const weeks = Math.max(0, Math.ceil((start - now()) / (7 * 864e5)));
  document.querySelectorAll("[data-weeks]").forEach(el => el.textContent = weeks);
  if (weeks === 0) document.querySelectorAll(".headstart").forEach(el => el.style.display = "none");
})();
