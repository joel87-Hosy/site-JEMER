(function () {
  function removeConsent() {
    try {
      localStorage.removeItem("jemer_cookie_consent");
      return true;
    } catch (e) {
      return false;
    }
  }

  document.getElementById("show-banner").addEventListener("click", function () {
    removeConsent();
    location.reload();
  });

  document
    .getElementById("clear-consent")
    .addEventListener("click", function () {
      if (removeConsent()) {
        alert(
          "Consentement reinitialise. Rechargez la page pour voir le bandeau.",
        );
      } else {
        alert("Impossible d'acceder au localStorage");
      }
    });

  document
    .getElementById("accept-consent")
    .addEventListener("click", function () {
      try {
        localStorage.setItem("jemer_cookie_consent", "accepted");
        alert("Consentement = accepted");
      } catch (e) {
        alert("Impossible d'ecrire dans le localStorage");
      }
    });

  document
    .getElementById("reject-consent")
    .addEventListener("click", function () {
      try {
        localStorage.setItem("jemer_cookie_consent", "rejected");
        alert("Consentement = rejected");
      } catch (e) {
        alert("Impossible d'ecrire dans le localStorage");
      }
    });
})();
