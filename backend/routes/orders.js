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
    try {
      const conn = await pool.getConnection();
      let orderId = null;
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
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }

      const emailItems = items.map((item) => ({
        name: String(item.name || ""),
        qty: item.qty || item.quantity || 1,
        price: item.price || 0,
        img: toPublicAssetUrl(item.img),
      }));

      const itemsHtml = emailItems
        .map((i) => {
          const imgTag = i.img
            ? `<div><img src="${i.img}" style="max-width:120px;height:auto;display:block;margin-bottom:6px" alt="${i.name}"/></div>`
            : "";
          return `<li>${imgTag}<strong>${i.name}</strong> — quantite: ${i.qty} — prix unitaire: ${i.price}</li>`;
        })
        .join("");

      const itemsText = emailItems
        .map((i) => {
          const imgLine = i.img ? `Image: ${i.img}\n` : "";
          return `${imgLine}${i.name} — quantite: ${i.qty} — prix unitaire: ${i.price}`;
        })
        .join("\n\n");

      const html = `<p>Nouvelle commande${orderId ? " — N°" + orderId : ""}</p>
        <p><strong>Client:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telephone:</strong> ${phone || "(non fourni)"}</p>
        <p><strong>Adresse:</strong> ${address || "(non fourni)"}</p>
        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Articles:</strong></p>
        <ul>${itemsHtml}</ul>`;

      const text = `Nouvelle commande${orderId ? " — N°" + orderId : ""}\n
Client: ${name}\nEmail: ${email}\nTelephone: ${phone || "(non fourni)"}\nAdresse: ${address || "(non fourni)"}\nTotal: ${total}\n\nArticles:\n${itemsText}`;

      await sendMail({
        to: getAdminEmail(),
        subject: `Commande - ${name}${orderId ? " #" + orderId : ""}`,
        html,
        text,
        replyTo: email,
      });

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "server_error" });
    }
  },
);

module.exports = router;
