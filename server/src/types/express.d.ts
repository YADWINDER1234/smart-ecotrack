import type { Role } from "./role";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        name?: string;
      };
    }
  }
}

export {};

