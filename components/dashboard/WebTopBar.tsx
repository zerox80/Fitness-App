import React from 'react';
import { View, Text } from 'react-native';
import { CalendarDays, User as UserIcon } from 'lucide-react-native';
import { palette } from '@/constants/dashboard-constants';
import { webStyles } from './dashboard-web.styles';

export function WebTopBar({ collapsed }: { collapsed?: boolean }) {
  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <View style={[webStyles.webTopBar, collapsed && { paddingHorizontal: 20 }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>FitPulse</Text>
        <Text style={{ color: palette.muted, fontSize: 13, fontWeight: '500', marginTop: 2 }}>Training, Aktivität und Fortschritt</Text>
      </View>
      <View style={[webStyles.topActions, { gap: 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 38, borderRadius: 10, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}>
          <CalendarDays size={18} color={palette.muted} strokeWidth={2.1} />
          <Text style={{ color: palette.muted, fontSize: 13, fontWeight: '600' }}>{today}</Text>
        </View>
        <View style={[webStyles.webAvatar, { backgroundColor: palette.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}>
          <UserIcon size={24} color={palette.muted} />
        </View>
      </View>
    </View>
  );
}
