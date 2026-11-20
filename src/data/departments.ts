// Task 1 - the data access module for departments. Solution.

import { PoolClient } from 'pg';
import { pool } from '../db.js';

export interface Department {
  deptName: string;
  building: string;
  budget: number;
}

const SELECT = `
  SELECT dept_name AS "deptName", building, budget::float8 AS budget
  FROM department`;

/** Every department, ordered by name. */
export async function list(): Promise<Department[]> {
  const { rows } = await pool.query<Department>(`${SELECT} ORDER BY dept_name`);
  return rows;
}

/** One department, or undefined when there is no such name. */
export async function find(deptName: string): Promise<Department | undefined> {
  const { rows } = await pool.query<Department>(
    `${SELECT} WHERE dept_name = $1`, [deptName]);
  return rows[0];
}

/**
 * Takes an amount off a department's budget and returns what is left. It
 * runs on the client it is given, because it is one step of a transaction.
 */
export async function reduceBudgetOn(
  client: PoolClient, deptName: string, amount: number): Promise<number> {
  const { rows } = await client.query<{ budget: number }>(`
    UPDATE department SET budget = budget - $2 WHERE dept_name = $1
    RETURNING budget::float8 AS budget`,
    [deptName, amount]);
  return rows[0].budget;
}
