import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, useWindowDimensions, Platform, Modal, Pressable } from 'react-native';
import { Slot, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Menu, X } from 'lucide-react-native';
import { WebSidebar } from '@/components/dashboard/WebSidebar';
import { WebTopBar } from '@/components/dashboard/WebTopBar';
import { webStyles } from '@/components/dashboard/dashboard-web.styles';
import { palette } from '@/constants/dashboard-constants';

const DESKTOP_BREAKPOINT = 900;

export default function WebTabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  const isMedium = isDesktop && width < 1100;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  if (!isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
        <StatusBar style="dark" />
        <MobileTopBar onMenuPress={() => setDrawerOpen(true)} />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Slot />
        </ScrollView>
        <MobileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <StatusBar style="dark" />
      <View style={webStyles.webShell}>
        <WebSidebar collapsed={isMedium} />
        <View style={webStyles.webMain}>
          <WebTopBar collapsed={isMedium} />
          <ScrollView
            contentContainerStyle={webStyles.webScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={webStyles.webContent}>
              <Slot />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function MobileTopBar({ onMenuPress }: { onMenuPress: () => void }) {
  return (
    <View style={{
      height: 56,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E3E7EB',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    }}>
      <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={{ padding: 4 }}>
        <Menu size={24} color={palette.text} />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '900', color: palette.text }}>FitPulse</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function MobileDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={onClose}>
        <Pressable style={{ width: 280, height: '100%', backgroundColor: '#FFFFFF' }} onPress={(e) => e.stopPropagation()}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={24} color={palette.text} />
            </TouchableOpacity>
          </View>
          <WebSidebar />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
