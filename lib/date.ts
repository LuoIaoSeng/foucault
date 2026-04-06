export function getDateString(date: Date | string) {
  const t = typeof (date) === 'string' ? new Date(date) : date
  return t.toISOString().split('T')[0]
}