export type SeasonStatus = 'active' | 'upcoming' | 'completed';

export interface Reward {
  position: number;
  title: string;
  desc: string;
}

export interface Season {
  id: string;
  name: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  participants: number;
  userPoints: number;
  userRank: number;
  progress: number;
  achievement?: string;
  rewards: Reward[];
}

export type RankMovement = 'up' | 'down' | 'same';

export interface Player {
  id: string;
  name: string;
  avatarSeed: string;
  initials: string;
  points: number;
  completed: number;
  submissions: number;
  rankChange: RankMovement;
  changeAmount: number;
  isCurrentUser: boolean;
  rank?: number;
  streak?: number;
  solvedProblems?: string[];
}

export type Difficulty = 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'expert';
export type ChallengeStatus = 'not_started' | 'in_progress' | 'completed';

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  points: number;
  status: ChallengeStatus;
  acceptedRate: number;
  solveTime: number; // minutes (median)
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UserAchievement {
  id: string;
  title: string;
  desc: string;
  icon: 'crown' | 'brain' | 'rocket' | 'flame' | 'zap' | 'trophy';
  earned: boolean;
  date: string;
  rarity: AchievementRarity;
}

export interface ChallengeFilter {
  difficulty: Difficulty | 'all';
  topic: string | 'all';
  status: ChallengeStatus | 'all';
}
