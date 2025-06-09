export type Position = {
  id: number;
  name: string;
};

export type Employee = {
  id: number;
  name: string;
  email: string;
  position: Position | number;
  department: Department | number;
};

export type Appointment = {
  id: number;
  start: Date;
  end: Date;
  title: string;
  description: string;
  employee: Employee | number | undefined;
  participation: Employee[] | undefined;
};

export type Department = {
  id: number;
  name: string;
  description: string;
  manager: number;
};
