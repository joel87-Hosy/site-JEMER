$(document).ready(function () {
  "use strict";

  /*==================================
* Author        : "ThemeSine"
* Template Name : CarVilla HTML Template
* Version       : 1.0
==================================== */

  /*=========== TABLE OF CONTENTS ===========
1. Scroll To Top
2. welcome animation support
3. owl carousel
======================================*/

  // 1. Scroll To Top
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300) {
      $(".return-to-top").fadeIn();
    } else {
      $(".return-to-top").fadeOut();
    }
  });
  $(".return-to-top").on("click", function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      1500,
    );
    return false;
  });

  // 2. welcome animation support

  $(window).load(function () {
    $(".welcome-hero-txt h2,.welcome-hero-txt p")
      .removeClass("animated fadeInUp")
      .css({ opacity: "0" });
    $(".welcome-hero-txt button")
      .removeClass("animated fadeInDown")
      .css({ opacity: "0" });
  });

  $(window).load(function () {
    $(".welcome-hero-txt h2,.welcome-hero-txt p")
      .addClass("animated fadeInUp")
      .css({ opacity: "0" });
    $(".welcome-hero-txt button")
      .addClass("animated fadeInDown")
      .css({ opacity: "0" });
  });

  // 3. owl carousel

  // i.  new-cars-carousel

  $("#new-cars-carousel").owlCarousel({
    items: 1,
    autoplay: true,
    loop: true,
    dots: true,
    mouseDrag: true,
    nav: false,
    smartSpeed: 1000,
    transitionStyle: "fade",
    animateIn: "fadeIn",
    animateOut: "fadeOutLeft",
    // navText:["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"]
  });

  // ii. .testimonial-carousel

  var owl = $(".testimonial-carousel");
  owl.owlCarousel({
    items: 3,
    margin: 0,

    loop: true,
    autoplay: true,
    smartSpeed: 1000,

    //nav:false,
    //navText:["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"],

    dots: false,
    autoplayHoverPause: false,

    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      640: {
        items: 2,
      },
      992: {
        items: 3,
      },
    },
  });

  // iii. .brand-item (carousel)

  $(".brand-item").owlCarousel({
    items: 6,
    loop: true,
    smartSpeed: 1000,
    autoplay: true,
    dots: false,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 2,
      },
      415: {
        items: 2,
      },
      600: {
        items: 3,
      },
      1000: {
        items: 6,
      },
    },
  });

  $(".play").on("click", function () {
    owl.trigger("play.owl.autoplay", [1000]);
  });
  $(".stop").on("click", function () {
    owl.trigger("stop.owl.autoplay");
  });
});

// Cookie consent banner — stores choice in localStorage under 'jemer_cookie_consent'
(function () {
  var ALLOWED_LOCAL_KEYS = [
    "jemer_cookie_consent",
    "jemer_cart",
    "jemer_likes",
  ];

  function createBanner() {
    if (document.getElementById("jemer-cookie-banner")) return;
    var div = document.createElement("div");
    div.id = "jemer-cookie-banner";
    div.style.position = "fixed";
    div.style.left = "0";
    div.style.right = "0";
    div.style.bottom = "0";
    div.style.background = "#111";
    div.style.color = "#fff";
    div.style.padding = "14px 16px";
    div.style.zIndex = "9999";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";
    div.style.flexWrap = "wrap";
    div.innerHTML =
      '<div style="max-width:78%;font-size:14px;line-height:1.3">Nous utilisons des cookies pour améliorer votre expérience. En acceptant, vous autorisez l\'usage de cookies non essentiels. <a href="cookies.html" style="color:#f4c06d;text-decoration:underline;margin-left:6px">Gérer</a></div>' +
      '<div style="margin-left:12px;display:flex;gap:8px">' +
      '<button id="jemer-cookie-accept" style="background:#2a3f8f;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer">Accepter</button>' +
      '<button id="jemer-cookie-reject" style="background:transparent;color:#ddd;border:1px solid #555;padding:8px 12px;border-radius:4px;cursor:pointer">Refuser</button>' +
      "</div>";
    document.body.appendChild(div);
    document
      .getElementById("jemer-cookie-accept")
      .addEventListener("click", function () {
        try {
          localStorage.setItem("jemer_cookie_consent", "accepted");
        } catch (e) {}
        enableNonEssential();
        showBanner(false);
      });
    document
      .getElementById("jemer-cookie-reject")
      .addEventListener("click", function () {
        try {
          localStorage.setItem("jemer_cookie_consent", "rejected");
        } catch (e) {}
        disableNonEssential();
        showBanner(false);
      });
  }

  function showBanner(visible) {
    var b = document.getElementById("jemer-cookie-banner");
    if (!b && visible) createBanner();
    if (b) b.style.display = visible ? "flex" : "none";
  }

  // Provide global hooks so other scripts can check consent
  window.jemer_is_cookie_accepted = function () {
    try {
      return localStorage.getItem("jemer_cookie_consent") === "accepted";
    } catch (e) {
      return false;
    }
  };

  window.jemer_enable_non_essential = function () {
    // Placeholder: load analytics or third-party scripts here
    // Example: dynamically inject a script
    if (window.__jemer_non_essential_enabled) return;
    window.__jemer_non_essential_enabled = true;
    console.debug("JEMER: non-essential cookies enabled");
    if (typeof window.jemer_onConsentAccepted === "function") {
      try {
        window.jemer_onConsentAccepted();
      } catch (e) {}
    }
  };

  window.jemer_disable_non_essential = function () {
    // Attempt to remove common tracking cookies (best-effort)
    try {
      var cookies = document.cookie ? document.cookie.split(";") : [];
      cookies.forEach(function (c) {
        var idx = c.indexOf("=");
        var name = idx > -1 ? c.substr(0, idx).trim() : c.trim();
        if (ALLOWED_LOCAL_KEYS.indexOf(name) === -1) {
          document.cookie =
            name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      });
    } catch (e) {}
    window.__jemer_non_essential_enabled = false;
    console.debug("JEMER: non-essential cookies disabled");
    if (typeof window.jemer_onConsentRejected === "function") {
      try {
        window.jemer_onConsentRejected();
      } catch (e) {}
    }
  };

  function enableNonEssential() {
    window.jemer_enable_non_essential();
  }
  function disableNonEssential() {
    window.jemer_disable_non_essential();
  }

  // Floating "manage" button removed per request (no simulation UI)

  function initConsentUI() {
    try {
      var consent = localStorage.getItem("jemer_cookie_consent");
      if (consent === "accepted") {
        enableNonEssential();
      } else if (consent === "rejected") {
        disableNonEssential();
      } else {
        createBanner();
      }
    } catch (e) {
      createBanner();
    }
    // no floating manage button
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initConsentUI);
  } else {
    // document already loaded — run immediately
    initConsentUI();
  }
})();

