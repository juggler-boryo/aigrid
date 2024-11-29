export const Min2Str = (minutes: number) => {
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
