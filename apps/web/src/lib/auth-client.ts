import { createAuthClient } from "better-auth/react";

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("santlaj.in") || host.includes("vercel.app")) {
      return "https://api.stackaudit.santlaj.in";
    }
  }
  if (process.env.NODE_ENV === "production") {
    return "https://api.stackaudit.santlaj.in";
  }
  return "http://localhost:4000";
};

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signUp, signIn, signOut, linkSocial, listAccounts } = authClient;
