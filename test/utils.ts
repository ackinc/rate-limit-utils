export function computeMaxConcurrency(
  times: { startTime: number; endTime: number }[],
) {
  if (!times.every((t) => t.startTime <= t.endTime)) {
    throw new Error("Invalid time intervals");
  }

  const startTimes = times.map((t) => t.startTime).sort((a, b) => a - b);
  const endTimes = times.map((t) => t.endTime).sort((a, b) => a - b);

  let maxConcurrency = 0,
    curConcurrency = 0;
  let i = 0,
    j = 0;
  while (i < startTimes.length) {
    while (endTimes[j]! < startTimes[i]!) {
      curConcurrency--;
      j++;
    }
    curConcurrency++;
    maxConcurrency = Math.max(maxConcurrency, curConcurrency);
    i++;
  }
  return maxConcurrency;
}

export function computeFreqs(items: (string | number)[]) {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}
