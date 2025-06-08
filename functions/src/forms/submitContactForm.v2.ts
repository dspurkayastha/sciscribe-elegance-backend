import * as functions from "firebase-functions";
import {z} from "zod";
import {getFirestore} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validateHoneypot} from "../utils/validation";
import {handleCors, corsPreflight} from "../utils/cors";

const contactSchemaV2 = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  fileUrls: z.array(z.string().url()).optional(),
  honeypot: z.string().optional(),
  phone: z.string().min(5).max(32),
  service: z.string().min(1),
  addOns: z.object({
    plagiarism: z.boolean().optional(),
    statistical: z.boolean().optional(),
    figures: z.boolean().optional(),
    journal: z.boolean().optional(),
    cover: z.boolean().optional(),
    fastTrack: z.boolean().optional(),
  }).optional(),
  documentType: z.string().min(1),
  subjectArea: z.string().min(1),
  wordCount: z.number().int().min(0),
  deadline: z.string().optional(),
  contactMethod: z.string().min(1),
  source: z.string().optional(),
  gdprConsent1: z.boolean(),
});

const contactFormHandler = async (req: Request, res: Response) => {
  // Handle preflight
  if (corsPreflight(req, res)) {
    return;
  }

  // Apply CORS
  try {
    await handleCors(req, res, () => {});
  } catch (error) {
    console.error("CORS error:", error);
    res.status(403).json({ error: "Not allowed by CORS" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const parsed = contactSchemaV2.safeParse(req.body);
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
      fileUrls: data.fileUrls || [],
      phone: data.phone,
      service: data.service,
      addOns: data.addOns || {},
      documentType: data.documentType,
      subjectArea: data.subjectArea,
      wordCount: data.wordCount,
      deadline: data.deadline || null,
      contactMethod: data.contactMethod,
      source: data.source || null,
      gdprConsent1: data.gdprConsent1,
      createdAt: new Date().toISOString(),
      reviewed: false,
      v: 2,
    };

    await db.collection("contact_submissions").add(submission);

    // CORS headers are already set by the middleware
    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error processing form:", error);
    // CORS headers are already set by the middleware
    res.status(500).json({error: "Failed to process form"});
  }
};

export const submitContactFormV2 = functions
  .region("asia-south1")
  .https.onRequest(contactFormHandler);
