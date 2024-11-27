import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../db/index.js";
import { admin } from "../db/friebase-admin.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Missing access token");
  }
  const userRecord = await admin.auth().verifyIdToken(token);
  console.log("Existing token expiration:", userRecord.exp); // Unix timestamp in seconds

  const id = userRecord.uid;
  const userDoc = await getDoc(doc(db, "users", id));
  if (!userDoc.exists()) {
    throw new ApiError(401, "User not found associated with the token");
  }
  req.user = id;
  console.log(req.user);
  next();
});

export const authorizeRole = (requiredRole) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.user;
    const userDocRef = doc(db, "users", userId);
    const userDocSnapshot = await getDoc(userDocRef);
    // Check if user document exists and has userRole field
    if (!userDocSnapshot.exists() || !userDocSnapshot.data().userRole) {
      throw new ApiError(403, "Unauthorized user");
    }
    // Get user's role from the document
    const userRole = userDocSnapshot.data().userRole;
    // Compare user's role with required role
    if (userRole !== requiredRole) {
      throw new ApiError(403, "Unauthorized user");
    }
    next();
  });
};
