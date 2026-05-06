import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Layout } from '@/constants/Colors';

type AppPageProps = {
  children: React.ReactNode;
  maxWidth?: number;
  padded?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function useResponsive() {
  const { width } = useWindowDimensions();
  return {
    width,
    isCompactPhone: width < Layout.compactPhone,
    isPhone: width < Layout.phone,
    isTablet: width >= Layout.phone && width < Layout.tablet,
    isDesktop: Platform.OS === 'web' && width >= Layout.desktop,
    isWideDesktop: Platform.OS === 'web' && width >= Layout.desktopExpanded,
  };
}

export function AppPage({ children, maxWidth = Layout.pageMax, padded = true, scroll = true, style }: AppPageProps) {
  const { isDesktop } = useResponsive();
  const contentStyle = [
    styles.content,
    padded && styles.padded,
    isDesktop && styles.desktopContent,
    { maxWidth },
    style,
  ];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={contentStyle}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingCopy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.headingAction}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 128,
  },
  padded: {
    paddingHorizontal: 20,
  },
  desktopContent: {
    paddingHorizontal: 28,
    paddingBottom: 72,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 14,
    marginBottom: 22,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  headingAction: {
    flexShrink: 0,
  },
  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    marginTop: 4,
  },
});
