// Test file to verify TypeScript imports and types
import { handleCors, corsPreflight } from "./utils/cors";
import { Request, Response } from "express";

// Test type imports
const req = {} as Request;
const res = {
  status: () => res,
  json: (data: any) => console.log('JSON Response:', data),
  sendStatus: (code: number) => console.log('Status:', code),
  set: () => res,
  end: () => {}
} as unknown as Response;

// Test CORS utilities
console.log('CORS utilities loaded successfully');
console.log('handleCors type:', typeof handleCors);
console.log('corsPreflight type:', typeof corsPreflight);

// Test if CORS functions can be called
console.log('Testing corsPreflight...');
const isPreflight = corsPreflight(req, res);
console.log('Is preflight?', isPreflight);

console.log('All imports working correctly!');
