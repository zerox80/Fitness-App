import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Bell, Search } from 'lucide-react-native';
import { avatarUri, palette } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';

export function WebTopBar() {
  return (
    <View style={webStyles.webTopBar}>
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
