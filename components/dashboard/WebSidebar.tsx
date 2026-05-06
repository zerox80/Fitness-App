import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { palette, sidebarItems } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';

import { router, usePathname } from 'expo-router';

function WebLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <View style={[webStyles.logoRow, collapsed && { justifyContent: 'center', marginBottom: 30 }]}>
      <View style={webStyles.logoMark}>
        <View style={webStyles.logoTop} />
        <View style={webStyles.logoMiddle} />
        <View style={webStyles.logoBottom} />
      </View>
      {!collapsed && <Text style={webStyles.logoText}>FitPulse</Text>}
    </View>
  );
}

export function WebSidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const navigateTo = (label: string) => {
    switch (label) {
      case 'Übersicht': router.push('/(tabs)'); break;
      case 'Aktivität': router.push('/(tabs)/tasks'); break;
      case 'Trainings': router.push('/(tabs)/workout'); break;
      case 'Profil': router.push('/(tabs)/profile'); break;
      case 'Ernährung': case 'Ziele': alert('Kommt bald!'); break;
    }
  };

  const isActive = (label: string) => {
    if (label === 'Übersicht') return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';
    if (label === 'Aktivität') return pathname.includes('/tasks');
    if (label === 'Trainings') return pathname.includes('/workout');
    if (label === 'Profil') return pathname.includes('/profile');
    return false;
  };

  return (
    <View style={[webStyles.webSidebar, collapsed && { width: 80, paddingHorizontal: 0 }]}>
      <WebLogo collapsed={collapsed} />
      <View style={webStyles.sidebarNav}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.label);
          return (
            <TouchableOpacity 
              key={item.label} 
              activeOpacity={0.75} 
              style={[
                webStyles.sidebarItem, 
                active && webStyles.sidebarItemActive,
                collapsed && { paddingHorizontal: 0, justifyContent: 'center', borderLeftWidth: 0 }
              ]}
              onPress={() => navigateTo(item.label)}
            >
              <Icon size={22} color={active ? palette.greenDark : palette.muted} fill={active ? palette.greenDark : 'transparent'} strokeWidth={2.1} />
              {!collapsed && <Text style={[webStyles.sidebarText, active && webStyles.sidebarTextActive]}>{item.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity 
        activeOpacity={0.75} 
        style={[webStyles.sidebarSettings, collapsed && { paddingHorizontal: 0, justifyContent: 'center' }]} 
        onPress={() => alert('Einstellungen kommen bald!')}
      >
        <Settings size={23} color={palette.muted} strokeWidth={2.1} />
        {!collapsed && <Text style={webStyles.sidebarText}>Einstellungen</Text>}
      </TouchableOpacity>
    </View>
  );
}
