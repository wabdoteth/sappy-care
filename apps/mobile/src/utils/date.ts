export function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, offset: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
}

export function getRecentLocalDates(days: number, anchor = new Date()) {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    dates.push(getLocalDate(addDays(anchor, -i)));
  }
  return dates;
}

export function formatLocalDate(localDate: string) {
  const date = new Date(`${localDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
