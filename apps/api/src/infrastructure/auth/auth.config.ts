import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma/index.js";
import { env } from "../../config/env.js";

// Better Auth instance — handles all OAuth flows, session management,
// and token creation. Configured with Prisma adapter for persistence.

// Normalize authBase so that whether BETTER_AUTH_URL is 'https://api.stackaudit.santlaj.in'
// or 'https://api.stackaudit.santlaj.in/api/auth', it resolves cleanly without duplicates.
const authBase = (env.BETTER_AUTH_URL || "https://api.stackaudit.santlaj.in")
  .replace(/\/$/, "")
  .replace(/\/api\/auth$/, "");

const githubRedirectUri = `${authBase}/api/auth/callback/github`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: authBase,
  basePath: "/api/auth",

  onAPIError: {
    errorURL: `${env.FRONTEND_URL.replace(/\/$/, "")}/login`,
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      redirectURI: githubRedirectUri,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    env.FRONTEND_URL,
    env.FRONTEND_URL.replace(/\/$/, ""),
    "https://*.vercel.app",
    "https://stackaudit.santlaj.in",
    "http://stackaudit.santlaj.in",
    "https://api.stackaudit.santlaj.in",
    "http://api.stackaudit.santlaj.in",
  ],

  session: {
    // Session token lives for 7 days.
    expiresIn: 60 * 60 * 24 * 7,
    // Refresh session if it's used within 1 day of expiry.
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  advanced: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: env.NODE_ENV === "production",
      domain: ".santlaj.in",
    },
    defaultCookieAttributes: {
      sameSite: env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip", "x-real-ip"],
    },
  },
});

// Export the auth type for use in other modules.
export type Auth = typeof auth;
