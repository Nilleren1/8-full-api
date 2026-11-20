// The instructors controller. Solution, including Tasks 2 and 3.
//
// Each handler reads the input, calls one function, and answers. Every
// error goes to next(err), and the error handler decides the answer.

import { Router } from 'express';
import * as instructors from '../data/instructors.js';
import { validateSalary } from '../validation.js';
import { changeSalary } from '../services/salaries.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Claims } from '../auth/crypto.js';
import { toInstructorDto } from './dto.js';

export const instructorsRouter = Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function pageOf(query: Record<string, unknown>): { limit: number; offset: number } {
  const asked = Number(query.limit ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(asked) && asked > 0 ? Math.min(asked, MAX_LIMIT) : DEFAULT_LIMIT;
  const from = Number(query.offset ?? 0);
  const offset = Number.isFinite(from) && from >= 0 ? from : 0;
  return { limit, offset };
}

// GET /instructors?dept=&limit=&offset=  ->  { total, limit, offset, items }
instructorsRouter.get('/', async (req, res, next) => {
  try {
    const { limit, offset } = pageOf(req.query as Record<string, unknown>);
    const dept = typeof req.query.dept === 'string' ? req.query.dept : undefined;
    const items = await instructors.list(dept, limit, offset);
    const total = await instructors.count(dept);
    res.json({ total, limit, offset, items: items.map(toInstructorDto) });
  } catch (err) {
    next(err);
  }
});

instructorsRouter.get('/:id', async (req, res, next) => {
  try {
    const found = await instructors.find(req.params.id);
    if (found === undefined) {
      res.status(404).json({ error: `no instructor with id ${req.params.id}` });
      return;
    }
    res.json(toInstructorDto(found));
  } catch (err) {
    next(err);
  }
});

// Task 3: the salary, for the instructor themself and for the admin. The
// check compares the user with the instructor asked for, which only the
// handler knows, so it is here and not in middleware.
instructorsRouter.get('/:id/salary', requireAuth, async (req, res, next) => {
  try {
    const user = res.locals.user as Claims;
    if (user.role !== 'admin' && user.id !== req.params.id) {
      res.status(403).json({ error: 'you may only see your own salary' });
      return;
    }
    const found = await instructors.find(req.params.id);
    if (found === undefined) {
      res.status(404).json({ error: `no instructor with id ${req.params.id}` });
      return;
    }
    res.json({ id: found.id, salary: found.salary });
  } catch (err) {
    next(err);
  }
});

// Tasks 2 and 3: a known user, and the admin.
instructorsRouter.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const salary = validateSalary(req.body);
    if (salary === undefined) {
      res.status(400).json({ error: 'salary must be a number above 0' });
      return;
    }
    const result = await changeSalary(req.params.id, salary);
    if (!result.ok && result.reason === 'not-found') {
      res.status(404).json({ error: `no instructor with id ${req.params.id}` });
      return;
    }
    if (!result.ok) {
      res.status(409).json({ error: 'a raise may be at most 10% of the current salary' });
      return;
    }
    res.json(toInstructorDto(result.instructor));
  } catch (err) {
    next(err);
  }
});

instructorsRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const gone = await instructors.remove(req.params.id);
    if (!gone) {
      res.status(404).json({ error: `no instructor with id ${req.params.id}` });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
