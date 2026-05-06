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
import { Colors, Layout } from '@/constants/Colors';

export const STEP_GOAL = 10000;
export const DESKTOP_BREAKPOINT = Layout.desktop;
export const WIDE_BREAKPOINT = Layout.desktopExpanded;
export const ULTRA_WIDE_BREAKPOINT = 1800;
export const WEB_CONTENT_MAX_WIDTH = Layout.contentMax;

export const palette = {
  background: Colors.background,
  appBackground: Colors.background,
  card: Colors.card,
  text: Colors.text,
  muted: Colors.textMuted,
  softMuted: Colors.textSoft,
  border: Colors.borderSoft,
  green: Colors.primary,
  greenDark: '#126F54',
  greenSoft: Colors.primaryGlow,
  teal: Colors.secondary,
  tealSoft: Colors.secondaryGlow,
  red: Colors.tertiary,
  redSoft: Colors.tertiaryGlow,
  shadow: Colors.shadow,
  track: '#E3E9EC',
  accent: Colors.primary,
  accentLight: Colors.primaryGlow,
  glass: Colors.card,
  glassBorder: Colors.borderSoft,
};

export const avatarUri: string | null = null;

export const trainings = [
  { title: 'Laufen', meta: '30 Min · 5,2 km · Mittel', kcal: 320, icon: PersonStanding, color: Colors.primary },
  { title: 'Krafttraining', meta: '45 Min · Ganzkörper', kcal: 280, icon: Dumbbell, color: Colors.secondary },
  { title: 'Mobilität', meta: '30 Min · Regeneration', kcal: 180, icon: PersonStanding, color: Colors.warning },
  { title: 'Radfahren', meta: '40 Min · 12,4 km · Mittel', kcal: 420, icon: Bike, color: '#2D7EAA' },
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
