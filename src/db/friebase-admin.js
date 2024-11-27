import admin from "firebase-admin";
import { serviceAccount } from "../db/config.js";
import { firebaseApp } from "./index.js";
import { getAuth } from "firebase/auth";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const auth = getAuth(firebaseApp);
export { auth, admin };
