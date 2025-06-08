/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";

admin.initializeApp();

// Forms
export {submitContactForm} from "./forms/submitContactForm";
export {submitContactFormV2} from "./forms/submitContactForm.v2";
export {submitFeedbackForm} from "./forms/submitFeedbackForm";
export {submitQuickContactForm} from "./forms/submitQuickContactForm";

// Admin
export {getSubmissions} from "./admin/getSubmissions";
export {deleteSubmission} from "./admin/deleteSubmission";
export {markAsReviewed} from "./admin/markAsReviewed";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
