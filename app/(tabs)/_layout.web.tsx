import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, useWindowDimensions, Platform, Modal, Pressable } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Menu, X } from 'lucide-react-native';
import { WebSidebar } from '@/components/dashboard/WebSidebar';
import { WebTopBar } from '@/components/dashboard/WebTopBar';
import { webStyles } from '@/components/dashboard/dashboard-web.styles';
import { palette, DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { Colors } from '@/constants/Colors';

export default function WebTabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  const isMedium = isDesktop && width < 1100;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '/(tabs)';

  if (!isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <StatusBar style="dark" />
        <MobileTopBar onMenuPress={() => setDrawerOpen(true)} />
        {isHome ? (
          <Slot />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Slot />
          </ScrollView>
        )}
        <MobileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
      height: 58,
      backgroundColor: Colors.card,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderSoft,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    }}>
      <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={{ padding: 4 }}>
        <Menu size={24} color={palette.text} />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '800', color: palette.text }}>FitPulse</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function MobileDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(23,33,43,0.28)' }} onPress={onClose}>
        <Pressable style={{ width: 280, height: '100%', backgroundColor: Colors.card }} onPress={(e) => e.stopPropagation()}>
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
