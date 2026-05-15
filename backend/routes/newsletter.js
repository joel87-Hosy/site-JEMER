const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { sendMail, getAdminEmail } = require("../mailer");

const router = express.Router();

router.post("/", [body("email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    try {
      await pool.execute(
        "INSERT INTO newsletter (email, created_at) VALUES (?, NOW())",
        [email],
      );
    } catch (dbErr) {
      // Already subscribed: keep endpoint idempotent instead of returning 500.
      if (!(dbErr && dbErr.code === "ER_DUP_ENTRY")) {
        throw dbErr;
      }
    }

    const html = `<p>Nouvelle inscription à la newsletter: <strong>${email}</strong></p>`;
    const text = `Nouvelle inscription a la newsletter: ${email}`;
    await sendMail({
      to: getAdminEmail(),
      subject: "Nouvelle inscription newsletter",
      html,
      text,
      replyTo: email,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
