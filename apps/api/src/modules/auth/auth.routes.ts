import { Router, Request as ExpressReq, Response as ExpressRes } from "express";
import { auth } from "../../infrastructure/auth/index.js";
import { getCurrentSession } from "./auth.controller.js";
import { env } from "../../config/env.js";

const authRouter = Router();

// ---------------------------------------------------------------------------
// Shared helpers for Express ↔ Web API Request/Response bridging
// ---------------------------------------------------------------------------

/** Build Web API Headers from an Express request, forwarding client IP. */
function buildWebHeaders(req: ExpressReq): Headers {
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
  return headers;
}

/** Resolve protocol and host from an Express request behind a reverse proxy. */
function resolveOrigin(req: ExpressReq): { protocol: string; host: string } {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    (typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.protocol) || "https";
  const host = req.get("host") || "localhost:4000";
  return { protocol, host };
}

/** Pipe a Web API Response into an Express response (headers, cookies, body). */
async function pipeWebResponse(webRes: globalThis.Response, res: ExpressRes): Promise<void> {
  res.status(webRes.status);

  // Forward Set-Cookie headers individually (getSetCookie avoids concatenation)
  const setCookies =
    typeof (webRes.headers as any).getSetCookie === "function"
      ? (webRes.headers as any).getSetCookie()
      : webRes.headers.get("set-cookie")
        ? [webRes.headers.get("set-cookie")!]
        : [];
  for (const cookie of setCookies) {
    res.append("Set-Cookie", cookie);
  }

  // Forward all other headers
  webRes.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      res.setHeader(key, value);
    }
  });

  const text = await webRes.text();
  res.send(text);
}

/**
 * Validate a caller-supplied callbackURL against an allow-list.
 * Returns the validated URL or falls back to FRONTEND_URL.
 */
function validateCallbackUrl(raw: string | undefined): string {
  if (!raw) return env.FRONTEND_URL;
  try {
    const parsed = new URL(raw);
    const frontendHostname = new URL(env.FRONTEND_URL).hostname;
    const isAllowed =
      parsed.hostname === frontendHostname ||
      parsed.hostname === "stackaudit.santlaj.in" ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".vercel.app");
    return isAllowed ? raw : env.FRONTEND_URL;
  } catch {
    return env.FRONTEND_URL;
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Custom session endpoint for our API consumers.
authRouter.get("/session", getCurrentSession);

// GET endpoint for initiating GitHub OAuth login via direct browser navigation.
// Constructs a synthetic POST to Better Auth's native /sign-in/social endpoint
// so that the entire signed-cookie lifecycle is handled by auth.handler().
authRouter.get("/login/github", async (req, res, next) => {
  try {
    const targetCallbackUrl = validateCallbackUrl(
      typeof req.query.callbackURL === "string" ? req.query.callbackURL : undefined,
    );

    const { protocol, host } = resolveOrigin(req);
    const syntheticUrl = `${protocol}://${host}/api/auth/sign-in/social`;

    const headers = buildWebHeaders(req);
    headers.set("content-type", "application/json");

    const body = JSON.stringify({
      provider: "github",
      callbackURL: targetCallbackUrl,
    });

    const webRequest = new Request(syntheticUrl, {
      method: "POST",
      headers,
      body,
    });

    // Let Better Auth handle the full OAuth initiation natively —
    // state generation, signed cookie creation, and redirect are all
    // within the same request context, preserving the HMAC chain.
    const response = await auth.handler(webRequest);

    if (!response) {
      res.redirect(targetCallbackUrl);
      return;
    }

    await pipeWebResponse(response, res);
  } catch (error) {
    next(error);
  }
});

// Delegate all other auth endpoints to Better Auth using native auth.handler
authRouter.use(async (req, res, next) => {
  try {
    const { protocol, host } = resolveOrigin(req);
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    const headers = buildWebHeaders(req);

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
      await pipeWebResponse(response, res);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

export default authRouter;
