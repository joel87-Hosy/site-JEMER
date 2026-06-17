const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail, getAdminEmail } = require("../mailer");

const router = express.Router();

const PUBLIC_SITE_URL =
  (process.env.PUBLIC_SITE_URL || "https://joel87-hosy.github.io/site-JEMER")
    .trim()
    .replace(/\/$/, "");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toPublicAssetUrl(src) {
  if (!src) return "";
  const value = String(src).trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const cleanPath = value.replace(/^\.?\//, "");
  return `${PUBLIC_SITE_URL}/${cleanPath}`;
}

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("items").isArray({ min: 1 }),
    body("total").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address, items, total } = req.body;
    let saved = false;
    let emailed = false;
    let orderId = null;
    const failures = [];

    try {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [result] = await conn.execute(
          "INSERT INTO orders (customer_name, email, phone, address, total, items_json, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
          [
            name,
            email,
            phone || null,
            address || null,
            total,
            JSON.stringify(items),
          ],
        );
        await conn.commit();
        orderId = result && result.insertId ? result.insertId : null;
        saved = true;
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      failures.push("database");
      console.error("Order database error:", err);
    }

    const emailItems = items.map((item) => ({
      name: String(item.name || ""),
      qty: item.qty || item.quantity || 1,
      price: item.price || 0,
      img: toPublicAssetUrl(item.img),
    }));

    const itemsHtml = emailItems
      .map((item) => {
        const safeName = escapeHtml(item.name);
        const safeImg = escapeHtml(item.img);
        const imgTag = item.img
          ? `<div><img src="${safeImg}" style="max-width:120px;height:auto;display:block;margin-bottom:6px" alt="${safeName}"/></div>`
          : "";
        return `<li>${imgTag}<strong>${safeName}</strong> - quantite: ${escapeHtml(item.qty)} - prix unitaire: ${escapeHtml(item.price)}</li>`;
      })
      .join("");

    const itemsText = emailItems
      .map((item) => {
        const imgLine = item.img ? `Image: ${item.img}\n` : "";
        return `${imgLine}${item.name} - quantite: ${item.qty} - prix unitaire: ${item.price}`;
      })
      .join("\n\n");

    const orderLabel = orderId ? ` - N ${orderId}` : "";
    const html = `<p>Nouvelle commande${orderLabel}</p>
      <p><strong>Client:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telephone:</strong> ${escapeHtml(phone || "(non fourni)")}</p>
      <p><strong>Adresse:</strong> ${escapeHtml(address || "(non fourni)")}</p>
      <p><strong>Total:</strong> ${escapeHtml(total)}</p>
      <p><strong>Articles:</strong></p>
      <ul>${itemsHtml}</ul>`;

    const text = `Nouvelle commande${orderLabel}

Client: ${name}
Email: ${email}
Telephone: ${phone || "(non fourni)"}
Adresse: ${address || "(non fourni)"}
Total: ${total}

Articles:
${itemsText}`;

    try {
      await sendMail({
        to: getAdminEmail(),
        subject: `Commande - ${name}${orderId ? " #" + orderId : ""}`,
        html,
        text,
        replyTo: email,
      });
      emailed = true;
    } catch (err) {
      failures.push("email");
      console.error("Order email error:", err);
    }

    if (saved || emailed) {
      return res.json({ ok: true, saved, emailed });
    }

    res.status(500).json({ error: "order_delivery_failed", failures });
  },
);

module.exports = router;
