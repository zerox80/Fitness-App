import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Settings, LogOut, Trophy, TrendingUp, Calendar, User, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { useAuth } from '@/lib/auth-context';
import { api, UserStats } from '@/lib/api';

const MOBILE_BP = 600;

export default function ProfileScreenWeb() {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BP;
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => { if (user) loadStats(); }, [user]);

  async function loadStats() {
    try { setStats(await api.stats.get()); } catch {}
  }

  if (!user) return null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.webHeader}>
        <Text style={styles.webTitle}>Mein Profil</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={20} color="#FF4B4B" />
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileGrid, isMobile && { flexDirection: 'column' }]}>
        {/* Left Column: Info & Stats */}
        <View style={styles.leftCol}>
          <View style={[styles.userCard, isMobile && { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={styles.avatarBox}>
              <User size={60} color={Colors.textMuted} />
            </View>
            <View>
              <Text style={[styles.userName, isMobile && { fontSize: 22 }]}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO MITGLIED</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsRow, isMobile && { flexWrap: 'wrap' }]}>
            {[
              { label: 'Trainings', value: stats?.total_workouts ?? 0, icon: Trophy, color: Colors.primary },
              { label: 'Minuten', value: stats?.total_minutes ?? 0, icon: TrendingUp, color: Colors.secondary },
              { label: 'Streak', value: stats?.current_streak ?? 0, icon: Calendar, color: Colors.tertiary },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <View key={i} style={[styles.statCard, isMobile && { minWidth: '45%' }]}>
                  <View style={[styles.iconBox, { backgroundColor: `${s.color}15` }]}>
                    <Icon size={24} color={s.color} />
                  </View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Right Column: Settings */}
        <View style={styles.rightCol}>
          <View style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Einstellungen</Text>
            {[
              { label: 'Benachrichtigungen', icon: Settings },
              { label: 'Datenschutz', icon: Settings },
              { label: 'Konto verwalten', icon: User },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity key={i} style={styles.settingItem} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <Icon size={20} color={Colors.textMuted} />
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
  webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  webTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFE0E0' },
  logoutText: { color: '#FF4B4B', fontWeight: '800', fontSize: 14 },
  profileGrid: { flexDirection: 'row', gap: 32 },
  leftCol: { flex: 2, gap: 32 },
  rightCol: { flex: 1 },
  userCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, flexDirection: 'row', alignItems: 'center', gap: 24, borderWidth: 1, borderColor: Colors.glassBorder },
  avatarBox: { width: 100, height: 100, borderRadius: 32, backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  userEmail: { fontSize: 16, color: Colors.textMuted, marginTop: 4, marginBottom: 12 },
  proBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  proBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 20 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
  iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statValue: { fontSize: 28, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 14, color: Colors.textMuted, fontWeight: '600', marginTop: 4 },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: Colors.glassBorder },
  cardTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 20 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
});
