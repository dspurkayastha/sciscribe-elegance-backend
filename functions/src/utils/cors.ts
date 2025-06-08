import cors from "cors";
import {Request, Response, NextFunction} from "express";

// Define allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://sciscribe-elegance.web.app",
  "https://sciscribe-elegance.firebaseapp.com",
  "https://www.sciscribesolutions.com",
  "https://sciscribesolutions.com",
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
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    await corsMiddleware(req, res, emptyCorsHandler);
    next();
  } catch (error) {
    console.error("CORS error:", error);
    res.status(403).json({error: "Not allowed by CORS"});
  }
};

export const corsPreflight = (req: Request, res: Response) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).send("");
    return true;
  }
  return false;
};
