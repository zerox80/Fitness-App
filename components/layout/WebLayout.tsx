import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebSidebar } from '@/components/dashboard/WebSidebar';
import { WebTopBar } from '@/components/dashboard/WebTopBar';
import { webStyles } from '@/components/dashboard/dashboard-web.styles';
import { DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { Colors } from '@/constants/Colors';

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  if (!isDesktop) {
    return <>{children}</>;
  }

  const isUltraWide = width >= 2000;
  const isMedium = width < 1200;

  return (
    <SafeAreaView style={[webStyles.webSafeArea, isUltraWide && { backgroundColor: Colors.background }]} edges={['top']}>
      <StatusBar style="dark" />
      <View style={[webStyles.webShell, isUltraWide && { maxWidth: 2200, alignSelf: 'center' }]}>
        <WebSidebar collapsed={isMedium} />
        <View style={webStyles.webMain}>
          <WebTopBar collapsed={isMedium} />
          <View style={webStyles.webContent}>
            {children}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
