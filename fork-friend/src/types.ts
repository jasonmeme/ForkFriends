export interface User {
  id: string;
  name: string;
  availableToday: boolean;
}

export interface Match {
  id: string;
  date: Date;
  user1Id: string;
  user2Id: string;
  user1Name?: string;
  user2Name?: string;
}

export interface AppState {
  user: User | null;
  todayMatch: Match | null;
  loadingUser: boolean;
  loadingMatch: boolean;
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  matchingComplete: boolean;
} 