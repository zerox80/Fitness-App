import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bike,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  PersonStanding,
  Timer,
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

import { FadeIn } from '@/components/FadeIn';
import { api, DailyActivity } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_W - 40, 560);
const STEP_GOAL = 10000;

const palette = {
  background: '#F5F7F6',
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

function StepProgressRing({ progress }: { progress: number }) {
  const radius = 86;
  const strokeWidth = 13;
  const size = (radius + strokeWidth) * 2;
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

function HeartRateChart() {
  return (
    <View style={styles.chartWrap}>
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

export default function HomeScreen() {
  const { user } = useAuth();
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
  const distance = useMemo(() => Math.max(0, steps * 0.00072), [steps]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.green} />
        }
      >
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>Hallo, {name}! 👋</Text>
              <Text style={styles.subtitle}>Schön, dass du dranbleibst.</Text>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' }}
              style={styles.avatar}
            />
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Heute im Überblick</Text>
            <View style={styles.dateRow}>
              <CalendarDays size={16} color={palette.greenDark} />
              <Text style={styles.dateText}>{formatGermanDate(new Date())}</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={140}>
          <View style={styles.overviewCard}>
            <View style={styles.stepRingArea}>
              <StepProgressRing progress={stepProgress} />
              <View style={styles.stepRingContent}>
                <Footprints size={34} color={palette.teal} strokeWidth={2.4} />
                <Text style={styles.stepsValue}>{formatSteps(steps)}</Text>
                <Text style={styles.stepsGoal}>/ {formatSteps(STEP_GOAL)} Schritte</Text>
                <Text style={styles.stepsPercent}>{Math.round(stepProgress * 100)}%</Text>
              </View>
            </View>

            <View style={styles.metricsColumn}>
              <View style={styles.metricRow}>
                <View style={[styles.metricIcon, { backgroundColor: palette.greenSoft }]}>
                  <Flame size={28} color="#65BE20" fill="#65BE20" />
                </View>
                <View>
                  <Text style={styles.metricLabel}>Kalorien</Text>
                  <Text style={styles.metricValue}>{Math.round(calories)} <Text style={styles.metricUnit}>kcal</Text></Text>
                </View>
              </View>
              <View style={styles.metricRow}>
                <View style={[styles.metricIcon, { backgroundColor: palette.tealSoft }]}>
                  <Timer size={28} color={palette.teal} />
                </View>
                <View>
                  <Text style={styles.metricLabel}>Aktive Minuten</Text>
                  <Text style={styles.metricValue}>{Math.round(activeMinutes)} <Text style={styles.metricUnit}>min</Text></Text>
                </View>
              </View>
              <View style={styles.metricRow}>
                <View style={[styles.metricIcon, { backgroundColor: palette.greenSoft }]}>
                  <PersonStanding size={28} color="#75BE25" />
                </View>
                <View>
                  <Text style={styles.metricLabel}>Strecke</Text>
                  <Text style={styles.metricValue}>{distance.toFixed(1).replace('.', ',')} <Text style={styles.metricUnit}>km</Text></Text>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>

        <View style={styles.smallCardsRow}>
          <FadeIn delay={220} style={styles.smallCardFlex}>
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Text style={styles.cardTitle}>Herzfrequenz</Text>
                <View style={[styles.roundIcon, { backgroundColor: palette.redSoft }]}>
                  <Heart size={18} color={palette.red} fill={palette.red} />
                </View>
              </View>
              <Text style={styles.heartValue}>128 <Text style={styles.heartUnit}>bpm</Text></Text>
              <Text style={styles.cardMuted}>Durchschnitt</Text>
              <HeartRateChart />
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabel}>00:00</Text>
                <Text style={styles.timeLabel}>12:00</Text>
                <Text style={styles.timeLabel}>24:00</Text>
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={280} style={styles.smallCardFlex}>
            <View style={styles.smallCard}>
              <View style={styles.weekHeader}>
                <Text style={styles.cardTitle}>Wochenfortschritt</Text>
                <View style={styles.weekSelector}>
                  <Text style={styles.weekSelectorText}>Diese Woche</Text>
                  <ChevronDown size={13} color={palette.greenDark} />
                </View>
              </View>
              <Text style={styles.weekValue}>4 <Text style={styles.weekUnit}>von 7</Text></Text>
              <Text style={styles.cardMuted}>Ziele erreicht</Text>
              <View style={styles.weekBars}>
                {weeklyProgress.map((item, index) => (
                  <View key={`${item.day}-${index}`} style={styles.weekBarItem}>
                    <View style={styles.checkSpace}>
                      {item.done && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <View style={styles.weekTrack}>
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
          </FadeIn>
        </View>

        <FadeIn delay={340}>
          <View style={styles.trainingsHeader}>
            <Text style={styles.sectionTitle}>Trainings</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.showAll}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.trainingCard}>
            {trainings.map((training, index) => {
              const Icon = training.icon;
              return (
                <TouchableOpacity
                  key={training.title}
                  style={[styles.trainingRow, index === trainings.length - 1 && styles.trainingRowLast]}
                  activeOpacity={0.75}
                >
                  <View style={[styles.trainingIcon, { backgroundColor: training.color }]}>
                    <Icon size={24} color="#FFFFFF" strokeWidth={2.3} />
                  </View>
                  <View style={styles.trainingContent}>
                    <Text style={styles.trainingTitle}>{training.title}</Text>
                    <Text style={styles.trainingMeta}>{training.meta}</Text>
                  </View>
                  <View style={styles.kcalBlock}>
                    <Text style={styles.kcalValue}>{training.kcal}</Text>
                    <Text style={styles.kcalUnit}>kcal</Text>
                  </View>
                  <ChevronRight size={22} color={palette.softMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: palette.shadow,
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.28,
  shadowRadius: 24,
  elevation: 8,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 128,
    alignItems: 'center',
  },
  header: {
    width: CARD_WIDTH,
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
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
  overviewCard: {
    ...shadow,
    width: CARD_WIDTH,
    minHeight: 310,
    borderRadius: 20,
    backgroundColor: palette.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  stepRingArea: {
    width: '54%',
    minWidth: 184,
    alignItems: 'center',
    justifyContent: 'center',
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
  stepsGoal: {
    color: palette.muted,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
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
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  metricValue: {
    color: palette.text,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 31,
  },
  metricUnit: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: '500',
  },
  smallCardsRow: {
    width: CARD_WIDTH,
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
    width: CARD_WIDTH,
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
    width: CARD_WIDTH,
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
});
