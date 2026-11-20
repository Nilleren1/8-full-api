// The application, without listening. Solution, including Task 2.
//
// It is exported and does not listen: index.ts listens, and the check
// script and the tests use the app on their own.

import express from 'express';
import { instructorsRouter } from './routes/instructors.js';
import { departmentsRouter } from './routes/departments.js';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errors.js';

export const app = express();

app.use(express.json());

app.use('/auth', authRouter);     // Task 2: open, or nobody can log in
app.use('/instructors', instructorsRouter);
app.use('/departments', departmentsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'no such endpoint' });
});

app.use(errorHandler);   // last, after every route
