export interface AuthUser {
  userId: number;
  username: string;
  is_admin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
