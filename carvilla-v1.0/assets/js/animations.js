// Lightweight page-load animation starter
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    try {
      var body = document.body;
      // find common blocks to animate
      var selectors = [
        "header",
        ".welcome-hero-txt",
        ".section-header",
        ".single-featured-cars",
        ".featured-cars-img img",
        ".collection-item",
        ".collection-block",
        "footer",
      ];
      var nodes = [];
      selectors.forEach(function (s) {
        document.querySelectorAll(s).forEach(function (el) {
          nodes.push(el);
        });
      });

      // unique nodes only
      nodes = nodes.filter(function (v, i) {
        return nodes.indexOf(v) === i;
      });

      // add class and stagger
      nodes.forEach(function (el, i) {
        // skip if hidden
        if (!(el instanceof Element)) return;
        el.classList.add("animate-on-load");
        // if it's an image mark it for gentle scale
        if (
          el.tagName === "IMG" ||
          (el.querySelector && el.querySelector("img"))
        ) {
          el.classList.add("image");
        }
        el.style.setProperty("--delay", i * 60 + "ms");
      });

      // small timeout to allow paint then add page-loaded class
      setTimeout(function () {
        document.documentElement.classList.add("page-loaded");
        body.classList.add("page-loaded");
      }, 80);
    } catch (e) {
      // silent
    }
  });
})();
