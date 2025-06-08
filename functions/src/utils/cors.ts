import cors from "cors";
import {Request, Response, NextFunction} from "express";

// Define allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://sciscribe-elegance.web.app",
  "https://sciscribe-elegance.firebaseapp.com",
];

// CORS options
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 3600,
};

const corsMiddleware = cors(corsOptions);

const emptyCorsHandler = () => {
  // Empty function for CORS
};

export const handleCors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await corsMiddleware(req, res, emptyCorsHandler);
  } catch (error) {
    console.error("CORS error:", error);
    res.status(403).json({error: "Not allowed by CORS"});
    return;
  }
  next();
};

export const corsPreflight = (req: Request, res: Response) => {
  if (req.method === "OPTIONS") {
    res.status(204).send();
    return true;
  }
  return false;
};
