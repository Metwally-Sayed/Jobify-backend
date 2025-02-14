import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import { User, users } from "../model/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utiles/token.utils";

// User Sign Up
export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = users.find((user: User) => user.email === email);
  if (existingUser) res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
  };
  users.push(newUser);

  res.json({ message: "User registered successfully" });
};

// User Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);
  if (!user) res.status(400).json({ error: "Invalid credentials" });

  const isValidPassword = await bcrypt.compare(password, user!.password);
  if (!isValidPassword) res.status(400).json({ error: "Invalid credentials" });

  const accessToken = generateAccessToken(user!.id);
  const refreshToken = generateRefreshToken(user!.id);

  user!.refreshToken = refreshToken; // Store refresh token

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ accessToken, user: { name: user!.name, email: user!.email } });
};

export const refreshToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) res.status(401).json({ error: "Unauthorized" });

  const user = users.find((user) => user.refreshToken === refreshToken);
  if (!user) res.status(403).json({ error: "Invalid refresh token" });

  try {
    const payload = verifyRefreshToken(refreshToken) as { userId: string };
    const newAccessToken = generateAccessToken(payload.userId);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
