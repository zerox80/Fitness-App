import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { FadeIn } from '@/components/FadeIn';
import { DashboardData } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';
import { OverviewCard } from './OverviewCard';
import { HeartCard } from './HeartCard';
import { WeekCard } from './WeekCard';
import { TrainingList } from './TrainingList';
import { WebSidebar } from './WebSidebar';
import { WebTopBar } from './WebTopBar';

import { useWindowDimensions } from 'react-native';

export function WebDashboard({ data }: { data: DashboardData }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const isMedium = width < 1100;

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={[webStyles.webScrollContent, isMedium && { paddingHorizontal: 24 }, isMobile && { paddingHorizontal: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={webStyles.webContent}>
        <FadeIn delay={0}>
          <View style={webStyles.webGreetingBlock}>
            <Text style={[webStyles.webGreeting, isMobile && { fontSize: 24, lineHeight: 30 }]}>Hallo, {data.name}! 👋</Text>
            <Text style={[webStyles.webSubtitle, isMobile && { fontSize: 15 }]}>Schön, dass du dranbleibst.</Text>
          </View>
        </FadeIn>

        <View style={[webStyles.webCardsRow, isMobile && { flexDirection: 'column' }]}>
          <FadeIn delay={80} style={[webStyles.webOverviewFlex, isMobile && { minWidth: '100%' }]}>
            <OverviewCard data={data} desktop={!isMobile} />
          </FadeIn>
          <FadeIn delay={140} style={[webStyles.webMetricCardFlex, isMobile && { minWidth: '100%' }]}>
            <HeartCard desktop={!isMobile} />
          </FadeIn>
          <FadeIn delay={200} style={[webStyles.webMetricCardFlex, isMobile && { minWidth: '100%' }]}>
            <WeekCard desktop={!isMobile} />
          </FadeIn>
        </View>

        <FadeIn delay={260}>
          <View style={webStyles.webTrainingSection}>
            <TrainingList desktop />
          </View>
        </FadeIn>
      </View>
    </ScrollView>
  );
}
