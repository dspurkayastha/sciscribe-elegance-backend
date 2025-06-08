import * as functions from "firebase-functions";
import {z} from "zod";
import {getFirestore} from "firebase-admin/firestore";
import {validateHoneypot} from "../utils/validation";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  fileUrls: z.array(z.string().url()).optional(),
  honeypot: z.string().optional(),
});

export const submitContactForm = functions
  .region("asia-south1")
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send({error: "Method not allowed"});
      return;
    }

    try {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid input",
          details: parsed.error.errors,
        });
        return;
      }
      const data = parsed.data;

      // Anti-spam honeypot check
      if (!validateHoneypot(data.honeypot)) {
        res.status(400).json({
          error: "Spam detected",
        });
        return;
      }

      const db = getFirestore();
      const submission = {
        name: data.name,
        email: data.email,
        message: data.message,
        fileUrls: data.fileUrls || [],
        createdAt: new Date().toISOString(),
        reviewed: false,
      };
      await db.collection("contact_submissions").add(submission);
      res.status(200).json({success: true});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: "Internal server error"});
    }
  });
