import admin from "firebase-admin";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
export const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            throw new ApiError(401, "Invalid token");
        }
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        req.user = {
            uid: userRecord.uid,
            email: userRecord.email,
            fullName: userRecord.displayName || "",
            phoneNumber: userRecord.phoneNumber || "",
        };
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        throw new ApiError(401, error.message || "Invalid token");
    }
});
