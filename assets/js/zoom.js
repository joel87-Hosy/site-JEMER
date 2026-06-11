(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var overlay = document.getElementById("image-zoom-overlay");
    var closeBtn = document.getElementById("image-zoom-close");
    var backBtn = document.getElementById("image-zoom-back");
    var imgEl = document.getElementById("image-zoom-img");
    var titleEl = document.getElementById("image-zoom-title");
    var priceEl = document.getElementById("image-zoom-price");
    var descEl = document.getElementById("image-zoom-desc");
    var addBtn = document.getElementById("image-zoom-add");
    var prevBtn = document.getElementById("image-zoom-prev");
    var nextBtn = document.getElementById("image-zoom-next");
    var currentList = null;
    var currentIndex = 0;
    var counterEl = document.getElementById("image-zoom-counter");

    function updateCounter() {
      if (!counterEl) return;
      if (currentList && currentList.length > 0) {
        counterEl.textContent = currentIndex + 1 + " / " + currentList.length;
        counterEl.setAttribute("aria-hidden", "false");
      } else {
        counterEl.textContent = "";
        counterEl.setAttribute("aria-hidden", "true");
      }
    }

    function findCard(el) {
      while (
        el &&
        !el.classList.contains("single-featured-cars") &&
        !el.classList.contains("collection-item")
      ) {
        el = el.parentElement;
      }
      return el;
    }

    // Find the card element that contains an image with the given resolved src
    function findCardBySrc(src) {
      if (!src) return null;
      var imgs = document.querySelectorAll(
        ".single-featured-cars img, .collection-item img",
      );
      for (var i = 0; i < imgs.length; i++) {
        try {
          var im = imgs[i];
          // compare resolved src (property) and attribute value
          if (
            im.src === src ||
            im.getAttribute("src") === src ||
            im.getAttribute("src") === decodeURIComponent(src)
          ) {
            return findCard(im);
          }
          // also allow ends-with match for relative/absolute mismatch
          if (
            src.indexOf &&
            im.src &&
            src.indexOf(im.getAttribute("src")) !== -1
          ) {
            return findCard(im);
          }
        } catch (e) {
          // ignore
        }
      }
      return null;
    }

    function openZoom(data) {
      imgEl.src = data.img || "";
      imgEl.alt = data.name || "";
      titleEl.textContent = data.name || "";
      priceEl.textContent = data.price
        ? data.price.toString().indexOf("FCFA") === -1
          ? Number(data.price).toFixed(0) + " FCFA"
          : data.price
        : "";
      descEl.textContent = data.desc || "";
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      // set add button attributes so cart.js can pick them up
      addBtn.setAttribute("data-name", data.name || "Produit");
      addBtn.setAttribute("data-price", data.price || 0);
      addBtn.setAttribute("data-img", data.img || "");
      // focus
      addBtn.focus();
      // build currentList if provided
      if (data.list && Array.isArray(data.list)) {
        currentList = data.list;
        currentIndex = Number(data.index) || 0;
      } else {
        currentList = null;
        currentIndex = 0;
      }
      // show/hide prev/next
      if (prevBtn)
        prevBtn.style.display =
          currentList && currentList.length > 1 ? "block" : "none";
      if (nextBtn)
        nextBtn.style.display =
          currentList && currentList.length > 1 ? "block" : "none";
      // update counter
      updateCounter();
      // populate thumbnails
      var thumbs = document.getElementById("image-zoom-thumbs");
      if (thumbs) {
        thumbs.innerHTML = "";
        if (currentList && currentList.length) {
          currentList.forEach(function (src, i) {
            var t = document.createElement("img");
            t.src = src;
            t.alt = (data.name || "") + " " + (i + 1);
            if (i === currentIndex) t.classList.add("active");
            t.addEventListener("click", function () {
              currentIndex = i;
              var card = findCardBySrc(src);
              var name = "",
                price = "",
                desc = "";
              if (card) {
                var c = findCard(card);
                var h =
                  c &&
                  c.querySelector(
                    ".featured-cars-txt h3, .featured-cars-txt h4, .featured-cars-txt h2",
                  );
                if (h) name = h.textContent.trim();
                var p =
                  c &&
                  c.querySelector(".collection-price, .featured-cars-txt h5");
                if (p) price = p.textContent.trim();
                var de = c && c.querySelector(".featured-cars-txt p");
                if (de) desc = de.textContent.trim();
              }
              openZoom({
                img: src,
                name: name,
                price: price,
                desc: desc,
                list: currentList,
                index: currentIndex,
              });
            });
            thumbs.appendChild(t);
          });
        }
      }
    }

    function closeZoom() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      imgEl.src = "";
      currentList = null;
      currentIndex = 0;
      updateCounter();
    }

    // Click images in collections
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        // if an <img> inside collection image placeholder
        if (
          t &&
          t.tagName === "IMG" &&
          (t.closest(".collection-image-placeholder") ||
            t.closest(".featured-cars-img"))
        ) {
          var card = findCard(t);
          var name = "";
          var price = "";
          var desc = "";
          if (card) {
            var h = card.querySelector(
              ".featured-cars-txt h3, .featured-cars-txt h4, .featured-cars-txt h2",
            );
            if (h) name = h.textContent.trim();
            var p = card.querySelector(
              ".collection-price, .featured-cars-txt h5",
            );
            if (p) price = p.textContent.trim();
            var de = card.querySelector(".featured-cars-txt p");
            if (de) desc = de.textContent.trim();
          }
          var src = t.getAttribute("src") || t.dataset.img || "";
          // build list of images within the same collection block for navigation
          var list = [];
          var cardsContainer =
            t.closest(".row") || t.closest(".collection-block") || document;
          if (cardsContainer) {
            var imgs = cardsContainer.querySelectorAll(
              ".collection-image-placeholder img, .featured-cars-img img",
            );
            imgs.forEach(function (im) {
              if (im && im.src) list.push(im.src);
            });
          }
          var index = list.indexOf(src);
          if (index === -1) index = 0;
          openZoom({
            img: src,
            name: name,
            price: price,
            desc: desc,
            list: list,
            index: index,
          });
          e.preventDefault();
          return;
        }

        // handle close clicks on overlay backdrop
        if (t && t.id === "image-zoom-overlay") {
          closeZoom();
        }
      },
      false,
    );

    closeBtn && closeBtn.addEventListener("click", closeZoom);
    backBtn && backBtn.addEventListener("click", closeZoom);
    prevBtn &&
      prevBtn.addEventListener("click", function () {
        if (!currentList || currentList.length === 0) return;
        currentIndex =
          (currentIndex - 1 + currentList.length) % currentList.length;
        var src = currentList[currentIndex];
        // find card by src to read details
        var card = findCardBySrc(src);
        var name = "",
          price = "",
          desc = "";
        if (card) {
          var c = findCard(card);
          var h =
            c &&
            c.querySelector(
              ".featured-cars-txt h3, .featured-cars-txt h4, .featured-cars-txt h2",
            );
          if (h) name = h.textContent.trim();
          var p =
            c && c.querySelector(".collection-price, .featured-cars-txt h5");
          if (p) price = p.textContent.trim();
          var de = c && c.querySelector(".featured-cars-txt p");
          if (de) desc = de.textContent.trim();
        }
        openZoom({
          img: src,
          name: name,
          price: price,
          desc: desc,
          list: currentList,
          index: currentIndex,
        });
        updateCounter();
      });
    nextBtn &&
      nextBtn.addEventListener("click", function () {
        if (!currentList || currentList.length === 0) return;
        currentIndex = (currentIndex + 1) % currentList.length;
        var src = currentList[currentIndex];
        var card = document.querySelector(
          '.single-featured-cars img[src="' +
            src +
            '"], .collection-item img[src="' +
            src +
            '"]',
        );
        var name = "",
          price = "",
          desc = "";
        if (card) {
          var c = findCard(card);
          var h =
            c &&
            c.querySelector(
              ".featured-cars-txt h3, .featured-cars-txt h4, .featured-cars-txt h2",
            );
          if (h) name = h.textContent.trim();
          var p =
            c && c.querySelector(".collection-price, .featured-cars-txt h5");
          if (p) price = p.textContent.trim();
          var de = c && c.querySelector(".featured-cars-txt p");
          if (de) desc = de.textContent.trim();
        }
        openZoom({
          img: src,
          name: name,
          price: price,
          desc: desc,
          list: currentList,
          index: currentIndex,
        });
        updateCounter();
      });

    // wire add button to existing cart logic: delegate click to any .btn-add-to-cart handler
    addBtn &&
      addBtn.addEventListener("click", function (e) {
        var name = this.getAttribute("data-name");
        var price = this.getAttribute("data-price");
        var img = this.getAttribute("data-img");
        // create a synthetic button and trigger existing click handler
        var fake = document.createElement("button");
        fake.className = "btn-add-to-cart";
        fake.setAttribute("data-name", name);
        fake.setAttribute("data-price", price);
        fake.setAttribute("data-img", img);
        fake.style.display = "none";
        document.body.appendChild(fake);
        fake.click();
        document.body.removeChild(fake);
        // close overlay after adding
        closeZoom();
      });

    // close on ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeZoom();
      if (e.key === "ArrowRight") nextBtn && nextBtn.click();
      if (e.key === "ArrowLeft") prevBtn && prevBtn.click();
    });
  });
})();
