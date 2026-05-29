import { useTranslation } from 'react-i18next';
import type { Todo } from '../../../types/todo';
import type { Category } from '../../../types/category';
import TodoCard from './TodoCard';
import './todo.css';

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export default function TodoList({ todos, categories, onEdit, onDelete }: TodoListProps) {
  const { t } = useTranslation();

  if (todos.length === 0) {
    return <div className="todo-empty">{t('todo.emptyMessage')}</div>;
  }

  return (
    <table className="todo-table">
      <thead>
        <tr className="todo-table-header">
          <th style={{ width: 80 }}>{t('todo.categoryLabel')}</th>
          <th>{t('todo.titleLabel')}</th>
          <th style={{ width: 80 }}>{t('todo.statusLabel')}</th>
          <th style={{ width: 120 }}>날짜</th>
          <th style={{ width: 80 }}>관리</th>
        </tr>
      </thead>
      <tbody>
        {todos.map((todo) => {
          const category = categories.find((cat) => cat.id === todo.categoryId);
          const categoryName = category ? category.name : '';
          return (
            <TodoCard
              key={todo.id}
              todo={todo}
              categoryName={categoryName}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </tbody>
    </table>
  );
}
