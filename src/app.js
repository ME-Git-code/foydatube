const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { healthRouter } = require("./routes/health");
const { apiRouter } = require("./routes");
const { notFound } = require("./middleware/not-found");
const { errorHandler } = require("./middleware/error-handler");
const { createGeneralLimiter } = require("./middleware/rate-limit");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);
app.use(helmet());
app.use(createGeneralLimiter());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "FoydaTube API",
    status: "ok",
  });
});

app.use("/health", healthRouter);
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