// On small screens, neutralize any inline fixed/absolute positioning on action buttons
(function () {
  function neutralizeInlineFixed() {
    try {
      if (window.innerWidth > 480) return;
      var els = document.querySelectorAll(
        ".welcome-btn, .btn-add-to-cart, .qty-control, .btn-like, .nav-cart, #cart-count",
      );
      function neutralizeEl(el) {
        try {
          // force relative positioning and remove inline offsets/z-index
          el.style.position = "relative";
          el.style.top = "";
          el.style.bottom = "";
          el.style.left = "";
          el.style.right = "";
          el.style.zIndex = "";
        } catch (e) {}
      }
      els.forEach(function (el) {
        neutralizeEl(el);
      });

      // Observe inline style changes and neutralize if scripts try to reapply fixed positioning
      if (!window.__jemer_neutralize_observer_installed) {
        try {
          var mo = new MutationObserver(function (muts) {
            muts.forEach(function (m) {
              if (m.type === "attributes" && m.attributeName === "style") {
                var t = m.target;
                if (
                  t &&
                  t.matches &&
                  t.matches(
                    ".welcome-btn, .btn-add-to-cart, .qty-control, .btn-like, .nav-cart, #cart-count",
                  )
                ) {
                  neutralizeEl(t);
                }
              }
              if (
                m.type === "childList" &&
                m.addedNodes &&
                m.addedNodes.length
              ) {
                // newly added nodes may contain buttons
                neutralizeInlineFixed();
              }
            });
          });
          mo.observe(document.body, {
            attributes: true,
            attributeFilter: ["style"],
            subtree: true,
            childList: true,
          });
          window.__jemer_neutralize_observer_installed = true;
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", neutralizeInlineFixed);
  } else neutralizeInlineFixed();
  // also run after window resize (debounced small)
  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(neutralizeInlineFixed, 200);
  });
})();

/*
  Conditional analytics loader examples.
  To enable, set one of the global variables before this script runs in HTML pages:
    - window.JEMER_GA_ID = 'G-XXXXXXXXXX'           (Google Analytics 4)
    - window.JEMER_MATOMO_URL = 'https://matomo.example.com/'; window.JEMER_MATOMO_SITEID = '5'
  Or call the loader manually after user accepts by implementing:
    window.jemer_onConsentAccepted = function(){ (custom load) }
*/
(function () {
  function loadGoogleAnalytics(id) {
    if (!id) return;
    if (window.__jemer_ga_loaded) return;
    window.__jemer_ga_loaded = true;
    var gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src =
      "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(gtagScript);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    gtag("config", id, { send_page_view: true });
    console.debug("JEMER: Google Analytics loaded (id=" + id + ")");
  }

  function loadMatomo(url, siteId) {
    if (!url || !siteId) return;
    if (window.__jemer_matomo_loaded) return;
    window.__jemer_matomo_loaded = true;
    var u = url.replace(/\/?$/, "/");
    var s = document.createElement("script");
    s.async = true;
    s.src = u + "matomo.js";
    document.head.appendChild(s);
    window._paq = window._paq || [];
    window._paq.push(["setSiteId", siteId]);
    window._paq.push(["trackPageView"]);
    window._paq.push(["enableLinkTracking"]);
    console.debug(
      "JEMER: Matomo loader injected (url=" + url + ", siteId=" + siteId + ")",
    );
  }

  // default hooks if the page didn't set custom handlers
  if (typeof window.jemer_onConsentAccepted !== "function") {
    window.jemer_onConsentAccepted = function () {
      // try Google Analytics
      try {
        if (window.JEMER_GA_ID) loadGoogleAnalytics(window.JEMER_GA_ID);
      } catch (e) {}
      // try Matomo
      try {
        if (window.JEMER_MATOMO_URL && window.JEMER_MATOMO_SITEID)
          loadMatomo(window.JEMER_MATOMO_URL, window.JEMER_MATOMO_SITEID);
      } catch (e) {}
    };
  }
  if (typeof window.jemer_onConsentRejected !== "function") {
    window.jemer_onConsentRejected = function () {
      // If analytics were loaded previously, this is best-effort only.
      console.debug(
        "JEMER: consent rejected — analytics should remain disabled",
      );
    };
  }
})();
