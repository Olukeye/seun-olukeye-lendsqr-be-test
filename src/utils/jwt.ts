import { JWTPayload } from "../models/models/types";
import jwt, { SignOptions, Secret } from 'jsonwebtoken';


const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any};
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};