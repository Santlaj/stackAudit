// Auth-specific type definitions.

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface SessionData {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  };
  user: SessionUser;
}
