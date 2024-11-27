import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  FieldValue,
} from "firebase/firestore";

//Read Questions
const readQuestions = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5; // Default page size to 5
  const page = parseInt(req.query.page) || 1; // Default page to 1
  const queryRef = collection(db, "questions");
  let q;
  let nextPageVisibleId = null;
  if (page > 1) {
    // Use lastVisible for pagination if page > 1
    const lastVisible = req.query.lastVisible;
    if (!lastVisible) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: 'lastVisible' parameter is missing.",
      });
    }
    q = query(
      queryRef,
      orderBy("createdAt", "desc"),
      startAfter(doc(queryRef, lastVisible)),
      limit(pageSize)
    );
  } else {
    // Initial query for page 1, include the first document for reference
    q = query(queryRef, orderBy("createdAt", "desc"), limit(pageSize + 1));
  }

  const questionsSnapshot = await getDocs(q);

  // Handle edge cases (empty results, insufficient documents)
  if (questionsSnapshot.size === 0) {
    return res
      .status(200)
      .json({ success: true, users: [], nextPageVisibleId: null });
  }
  const questions = questionsSnapshot.docs
    .slice(0, pageSize)
    .map((doc) => doc.data()); // Limit retrieved users to page size
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { questions, nextPageVisibleId },
        "Users retrieved successfully"
      )
    );
});

//Reading Question by Id
const readQuestionById = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const questionDoc = await getDoc(doc(db, "questions", questionId));
  if (questionDoc.exists()) {
    // Construct the question object
    const question = {
      id: questionDoc.id,
      ...questionDoc.data(),
    };
  } else {
    throw new ApiError(404, "Question not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, { question }, "Question retrieved successfully")
    );
});

export { readQuestions, readQuestionById };
