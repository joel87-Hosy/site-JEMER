const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail } = require("../mailer");

const router = express.Router();

router.post("/", [body("email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    await pool.execute(
      "INSERT INTO newsletter (email, created_at) VALUES (?, NOW())",
      [email],
    );

    const html = `<p>Nouvelle inscription à la newsletter: <strong>${email}</strong></p>`;
    await sendMail({ subject: "Nouvelle inscription newsletter", html });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    // handle duplicate entry quietly
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
