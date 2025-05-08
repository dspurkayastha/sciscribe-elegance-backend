import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { requireAdminAuth } from "../utils/auth";

export const getSubmissions = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // Auth check
  const authResult = await requireAdminAuth(req, res);
  if (authResult !== true) return;

  const db = getFirestore();
  const { type = "all", limit = 20, startAfter } = req.query;
  let query;

  if (type === "feedback") {
    query = db.collection("feedback_entries").orderBy("createdAt", "desc");
  } else if (type === "contact") {
    query = db.collection("contact_submissions").orderBy("createdAt", "desc");
  } else {
    // Union query not natively supported; fetch both and merge
    const [contactsSnap, feedbackSnap] = await Promise.all([
      db.collection("contact_submissions").orderBy("createdAt", "desc").limit(Number(limit)).get(),
      db.collection("feedback_entries").orderBy("createdAt", "desc").limit(Number(limit)).get()
    ]);
    const contacts = contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const feedback = feedbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Merge and sort by createdAt
    const merged = [...contacts, ...feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return res.json({ submissions: merged.slice(0, Number(limit)) });
  }

  let q = query.limit(Number(limit));
  if (startAfter) {
    q = q.startAfter(startAfter);
  }
  const snap = await q.get();
  const submissions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return res.json({ submissions });
});
