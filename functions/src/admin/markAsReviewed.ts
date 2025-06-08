import * as functions from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {requireAdminAuth} from "../utils/auth";

export const markAsReviewed = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({error: "Method not allowed"});
        return;
      }

      const authResult = await requireAdminAuth(req, res);
      if (authResult !== true) return;

      const db = getFirestore();
      const {id, type, reviewed = true, notes} = req.body;

      if (!id || !type || (type !== "contact" && type !== "feedback")) {
        res.status(400).json({
          error: "id and type (contact|feedback) required",
        });
        return;
      }

      const collection = type === "contact"
        ? "contact_submissions"
        : "feedback_entries";

      const update: Record<string, unknown> = {reviewed};
      if (notes) update.adminNotes = notes;

      await db.collection(collection).doc(String(id)).update(update);
      res.json({success: true});
    } catch (error) {
      console.error("Error in markAsReviewed:", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);
