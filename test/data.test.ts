// Task 4 - the second kind: data access against the real database. Solution.
//
// Every test runs inside a transaction that is rolled back afterwards, so
// the second run gives the same result as the first.

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { PoolClient } from 'pg';
import { pool } from '../src/db.js';
import * as departments from '../src/data/departments.js';

let client: PoolClient;

beforeAll(async () => {
  client = await pool.connect();
});
beforeEach(async () => {
  await client.query('BEGIN');
});
afterEach(async () => {
  await client.query('ROLLBACK');
});
afterAll(async () => {
  client.release();
  await pool.end();
});

describe('reduceBudgetOn', () => {
  it('takes the amount off the budget and returns what is left', async () => {
    expect(await departments.reduceBudgetOn(client, 'Music', 30000)).toBe(50000);
  });

  // The same call again gives the same answer: the first test was rolled back.
  it('starts from the same budget every time', async () => {
    expect(await departments.reduceBudgetOn(client, 'Music', 30000)).toBe(50000);
  });
});

describe('list', () => {
  it('returns every department, ordered by name', async () => {
    const all = await departments.list();
    expect(all.map(d => d.deptName)).toEqual(
      ['Biology', 'Comp. Sci.', 'Elec. Eng.', 'Finance', 'History', 'Music', 'Physics']);
  });
});
