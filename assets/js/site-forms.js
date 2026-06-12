// Simple site-wide form handlers: newsletter footer
(function () {
  const PRODUCTION_API_BASE_URL = "https://jemer-web.onrender.com";

  function getApiBaseUrl() {
    if (window.JEMER_API_BASE_URL) {
      return window.JEMER_API_BASE_URL.replace(/\/$/, "");
    }

    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3000";
    }

    return PRODUCTION_API_BASE_URL;
  }

  function apiUrl(path) {
    return getApiBaseUrl() + path;
  }

  async function postNewsletter(email) {
    const resp = await fetch(apiUrl("/api/newsletter"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!resp.ok) {
      const json = await resp.json().catch(() => ({}));
      throw new Error((json && json.error) || "Server error");
    }
    return true;
  }

  function init() {
    const input = document.getElementById("newsletter-email");
    const btn = document.getElementById("newsletter-submit");
    if (!input || !btn) return;

    btn.addEventListener("click", async function () {
      const email = (input.value || "").trim();
      if (!email) return alert("Entrez une adresse e-mail valide");
      btn.disabled = true;
      try {
        await postNewsletter(email);
        alert("Merci — inscription confirmée.");
        input.value = "";
      } catch (err) {
        alert("Erreur: " + err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})();
