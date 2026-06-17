const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail, getAdminEmail } = require("../mailer");

const router = express.Router();

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("message").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;
    let saved = false;
    let emailed = false;
    const failures = [];

    try {
      await pool.execute(
        "INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())",
        [name, email, subject || null, message],
      );
      saved = true;
    } catch (err) {
      failures.push("database");
      console.error("Contact database error:", err);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject || "");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const html = `<p>Nouvelle demande de contact</p>
      <p><strong>Nom:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Sujet:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong><br/>${safeMessage}</p>`;

    const text = `Nouvelle demande de contact\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject || ""}\nMessage:\n${message}`;

    try {
      await sendMail({
        to: getAdminEmail(),
        subject: `Contact - ${name}`,
        html,
        text,
        replyTo: email,
      });
      emailed = true;
    } catch (err) {
      failures.push("email");
      console.error("Contact email error:", err);
    }

    if (saved || emailed) {
      return res.json({ ok: true, saved, emailed });
    }

    res.status(500).json({ error: "contact_delivery_failed", failures });
  },
);

module.exports = router;
