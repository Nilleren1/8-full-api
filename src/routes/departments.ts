// Task 1 - the departments controller, including hiring. Solution, with the
// guards from Tasks 2 and 3 on hiring.

import { Router } from 'express';
import * as departments from '../data/departments.js';
import { hireInstructor } from '../services/hiring.js';
import { validateHire } from '../validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { toDepartmentDto, toInstructorDto } from './dto.js';

export const departmentsRouter = Router();

departmentsRouter.get('/', async (_req, res, next) => {
  try {
    const all = await departments.list();
    res.json(all.map(toDepartmentDto));
  } catch (err) {
    next(err);
  }
});

departmentsRouter.get('/:name', async (req, res, next) => {
  try {
    const found = await departments.find(req.params.name);
    if (found === undefined) {
      res.status(404).json({ error: `no department named ${req.params.name}` });
      return;
    }
    res.json(toDepartmentDto(found));
  } catch (err) {
    next(err);
  }
});

// The controller checks the shape of the request. The service decides
// whether it may happen, and throws NotFound or Conflict, which the error
// handler turns into 404 and 409. Nothing is caught here.
departmentsRouter.post('/:name/instructors', requireAuth, requireRole('admin'),
  async (req, res, next) => {
    try {
      const input = validateHire(req.body);
      if (input === undefined) {
        res.status(400).json({ error: 'id, name and salary are required' });
        return;
      }
      const result = await hireInstructor(req.params.name, input);
      res.status(201)
        .location(`/instructors/${result.instructor.id}`)
        .json({ instructor: toInstructorDto(result.instructor), budgetLeft: result.budgetLeft });
    } catch (err) {
      next(err);
    }
  });
