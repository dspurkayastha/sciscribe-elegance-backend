/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

// Forms
export { submitContactForm } from "./forms/submitContactForm";
export { submitFeedbackForm } from "./forms/submitFeedbackForm";

// Admin
export { getSubmissions } from "./admin/getSubmissions";
export { deleteSubmission } from "./admin/deleteSubmission";
export { markAsReviewed } from "./admin/markAsReviewed";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
