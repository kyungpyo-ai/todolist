import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../../../api/todoApi';
import type { TodoFilter } from '../../../types/todo';

export function useTodoList(filter?: TodoFilter) {
  return useQuery({
    queryKey: ['todos', filter],
    queryFn: () => getTodos(filter),
    staleTime: 0,
  });
}
