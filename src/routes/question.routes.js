import { Router } from "express";
import {
  readQuestions,
  readQuestionById,
} from "../controllers/question.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/").get(verifyToken, readQuestions);
router.route("/:id").get(verifyToken, readQuestionById);

export default router;
