import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../db/friebase-admin.js";
import admin from "firebase-admin";
import { db } from "../db/index.js";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  limit,
  query,
  startAfter,
  orderBy,
} from "firebase/firestore";

//Create Question
const createQuestion = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { question, isActive } = req.body;
  const newQuestion = new Question(question, isActive);
  let validationErrors;
  if (validationErrors) {
    throw new ApiError(400, JSON.stringify(validationErrors));
  }

  const questionData = {
    question: newQuestion.question,
    isActive: newQuestion.isActive,
    createdAt: new Date().toUTCString(),
    createdBy: userId,
  };

  // Save the validated Question data to the database
  await addDoc(collection(db, "questions"), questionData);
  res
    .status(200)
    .json(new ApiResponse(200, { question }, "Question added successfully"));
});

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

//Reading by Id
const readQuestionById = asyncHandler(async (req, res) => {
  const questionId = req.params.id;

  // Fetch the question document from Firestore by ID
  const questionDoc = await getDoc(doc(db, "questions", questionId));

  // Check if the question document exists
  if (questionDoc.exists()) {
    const question = {
      id: questionDoc.id,
      ...questionDoc.data(),
    };
    res
      .status(200)
      .json(new ApiResponse(200, question, "Question retrieved successfully"));
  } else {
    res.status(404).json(new ApiResponse(404, null, "Question not found"));
  }
});

//Update Question
const updateQuestion = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const updatedQuestion = req.body;

  // Check if questionId is provided
  if (!questionId) {
    throw new ApiError(400, "Question ID is missing");
  }

  // Check if updatedQuestion is provided
  if (!updatedQuestion) {
    throw new ApiError(400, "Updated question data is missing");
  }

  const newQuestion = new Question(question, isActive);
  let validationErrors;
  if (validationErrors) {
    throw new ApiError(400, JSON.stringify(validationErrors));
  }

  const questionData = {
    question: newQuestion.question,
    isActive: newQuestion.isActive,
    createdAt: new Date().toUTCString(),
    createdBy: userId,
  };

  // Update the question in the Firestore collection
  await updateDoc(doc(db, "questions", questionId), questionData);

  // Send success response
  res
    .status(200)
    .json(new ApiResponse(200, { question }, "Question updated successfully"));
});

//Delete Question
const deleteQuestion = asyncHandler(async (req, res) => {
  const questionId = req.params.id;

  if (!questionId) {
    throw new ApiError(400, "Question ID is missing");
  }

  await deleteDoc(doc(db, "questions", questionId));

  // Send success response
  res
    .status(200)
    .json(new ApiResponse(200, null, "Question deleted successfully"));
});

//Create User
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, age, gender, phoneNumber, profileImg } =
    req.body;

  // Create a new User instance with profileImg defaulting to an empty string if not provided
  const newUser = new User(
    username,
    email,
    password,
    age,
    gender,
    phoneNumber,
    profileImg
  );

  // Validate the user object
  newUser.validate();

  // Continue with the registration process if validation succeeds
  // Sign up the user with email and password
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Retrieve the user's UID
  const uid = userCredential.user.uid;

  // Construct the user data object
  const userData = {
    username,
    email,
    age,
    gender,
    phoneNumber,
    isAccountActive: true,
    createdAt: new Date().toUTCString(),
    userRole: "user",
    profileImg: newUser.profileImg,
  };

  // Save user data to Firestore
  const docRef = doc(collection(db, "users"), uid);
  await setDoc(docRef, userData);

  res
    .status(201)
    .json(new ApiResponse(201, { userData }, "User added successfully"));
});

//We will get the id of the user from params which we want to delete and update

//Read User
const getUsersWithPagination = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5; // Default page size to 5
  const page = parseInt(req.query.page) || 1; // Default page to 1
  const queryRef = collection(db, "users");
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

  const usersSnapshot = await getDocs(q);

  // Handle edge cases (empty results, insufficient documents)
  if (usersSnapshot.size === 0) {
    return res
      .status(200)
      .json({ success: true, users: [], nextPageVisibleId: null });
  }
  const users = usersSnapshot.docs.slice(0, pageSize).map((doc) => doc.data());
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users, nextPageVisibleId },
        "Users retrieved successfully"
      )
    );
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { username, email, password, age, gender, phoneNumber, profileImg } =
    req.body;

  // Create a new User instance with profileImg defaulting to an empty string if not provided
  const newUser = new User(
    username,
    email,
    password,
    age,
    gender,
    phoneNumber,
    profileImg
  );

  // Validate the user object
  newUser.validate();
  // Update the user document
  const updateData = {
    username,
    email,
    age,
    gender,
    phoneNumber,
    isAccountActive: true,
    createdAt: new Date().toUTCString(),
    userRole: "user",
    profileImg: newUser.profileImg,
  };

  // Update the user document
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updateData);

  // Retrieve the updated user document from Firestore
  const updatedUserDoc = await getDoc(userRef);
  const updatedUserData = updatedUserDoc.data();

  res
    .status(200)
    .json(
      new ApiResponse(200, { updatedUserData }, "User updated successfully")
    );
});

//Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  // Delete the user from Firebase Authentication
  await admin.auth().deleteUser(userId);

  // Delete the user document from Firestore
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

//Read User By Id
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    res
      .status(200)
      .json(
        new ApiResponse(200, { user: userData }, "User retrieved successfully")
      );
  } else {
    throw new ApiError(404, "User not found");
  }
});

//Change User Status
const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { isAccountActive } = req.body;
  // Validate isAccountActive field
  if (typeof isAccountActive !== "boolean") {
    throw new ApiError(400, "isAccountActive field must be a boolean value");
  }

  // Update the user's status based on the isActive value
  const updateData = { isAccountActive };

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updateData);
  const action = isAccountActive ? "activated" : "inactivated";

  const updatedUserDoc = await getDoc(userRef);
  const updatedUserData = updatedUserDoc.data();

  res
    .status(200)
    .json(
      new ApiResponse(200, { updatedUserData }, `User ${action} successfully`)
    );
});

//Stats for Dashboard
const getAllStats = asyncHandler(async (req, res) => {
  // Get the total number of users
  const usersSnapshot = await getDocs(collection(db, "users"));
  const totalUsers = usersSnapshot.size;

  // Get the total number of questions
  const questionsSnapshot = await getDocs(collection(db, "questions"));
  const totalQuestions = questionsSnapshot.size;

  // Get the total number of answers
  const answersSnapshot = await getDocs(collection(db, "answers"));
  const totalAnswers = answersSnapshot.size;

  // Send the response with the total number of users and questions
  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers: totalUsers,
        totalQuestions: totalQuestions,
        totalAnswers: totalAnswers,
      },
      `Here is your stats`
    )
  );
});

//Admin to do question InActive/Active
const updateQuestionStatus = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const { isAccountActive } = req.body;
  // Validate isActive field
  if (typeof isAccountActive !== "boolean") {
    throw new ApiError(400, "isAccountActive field must be a boolean value");
  }
  // Update the question's status based on the isActive value
  const updateData = { isActive };
  const userRef = doc(db, "questions", questionId);
  await updateDoc(userRef, updateData);
  const action = isActive ? "activated" : "inactivated";
  const updatedQuestionDoc = await getDoc(userRef);
  const updatedQuestionData = updatedUserDoc.data();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedQuestionData },
        `Question ${action} successfully`
      )
    );
});

export {
  readQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  readQuestionById,
  createUser,
  getUsersWithPagination,
  updateUser,
  getUserById,
  deleteUser,
  updateUserStatus,
  getAllStats,
  updateQuestionStatus,
};
