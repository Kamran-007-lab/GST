import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
    path: './.env'
});

// console.log("Firebase Config:");
// console.log("API Key:", process.env.FIREBASE_API_KEY);
// console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
// console.log("App ID:", process.env.FIREBASE_APP_ID);
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
});
