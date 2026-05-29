import apiClient from './client';
import type { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

export async function getTodos(filter?: TodoFilter): Promise<Todo[]> {
  const params: Record<string, string> = {};

  if (filter?.categoryId) {
    params.categoryId = filter.categoryId;
  }
  if (filter?.status) {
    params.status = filter.status;
  }
  if (filter?.overdue === true) {
    params.overdue = 'true';
  }
  if (filter?.month) {
    params.month = filter.month;
  }

  const res = await apiClient.get<{ success: true; data: { todos: Todo[] } }>('/api/todos', { params });
  return res.data.data.todos;
}

export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const res = await apiClient.post<{ success: true; data: { todo: Todo } }>('/api/todos', data);
  return res.data.data.todo;
}

export async function updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
  const res = await apiClient.patch<{ success: true; data: { todo: Todo } }>(`/api/todos/${id}`, data);
  return res.data.data.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/api/todos/${id}`);
}
