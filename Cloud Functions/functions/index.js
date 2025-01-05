import admin from "firebase-admin";
import * as functions from "firebase-functions";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const GST_RATE = 0.18;
const BASE_URL = "https://api-sandbox.clear.in";
const templateType = "sales";
const calculateGST = (totalBookingAmount, customerState, placeOfSupply) => {
    const gstAmount = parseFloat(totalBookingAmount) * GST_RATE;
    const isInterstate = customerState.toLowerCase() !== placeOfSupply.toLowerCase();
    
    return {
        cgst: isInterstate ? 0 : gstAmount / 2,
        sgst: isInterstate ? 0 : gstAmount / 2,
        igst: isInterstate ? gstAmount : 0,
        totalAmount: parseFloat(totalBookingAmount) + gstAmount,
        supplyType: isInterstate ? 'Interstate' : 'Intrastate'
    };
};
const sendGSTInvoice = async (invoiceData) => {
    const response = await fetch(`${BASE_URL}/integration/v2/ingest/json/${templateType}`, {
        method: "POST",
        headers: {
            "x-cleartax-gstin":process.env.GSTIN,
            "x-cleartax-auth-token":process.env.AUTH_TOKEN,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
    });
    return response.json();
};

export const generateGSTInvoice = functions.firestore
    .onDocumentUpdated("/bookings/{bookingId}", async (event) => {
        const newValue = event.data.after.data();
        const previousValue = event.data.before.data();
        const bookingId = event.params.bookingId;

        if (newValue.status === "finished" && previousValue.status !== "finished") {
            const {
                supplierName,
                supplierGstin,
                customerName,
                customerState,
                customerGstin,
                placeOfSupply,
                itemDescription,
                totalBookingAmount
            } = newValue;

            const gstDetails = calculateGST(totalBookingAmount, customerState, placeOfSupply);
            const invoiceData = {
                supplier: {
                    name: supplierName,
                    gstin: supplierGstin
                },
                customer: {
                    name: customerName,
                    state: customerState,
                    gstin: customerGstin
                },
                transaction: {
                    placeOfSupply,
                    itemDescription,
                    baseAmount: parseFloat(totalBookingAmount),
                    supplyType: gstDetails.supplyType
                },
                gstBreakdown: {
                    cgst: gstDetails.cgst,
                    sgst: gstDetails.sgst,
                    igst: gstDetails.igst,
                    totalAmount: gstDetails.totalAmount,
                    gstRate: GST_RATE * 100 
                },
                invoiceDate: new Date().toISOString()
            };

            try {
                const responseData = await sendGSTInvoice(invoiceData);
                console.log("GST Invoice Filed Successfully", invoiceData);
                // console.log("This is response",responseData);
            } catch (error) {
                console.error("Error filing GST:", error.message);
                await updateFirestoreWithGST(bookingId, invoiceData, null, error.message);
            }
        }
    });