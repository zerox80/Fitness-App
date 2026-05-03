import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { palette } from '@/constants/dashboard-constants';

const shadow = {
  shadowColor: palette.shadow,
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.28,
  shadowRadius: 24,
  elevation: 8,
};

type DashboardStyles = {
  container: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  headerCopy: ViewStyle;
  greeting: TextStyle;
  subtitle: TextStyle;
  avatar: ImageStyle;
  sectionHeader: ViewStyle;
  mobileSection: ViewStyle;
  webMobileFrame: ViewStyle;
  sectionTitle: TextStyle;
  dateRow: ViewStyle;
  dateText: TextStyle;
  webDateText: TextStyle;
  overviewCard: ViewStyle;
  overviewBody: ViewStyle;
  compactOverviewCard: ViewStyle;
  compactOverviewBody: ViewStyle;
  stepRingArea: ViewStyle;
  compactStepRingArea: ViewStyle;
  stepRingContent: ViewStyle;
  stepsValue: TextStyle;
  compactStepsValue: TextStyle;
  stepsGoal: TextStyle;
  compactStepsGoal: TextStyle;
  stepsPercent: TextStyle;
  metricsColumn: ViewStyle;
  compactMetricsColumn: ViewStyle;
  metricRow: ViewStyle;
  compactMetricRow: ViewStyle;
  metricIcon: ViewStyle;
  compactMetricIcon: ViewStyle;
  metricLabel: TextStyle;
  compactMetricLabel: TextStyle;
  metricValue: TextStyle;
  compactMetricValue: TextStyle;
  metricUnit: TextStyle;
  compactMetricUnit: TextStyle;
  smallCardsRow: ViewStyle;
  smallCardFlex: ViewStyle;
  smallCard: ViewStyle;
  smallCardHeader: ViewStyle;
  cardTitle: TextStyle;
  roundIcon: ViewStyle;
  heartValue: TextStyle;
  heartUnit: TextStyle;
  cardMuted: TextStyle;
  chartWrap: ViewStyle;
  webChartWrap: ViewStyle;
  heartBadge: ViewStyle;
  heartBadgeText: TextStyle;
  chartAxis: ViewStyle;
  chartAxisText: TextStyle;
  timeLabels: ViewStyle;
  timeLabel: TextStyle;
  weekHeader: ViewStyle;
  weekSelector: ViewStyle;
  weekSelectorText: TextStyle;
  weekValue: TextStyle;
  weekUnit: TextStyle;
  weekBars: ViewStyle;
  weekBarItem: ViewStyle;
  checkSpace: ViewStyle;
  checkMark: TextStyle;
  weekTrack: ViewStyle;
  weekFill: ViewStyle;
  weekDay: TextStyle;
  trainingsHeader: ViewStyle;
  showAll: TextStyle;
  trainingCard: ViewStyle;
  trainingRow: ViewStyle;
  compactTrainingRow: ViewStyle;
  trainingRowLast: ViewStyle;
  trainingIcon: ViewStyle;
  compactTrainingIcon: ViewStyle;
  trainingContent: ViewStyle;
  trainingTitle: TextStyle;
  compactTrainingTitle: TextStyle;
  trainingMeta: TextStyle;
  compactTrainingMeta: TextStyle;
  kcalBlock: ViewStyle;
  kcalValue: TextStyle;
  kcalUnit: TextStyle;
};

export const styles = StyleSheet.create<DashboardStyles>({
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
    marginBottom: 24,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.track,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  mobileSection: {
    width: '100%',
    maxWidth: 560,
  },
  webMobileFrame: {
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
    flexWrap: 'wrap',
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
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  compactStepRingArea: {
    minWidth: 170,
  },
  stepRingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsValue: {
    color: palette.text,
    fontSize: 38,
    fontWeight: '900',
    marginTop: 4,
    lineHeight: 42,
  },
  compactStepsValue: {
    fontSize: 32,
    lineHeight: 36,
    marginTop: 2,
  },
  stepsGoal: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  compactStepsGoal: {
    fontSize: 11,
  },
  stepsPercent: {
    color: palette.green,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  metricsColumn: {
    flex: 1,
    minWidth: 150,
    gap: 22,
    paddingLeft: 24,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 20,
    lineHeight: 24,
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
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  smallCardFlex: {
    flex: 1,
    minWidth: 160,
  },
  smallCard: {
    ...shadow,
    minHeight: 280,
    borderRadius: 16,
    backgroundColor: palette.card,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 18,
  },
  smallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: palette.text,
    fontSize: 13,
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
    fontSize: 28,
    fontWeight: '900',
    marginTop: 16,
    lineHeight: 32,
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
    marginLeft: 36,
    marginRight: 4,
  },
  webChartWrap: {
    height: 116,
    marginTop: 8,
  },
  heartBadge: {
    position: 'absolute',
    top: 37,
    left: '60%',
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
    left: -32,
    width: 28,
    height: 94,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingTop: 0,
  },
  weekSelectorText: {
    color: palette.greenDark,
    fontSize: 11,
    fontWeight: '800',
  },
  weekValue: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
    lineHeight: 36,
  },
  weekUnit: {
    color: palette.muted,
    fontSize: 17,
    fontWeight: '600',
  },
  weekBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  weekBarItem: {
    flex: 1,
    maxWidth: 32,
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
    width: '100%',
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
    width: '100%',
    borderRadius: 16,
    backgroundColor: palette.card,
    paddingHorizontal: 18,
  },
  trainingRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.background,
    gap: 16,
    paddingVertical: 12,
  },
  compactTrainingRow: {
    minHeight: 74,
    gap: 12,
    paddingVertical: 10,
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
    flexShrink: 0,
  },
  compactTrainingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  trainingContent: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  trainingTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
    flexShrink: 1,
  },
  compactTrainingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  trainingMeta: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  compactTrainingMeta: {
    fontSize: 13,
  },
  kcalBlock: {
    minWidth: 64,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  kcalValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  kcalUnit: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
  },
});
