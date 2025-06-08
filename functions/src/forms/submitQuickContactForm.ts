import * as functions from "firebase-functions";
import {z} from "zod";
import {getFirestore} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {handleCors} from "../utils/cors";

const quickContactSchema = z.object({
  name: z.string().min(1, {message: "Name is required"}),
  email: z.string().email({message: "Please enter a valid email address"}),
  message: z.string().min(1, {message: "Message is required"}),
  honeypot: z.string().optional(),
});

const quickContactHandler = async (req: Request, res: Response) => {
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

    // Parse and validate request body
    const result = quickContactSchema.safeParse(req.body);
    if (!result.success) {
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
    await db.collection("quickContacts").add({
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: new Date().toISOString(),
      type: "consultation",
      status: "new",
      reviewed: false,
    });

    res.status(200).json({
      status: "success",
      message: "Thank you for your submission!",
    });
  } catch (error) {
    console.error("Error processing quick contact form:", error);
    res.status(500).json({
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

export const submitQuickContactForm = functions
  .region("asia-south1")
  .https.onRequest(quickContactHandler);
