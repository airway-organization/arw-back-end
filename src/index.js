import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
dotenv.config({
  path: "./env",
});

connectDB
  .then(function () {
    // This block executes if myPromise is resolved
    runServer();
  })
  .catch(function (error) {
    console.error("Failed to connect to Firebase:", error);
    process.exit(1);
  });

//starting the server
function runServer() {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️  Server is running at port : 8000`);
  });
}
