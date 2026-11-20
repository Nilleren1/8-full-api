// Task 4 - the first kind: logic that touches nothing. Solution.

import { describe, it, expect } from 'vitest';
import { toInstructorDto, toDepartmentDto } from '../src/routes/dto.js';

describe('toInstructorDto', () => {
  const einstein = { id: '22222', name: 'Einstein', deptName: 'Physics', salary: 95000 };

  it('maps an instructor to a DTO', () => {
    expect(toInstructorDto(einstein))
      .toEqual({ id: '22222', name: 'Einstein', department: 'Physics' });
  });

  it('never sends the salary', () => {
    expect(toInstructorDto(einstein)).not.toHaveProperty('salary');
  });
});

describe('toDepartmentDto', () => {
  it('maps a department to a DTO, without the budget', () => {
    expect(toDepartmentDto({ deptName: 'Music', building: 'Packard', budget: 80000 }))
      .toEqual({ department: 'Music', building: 'Packard' });
  });
});
