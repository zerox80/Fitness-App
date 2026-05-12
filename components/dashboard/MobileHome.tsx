import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  RefreshControl,
  Platform,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { FadeIn } from '@/components/FadeIn';
import { DashboardData, avatarUri, palette, WIDE_BREAKPOINT } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';
import { OverviewCard } from './OverviewCard';
import { HeartCard } from './HeartCard';
import { WeekCard } from './WeekCard';
import { TrainingList } from './TrainingList';
import { DateRow } from './DateRow';
import { CalorieChatCard } from '@/components/activity/CalorieChatCard';

export function MobileHome({ data }: { data: DashboardData }) {
  const { width } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
  const isCompact = viewportWidth < 430;
  const isNarrow = viewportWidth < 380;
  const isWide = viewportWidth >= WIDE_BREAKPOINT;
  const mobileFrameStyle: StyleProp<ViewStyle> = Platform.OS === 'web'
    ? [styles.webMobileFrame, { width: Math.max(0, viewportWidth - 40) }]
    : null;
  const avatarSource = avatarUri ? { uri: avatarUri } : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && { maxWidth: 800 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={data.onRefresh} tintColor={palette.green} />}
      >
        <FadeIn delay={0} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.header, mobileFrameStyle]}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>{data.name ? `Hallo, ${data.name}` : 'Hallo'}</Text>
              <Text style={styles.subtitle}>Dein aktueller Tag im Überblick.</Text>
            </View>
            <Image source={avatarSource} style={styles.avatar} />
          </View>
        </FadeIn>

        <FadeIn delay={80} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.sectionHeader, mobileFrameStyle]}>
            <Text style={styles.sectionTitle}>Tagesübersicht</Text>
            <DateRow dateLabel={data.dateLabel} />
          </View>
        </FadeIn>

        <FadeIn delay={140} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.mobileSection, mobileFrameStyle]}>
            <OverviewCard compact={isCompact} data={data} />
          </View>
        </FadeIn>

        <FadeIn delay={200} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.mobileSection, mobileFrameStyle]}>
            <CalorieChatCard onActivityUpdated={data.onActivityUpdated} />
          </View>
        </FadeIn>

        <View style={[styles.smallCardsRow, mobileFrameStyle, { width: '100%' }, isNarrow && { flexDirection: 'column' }]}>
          <FadeIn delay={280} style={[styles.smallCardFlex, isNarrow && { minWidth: '100%' }]}>
            <HeartCard />
          </FadeIn>

          <FadeIn delay={340} style={[styles.smallCardFlex, isNarrow && { minWidth: '100%' }]}>
            <WeekCard compact={isNarrow} summary={data.weeklySummary} />
          </FadeIn>
        </View>

        <FadeIn delay={400} style={[styles.mobileSection, mobileFrameStyle, { width: '100%' }]}>
          <TrainingList />
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}
