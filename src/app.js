import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
const app = express();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute can adjust as per needs
  limit: 100, // Limit each IP to 100 requests per `window (1 minute)`
  message: "Too many request from this IP Please try again in some time",
});

//Custom Middlewares

// Helmet for various security headers
app.use(helmet());
// CORS configuration (adjust origins and options as needed)
app.use(cors(
  {
    origin: '*',
  }
));
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use("/api", limiter);
//Data sanitization against XSS
app.use(xss());
//Prevents Paramater pollution
// app.use(hpp());

//Routes import
import userRouter from "./routes/user.routes.js";
import questionRouter from "./routes/question.routes.js";
import adminRouter from "./routes/admin.routes.js";
import chartRouter from "./routes/admin.routes.js";

//Routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/chart", chartRouter);
app.use("/api/v1/admin", adminRouter);

export { app };
