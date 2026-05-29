import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../features/calendar/components/calendar.css';
import { useCalendarTodos } from '../features/calendar/hooks/useCalendarTodos';
import { useCategoryList } from '../features/category/hooks/useCategoryList';
import TodoDetailModal from '../features/calendar/components/TodoDetailModal';
import type { Todo, TodoStatus } from '../types/todo';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: Todo;
}

const EVENT_CLASS: Record<TodoStatus, string> = {
  NOT_STARTED: 'event--not-started',
  IN_PROGRESS: 'event--in-progress',
  DONE: 'event--done',
};

function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const month = toYearMonth(currentDate);
  const { data: todos = [], isLoading } = useCalendarTodos(month);
  const { data: categories = [] } = useCategoryList();

  const events: CalendarEvent[] = todos.map((todo) => {
    const date = new Date(todo.startDate);
    return {
      title: todo.title,
      start: date,
      end: date,
      resource: todo,
    };
  });

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTodo(event.resource);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTodo(null);
  }, []);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
  };

  return (
    <div className="calendar-page">
      <h1 className="calendar-page__title">{t('calendar.title')}</h1>

      {isLoading ? (
        <p>{t('calendar.loading')}</p>
      ) : (
        <div className="calendar-page__body">
          <Calendar
            localizer={localizer}
            events={events}
            date={currentDate}
            onNavigate={handleNavigate}
            views={['month']}
            defaultView="month"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event: CalendarEvent) => ({
              className: EVENT_CLASS[event.resource.status],
            })}
            style={{ height: '100%' }}
          />
        </div>
      )}

      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          categoryName={getCategoryName(selectedTodo.categoryId)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
