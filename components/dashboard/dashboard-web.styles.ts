import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { palette, WEB_CONTENT_MAX_WIDTH } from '@/constants/dashboard-constants';

const webShadow = {
  shadowColor: palette.shadow,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 2,
};

type DashboardWebStyles = {
  webSafeArea: ViewStyle;
  webShell: ViewStyle;
  webSidebar: ViewStyle;
  logoRow: ViewStyle;
  logoMark: ViewStyle;
  logoTop: ViewStyle;
  logoMiddle: ViewStyle;
  logoBottom: ViewStyle;
  logoText: TextStyle;
  sidebarNav: ViewStyle;
  sidebarItem: ViewStyle;
  sidebarItemActive: ViewStyle;
  sidebarText: TextStyle;
  sidebarTextActive: TextStyle;
  sidebarSettings: ViewStyle;
  webMain: ViewStyle;
  webTopBar: ViewStyle;
  searchBox: ViewStyle;
  searchPlaceholder: TextStyle;
  topActions: ViewStyle;
  notificationButton: ViewStyle;
  webAvatar: ViewStyle;
  webScrollContent: ViewStyle;
  webContent: ViewStyle;
  webGrid: ViewStyle;
  webGridItem: ViewStyle;
  webGreetingBlock: ViewStyle;
  webGreeting: TextStyle;
  webSubtitle: TextStyle;
  webCardsRow: ViewStyle;
  webOverviewFlex: ViewStyle;
  webMetricCardFlex: ViewStyle;
  webOverviewCard: ViewStyle;
  webCardHeader: ViewStyle;
  webCardTitle: TextStyle;
  webOverviewBody: ViewStyle;
  webStepRingArea: ViewStyle;
  webStepsValue: TextStyle;
  webStepsGoal: TextStyle;
  webMetricsColumn: ViewStyle;
  webSmallCard: ViewStyle;
  webHeartValue: TextStyle;
  webWeekSelector: ViewStyle;
  webWeekValue: TextStyle;
  webWeekTrack: ViewStyle;
  webTrainingSection: ViewStyle;
  webTrainingsHeader: ViewStyle;
  webTrainingCard: ViewStyle;
  webTrainingRow: ViewStyle;
  webTrainingContent: ViewStyle;
  webKcalBlock: ViewStyle;
};

export const webStyles = StyleSheet.create<DashboardWebStyles>({
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
    backgroundColor: palette.card,
    borderRightWidth: 1,
    borderRightColor: palette.border,
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 34,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 34,
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
    backgroundColor: palette.green,
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
    fontWeight: '800',
  },
  sidebarNav: {
    gap: 8,
  },
  sidebarItem: {
    minHeight: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
  },
  sidebarItemActive: {
    backgroundColor: palette.greenSoft,
    borderLeftWidth: 0,
    paddingLeft: 16,
  },
  sidebarText: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  sidebarTextActive: {
    color: palette.greenDark,
  },
  sidebarSettings: {
    marginTop: 'auto',
    minHeight: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  webMain: {
    flex: 1,
  },
  webTopBar: {
    minHeight: 70,
    backgroundColor: palette.card,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    gap: 16,
  },
  searchBox: {
    flex: 1,
    maxWidth: 560,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notificationButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.track,
  },
  webScrollContent: {
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 60,
  },
  webContent: {
    width: '100%',
    maxWidth: WEB_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flex: 1,
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginHorizontal: -10,
  },
  webGridItem: {
    padding: 10,
  },
  webGreetingBlock: {
    marginBottom: 22,
  },
  webGreeting: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  webSubtitle: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  webCardsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    flexWrap: 'wrap',
  },
  webOverviewFlex: {
    flex: 2,
    minWidth: 320,
  },
  webMetricCardFlex: {
    flex: 1,
    minWidth: 240,
  },
  webOverviewCard: {
    ...webShadow,
    minHeight: 310,
    borderRadius: 14,
    padding: 20,
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
    fontWeight: '800',
  },
  webOverviewBody: {
    alignItems: 'center',
  },
  webStepRingArea: {
    flex: 1,
    minWidth: 200,
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
    minHeight: 280,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
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
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
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
