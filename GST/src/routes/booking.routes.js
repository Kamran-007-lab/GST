import { Router } from "express";
import {
    createBooking,
    getBookingById,
    updateBooking,
    deleteBooking,
} from "../controllers/booking.controller.js";
import { verifyFirebaseToken } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/create").post(verifyFirebaseToken, createBooking);
router.route("/:id")
    .get(verifyFirebaseToken, getBookingById)
    .patch(verifyFirebaseToken, updateBooking)
    .delete(verifyFirebaseToken, deleteBooking);

export default router;
