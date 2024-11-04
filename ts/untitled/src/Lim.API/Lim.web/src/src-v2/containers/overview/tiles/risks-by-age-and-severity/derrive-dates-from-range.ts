export function deriveDatesFromRange(range: string) {
  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const twoYearsInMilliseconds = 2 * 365 * dayInMilliseconds;

  if (!range) {
    return [null, null];
  }

  // Check if the format is "30+"
  if (range.includes('+')) {
    const daysAgo = parseInt(range, 10);

    return [
      new Date(Date.now() - twoYearsInMilliseconds),
      new Date(Date.now() - daysAgo * dayInMilliseconds - dayInMilliseconds),
    ];
  }

  // Check if the format is "2-5"`
  const [start, end] = range.split('-').map(Number);
  if (start !== undefined && end !== undefined) {
    const startDate = new Date(Date.now() - start * dayInMilliseconds);
    const endDate = new Date(Date.now() - end * dayInMilliseconds);
    return [endDate, startDate];
  }

  return [null, null];
}
