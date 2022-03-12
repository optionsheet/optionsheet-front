import compression from "compression";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import startServer from "./server";

const app = express();

// Middleware
app.use(rateLimit({
  windowMs: 60 * 100, // 1 minute
  max: 1000
}));
app.use(compression());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

startServer(app);