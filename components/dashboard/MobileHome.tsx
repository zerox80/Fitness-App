import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { FadeIn } from '@/components/FadeIn';
import { DashboardData, avatarUri, palette } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';
import { OverviewCard } from './OverviewCard';
import { HeartCard } from './HeartCard';
import { WeekCard } from './WeekCard';
import { TrainingList } from './TrainingList';
import { DateRow } from './DateRow';

export function MobileHome({ data }: { data: DashboardData }) {
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
        <FadeIn delay={0} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.header, mobileFrameStyle]}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>Hallo, {data.name}! 👋</Text>
              <Text style={styles.subtitle}>Schön, dass du dranbleibst.</Text>
            </View>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>
        </FadeIn>

        <FadeIn delay={80} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.sectionHeader, mobileFrameStyle]}>
            <Text style={styles.sectionTitle}>Heute im Überblick</Text>
            <DateRow dateLabel={data.dateLabel} />
          </View>
        </FadeIn>

        <FadeIn delay={140} style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.mobileSection, mobileFrameStyle]}>
            <OverviewCard compact={isCompact} data={data} />
          </View>
        </FadeIn>

        <View style={[styles.smallCardsRow, mobileFrameStyle, { width: '100%' }]}>
          <FadeIn delay={220} style={styles.smallCardFlex}>
            <HeartCard />
          </FadeIn>

          <FadeIn delay={280} style={styles.smallCardFlex}>
            <WeekCard />
          </FadeIn>
        </View>

        <FadeIn delay={340} style={[styles.mobileSection, mobileFrameStyle, { width: '100%' }]}>
          <TrainingList />
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}
