const express = require("express");

const healthRouter = express.Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "foydatube-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = { healthRouter };
