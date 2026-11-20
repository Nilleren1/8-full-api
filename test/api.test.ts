// Task 4 - the third kind: the API over HTTP. Solution.

import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/db.js';

afterAll(async () => {
  await pool.end();
});

async function login(username: string, password: string): Promise<string> {
  const res = await request(app).post('/auth/login').send({ username, password });
  return res.body.token;
}

describe('the instructors API', () => {
  it('reads one instructor, as a DTO', async () => {
    const res = await request(app).get('/instructors/22222');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '22222', name: 'Einstein', department: 'Physics' });
  });

  it('pages the collection, with the total of all of them', async () => {
    const res = await request(app).get('/instructors?limit=5&offset=5');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(12);
    expect(res.body.items).toHaveLength(5);
  });

  // Setting Einstein's salary to what it already is: a real write, which
  // leaves the database as it was.
  it('lets the admin change a salary', async () => {
    const token = await login('admin', 'admin-pw');
    const res = await request(app).put('/instructors/22222')
      .set('Authorization', `Bearer ${token}`)
      .send({ salary: 95000 });
    expect(res.status).toBe(200);
  });

  it('refuses a change without a token with 401', async () => {
    const res = await request(app).put('/instructors/22222').send({ salary: 95000 });
    expect(res.status).toBe(401);
  });

  it('refuses a change by an instructor with 403', async () => {
    const token = await login('einstein', 'einstein-pw');
    const res = await request(app).put('/instructors/22222')
      .set('Authorization', `Bearer ${token}`)
      .send({ salary: 95000 });
    expect(res.status).toBe(403);
  });
});
