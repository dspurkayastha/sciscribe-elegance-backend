import * as functions from "firebase-functions";
import {z} from "zod";
import {getFirestore} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validateHoneypot} from "../utils/validation";
import {handleCors, corsPreflight} from "../utils/cors";

const feedbackSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(1),
  service: z.string().min(1),
  honeypot: z.string().optional(),
  consentToShow: z.boolean().optional(),
});

const feedbackFormHandler = async (req: Request, res: Response) => {
  // Handle preflight
  if (corsPreflight(req, res)) {
    return;
  }

  // Apply CORS
  try {
    await handleCors(req, res, () => {/* empty function for CORS */});
  } catch (error) {
    console.error("CORS error:", error);
    res.status(403).json({error: "Not allowed by CORS"});
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send({error: "Method not allowed"});
    return;
  }

  try {
    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        details: parsed.error.errors,
      });
      return;
    }

    const data = parsed.data;

    if (!validateHoneypot(data.honeypot)) {
      res.status(400).json({error: "Spam detected"});
      return;
    }

    const db = getFirestore();
    const submission = {
      name: data.name,
      email: data.email,
      rating: data.rating,
      feedback: data.feedback,
      service: data.service,
      consentToShow: data.consentToShow || false,
      createdAt: new Date().toISOString(),
    };

    await db.collection("feedback").add(submission);
    res.status(200).json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
};

export const submitFeedbackForm = functions
  .region("asia-south1")
  .https.onRequest(feedbackFormHandler);
