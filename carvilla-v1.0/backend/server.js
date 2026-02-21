const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const contactRoute = require("./routes/contact");
const newsletterRoute = require("./routes/newsletter");
const ordersRoute = require("./routes/orders");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/contact", contactRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/orders", ordersRoute);

app.get("/", (req, res) => res.json({ ok: true, msg: "JEMER backend" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
