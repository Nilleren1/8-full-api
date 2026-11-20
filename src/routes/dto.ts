// Task 1 - what the API sends. Solution.

import { Instructor } from '../data/instructors.js';
import { Department } from '../data/departments.js';

export interface InstructorDto {
  id: string;
  name: string;
  department: string;
}

export interface DepartmentDto {
  department: string;
  building: string;
}

export function toInstructorDto(instructor: Instructor): InstructorDto {
  return { id: instructor.id, name: instructor.name, department: instructor.deptName };
}

export function toDepartmentDto(department: Department): DepartmentDto {
  return { department: department.deptName, building: department.building };
}
