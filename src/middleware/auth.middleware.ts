import { NextFunction, Request, Response } from "express";
import { User, users } from "../model/user.model";
import { verifyAccessToken } from "../utiles/token.utils";

/**
 * 🛑 Middleware: Authentication
 * - Verifies the access token in the Authorization header
 * - Attaches the user object to the request object
 * - If the token is invalid, returns an error response
 */

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader!.split(" ")[1];
  try {
    const payload = verifyAccessToken(token) as { userId: string };

    // Fetch user from database
    const user = users.find((user: User) => user.id === payload.userId);

    if (!user) {
       res.status(404).json({ error: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
};
