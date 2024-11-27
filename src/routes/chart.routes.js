import { Router } from "express";
import {
  createChart,
  updateChart,
  deleteChart,
  readChart,
} from "../controllers/chart.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/").get(verifyToken, createChart);
router
  .route("/:id")
  .get(verifyToken, updateChart)
  .delete(verifyToken, deleteChart)
  .patch(verifyToken, updateChart);

export default router;
