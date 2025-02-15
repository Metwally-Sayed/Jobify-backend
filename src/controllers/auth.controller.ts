import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import { decryptToken, encryptToken } from "../utiles/cryption.utils";
import { prisma } from "../utiles/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utiles/token.utils";

// User Sign Up
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: "", // Add phone property
        refreshToken: null, // Initialize refresh token field
      },
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: { name, email } });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json({ error: "Invalid credentials" });

    // Generate Tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Encrypt the refresh token before storing
    const encryptedRefreshToken = encryptToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: encryptedRefreshToken },
    });

    // Store refresh token in HttpOnly cookie
    res.cookie("jid", encryptedRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { jid } = req.cookies;
    if (!jid) return res.status(401).json({ error: "Unauthorized" });

    // Find user by refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken: jid },
    });

    if (!user || !user.refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Decrypt stored refresh token
    const decryptedToken = decryptToken(user.refreshToken);



    // Verify the token
    const decoded = verifyRefreshToken(decryptedToken) as { userId: string };
    if (decoded.userId !== user.id) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Generate new Access Token
    const newAccessToken = generateAccessToken(user.id);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Remove refresh token from database
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    // Clear cookie
    res.clearCookie("jid", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
