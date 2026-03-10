const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
dotenv.config();

const contactRoute = require("./routes/contact");
const newsletterRoute = require("./routes/newsletter");
const ordersRoute = require("./routes/orders");

const app = express();

// Security headers
app.use(helmet());

// Logging
app.use(morgan(process.env.LOG_FORMAT || "combined"));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
});
app.use(limiter);

// CORS: restrict by env var CORS_ORIGIN (comma-separated), fallback to localhost
const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : defaultOrigins;
app.use(
  cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
  }),
);

app.use(bodyParser.json({ limit: process.env.BODY_LIMIT || "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static site files from project root (so pages like /heritage.html are available)
app.use(express.static(path.join(__dirname, "..")));

app.use("/api/contact", contactRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/orders", ordersRoute);

app.get("/", (req, res) => res.json({ ok: true, msg: "JEMER backend" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
