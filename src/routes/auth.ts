// Task 2 - logging in. Solution.

import { Router } from 'express';
import { findUserByName } from '../data/users.js';
import { signToken, verifyPassword } from '../auth/crypto.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }
    const user = await findUserByName(username);
    const ok = user !== undefined && await verifyPassword(password, user.hash);
    // The same answer whether the name or the password was wrong, so nobody
    // can find out which usernames exist.
    if (!ok) {
      res.status(401).json({ error: 'wrong username or password' });
      return;
    }
    res.json({ token: signToken({ id: user.id, role: user.role }) });
  } catch (err) {
    next(err);
  }
});
