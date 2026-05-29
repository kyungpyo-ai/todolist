import { useState } from 'react';
import { useTodoList } from '../features/todo/hooks/useTodoList';
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from '../features/todo/hooks/useTodoForm';
import { useCategoryList } from '../features/category/hooks/useCategoryList';
import TodoFilterBar from '../features/todo/components/TodoFilter';
import TodoList from '../features/todo/components/TodoList';
import TodoForm from '../features/todo/components/TodoForm';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

export default function TodoListPage() {
  const [filter, setFilter] = useState<TodoFilter>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  const { data: todos, isLoading: todosLoading, isError: todosError } = useTodoList(filter);
  const { data: categories, isLoading: categoriesLoading } = useCategoryList();

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const isLoading = todosLoading || categoriesLoading;

  function handleAddClick() {
    setSelectedTodo(null);
    setIsFormOpen(true);
  }

  function handleEdit(todo: Todo) {
    setSelectedTodo(todo);
    setIsFormOpen(true);
  }

  function handleDelete(todo: Todo) {
    setTodoToDelete(todo);
  }

  function handleFormSubmit(data: CreateTodoRequest | UpdateTodoRequest) {
    if (selectedTodo) {
      updateTodo.mutate(
        { id: selectedTodo.id, data: data as UpdateTodoRequest },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createTodo.mutate(data as CreateTodoRequest, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  }

  function handleFormCancel() {
    setIsFormOpen(false);
    setSelectedTodo(null);
  }

  function handleDeleteConfirm() {
    if (!todoToDelete) return;
    deleteTodo.mutate(todoToDelete.id, {
      onSuccess: () => setTodoToDelete(null),
    });
  }

  function handleDeleteCancel() {
    setTodoToDelete(null);
  }

  if (isLoading) {
    return <div className="todo-loading">로딩 중...</div>;
  }

  if (todosError) {
    return <div className="todo-error">데이터를 불러오는데 실패했습니다.</div>;
  }

  const isFormLoading = createTodo.isPending || updateTodo.isPending;

  return (
    <div>
      <TodoFilterBar
        filter={filter}
        categories={categories ?? []}
        onChange={setFilter}
        onAddClick={handleAddClick}
      />
      <TodoList
        todos={todos ?? []}
        categories={categories ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isFormOpen && (
        <TodoForm
          todo={selectedTodo ?? undefined}
          categories={categories ?? []}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isFormLoading}
        />
      )}

      <ConfirmDialog
        isOpen={!!todoToDelete}
        title="할일 삭제"
        message={`"${todoToDelete?.title}"을(를) 삭제하시겠습니까? 삭제한 할일은 복구할 수 없습니다.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteTodo.isPending}
        confirmLabel="삭제"
      />
    </div>
  );
}
