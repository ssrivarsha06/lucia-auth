import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import axios from "axios";
import { lucia, validateRequest } from "./auth.js";
import { generateId } from "lucia";
import { send2FACode } from "./email.js";
import { generate2FACode } from "./auth-utils.js";
import db from "./db.js";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// GitHub login route
app.get("/login/github", (req, res) => {
  const redirectUri = "http://localhost:3000/callback";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user&prompt=login`;
  res.redirect(githubAuthUrl);
});

// GitHub callback route with 2FA
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userRes.data;

    // Check if user exists
    let user = await lucia.adapter.getUser(githubUser.id.toString());

    if (!user) {
      await lucia.adapter.setUser({
        id: githubUser.id.toString(),
        username: githubUser.login,
      });
      user = await lucia.adapter.getUser(githubUser.id.toString());
    }

    // Create session
    const sessionId = generateId(40);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await lucia.adapter.setSession({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    // Set session cookie
    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Generate and store 2FA code
    const { code: twoFACode, expiresAt: codeExpiresAt } = generate2FACode();
    await db.prepare(`
      INSERT OR REPLACE INTO twofa_codes (user_id, code, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, twoFACode, codeExpiresAt);

    // Send to user's email
    const email = githubUser.email || 'user@example.com';
    await send2FACode(email, twoFACode);

    // Show verification form
    res.send(`
        <!DOCTYPE html>
  	<html>
  	<head>
    	<title>2FA Verification</title>
    	<link rel="stylesheet" href="/styles.css">
  	</head>
  	<body>
    	<h2>Two-Factor Authentication</h2>
    	<div class="twofa-form">
      	<form action="/verify-2fa" method="POST">
        	<label for="code">Enter the 6-digit code from your email:</label>
        	<input type="text" id="code" name="code" placeholder="Enter the code" required>
        	<button type="submit">Verify</button>
      	</form>
    	</div>
  	</body>
  	</html>
    `);

  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Login failed");
  }
});

// 2FA Verification Route
app.post("/verify-2fa", async (req, res) => {
  try {
    if (!req.body || !req.body.code) {
      return res.status(400).send("Missing verification code");
    }

    const { user } = await validateRequest(req);
    if (!user) {
      res.clearCookie("session");
      return res.redirect("/");
    }

    const validCode = await db.prepare(`
      SELECT * FROM twofa_codes 
      WHERE user_id = ? AND code = ? AND expires_at > ?
    `).get(user.id, req.body.code, Date.now());

    if (!validCode) {
      return res.status(400).send("Invalid or expired code");
    }

    await db.prepare(`DELETE FROM twofa_codes WHERE user_id = ?`).run(user.id);
    res.redirect("/dashboard");

  } catch (error) {
    console.error("2FA Verification Error:", error);
    res.status(500).send("Verification failed. Please try again.");
  }
});

// Dashboard route
app.get("/dashboard", async (req, res) => {
  const { user } = await validateRequest(req);
  if (!user) {
    res.clearCookie("session");
    return res.redirect("/");
  }

  res.send(`
	<!DOCTYPE html>
  	<html>
  	<head>
    	<title>Dashboard</title>
    	<link rel="stylesheet" href="/styles.css">
  	</head>
  	<body>
    	<h2>Welcome, ${user.username}!</h2>
    	<p>You are successfully authenticated via Lucia.</p>
    	<form action="/logout" method="POST">
      	<button type="submit">Logout</button>
    	</form>
  	</body>
  	</html>
  `);
});

// Logout route
app.post("/logout", async (req, res) => {
  const sessionId = req.cookies?.session;
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
    res.clearCookie("session");
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
