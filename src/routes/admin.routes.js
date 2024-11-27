import { Router } from "express";
const router = Router();
import {
  readQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  readQuestionById,
  createUser,
  getUsersWithPagination,
  updateUser,
  deleteUser,
  getUserById,
  updateUserStatus,
  getAllStats,
  updateQuestionStatus,
} from "../controllers/superAdmin.controller.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";

//Admin Routes
router
  .route("/question")
  .post(verifyToken, authorizeRole("admin"), createQuestion)
  .get(verifyToken, authorizeRole("admin"), readQuestions);

router
  .route("/question/:id")
  .get(verifyToken, authorizeRole("admin"), readQuestionById)
  .patch(verifyToken, authorizeRole("admin"), updateQuestion)
  .delete(verifyToken, authorizeRole("admin"), deleteQuestion);



router
  .route("/question/updatestatus/:id")
  .patch(verifyToken, authorizeRole("admin"), updateQuestionStatus);

router
  .route("/user")
  .post(verifyToken, authorizeRole("admin"), createUser)
  .get(verifyToken, authorizeRole("admin"), getUsersWithPagination)



router
  .route("/user/:id")
  .delete(verifyToken, authorizeRole("admin"), deleteUser)
  .get(verifyToken, authorizeRole("admin"), getUserById)
  .patch(verifyToken, authorizeRole("admin"), updateUser);

router
  .route("/user/update-status/:id")
  .post(verifyToken, authorizeRole("admin"), updateUserStatus);

router
  .route("/dashboard/stats")
  .get(verifyToken, authorizeRole("admin"), getAllStats);

export default router;
