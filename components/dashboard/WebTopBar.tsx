import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, Search, User as UserIcon } from 'lucide-react-native';
import { palette } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';

export function WebTopBar({ collapsed }: { collapsed?: boolean }) {
  return (
    <View style={[webStyles.webTopBar, collapsed && { paddingHorizontal: 20 }]}>
      <View style={webStyles.searchBox}>
        <Search size={22} color={palette.muted} strokeWidth={2.1} />
        <Text style={webStyles.searchPlaceholder}>Suche nach Aktivitäten, Trainings...</Text>
      </View>
      <View style={webStyles.topActions}>
        <TouchableOpacity activeOpacity={0.75} style={webStyles.notificationButton}>
          <Bell size={25} color="#4A5564" strokeWidth={2.1} />
        </TouchableOpacity>
        <View style={[webStyles.webAvatar, { backgroundColor: palette.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}>
          <UserIcon size={24} color={palette.muted} />
        </View>
      </View>
    </View>
  );
}
