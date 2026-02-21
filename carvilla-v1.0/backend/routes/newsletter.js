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
  console.log("Newsletter signup request received:", email);
  try {
    try {
      await pool.execute(
        "INSERT INTO newsletter (email, created_at) VALUES (?, NOW())",
        [email],
      );
      console.log("Newsletter saved to DB:", email);
    } catch (dbErr) {
      // If it's a duplicate entry, treat as success (already subscribed)
      if (dbErr && dbErr.code === "ER_DUP_ENTRY") {
        console.log("Newsletter duplicate signup ignored:", email);
      } else {
        throw dbErr;
      }
    }

    const html = `<p>Nouvelle inscription à la newsletter: <strong>${email}</strong></p>`;
    try {
      const info = await sendMail({
        subject: "Nouvelle inscription newsletter",
        html,
      });
      console.log("sendMail result for newsletter:", info);
    } catch (mailErr) {
      // Log mail errors but don't fail the signup flow
      console.error(
        "sendMail failed for newsletter signup:",
        mailErr && mailErr.message ? mailErr.message : mailErr,
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    // handle duplicate entry quietly
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
