import { Router } from "express";
import { auth } from "../../infrastructure/auth/index.js";
import { getCurrentSession } from "./auth.controller.js";

const authRouter = Router();

// Custom session endpoint for our API consumers.
authRouter.get("/session", getCurrentSession);

// Direct GET endpoint for initiating GitHub OAuth login directly from browser links
authRouter.get("/login/github", async (req, res, next) => {
  try {
    const result = await auth.api.signInSocial({
      body: {
        provider: "github",
        callbackURL: "http://localhost:3000",
      },
      headers: req.headers as unknown as Headers,
      returnHeaders: true,
    });

    if (result.headers) {
      result.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
    }

    const redirectUrl = 
      (result as any)?.response?.url || 
      (result as any)?.url || 
      (result as any)?.headers?.get?.("location");

    if (redirectUrl) {
      res.redirect(redirectUrl);
    } else {
      res.redirect("http://localhost:3000");
    }
  } catch (error) {
    next(error);
  }
});

// Delegate all other auth endpoints to Better Auth using native auth.handler
authRouter.use(async (req, res, next) => {
  try {
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:4000";
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, val]) => {
      if (key.toLowerCase() === "content-length") return; // Let it be recalculated
      if (Array.isArray(val)) {
        val.forEach(v => headers.append(key, v));
      } else if (val) {
        headers.set(key, val);
      }
    });

    let body: string | undefined = undefined;
    if (!["GET", "HEAD"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body);
    }

    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body,
    });

    const response = await auth.handler(webRequest);

    if (response) {
      res.status(response.status);
      
      const setCookies = response.headers.getSetCookie();
      for (const cookie of setCookies) {
        res.append("Set-Cookie", cookie);
      }

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") {
          res.setHeader(key, value);
        }
      });
      const text = await response.text();
      res.send(text);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

export default authRouter;
