import { Router } from "express";
import { auth } from "../../infrastructure/auth/index.js";
import { getCurrentSession } from "./auth.controller.js";
import { env } from "../../config/env.js";

const authRouter = Router();

// Custom session endpoint for our API consumers.
authRouter.get("/session", getCurrentSession);

// Direct GET endpoint for initiating GitHub OAuth login directly from browser links
authRouter.get("/login/github", async (req, res, next) => {
  try {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, val]) => {
      if (key.toLowerCase() === "content-length") return;
      if (Array.isArray(val)) {
        val.forEach(v => headers.append(key, v));
      } else if (val) {
        headers.set(key, val);
      }
    });

    if (req.ip && !headers.has("x-forwarded-for")) {
      headers.set("x-forwarded-for", req.ip);
    }

    const rawCallback = typeof req.query.callbackURL === "string" ? req.query.callbackURL : undefined;
    let targetCallbackUrl = env.FRONTEND_URL;
    if (rawCallback) {
      try {
        const parsed = new URL(rawCallback);
        const frontendHostname = new URL(env.FRONTEND_URL).hostname;
        const isAllowed = 
          parsed.hostname === frontendHostname ||
          parsed.hostname === "stackaudit.santlaj.in" ||
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1" ||
          parsed.hostname.endsWith(".vercel.app");
        if (isAllowed) {
          targetCallbackUrl = rawCallback;
        }
      } catch {
        targetCallbackUrl = env.FRONTEND_URL;
      }
    }

    const result = await auth.api.signInSocial({
      body: {
        provider: "github",
        callbackURL: targetCallbackUrl,
      },
      headers,
      returnHeaders: true,
    });

    if (result.headers) {
      const setCookies = typeof (result.headers as any).getSetCookie === "function"
        ? (result.headers as any).getSetCookie()
        : result.headers.get("set-cookie")
          ? [result.headers.get("set-cookie")!]
          : [];
      for (const cookie of setCookies) {
        res.append("Set-Cookie", cookie);
      }
      result.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") {
          res.setHeader(key, value);
        }
      });
    }

    const redirectUrl = 
      (result as any)?.response?.url || 
      (result as any)?.url || 
      (result as any)?.headers?.get?.("location");

    if (redirectUrl) {
      res.redirect(redirectUrl);
    } else {
      res.redirect(targetCallbackUrl);
    }
  } catch (error) {
    next(error);
  }
});

// Delegate all other auth endpoints to Better Auth using native auth.handler
authRouter.use(async (req, res, next) => {
  try {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = (typeof forwardedProto === "string" ? forwardedProto.split(",")[0].trim() : req.protocol) || "https";
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

    if (req.ip && !headers.has("x-forwarded-for")) {
      headers.set("x-forwarded-for", req.ip);
    }

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
      
      const setCookies = typeof (response.headers as any).getSetCookie === "function"
        ? (response.headers as any).getSetCookie()
        : response.headers.get("set-cookie")
          ? [response.headers.get("set-cookie")!]
          : [];
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
