const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/error");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true, message: "Server healthy" }));
app.get("/api/v1/ping", (req, res) => res.json({ ok: true, message: "v1 ping works" }));

// ✅ VERSIONED ROUTES
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/tasks", require("./routes/task.routes"));

// ✅ MUST BE LAST

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "PrimeTrade API is running",
    endpoints: {
      health: "/health",
      ping: "/api/v1/ping",
      register: "POST /api/v1/auth/register",
      login: "POST /api/v1/auth/login",
      tasks: "GET/POST /api/v1/tasks"
    }
  });
});
app.use(notFound);
app.use(errorHandler);

module.exports = app;
