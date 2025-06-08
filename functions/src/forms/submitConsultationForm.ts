import * as functions from "firebase-functions";
import {z} from "zod";
import {getFirestore} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {handleCors} from "../utils/cors";

// Define the schema for consultation form
export const consultationSchema = z.object({
  name: z.string().min(1, {message: "Name is required"}),
  phone: z.string().min(1, {message: "Phone number is required"}),
  message: z.string().min(1, {message: "Message is required"}),
  consultationDate: z.string().datetime().or(z.string()),
  timeSlot: z.string(),
  type: z.string().default("consultation"),
  honeypot: z.string().optional(),
  createdAt: z.string().optional(),
});

const consultationHandler = async (req: Request, res: Response) => {
  try {
    // Handle CORS
    await handleCors(req, res, () => {/* empty function for CORS */});

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return;
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    // Log incoming request for debugging
    // Log request details for debugging
    console.log(
      "Consultation form request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "Content-Type:",
      req.headers["content-type"]
    );

    // Parse and validate request body
    let body = req.body;

    // If content-type is form-urlencoded, parse it
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const params = new URLSearchParams(req.body as string);
        body = Object.fromEntries(params.entries());
      } catch (error) {
        console.error("Error parsing form data:", error);
        res.status(400).json({
          error: "Invalid form data format",
          details: "Could not parse form data",
        });
        return;
      }
    }

    const result = consultationSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation failed:", result.error.flatten());
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten(),
      });
      return;
    }

    const data = result.data;

    // Honeypot check
    if (data.honeypot && data.honeypot !== "") {
      console.log("Bot detected via honeypot");
      // Return success to bots to avoid giving them feedback
      res.status(200).json({
        status: "success",
        message: "Thank you for your submission!",
      });
      return;
    }

    // Save to Firestore
    const db = getFirestore();
    await db.collection("consultations").add({
      name: data.name,
      phone: data.phone,
      message: data.message,
      consultationDate: data.consultationDate,
      timeSlot: data.timeSlot,
      type: data.type,
      status: "new",
      reviewed: false,
      createdAt: data.createdAt || new Date().toISOString(),
    });

    const successMessage = "Thank you for your consultation request! " +
      "We'll be in touch soon.";
    res.status(200).json({
      status: "success",
      message: successMessage,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ?
      error.message : "Unknown error";
    console.error("Error processing consultation form:", errorMessage);
    const errorResponse = {
      error: "An unexpected error occurred. Please try again later.",
      details: process.env.NODE_ENV === "development" ?
        errorMessage : undefined,
    };
    res.status(500).json(errorResponse);
  }
};

export const submitConsultationForm = functions
  .region("asia-south1")
  .https.onRequest(consultationHandler);
