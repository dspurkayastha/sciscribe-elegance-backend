import * as functions from "firebase-functions";
import { z } from "zod";
import { getFirestore } from "firebase-admin/firestore";
import { validateHoneypot } from "../utils/validation";

const feedbackSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(1),
  service: z.string().min(1),
  honeypot: z.string().optional(),
});

export const submitFeedbackForm = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  try {
    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }
    const data = parsed.data;

    // Anti-spam honeypot check
    if (!validateHoneypot(data.honeypot)) {
      return res.status(400).json({ error: "Spam detected" });
    }

    const db = getFirestore();
    const submission = {
      name: data.name,
      email: data.email,
      rating: data.rating,
      feedback: data.feedback,
      service: data.service,
      createdAt: new Date().toISOString(),
      reviewed: false,
    };
    await db.collection("feedback_entries").add(submission);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
