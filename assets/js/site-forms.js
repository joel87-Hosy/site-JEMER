// Simple site-wide form handlers: newsletter footer
(function () {
  async function postNewsletter(email) {
    const resp = await fetch("http://localhost:3000/api/newsletter", {
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
