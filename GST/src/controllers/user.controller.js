import { adminAuth, adminFirestore } from "../db/config.js";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { db } from "../db/config.js";

const auth = getAuth();

export const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, phoneNumber } = req.body;
    if ([fullname, email, password, phoneNumber].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }
    try {
        try {
            const userExists = await adminAuth.getUserByEmail(email);
            if (userExists) {
                throw new ApiError(409, "User with this email already exists");
            }
        } catch (error) {
            if (error.code !== "auth/user-not-found") {
                throw new ApiError(409, "User with this email already exists",error);
            }
        }
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: fullname,
        });
        await setDoc(doc(db, "users", userRecord.uid), {
            fullname,
            email,
            phoneNumber,
            createdAt: new Date().toISOString(),
        });
        return res.status(201).json(
            new ApiResponse(201, { uid: userRecord.uid, fullname, email }, "User registered successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        const statusCode = error.errorInfo?.code || 500;
        const message = error.errorInfo?.message || "An error occurred during registration";
        throw new ApiError(statusCode, message);
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        };

        return res
            .status(200)
            .cookie("accessToken", idToken, options)
            .json(new ApiResponse(200, { token: idToken }, "User logged in successfully"));
    } catch (error) {
        throw new ApiError(401, "Invalid email or password");
    }
});

export const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const { user } = req;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userDoc.data(), "Current user fetched successfully"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    const { user } = req;

    if (!fullname && !email) {
        throw new ApiError(400, "Either name or email is required");
    }

    let authData = {};
    let firestoreData = {};

    if (fullname) {
        authData.displayName = fullname;
        firestoreData.fullname = fullname;
    }

    if (email) {
        authData.email = email;
        firestoreData.email = email;
    }

    try {
        const updatedUser = await adminAuth.updateUser(user.uid, authData);
        await updateDoc(doc(db, "users", user.uid), firestoreData);
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    fullname: updatedUser.displayName,
                    email: updatedUser.email
                },
                "Account details updated successfully"
            )
        );
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            throw new ApiError(409, "Email already in use");
        }
        throw new ApiError(500, "Error updating account details");
    }
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { user } = req;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from old password");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
            auth,
            user.email,
            oldPassword
        );

        if (!userCredential) {
            throw new ApiError(401, "Current password is incorrect");
        }
        await adminAuth.updateUser(user.uid, {
            password: newPassword,
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Password changed successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error.code === 'auth/wrong-password') {
            throw new ApiError(401, "Current password is incorrect");
        }
        if (error.code === 'auth/weak-password') {
            throw new ApiError(400, "New password is too weak. It must be at least 6 characters long");
        }
        throw new ApiError(500, "Error changing password");
    }
});
