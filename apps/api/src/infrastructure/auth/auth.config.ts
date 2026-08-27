import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma/index.js";
import { env } from "../../config/env.js";

// Better Auth instance — handles all OAuth flows, session management,
// and token creation. Configured with Prisma adapter for persistence.

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],

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
});

// Export the auth type for use in other modules.
export type Auth = typeof auth;
