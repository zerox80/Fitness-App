import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Activity,
  Bell,
  Bike,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Home,
  PersonStanding,
  Search,
  Settings,
  Target,
  Timer,
  User,
  Utensils,
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

import { FadeIn } from '@/components/FadeIn';
import { api, DailyActivity } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const STEP_GOAL = 10000;
const DESKTOP_BREAKPOINT = 900;
const WEB_CONTENT_MAX_WIDTH = 1280;

const palette = {
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
};

const avatarUri = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80';

const trainings = [
  { title: 'Laufen', meta: '30 Min · 5,2 km · Mittel', kcal: 320, icon: PersonStanding, color: '#64C80E' },
  { title: 'Krafttraining', meta: '45 Min · Ganzkörper', kcal: 280, icon: Dumbbell, color: '#29B9C5' },
  { title: 'Yoga', meta: '30 Min · Entspannung', kcal: 180, icon: PersonStanding, color: '#A7E87F' },
  { title: 'Radfahren', meta: '40 Min · 12,4 km · Mittel', kcal: 420, icon: Bike, color: '#20C7B3' },
];

const weeklyProgress = [
  { day: 'M', progress: 0.72, done: true },
  { day: 'D', progress: 0.66, done: false },
  { day: 'M', progress: 0.70, done: true },
  { day: 'D', progress: 0.72, done: true },
  { day: 'F', progress: 0.78, done: false },
  { day: 'S', progress: 0.52, done: false },
  { day: 'S', progress: 0.80, done: false, muted: true },
];

const sidebarItems = [
  { label: 'Übersicht', icon: Home, active: true },
  { label: 'Aktivität', icon: Activity },
  { label: 'Trainings', icon: Dumbbell },
  { label: 'Ernährung', icon: Utensils },
  { label: 'Ziele', icon: Target },
  { label: 'Profil', icon: User },
];

