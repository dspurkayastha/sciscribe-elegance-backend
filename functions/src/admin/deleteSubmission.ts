import * as functions from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {requireAdminAuth} from "../utils/auth";

export const deleteSubmission = functions
  .region("asia-south1")
  .https.onRequest(async (req, res) => {
    if (req.method !== "DELETE") {
      res.status(405).json({
        error: "Method not allowed",
      });
      return;
    }
    const authResult = await requireAdminAuth(req, res);
    if (authResult !== true) return;

    const db = getFirestore();
    const {id, type} = req.query;
    if (
      !id ||
      !type ||
      (type !== "contact" && type !== "feedback")
    ) {
      res.status(400).json({
        error: "id and type (contact|feedback) required",
      });
      return;
    }
    const collection = type === "contact" ?
      "contact_submissions" :
      "feedback_entries";
    await db
      .collection(collection)
      .doc(String(id))
      .delete();
    res.json({
      success: true,
    });
    return;
  });
