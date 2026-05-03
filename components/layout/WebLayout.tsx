import React from 'react';
import { View, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebSidebar } from '@/components/dashboard/WebSidebar';
import { WebTopBar } from '@/components/dashboard/WebTopBar';
import { webStyles } from '@/components/dashboard/dashboard-web.styles';
import { DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView style={webStyles.webSafeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={webStyles.webShell}>
        <WebSidebar />
        <View style={webStyles.webMain}>
          <WebTopBar />
          <ScrollView 
            contentContainerStyle={webStyles.webScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <View style={webStyles.webContent}>
              {children}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
