// Task 1 - hiring an instructor into a department. Solution.

import { pool } from '../db.js';
import { NotFound, Conflict } from '../middleware/errors.js';
import * as instructors from '../data/instructors.js';
import * as departments from '../data/departments.js';

export interface HireInput {
  id: string;
  name: string;
  salary: number;
}

export interface HireResult {
  instructor: instructors.Instructor;
  budgetLeft: number;
}

export async function hireInstructor(deptName: string, input: HireInput): Promise<HireResult> {
  const department = await departments.find(deptName);
  if (department === undefined) {
    throw new NotFound(`no department named ${deptName}`);
  }
  if (await instructors.find(input.id) !== undefined) {
    throw new Conflict(`instructor ${input.id} already exists`);
  }
  if (input.salary >= department.budget) {
    throw new Conflict(`the budget of ${deptName} does not cover the salary`);
  }

  // Both steps, or neither. A transaction runs on one connection, so take a
  // client from the pool and run both steps on it.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const instructor = await instructors.insertOn(client, {
      id: input.id, name: input.name, deptName, salary: input.salary,
    });
    const budgetLeft = await departments.reduceBudgetOn(client, deptName, input.salary);
    await client.query('COMMIT');
    return { instructor, budgetLeft };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();     // or the connection never goes back to the pool
  }
}

// Why >= and not >: the schema requires a budget above 0, so a salary equal
// to the whole budget would leave 0, the database would refuse the update,
// and the client would get a 500 instead of a 409.
