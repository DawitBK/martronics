import express from "express";
import sequelize from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
// const PORT = process.env.PORT || 3000;
import indexRouter from "./routes/index.router.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import specs from "./swagger.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

try {
  await sequelize.authenticate();
  console.log("database connected");

  await sequelize.sync({ alter: true });
  console.log("database synced");
} catch (error) {
  console.log("connection error", error);
}

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});
app.use("/api", indexRouter);
app.use(errorHandler);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
