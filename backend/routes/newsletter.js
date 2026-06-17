const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail, getAdminEmail } = require("../mailer");

const router = express.Router();

router.post("/", [body("email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  let saved = false;
  let emailed = false;
  const failures = [];

  try {
    await pool.execute(
      "INSERT INTO newsletter (email, created_at) VALUES (?, NOW())",
      [email],
    );
    saved = true;
  } catch (dbErr) {
    // Already subscribed: keep endpoint idempotent instead of returning 500.
    if (dbErr && dbErr.code === "ER_DUP_ENTRY") {
      saved = true;
    } else {
      failures.push("database");
      console.error("Newsletter database error:", dbErr);
    }
  }

  const html = `<p>Nouvelle inscription a la newsletter: <strong>${email}</strong></p>`;
  const text = `Nouvelle inscription a la newsletter: ${email}`;

  try {
    await sendMail({
      to: getAdminEmail(),
      subject: "Nouvelle inscription newsletter",
      html,
      text,
      replyTo: email,
    });
    emailed = true;
  } catch (mailErr) {
    failures.push("email");
    console.error("Newsletter email error:", mailErr);
  }

  if (saved || emailed) {
    return res.json({ ok: true, saved, emailed });
  }

  res.status(500).json({ error: "newsletter_delivery_failed", failures });
});

module.exports = router;
