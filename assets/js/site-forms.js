// Simple site-wide form handlers: newsletter footer and contact page
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

  async function postContact(payload) {
    const resp = await fetch(apiUrl("/api/contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const json = await resp.json().catch(() => ({}));
      throw new Error((json && json.error) || "Erreur du serveur");
    }
    return true;
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    const result = document.getElementById("contact-result");
    if (!form || !result) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      result.innerHTML = "";

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const payload = {
        name: (form.elements.name.value || "").trim(),
        email: (form.elements.email.value || "").trim(),
        subject: (form.elements.subject.value || "").trim(),
        message: (form.elements.message.value || "").trim(),
      };

      try {
        await postContact(payload);
        result.innerHTML =
          '<div style="color:green">Merci, votre message a ete envoye. Nous vous repondrons bientot.</div>';
        form.reset();
      } catch (err) {
        result.innerHTML =
          '<div style="color:red">Erreur: ' + err.message + "</div>";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function init() {
    initContactForm();

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
