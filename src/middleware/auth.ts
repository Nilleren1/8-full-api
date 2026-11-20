// Tasks 2 and 3 - who is asking, and may they. Solution.
//
// requireAuth replaces requireToken from the structured API exercises: the
// token is now one the API gave out at login, and it says who the user is.

import { Request, Response, NextFunction } from 'express';
import { Claims, verifyToken } from '../auth/crypto.js';

// Task 2: authentication.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'no token' });
    return;
  }
  const claims = verifyToken(token);
  if (!claims) {
    res.status(401).json({ error: 'invalid token' });
    return;
  }
  res.locals.user = claims;
  next();
}

// Task 3: authorization by role. It runs after requireAuth, so the user is
// known, and the answer is 403, not 401.
export function requireRole(role: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user as Claims;
    if (user.role !== role) {
      res.status(403).json({ error: 'not allowed' });
      return;
    }
    next();
  };
}
