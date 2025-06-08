import * as functions from "firebase-functions";
import {z} from "zod";
import {getFirestore} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validateHoneypot} from "../utils/validation";
import {handleCors, corsPreflight} from "../utils/cors";

const quickContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  honeypot: z.string().optional(),
});

const quickContactHandler = async (req: Request, res: Response) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    corsPreflight(req, res);
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
    const parsed = quickContactSchema.safeParse(req.body);
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
      message: data.message,
      createdAt: new Date().toISOString(),
      reviewed: false,
    };

    await db.collection("quick_contact").add(submission);
    res.status(200).json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
};

export const submitQuickContactForm = functions
  .region("asia-south1")
  .https.onRequest(quickContactHandler);
