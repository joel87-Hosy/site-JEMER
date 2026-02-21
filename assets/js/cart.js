(function ($) {
  "use strict";
  var CART_KEY = "jemer_cart";
  var LIKES_KEY = "jemer_likes";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function getLikes() {
    try {
      return JSON.parse(localStorage.getItem(LIKES_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveLikes(arr) {
    localStorage.setItem(LIKES_KEY, JSON.stringify(arr));
  }

  function updateCartCount() {
    var cart = getCart();
    var count = cart.reduce(function (s, i) {
      return s + (i.quantity || 0);
    }, 0);
    $("#cart-count").text(count);
  }

  function addToCart(item) {
    var cart = getCart();
    var found = cart.find(function (p) {
      return p.id === item.id;
    });
    // ensure quantity
    var qty = Number(item.quantity) || 1;
    if (found) {
      found.quantity = (found.quantity || 0) + qty;
    } else {
      item.quantity = qty;
      cart.push(item);
    }
    saveCart(cart);
    updateCartCount();
  }

  function removeFromCart(id) {
    var cart = getCart().filter(function (p) {
      return p.id !== id;
    });
    saveCart(cart);
    updateCartCount();
  }

  function setQuantity(id, qty) {
    var cart = getCart();
    cart.forEach(function (p) {
      if (p.id === id) p.quantity = qty;
    });
    saveCart(cart);
    updateCartCount();
  }

  function formatPrice(n) {
    return Number(n).toFixed(0) + " FCFA";
  }

  // expose renderCart for cart.html
  window.renderCart = function () {
    var cart = getCart();
    var $wrap = $("#cart-contents");
    if (!$wrap.length) return;
    $wrap.empty();
    if (cart.length === 0) {
      $wrap.append("<p>Votre panier est vide.</p>");
      $("#cart-summary").hide();
      return;
    }
    $("#cart-summary").show();
    var $table = $(
      '<table class="table"><thead><tr><th>Produit</th><th>Prix</th><th>Quantité</th><th>Total</th><th></th></tr></thead><tbody></tbody></table>',
    );
    var $tbody = $table.find("tbody");
    var total = 0;
    cart.forEach(function (p) {
      var line = (p.price || 0) * (p.quantity || 1);
      total += line;
      var $tr = $(
        '<tr data-id="' +
          p.id +
          '">' +
          '<td><img src="' +
          p.img +
          '" style="width:60px;height:auto;margin-right:8px;vertical-align:middle;"> <strong>' +
          p.name +
          "</strong></td>" +
          "<td>" +
          formatPrice(p.price) +
          "</td>" +
          '<td><input type="number" min="1" value="' +
          (p.quantity || 1) +
          '" class="cart-qty" style="width:70px"></td>' +
          '<td class="line-total">' +
          formatPrice(line) +
          "</td>" +
          '<td><button class="btn btn-danger btn-sm btn-remove">Supprimer</button></td>' +
          "</tr>",
      );
      $tbody.append($tr);
    });
    $wrap.append($table);
    $("#cart-total").text(formatPrice(total));
  };

  $(document).ready(function () {
    updateCartCount();

    // enhance product-actions: inject like button and quantity controls when missing
    $(".product-actions").each(function () {
      var $pa = $(this);
      var $add = $pa.find(".btn-add-to-cart");
      if ($add.length === 0) return;

      // ensure btn-like exists and has data-id
      if ($pa.find(".btn-like").length === 0) {
        var genId =
          $add.data("id") ||
          $add.data("name") ||
          $pa.closest(".single-featured-cars").find("h4").text() ||
          "";
        genId = genId
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "");
        $pa.prepend(
          '<button class="btn-like" data-id="' +
            genId +
            '"><i class="fa fa-heart"></i></button>',
        );
      }

      // ensure quantity controls
      if ($pa.find(".qty-input").length === 0) {
        var qtyHtml =
          '<div class="qty-control" style="display:inline-block;margin:0 8px;vertical-align:middle">' +
          '<button class="qty-minus" type="button">-</button>' +
          '<input type="number" min="1" value="1" class="qty-input" style="width:56px;text-align:center;display:inline-block;margin:0 6px">' +
          '<button class="qty-plus" type="button">+</button>' +
          "</div>";
        $add.before(qtyHtml);
      }

      // ensure data-img is set on the add button (use nearby image if missing)
      try {
        var hasImg = $add.data("img");
        if (!hasImg || hasImg === undefined) {
          var src = $pa
            .closest(".single-featured-cars")
            .find(".featured-cars-img img")
            .attr("src");
          if (src) $add.attr("data-img", src);
        }
      } catch (e) {
        // ignore
      }
    });

    // quantity +/- handlers
    $(document).on("click", ".qty-plus", function (e) {
      var $inp = $(this).closest(".qty-control").find(".qty-input");
      var v = parseInt($inp.val(), 10) || 1;
      $inp.val(v + 1).trigger("change");
    });
    $(document).on("click", ".qty-minus", function (e) {
      var $inp = $(this).closest(".qty-control").find(".qty-input");
      var v = parseInt($inp.val(), 10) || 1;
      if (v > 1) $inp.val(v - 1).trigger("change");
    });

    // add to cart (reads quantity if present)
    $(document).on("click", ".btn-add-to-cart", function (e) {
      e.preventDefault();
      var $t = $(this);
      var $pa = $t.closest(".product-actions");
      var qty = 1;
      var $q = $pa.find(".qty-input");
      if ($q.length) qty = parseInt($q.val(), 10) || 1;
      var item = {
        id:
          $t.data("id") ||
          ($t.data("name") || "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, ""),
        name:
          $t.data("name") ||
          $t.closest(".single-featured-cars").find("h4").text(),
        price: Number($t.data("price")) || 0,
        img:
          $t.data("img") ||
          $t
            .closest(".single-featured-cars")
            .find(".featured-cars-img img")
            .attr("src") ||
          "",
        quantity: qty,
      };
      addToCart(item);
      // small feedback
      var original = $t.text();
      $t.text("Ajouté");
      setTimeout(function () {
        $t.text(original);
      }, 1200);
    });

    // like
    $(document).on("click", ".btn-like", function (e) {
      e.preventDefault();
      var id = $(this).data("id");
      var likes = getLikes();
      var idx = likes.indexOf(id);
      if (idx === -1) {
        likes.push(id);
        $(this).addClass("liked");
      } else {
        likes.splice(idx, 1);
        $(this).removeClass("liked");
      }
      saveLikes(likes);
    });

    // cart page handlers
    $(document).on("change", ".cart-qty", function () {
      var $tr = $(this).closest("tr");
      var id = $tr.data("id");
      var qty = parseInt($(this).val(), 10) || 1;
      setQuantity(id, qty);
      // update line and total
      var cart = getCart();
      var p = cart.find(function (x) {
        return x.id === id;
      });
      var line = (p.price || 0) * (p.quantity || 1);
      $tr.find(".line-total").text(formatPrice(line));
      var total = cart.reduce(function (s, i) {
        return s + i.price * i.quantity;
      }, 0);
      $("#cart-total").text(formatPrice(total));
    });

    $(document).on("click", ".btn-remove", function () {
      var id = $(this).closest("tr").data("id");
      removeFromCart(id);
      $(this).closest("tr").remove();
      var cart = getCart();
      var total = cart.reduce(function (s, i) {
        return s + i.price * i.quantity;
      }, 0);
      $("#cart-total").text(formatPrice(total));
      if (cart.length === 0) {
        $("#cart-contents").html("<p>Votre panier est vide.</p>");
        $("#cart-summary").hide();
      }
    });

    $(document).on("click", "#btn-clear-cart", function () {
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      $("#cart-contents").html("<p>Votre panier est vide.</p>");
      $("#cart-summary").hide();
      $("#cart-total").text(formatPrice(0));
    });

    $(document).on("click", "#btn-checkout", function () {
      var cart = getCart();
      if (!cart || cart.length === 0) {
        alert("Votre panier est vide.");
        return;
      }
      // render simple checkout form inside cart-contents
      var html =
        '\n        <h3>Informations de commande</h3>\n        <div class="form-group">\n          <label>Nom complet</label>\n          <input id="order-name" class="form-control" required>\n        </div>\n        <div class="form-group">\n          <label>Email</label>\n          <input id="order-email" type="email" class="form-control" required>\n        </div>\n        <div class="form-group">\n          <label>Téléphone</label>\n          <input id="order-phone" class="form-control">\n        </div>\n        <div class="form-group">\n          <label>Adresse</label>\n          <textarea id="order-address" class="form-control" rows="3"></textarea>\n        </div>\n        <div id="order-result" style="margin-top:10px"></div>\n        <div style="margin-top:12px">\n          <button id="submit-order" class="welcome-btn">Confirmer la commande</button>\n          <button id="cancel-order" class="welcome-btn" style="background:#ccc;color:#111;margin-left:8px">Annuler</button>\n        </div>\n      ';
      $("#cart-contents").html(html);
      $("#cart-summary").hide();
      // attach handlers
    });

    // cancel order handler: re-render cart
    $(document).on("click", "#cancel-order", function () {
      window.renderCart();
      $("#cart-summary").show();
      updateCartCount();
      var cart = getCart();
      var total = cart.reduce(function (s, i) {
        return s + i.price * i.quantity;
      }, 0);
      $("#cart-total").text(formatPrice(total));
    });

    // submit order
    $(document).on("click", "#submit-order", async function () {
      var name = ($("#order-name").val() || "").trim();
      var email = ($("#order-email").val() || "").trim();
      var phone = ($("#order-phone").val() || "").trim();
      var address = ($("#order-address").val() || "").trim();
      var $res = $("#order-result");
      if (!name || !email) {
        $res.html(
          '<div style="color:red">Veuillez renseigner au minimum votre nom et email.</div>',
        );
        return;
      }
      var cart = getCart();
      if (!cart || cart.length === 0) {
        $res.html('<div style="color:red">Votre panier est vide.</div>');
        return;
      }
      var items = cart.map(function (p) {
        var displayName = p.name;
        try {
          var $el = $("[data-id='" + p.id + "']").first();
          if ($el && $el.length) {
            var fromData = $el.data("name");
            var fromDom = $el
              .closest(".single-featured-cars")
              .find("h4")
              .text();
            if (fromData && fromData.toString().trim().length)
              displayName = fromData.toString().trim();
            else if (fromDom && fromDom.toString().trim().length)
              displayName = fromDom.toString().trim();
          }
        } catch (e) {
          // ignore and keep stored name
        }
        return {
          name: displayName,
          qty: p.quantity || 1,
          price: p.price,
          img: p.img || "",
        };
      });
      var total = cart.reduce(function (s, i) {
        return s + i.price * i.quantity;
      }, 0);
      $("#submit-order").prop("disabled", true);
      try {
        var resp = await fetch("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            address: address,
            items: items,
            total: total,
          }),
        });
        if (!resp.ok) {
          var j = await resp.json().catch(function () {
            return {};
          });
          throw new Error((j && j.error) || "Erreur lors de l'envoi");
        }
        // success
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        $("#cart-contents").html(
          "<p>Merci — votre commande a été enregistrée. Nous vous contacterons bientôt.</p>",
        );
        $("#cart-summary").hide();
        $("#cart-total").text(formatPrice(0));
      } catch (err) {
        $res.html('<div style="color:red">Erreur: ' + err.message + "</div>");
      } finally {
        $("#submit-order").prop("disabled", false);
      }
    });
  });
})(jQuery);
