import { Router } from "express";
const router = Router();
import {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  submitAnswer,
  getCurrentUser,
  
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/")
  .delete(verifyToken, deleteUser)
  .patch(verifyToken, updateUser);

router.route("/current-user").get(verifyToken, getCurrentUser);
router.route("/answer/:questionId").post(verifyToken, submitAnswer);

export default router;
