import cors, {CorsOptions} from "cors";
import {Request, Response, NextFunction} from "express";

const allowedOrigins = [
  "https://www.sciscribesolutions.com",
  "https://sciscribe-elegance.web.app",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
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

export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  corsMiddleware(req, res, (error) => {
    if (error) {
      console.error("CORS error:", error);
      res.status(403).json({ error: "Not allowed by CORS" });
      return;
    }
    next();
  });
};

export const corsPreflight = (req: Request, res: Response) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return true;
  }
  return false;
};
