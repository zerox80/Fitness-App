import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Bell, Calendar, ChevronRight, LogOut, Shield, Trophy, TrendingUp, User } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { useAuth } from '@/lib/auth-context';
import { api, UserStats } from '@/lib/api';

export default function ProfileScreenWeb() {
  const { width } = useWindowDimensions();
  const isMobile = width < DESKTOP_BREAKPOINT;
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  async function loadStats() {
    try {
      setStats(await api.stats.get());
    } catch {
      setStats(null);
    }
  }

  if (!user) return null;

  const statItems = [
    { label: 'Trainings', value: stats?.total_workouts ?? 0, icon: Trophy, color: Colors.primary },
    { label: 'Minuten', value: stats?.total_minutes ?? 0, icon: TrendingUp, color: Colors.secondary },
    { label: 'Serie', value: stats?.current_streak ?? 0, icon: Calendar, color: Colors.tertiary },
  ];

  const settings = [
    { label: 'Benachrichtigungen', icon: Bell },
    { label: 'Datenschutz', icon: Shield },
    { label: 'Konto verwalten', icon: User },
  ];

  return (
    <View>
      <View style={[styles.webHeader, isMobile && styles.mobileHeader]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.webTitle, isMobile && { fontSize: 24 }]}>Profil</Text>
          <Text style={styles.webSubtitle}>{user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={18} color={Colors.tertiary} />
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileGrid, isMobile && styles.mobileGrid]}>
        <View style={styles.leftCol}>
          <View style={[styles.userCard, isMobile && styles.mobileUserCard]}>
            <View style={styles.avatarBox}>
              <User size={46} color={Colors.textMuted} />
            </View>
            <View style={styles.userCopy}>
              <Text style={[styles.userName, isMobile && { fontSize: 22 }]}>{user.name}</Text>
              <Text style={styles.userEmail}>FitPulse Konto</Text>
            </View>
          </View>

          <View style={[styles.statsRow, isMobile && styles.mobileStats]}>
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.label} style={[styles.statCard, isMobile && { minWidth: '31%' }]}>
                  <View style={[styles.iconBox, { backgroundColor: `${item.color}16` }]}>
                    <Icon size={22} color={item.color} />
                  </View>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.rightCol}>
          <View style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Einstellungen</Text>
            {settings.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity key={item.label} style={styles.settingItem} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <Icon size={19} color={Colors.textMuted} />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 28 },
  mobileHeader: { flexDirection: 'column', alignItems: 'flex-start', gap: 16 },
  headerCopy: { flex: 1, minWidth: 0 },
  webTitle: { fontSize: 30, fontWeight: '800', color: Colors.text, lineHeight: 36 },
  webSubtitle: { fontSize: 16, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 11, backgroundColor: Colors.tertiaryGlow, borderWidth: 1, borderColor: '#F0C9CD' },
  logoutText: { color: Colors.tertiary, fontWeight: '800', fontSize: 14 },
  profileGrid: { flexDirection: 'row', gap: 18 },
  mobileGrid: { flexDirection: 'column' },
  leftCol: { flex: 2, gap: 14 },
  rightCol: { flex: 1 },
  userCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 18, borderWidth: 1, borderColor: Colors.borderSoft },
  mobileUserCard: { flexDirection: 'column', alignItems: 'flex-start' },
  avatarBox: { width: 82, height: 82, borderRadius: 18, backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderSoft },
  userCopy: { flex: 1, minWidth: 0 },
  userName: { fontSize: 26, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 15, color: Colors.textMuted, marginTop: 4, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 14 },
  mobileStats: { flexWrap: 'wrap' },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: Colors.borderSoft },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', marginTop: 4 },
  settingsCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: Colors.borderSoft },
  cardTitle: { fontSize: 19, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
});
