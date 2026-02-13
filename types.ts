
export enum ActivityType {
  BEHAVIOR = 'behavior',
  CHORE = 'chore',
  REWARD_REDEMPTION = 'reward_redemption'
}

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  description: string;
  outcome: string;
  pointsChange: number;
  timestamp: number;
}

export interface Chore {
  id: string;
  title: string;
  points: number;
  isRecurring: boolean;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  points: number;
  avatar: string;
  history: ActivityRecord[];
}

export interface AppState {
  children: Child[];
  selectedChildId: string | null;
}