type DashboardData = {
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

function formatGermanDate(date: Date) {
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatSteps(steps: number) {
  return Math.round(steps).toLocaleString('de-DE');
}

function StepProgressRing({ progress, size = 198 }: { progress: number; size?: number }) {
  const strokeWidth = size >= 220 ? 15 : 13;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - circumference * progress;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={palette.track}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={palette.green}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HeartRateChart({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.chartWrap, compact && styles.webChartWrap]}>
      <Svg width="100%" height="100%" viewBox="0 0 220 105">
        <Path
          d="M6 70 C18 52 31 82 44 65 C55 50 61 34 75 47 C88 60 91 82 106 72 C119 62 125 80 137 67 C148 54 155 62 166 44 C177 26 186 62 198 54 C207 47 213 61 218 55"
          fill="none"
          stroke={palette.red}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M6 70 C18 52 31 82 44 65 C55 50 61 34 75 47 C88 60 91 82 106 72 C119 62 125 80 137 67 C148 54 155 62 166 44 C177 26 186 62 198 54 C207 47 213 61 218 55 L218 105 L6 105 Z"
          fill="rgba(255,95,112,0.12)"
        />
        <Circle cx={166} cy={44} r={5} fill={palette.red} />
      </Svg>
      <View style={styles.heartBadge}>
        <Text style={styles.heartBadgeText}>128</Text>
      </View>
      <View style={styles.chartAxis}>
        <Text style={styles.chartAxisText}>160</Text>
        <Text style={styles.chartAxisText}>120</Text>
        <Text style={styles.chartAxisText}>80</Text>
        <Text style={styles.chartAxisText}>40</Text>
      </View>
    </View>
  );
}

function DateRow({ dateLabel, desktop = false }: { dateLabel: string; desktop?: boolean }) {
  return (
    <View style={styles.dateRow}>
      <CalendarDays size={desktop ? 15 : 16} color={palette.greenDark} />
      <Text style={[styles.dateText, desktop && styles.webDateText]}>{dateLabel}</Text>
    </View>
  );
}

function OverviewCard({ compact = false, data, desktop = false }: { compact?: boolean; data: DashboardData; desktop?: boolean }) {
  const ringSize = desktop ? 236 : compact ? 172 : 198;

  return (
    <View style={[styles.overviewCard, compact && styles.compactOverviewCard, desktop && styles.webOverviewCard]}>
      {desktop && (
        <View style={styles.webCardHeader}>
          <Text style={styles.webCardTitle}>Heute im Überblick</Text>
          <DateRow dateLabel={data.dateLabel} desktop />
        </View>
      )}

      <View style={[styles.overviewBody, compact && styles.compactOverviewBody, desktop && styles.webOverviewBody]}>
        <View style={[styles.stepRingArea, compact && styles.compactStepRingArea, desktop && styles.webStepRingArea]}>
          <StepProgressRing progress={data.stepProgress} size={ringSize} />
          <View style={styles.stepRingContent}>
            <Footprints size={desktop ? 35 : compact ? 27 : 34} color={palette.teal} strokeWidth={2.4} />
            <Text style={[styles.stepsValue, compact && styles.compactStepsValue, desktop && styles.webStepsValue]}>{formatSteps(data.steps)}</Text>
            <Text style={[styles.stepsGoal, compact && styles.compactStepsGoal, desktop && styles.webStepsGoal]}>/ {formatSteps(STEP_GOAL)} Schritte</Text>
            <Text style={styles.stepsPercent}>{Math.round(data.stepProgress * 100)}%</Text>
          </View>
        </View>

        <View style={[styles.metricsColumn, compact && styles.compactMetricsColumn, desktop && styles.webMetricsColumn]}>
          <MetricRow compact={compact} icon={Flame} iconColor="#65BE20" iconFill="#65BE20" label="Kalorien" value={Math.round(data.calories)} unit="kcal" softColor={palette.greenSoft} />
          <MetricRow compact={compact} icon={Timer} iconColor={palette.teal} label="Aktive Minuten" value={Math.round(data.activeMinutes)} unit="min" softColor={palette.tealSoft} />
          <MetricRow compact={compact} icon={PersonStanding} iconColor="#75BE25" label="Strecke" value={data.distance} unit="km" softColor={palette.greenSoft} />
        </View>
      </View>
    </View>
  );
}

function MetricRow({
  icon: Icon,
  iconColor,
  iconFill,
  compact = false,
  label,
  softColor,
  unit,
  value,
}: {
  icon: typeof Flame;
  iconColor: string;
  iconFill?: string;
  compact?: boolean;
  label: string;
  softColor: string;
  unit: string;
  value: number | string;
}) {
  return (
    <View style={[styles.metricRow, compact && styles.compactMetricRow]}>
      <View style={[styles.metricIcon, compact && styles.compactMetricIcon, { backgroundColor: softColor }]}>
        <Icon size={compact ? 23 : 28} color={iconColor} fill={iconFill ?? 'transparent'} />
      </View>
      <View>
        <Text style={[styles.metricLabel, compact && styles.compactMetricLabel]}>{label}</Text>
        <Text style={[styles.metricValue, compact && styles.compactMetricValue]}>
          {value} <Text style={[styles.metricUnit, compact && styles.compactMetricUnit]}>{unit}</Text>
        </Text>
      </View>
    </View>
  );
}

function HeartCard({ desktop = false }: { desktop?: boolean }) {
  return (
    <View style={[styles.smallCard, desktop && styles.webSmallCard]}>
      <View style={styles.smallCardHeader}>
        <Text style={styles.cardTitle}>Herzfrequenz</Text>
        <View style={[styles.roundIcon, { backgroundColor: palette.redSoft }]}>
          <Heart size={18} color={palette.red} fill={palette.red} />
        </View>
      </View>
      <Text style={[styles.heartValue, desktop && styles.webHeartValue]}>
        128 <Text style={styles.heartUnit}>bpm</Text>
      </Text>
      <Text style={styles.cardMuted}>Durchschnitt</Text>
      <HeartRateChart compact={desktop} />
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>00:00</Text>
        <Text style={styles.timeLabel}>12:00</Text>
        <Text style={styles.timeLabel}>24:00</Text>
      </View>
    </View>
  );
}

function WeekCard({ desktop = false }: { desktop?: boolean }) {
  return (
    <View style={[styles.smallCard, desktop && styles.webSmallCard]}>
      <View style={styles.weekHeader}>
        <Text style={styles.cardTitle}>Wochenfortschritt</Text>
        <View style={[styles.weekSelector, desktop && styles.webWeekSelector]}>
          <Text style={styles.weekSelectorText}>Diese Woche</Text>
          <ChevronDown size={13} color={palette.greenDark} />
        </View>
      </View>
      <Text style={[styles.weekValue, desktop && styles.webWeekValue]}>
        4 <Text style={styles.weekUnit}>von 7</Text>
      </Text>
      <Text style={styles.cardMuted}>Ziele erreicht</Text>
      <View style={styles.weekBars}>
        {weeklyProgress.map((item, index) => (
          <View key={`${item.day}-${index}`} style={styles.weekBarItem}>
            <View style={styles.checkSpace}>{item.done && <Text style={styles.checkMark}>✓</Text>}</View>
            <View style={[styles.weekTrack, desktop && styles.webWeekTrack]}>
              <View
                style={[
                  styles.weekFill,
                  {
                    height: `${item.progress * 100}%`,
                    backgroundColor: item.muted ? '#E6EAEE' : palette.green,
                  },
                ]}
              />
            </View>
            <Text style={styles.weekDay}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TrainingList({ desktop = false }: { desktop?: boolean }) {
  return (
    <>
      <View style={[styles.trainingsHeader, desktop && styles.webTrainingsHeader]}>
        <Text style={desktop ? styles.webCardTitle : styles.sectionTitle}>Trainings</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.showAll}>Alle anzeigen</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.trainingCard, desktop && styles.webTrainingCard]}>
        {trainings.map((training, index) => {
          const Icon = training.icon;
          return (
            <TouchableOpacity
              key={training.title}
              style={[styles.trainingRow, desktop && styles.webTrainingRow, index === trainings.length - 1 && styles.trainingRowLast]}
              activeOpacity={0.75}
            >
              <View style={[styles.trainingIcon, { backgroundColor: training.color }]}>
                <Icon size={24} color="#FFFFFF" strokeWidth={2.3} />
              </View>
              <View style={[styles.trainingContent, desktop && styles.webTrainingContent]}>
                <Text style={styles.trainingTitle}>{training.title}</Text>
                <Text style={styles.trainingMeta}>{training.meta}</Text>
              </View>
              <View style={[styles.kcalBlock, desktop && styles.webKcalBlock]}>
                <Text style={styles.kcalValue}>{training.kcal}</Text>
                <Text style={styles.kcalUnit}>kcal</Text>
              </View>
              <ChevronRight size={22} color={palette.softMuted} />
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

function MobileHome({ data }: { data: DashboardData }) {
  const { width } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
  const isCompact = viewportWidth < 430;
  const mobileFrameStyle = Platform.OS === 'web' ? styles.webMobileFrame : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={data.onRefresh} tintColor={palette.green} />}
      >
        <FadeIn delay={0}>
          <View style={[styles.header, mobileFrameStyle]}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>Hallo, {data.name}! 👋</Text>
              <Text style={styles.subtitle}>Schön, dass du dranbleibst.</Text>
            </View>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <View style={[styles.sectionHeader, mobileFrameStyle]}>
            <Text style={styles.sectionTitle}>Heute im Überblick</Text>
            <DateRow dateLabel={data.dateLabel} />
          </View>
        </FadeIn>

        <FadeIn delay={140}>
          <View style={[styles.mobileSection, mobileFrameStyle]}>
            <OverviewCard compact={isCompact} data={data} />
          </View>
        </FadeIn>

        <View style={[styles.smallCardsRow, mobileFrameStyle]}>
          <FadeIn delay={220} style={styles.smallCardFlex}>
            <HeartCard />
          </FadeIn>

          <FadeIn delay={280} style={styles.smallCardFlex}>
            <WeekCard />
          </FadeIn>
        </View>

        <FadeIn delay={340} style={[styles.mobileSection, mobileFrameStyle]}>
          <TrainingList />
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

function WebLogo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoMark}>
        <View style={styles.logoTop} />
        <View style={styles.logoMiddle} />
        <View style={styles.logoBottom} />
      </View>
      <Text style={styles.logoText}>FitFlow</Text>
    </View>
  );
}

function WebSidebar() {
  return (
    <View style={styles.webSidebar}>
      <WebLogo />
      <View style={styles.sidebarNav}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={item.label} activeOpacity={0.75} style={[styles.sidebarItem, item.active && styles.sidebarItemActive]}>
              <Icon size={23} color={item.active ? palette.greenDark : palette.muted} fill={item.active ? palette.greenDark : 'transparent'} strokeWidth={2.1} />
              <Text style={[styles.sidebarText, item.active && styles.sidebarTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity activeOpacity={0.75} style={styles.sidebarSettings}>
        <Settings size={23} color={palette.muted} strokeWidth={2.1} />
        <Text style={styles.sidebarText}>Einstellungen</Text>
      </TouchableOpacity>
    </View>
  );
}

function WebTopBar() {
  return (
    <View style={styles.webTopBar}>
      <View style={styles.searchBox}>
        <Search size={22} color={palette.muted} strokeWidth={2.1} />
        <Text style={styles.searchPlaceholder}>Suche nach Aktivitäten, Trainings...</Text>
      </View>
      <View style={styles.topActions}>
        <TouchableOpacity activeOpacity={0.75} style={styles.notificationButton}>
          <Bell size={25} color="#4A5564" strokeWidth={2.1} />
        </TouchableOpacity>
        <Image source={{ uri: avatarUri }} style={styles.webAvatar} />
      </View>
    </View>
  );
}

function WebDashboard({ data }: { data: DashboardData }) {
  return (
    <SafeAreaView style={styles.webSafeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.webShell}>
        <WebSidebar />
        <View style={styles.webMain}>
          <WebTopBar />
          <ScrollView contentContainerStyle={styles.webScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.webContent}>
              <FadeIn delay={0}>
                <View style={styles.webGreetingBlock}>
                  <Text style={styles.webGreeting}>Hallo, {data.name}! 👋</Text>
                  <Text style={styles.webSubtitle}>Schön, dass du dranbleibst.</Text>
                </View>
              </FadeIn>

              <View style={styles.webCardsRow}>
                <FadeIn delay={80} style={styles.webOverviewFlex}>
                  <OverviewCard data={data} desktop />
                </FadeIn>
                <FadeIn delay={140} style={styles.webMetricCardFlex}>
                  <HeartCard desktop />
                </FadeIn>
                <FadeIn delay={200} style={styles.webMetricCardFlex}>
                  <WeekCard desktop />
                </FadeIn>
              </View>

              <FadeIn delay={260}>
                <View style={styles.webTrainingSection}>
                  <TrainingList desktop />
                </View>
              </FadeIn>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setActivity(await api.activity.today());
    } catch {
      setActivity(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const name = user?.name?.split(' ')[0] || 'Alex';
  const steps = activity?.steps ?? 8742;
  const calories = activity?.calories ?? 562;
  const activeMinutes = activity?.active_minutes ?? 61;
  const stepProgress = Math.min(steps / STEP_GOAL, 1);
  const distance = useMemo(() => Math.max(0, steps * 0.00072).toFixed(1).replace('.', ','), [steps]);

  const data: DashboardData = {
    activeMinutes,
    calories,
    dateLabel: formatGermanDate(new Date()),
    distance,
    name,
    refreshing,
    stepProgress,
    steps,
    onRefresh,
  };

  if (Platform.OS === 'web' && viewportWidth >= DESKTOP_BREAKPOINT) {
    return <WebDashboard data={data} />;
  }

  return <MobileHome data={data} />;
}

const shadow = {
  shadowColor: palette.shadow,
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.28,
  shadowRadius: 24,
  elevation: 8,
};

const webShadow = {
  shadowColor: '#D9DFE5',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.35,
  shadowRadius: 30,
  elevation: 8,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
    paddingBottom: 128,
    alignItems: 'center',
    alignSelf: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 34,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 19,
    fontWeight: '500',
    marginTop: 4,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: palette.track,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  mobileSection: {
    width: '100%',
    maxWidth: 560,
  },
  webMobileFrame: {
    width: 'calc(100vw - 40px)',
    maxWidth: 560,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '900',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dateText: {
    color: palette.greenDark,
    fontSize: 16,
    fontWeight: '800',
  },
  webDateText: {
    fontSize: 15,
  },
  overviewCard: {
    ...shadow,
    width: '100%',
    minHeight: 310,
    borderRadius: 20,
    backgroundColor: palette.card,
    padding: 16,
    marginBottom: 18,
  },
  overviewBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactOverviewCard: {
    minHeight: 280,
    paddingHorizontal: 12,
  },
  compactOverviewBody: {
    gap: 4,
  },
  stepRingArea: {
    width: '54%',
    minWidth: 184,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactStepRingArea: {
    width: '50%',
    minWidth: 154,
  },
  stepRingContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  stepsValue: {
    color: palette.text,
    fontSize: 40,
    fontWeight: '900',
    marginTop: 12,
    lineHeight: 45,
  },
  compactStepsValue: {
    fontSize: 33,
    lineHeight: 37,
    marginTop: 8,
  },
  stepsGoal: {
    color: palette.muted,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  compactStepsGoal: {
    fontSize: 14,
  },
  stepsPercent: {
    color: palette.green,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
  },
  metricsColumn: {
    flex: 1,
    gap: 22,
    paddingLeft: 8,
  },
  compactMetricsColumn: {
    gap: 18,
    paddingLeft: 0,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactMetricRow: {
    gap: 8,
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactMetricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  metricLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  compactMetricLabel: {
    fontSize: 12,
  },
  metricValue: {
    color: palette.text,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 31,
  },
  compactMetricValue: {
    fontSize: 23,
    lineHeight: 27,
  },
  metricUnit: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: '500',
  },
  compactMetricUnit: {
    fontSize: 13,
  },
  smallCardsRow: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  smallCardFlex: {
    flex: 1,
  },
  smallCard: {
    ...shadow,
    minHeight: 306,
    borderRadius: 16,
    backgroundColor: palette.card,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  smallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  roundIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartValue: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 24,
    lineHeight: 38,
  },
  heartUnit: {
    color: palette.muted,
    fontSize: 17,
    fontWeight: '700',
  },
  cardMuted: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  chartWrap: {
    height: 110,
    marginTop: 4,
    marginRight: 16,
  },
  webChartWrap: {
    height: 116,
    marginTop: 8,
  },
  heartBadge: {
    position: 'absolute',
    top: 37,
    left: '64%',
    backgroundColor: palette.red,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  chartAxis: {
    position: 'absolute',
    top: 2,
    right: -14,
    height: 94,
    justifyContent: 'space-between',
  },
  chartAxisText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingTop: 22,
  },
  weekSelectorText: {
    color: palette.greenDark,
    fontSize: 12,
    fontWeight: '800',
  },
  weekValue: {
    color: palette.text,
    fontSize: 39,
    fontWeight: '900',
    marginTop: 2,
    lineHeight: 44,
  },
  weekUnit: {
    color: palette.muted,
    fontSize: 17,
    fontWeight: '600',
  },
  weekBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  weekBarItem: {
    width: 22,
    alignItems: 'center',
  },
  checkSpace: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: palette.green,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  weekTrack: {
    width: 13,
    height: 76,
    borderRadius: 7,
    backgroundColor: '#ECEFF1',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekFill: {
    width: '100%',
    borderRadius: 7,
  },
  weekDay: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  trainingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  showAll: {
    color: palette.greenDark,
    fontSize: 16,
    fontWeight: '800',
  },
  trainingCard: {
    ...shadow,
    borderRadius: 16,
    backgroundColor: palette.card,
    paddingHorizontal: 18,
  },
  trainingRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    gap: 14,
  },
  trainingRowLast: {
    borderBottomWidth: 0,
  },
  trainingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainingContent: {
    flex: 1,
  },
  trainingTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  trainingMeta: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  kcalBlock: {
    minWidth: 42,
    alignItems: 'flex-start',
  },
  kcalValue: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '900',
  },
  kcalUnit: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  webSafeArea: {
    flex: 1,
    backgroundColor: palette.appBackground,
  },
  webShell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: palette.appBackground,
  },
  webSidebar: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E3E7EB',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 34,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 46,
  },
  logoMark: {
    width: 34,
    height: 34,
  },
  logoTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 34,
    height: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#42D88E',
  },
  logoMiddle: {
    position: 'absolute',
    top: 11,
    left: 0,
    width: 24,
    height: 11,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: palette.teal,
  },
  logoBottom: {
    position: 'absolute',
    top: 21,
    left: 0,
    width: 12,
    height: 13,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: palette.greenDark,
  },
  logoText: {
    color: palette.text,
    fontSize: 25,
    fontWeight: '900',
  },
  sidebarNav: {
    gap: 16,
  },
  sidebarItem: {
    minHeight: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  sidebarItemActive: {
    backgroundColor: '#EFF7F2',
    borderLeftWidth: 4,
    borderLeftColor: '#BDEEDB',
    paddingLeft: 20,
  },
  sidebarText: {
    color: '#566172',
    fontSize: 16,
    fontWeight: '700',
  },
  sidebarTextActive: {
    color: palette.greenDark,
  },
  sidebarSettings: {
    marginTop: 'auto',
    minHeight: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  webMain: {
    flex: 1,
  },
  webTopBar: {
    height: 78,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  searchBox: {
    width: 560,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F6F8FA',
    borderWidth: 1,
    borderColor: '#EEF1F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 17,
  },
  searchPlaceholder: {
    color: '#8A929D',
    fontSize: 14,
    fontWeight: '500',
  },
  topActions: {
    position: 'absolute',
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  notificationButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.track,
  },
  webScrollContent: {
    paddingHorizontal: 48,
    paddingTop: 22,
    paddingBottom: 42,
  },
  webContent: {
    width: '100%',
    maxWidth: WEB_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  webGreetingBlock: {
    marginBottom: 22,
  },
  webGreeting: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  webSubtitle: {
    color: palette.muted,
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
  },
  webCardsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  webOverviewFlex: {
    flex: 1.95,
    minWidth: 510,
  },
  webMetricCardFlex: {
    flex: 1,
    minWidth: 260,
  },
  webOverviewCard: {
    ...webShadow,
    minHeight: 320,
    borderRadius: 12,
    padding: 22,
    marginBottom: 0,
  },
  webCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  webCardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  webOverviewBody: {
    alignItems: 'center',
  },
  webStepRingArea: {
    width: '50%',
    minWidth: 250,
  },
  webStepsValue: {
    fontSize: 42,
    lineHeight: 46,
  },
  webStepsGoal: {
    fontSize: 18,
  },
  webMetricsColumn: {
    gap: 20,
    borderLeftWidth: 0,
    paddingLeft: 6,
  },
  webSmallCard: {
    ...webShadow,
    minHeight: 320,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
  },
  webHeartValue: {
    fontSize: 34,
    marginTop: 22,
  },
  webWeekSelector: {
    paddingTop: 2,
  },
  webWeekValue: {
    fontSize: 38,
    marginTop: 22,
  },
  webWeekTrack: {
    height: 86,
    width: 15,
  },
  webTrainingSection: {
    marginTop: 18,
  },
  webTrainingsHeader: {
    marginBottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: palette.card,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
    ...webShadow,
  },
  webTrainingCard: {
    ...webShadow,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 22,
  },
  webTrainingRow: {
    minHeight: 54,
  },
  webTrainingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 44,
  },
  webKcalBlock: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
});
