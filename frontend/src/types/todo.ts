export const TODO_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TodoStatus = typeof TODO_STATUS[keyof typeof TODO_STATUS];

export const ALLOWED_STATUS_TRANSITIONS: Record<TodoStatus, TodoStatus[]> = {
  NOT_STARTED: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE', 'NOT_STARTED'],
  DONE: ['IN_PROGRESS'],
};

export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  categoryId?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: TodoStatus;
}

export interface TodoFilter {
  categoryId?: string;
  status?: TodoStatus;
  overdue?: boolean;
  month?: string; // YYYY-MM
}
