import {
  Activity,
  Bike,
  Dumbbell,
  Home,
  PersonStanding,
  Target,
  User,
  Utensils,
} from 'lucide-react-native';

export const STEP_GOAL = 10000;
export const DESKTOP_BREAKPOINT = 900;
export const WIDE_BREAKPOINT = 1200;
export const ULTRA_WIDE_BREAKPOINT = 1800;
export const WEB_CONTENT_MAX_WIDTH = 1600;

export const palette = {
  background: '#F5F7F6',
  appBackground: '#F7F8FA',
  card: '#FFFFFF',
  text: '#18202A',
  muted: '#6D747E',
  softMuted: '#A4ABB4',
  border: '#ECEFF1',
  green: '#21B882',
  greenDark: '#129565',
  greenSoft: '#EAF8D9',
  teal: '#22C7BC',
  tealSoft: '#DDF8F4',
  red: '#FF5F70',
  redSoft: '#FFE2E5',
  shadow: '#C9D1D8',
  track: '#EBEEF1',
  // Premium additions
  accent: '#20B77F',
  accentLight: '#E8F8F2',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
};

export const avatarUri: string | null = null;

export const trainings = [
  { title: 'Laufen', meta: '30 Min · 5,2 km · Mittel', kcal: 320, icon: PersonStanding, color: '#64C80E' },
  { title: 'Krafttraining', meta: '45 Min · Ganzkörper', kcal: 280, icon: Dumbbell, color: '#29B9C5' },
  { title: 'Yoga', meta: '30 Min · Entspannung', kcal: 180, icon: PersonStanding, color: '#A7E87F' },
  { title: 'Radfahren', meta: '40 Min · 12,4 km · Mittel', kcal: 420, icon: Bike, color: '#20C7B3' },
];

export const weeklyProgress = [
  { day: 'M', progress: 0, done: false },
  { day: 'D', progress: 0, done: false },
  { day: 'M', progress: 0, done: false },
  { day: 'D', progress: 0, done: false },
  { day: 'F', progress: 0, done: false },
  { day: 'S', progress: 0, done: false },
  { day: 'S', progress: 0, done: false },
];

export const sidebarItems = [
  { label: 'Übersicht', icon: Home, active: true },
  { label: 'Aktivität', icon: Activity },
  { label: 'Trainings', icon: Dumbbell },
  { label: 'Ernährung', icon: Utensils },
  { label: 'Ziele', icon: Target },
  { label: 'Profil', icon: User },
];

export type DashboardData = {
  activeMinutes: number;
  calories: number;
  dateLabel: string;
  distance: string;
  name: string;
  refreshing: boolean;
  stepProgress: number;
  steps: number;
  onRefresh: () => Promise<void>;
};
