import * as functions from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {requireAdminAuth} from "../utils/auth";

export const getSubmissions = functions
  .region("asia-south1")
  .https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({
        error: "Method not allowed",
      });
      return;
    }
    // Auth check
    const authResult = await requireAdminAuth(req, res);
    if (authResult !== true) return;

    const db = getFirestore();
    const {type = "all", limit = 20, startAfter} = req.query;
    let query;

    if (type === "feedback") {
      query = db.collection("feedback_entries")
        .orderBy("createdAt", "desc");
    } else if (type === "contact") {
      query = db.collection("contact_submissions")
        .orderBy("createdAt", "desc");
    } else {
      // Union query not natively supported; fetch both and merge
      const [contactsSnap, feedbackSnap] = await Promise.all([
        db.collection("contact_submissions")
          .orderBy("createdAt", "desc")
          .limit(Number(limit))
          .get(),
        db.collection("feedback_entries")
          .orderBy("createdAt", "desc")
          .limit(Number(limit))
          .get(),
      ]);
      const contacts = contactsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const feedback = feedbackSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Merge and sort by createdAt
      const merged = (
        [...contacts, ...feedback] as Array<{ id: string; createdAt: string }>
      ).sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt),
      );
      res.json(merged.slice(0, Number(limit)));
    }

    if (query) {
      let q = query.limit(Number(limit));
      if (startAfter) {
        q = q.startAfter(startAfter);
      }
      const snap = await q.get();
      const submissions = snap.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      res.json({submissions: submissions});
      return;
    }
  });
