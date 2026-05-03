import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { palette, sidebarItems } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';

import { router } from 'expo-router';

function WebLogo() {
  return (
    <View style={webStyles.logoRow}>
      <View style={webStyles.logoMark}>
        <View style={webStyles.logoTop} />
        <View style={webStyles.logoMiddle} />
        <View style={webStyles.logoBottom} />
      </View>
      <Text style={webStyles.logoText}>FitPulse</Text>
    </View>
  );
}

export function WebSidebar() {
  const navigateTo = (label: string) => {
    switch (label) {
      case 'Übersicht': router.push('/(tabs)'); break;
      case 'Aktivität': router.push('/(tabs)/tasks'); break;
      case 'Trainings': router.push('/(tabs)/workout'); break;
      case 'Profil': router.push('/(tabs)/profile'); break;
      case 'Ernährung': case 'Ziele': alert('Kommt bald!'); break;
    }
  };

  return (
    <View style={webStyles.webSidebar}>
      <WebLogo />
      <View style={webStyles.sidebarNav}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity 
              key={item.label} 
              activeOpacity={0.75} 
              style={[webStyles.sidebarItem, item.active && webStyles.sidebarItemActive]}
              onPress={() => navigateTo(item.label)}
            >
              <Icon size={23} color={item.active ? palette.greenDark : palette.muted} fill={item.active ? palette.greenDark : 'transparent'} strokeWidth={2.1} />
              <Text style={[webStyles.sidebarText, item.active && webStyles.sidebarTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity activeOpacity={0.75} style={webStyles.sidebarSettings} onPress={() => alert('Einstellungen kommen bald!')}>
        <Settings size={23} color={palette.muted} strokeWidth={2.1} />
        <Text style={webStyles.sidebarText}>Einstellungen</Text>
      </TouchableOpacity>
    </View>
  );
}
