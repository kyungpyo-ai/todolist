import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../../../api/todoApi';

export function useCalendarTodos(month: string) {
  return useQuery({
    queryKey: ['todos', { month }],
    queryFn: () => getTodos({ month }),
    staleTime: 0,
    enabled: !!month,
  });
}
