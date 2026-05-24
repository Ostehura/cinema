export function getDateStart(date: Date): Date {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  return dayStart;
}

export function getDateEnd(date: Date): Date {
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  return dayEnd;
}
