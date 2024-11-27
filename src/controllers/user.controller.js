import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Answer from "../models/answer.model.js";
import { db } from "../db/index.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "../db/friebase-admin.js";
import admin from "firebase-admin";

//Register User
const registerUser = asyncHandler(async (req, res) => {
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

  // Only Continue with the registration process if validation succeeds

  // Sign up the user with email and password
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Retrieve the user's UID
  const uid = userCredential.user.uid;

  // Generate a token for the user
  const token = await userCredential.user.getIdToken(true);

  // Construct the user data object
  const userData = {
    username,
    email,
    age,
    gender,
    phoneNumber,
    isAccountActive: true,
    createdAt: serverTimestamp(),
    userRole: "user",
    profileImg: newUser.profileImg,
  };

  // Save user data to Firestore users collection
  const docRef = doc(collection(db, "users"), uid);
  await setDoc(docRef, userData);

  res.cookie("token", token, {
    expires: new Date(
      Date.now() + process.env.TOKEN_EXPIRES_IN || 90 * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  });

  // Send success response
  res
    .status(201)
    .json(
      new ApiResponse(201, { user: userData, token }, "User added successfully")
    );
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // validation
  if (!email || !email.trim()) {
    throw new ApiError(422, "Email is required and cannot be empty spaces.");
  }

  if (!password || !password.trim()) {
    throw new ApiError(422, "Password is required and cannot be empty spaces.");
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const token = await userCredential.user.getIdToken(/* forceRefresh = */ true);

  res.cookie("token", token, {
    expires: new Date(
      Date.now() + process.env.Token_Expires_In || 90 * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { token }, "User logged in successfully"));
});

//Delete User if Login/Authenticated
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  await admin.auth().deleteUser(userId);

  // Delete user from Firestore
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);

  // Send response
  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

//Update User if Login/Authenticated
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
    createdAt: serverTimestamp(),
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
      new ApiResponse(
        200,
        { data: updatedUserData },
        "User updated successfully"
      )
    );
});

//View User Details if Login/Authenticated
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new ApiError(404, "User not found");
  }
  const userData = userDoc.data();
  // Return user details
  res
    .status(200)
    .json(
      new ApiResponse(200, userData, "User details retrieved successfully")
    );
});

//Submit Answer if user is Login
const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const userId = req.user;
  const { questionId } = req.params;

  // Get the username from the users collection using the user ID
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new ApiError(404, "User not found");
  }
  const userData = userDoc.data();
  const submittedBy = userData.username;

  // Validate the answer using the Answer model
  const newAnswer = new Answer(submittedBy, answer, questionId);

  // Add the answer to the database
  const answerData = {
    submittedBy: newAnswer.answerBy,
    answer: newAnswer.answer,
    questionId: req.params.questionId,
    submittedAt: new Date().toUTCString(),
  };
  const answersRef = collection(db, "answers");
  await addDoc(answersRef, answerData);
  res
    .status(200)
    .json(
      new ApiResponse(200, { answerData }, "Answer submitted successfully")
    );
});

export {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  submitAnswer,
  getCurrentUser,
};
