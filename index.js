require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const apiRouter = require("./src/router/index");
// const path = require("path");

// global.__base = path.join(__dirname, "/");
// app.use(
//   "/assets/uploads",
//   express.static(path.resolve(__dirname, "assets", "uploads"))
// );

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    exposedHeaders:
      "x_total_data, x_page_limit, x_total_page, x_current_page, x-auth",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.send("S11Q09A02:v");
});

app.use("/api/v2", apiRouter);

app.listen(process.env.PORT, "172.16.43.60", () => {
  console.log(`PUBER API started on port ${process.env.PORT}`);
});
