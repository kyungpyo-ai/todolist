export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isEndDateValid(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
}

export function isOverdue(endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(endDate) < today;
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function todayString(): string {
  return toISODateString(new Date());
}
