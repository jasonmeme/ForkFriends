import { format, isToday } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMMM dd, yyyy');
};

export const getTimeRemaining = (): { hours: number, minutes: number, seconds: number } => {
  const now = new Date();
  const targetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    11, // 11 AM
    0,
    0
  );

  if (now >= targetTime) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const diffInSeconds = Math.floor((targetTime.getTime() - now.getTime()) / 1000);
  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  return { hours, minutes, seconds };
};

export const isMatchingComplete = (): boolean => {
  const now = new Date();
  const targetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    11, // 11 AM
    0,
    0
  );
  return now >= targetTime;
}; 