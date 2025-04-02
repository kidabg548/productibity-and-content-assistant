import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const router = Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Register Route
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

// Login Route
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Generate Auth URL
router.get("/google-auth", (req: Request, res: Response): void => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
  res.redirect(authUrl);
});

// Handle OAuth Callback
router.get(
  "/google/callback",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const code = req.query.code as string;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email;

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          firstName: userInfo.data.given_name || "",
          lastName: userInfo.data.family_name || "",
          password: Math.random().toString(36).slice(-8), // Generate random password
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date,
        });
      } else {
        // Update tokens
        user.googleAccessToken = tokens.access_token ?? undefined;
        user.googleRefreshToken = tokens.refresh_token ?? undefined;
        user.googleTokenExpiry = tokens.expiry_date ?? undefined;
        await user.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      // Send success message to popup window
      res.send(`
        <script>
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_SUCCESS', token: '${token}' },
            'http://localhost:5173'
          );
        </script>
      `);
      
    } catch (error) {
      console.error("Error in Google callback:", error);
      // Send error message to popup window
      res.send(`
        <script>
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error: 'Authentication failed' },
            'http://localhost:5173'
          );
        </script>
      `);
    }
  }
);

// Refresh Google token
router.post(
  "/refresh-token",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const user = await User.findById(userId);

      if (!user || !user.googleRefreshToken) {
        res.status(401).json({ error: "No refresh token available" });
        return;
      }

      oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      // Update user's tokens
      user.googleAccessToken = credentials.access_token ?? undefined;
      user.googleTokenExpiry = credentials.expiry_date ?? undefined;
      await user.save();

      res.json({
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date,
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  }
);

export default router;
