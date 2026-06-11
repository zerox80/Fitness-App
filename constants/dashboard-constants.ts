import {
  Activity,
  Dumbbell,
  Home,
  Target,
  User,
  Utensils,
} from 'lucide-react-native';
import { Colors, Layout } from '@/constants/Colors';
import type { DailyActivity, WeeklyActivitySummary } from '@/lib/api';

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
  weeklySummary?: WeeklyActivitySummary | null;
  onRefresh: () => Promise<void>;
  onActivityUpdated?: (activity: DailyActivity) => void;
};
