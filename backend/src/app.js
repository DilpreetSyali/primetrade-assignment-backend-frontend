const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/error");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true, message: "Server healthy" }));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Versioned Routes
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/tasks", require("./routes/task.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;