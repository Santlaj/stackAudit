import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signUp, signIn, signOut, linkSocial, listAccounts } = authClient;
