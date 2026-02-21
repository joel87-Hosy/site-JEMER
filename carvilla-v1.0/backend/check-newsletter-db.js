const pool = require("./db");
(async () => {
  try {
    const email = "testnewsletter@example.com";
    const [res] = await pool.execute(
      "INSERT INTO newsletter (email, created_at) VALUES (?, NOW())",
      [email],
    );
    console.log("Insert result:", res);
    process.exit(0);
  } catch (e) {
    console.error("DB Error code:", e.code);
    console.error("DB Error message:", e.message);
    process.exit(1);
  }
})();
