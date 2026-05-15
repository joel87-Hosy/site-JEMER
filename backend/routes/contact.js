const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail, getAdminEmail } = require("../mailer");

const router = express.Router();

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
    try {
      await pool.execute(
        "INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())",
        [name, email, subject || null, message],
      );

      const html = `<p>Nouvelle demande de contact</p>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject || ""}</p>
        <p><strong>Message:</strong><br/>${message}</p>`;

      const text = `Nouvelle demande de contact\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject || ""}\nMessage:\n${message}`;

      await sendMail({
        to: getAdminEmail(),
        subject: `Contact - ${name}`,
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
