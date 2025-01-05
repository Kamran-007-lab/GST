import { Router } from "express"
import {registerUser,loginUser,logoutUser, changePassword, getCurrentUser, updateAccountDetails } from "../controllers/user.controller.js"
import { verifyFirebaseToken } from "../middlewares/auth.middleware.js"

const router = Router()

// public routes
router.route("/register").post(
    registerUser
)
router.route("/login").post( loginUser)

// secured routes
router.route("/logout").post(verifyFirebaseToken, logoutUser)
router.route("/change-password").post(verifyFirebaseToken, changePassword)
router.route("/current-user").get(verifyFirebaseToken, getCurrentUser)
router.route("/update-account").patch(verifyFirebaseToken, updateAccountDetails)


export default router