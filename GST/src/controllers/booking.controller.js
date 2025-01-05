import { adminFirestore } from "../db/config.js";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { db } from "../db/config.js";

export const createBooking = asyncHandler(async (req, res) => {
    const {
        supplierName,
        supplierGstin,
        customerName,
        customerState,
        customerGstin,
        placeOfSupply,
        itemDescription,
        totalBookingAmount,
        status
    } = req.body;

    const requiredFields = [
        supplierName,
        supplierGstin,
        customerName,
        customerState,
        customerGstin,
        placeOfSupply,
        itemDescription,
        totalBookingAmount,
        status
    ];

    if (requiredFields.some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    try {
        const bookingRef = doc(db, "bookings", adminFirestore.collection("bookings").doc().id);
        await setDoc(bookingRef, {
            supplierName,
            supplierGstin,
            customerName,
            customerState,
            customerGstin,
            placeOfSupply,
            itemDescription,
            totalBookingAmount,
            status,
            createdAt: new Date().toISOString(),
        });

        res.status(201).json(
            new ApiResponse(201, { id: bookingRef.id }, "Booking created successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error creating booking");
    }
});

export const getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bookingDoc = await getDoc(doc(db, "bookings", id));

    if (!bookingDoc.exists()) {
        throw new ApiError(404, "Booking not found");
    }

    return res.status(200).json(
        new ApiResponse(200, bookingDoc.data(), "Booking retrieved successfully")
    );
});

export const updateBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        customerName,
        totalBookingAmount,
        status
    } = req.body;

    // Check if at least one field is provided for update
    if (!Object.keys(req.body).length) {
        throw new ApiError(400, "At least one field is required for update");
    }

    const bookingRef = doc(db, "bookings", id);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
        throw new ApiError(404, "Booking not found");
    }

    const updatedData = {
        ...bookingDoc.data(),
        ...(supplierName && { supplierName }),
        ...(supplierGstin && { supplierGstin }),
        ...(customerName && { customerName }),
        ...(customerState && { customerState }),
        ...(customerGstin && { customerGstin }),
        ...(placeOfSupply && { placeOfSupply }),
        ...(itemDescription && { itemDescription }),
        ...(totalBookingAmount && { totalBookingAmount }),
        ...(status && { status }),
        updatedAt: new Date().toISOString(),
    };

    try {
        await updateDoc(bookingRef, updatedData);

        res.status(200).json(
            new ApiResponse(200, updatedData, "Booking updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error updating booking");
    }
});

export const deleteBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const bookingRef = doc(db, "bookings", id);

    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
        throw new ApiError(404, "Booking not found");
    }

    try {
        await deleteDoc(bookingRef);
        res.status(200).json(
            new ApiResponse(200, {}, "Booking deleted successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error deleting booking");
    }
});