const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail } = require("../mailer");

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

      // send email to admin
      const html = `<p>Nouvelle demande de contact</p>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject || ""}</p>
        <p><strong>Message:</strong><br/>${message}</p>`;

      await sendMail({ subject: `Contact - ${name}`, html });

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "server_error" });
    }
  },
);

module.exports = router;
