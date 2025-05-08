import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { requireAdminAuth } from "../utils/auth";

export const deleteSubmission = functions.https.onRequest(async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const authResult = await requireAdminAuth(req, res);
  if (authResult !== true) return;

  const db = getFirestore();
  const { id, type } = req.query;
  if (!id || !type || (type !== "contact" && type !== "feedback")) {
    return res.status(400).json({ error: "id and type (contact|feedback) required" });
  }
  const collection = type === "contact" ? "contact_submissions" : "feedback_entries";
  await db.collection(collection).doc(String(id)).delete();
  return res.json({ success: true });
});
