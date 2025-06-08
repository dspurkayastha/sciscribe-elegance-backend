import * as admin from "firebase-admin";
import {Request, Response, NextFunction} from "express";

/**
 * Helper to check if the request is authenticated and user has admin claim.
 * Throws or sends 403 if not authorized.
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Optional next function for middleware
 */
export async function requireAdminAuth(
  req: Request,
  res: Response,
  next?: NextFunction
) {
  const authHeader =
    req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      error: "Missing or invalid authorization header",
    });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) {
      return res.status(403).json({
        error: "Admin privileges required",
      });
    }
    // Optionally attach user info
    (req as admin.auth.DecodedIdToken & typeof req).user = decoded;
    if (next) return next();
    return true;
  } catch (err) {
    return res.status(401).json({error: "Invalid or expired token"});
  }
}
