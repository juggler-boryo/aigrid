export const Min2Str = (minutes: number) => {
  if (!minutes) {
    return 0;
  }
  const intMinutes = Math.floor(minutes);
  if (intMinutes < 60) {
    return `${intMinutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export const Min2StrDetailed = (minutes: number): string => {
  if (!minutes) {
    return "0m";
  }

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.join(" ");
};