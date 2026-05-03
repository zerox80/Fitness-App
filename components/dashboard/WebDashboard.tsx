import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';

import { FadeIn } from '@/components/FadeIn';
import { DashboardData, DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';
import { OverviewCard } from './OverviewCard';
import { HeartCard } from './HeartCard';
import { WeekCard } from './WeekCard';
import { TrainingList } from './TrainingList';

export function WebDashboard({ data }: { data: DashboardData }) {
  const { width } = useWindowDimensions();
  const isMobile = width < DESKTOP_BREAKPOINT;

  return (
    <View style={[webStyles.webContent, isMobile && { maxWidth: 560 }]}>
      <FadeIn delay={0}>
        <View style={webStyles.webGreetingBlock}>
          <Text style={[webStyles.webGreeting, isMobile && { fontSize: 24, lineHeight: 30 }]}>Hallo, {data.name}! 👋</Text>
          <Text style={[webStyles.webSubtitle, isMobile && { fontSize: 15 }]}>Schön, dass du dranbleibst.</Text>
        </View>
      </FadeIn>

      <View style={[webStyles.webCardsRow, isMobile && { flexDirection: 'column' }]}>
        <FadeIn delay={80} style={[webStyles.webOverviewFlex, isMobile && { minWidth: '100%' }]}>
          <OverviewCard data={data} desktop={!isMobile} compact={isMobile} />
        </FadeIn>
        <FadeIn delay={140} style={[webStyles.webMetricCardFlex, isMobile && { minWidth: '100%' }]}>
          <HeartCard desktop={!isMobile} />
        </FadeIn>
        <FadeIn delay={200} style={[webStyles.webMetricCardFlex, isMobile && { minWidth: '100%' }]}>
          <WeekCard desktop={!isMobile} compact={isMobile} />
        </FadeIn>
      </View>

      <FadeIn delay={260}>
        <View style={webStyles.webTrainingSection}>
          <TrainingList desktop />
        </View>
      </FadeIn>
    </View>
  );
}
