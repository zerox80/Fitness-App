import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, ChevronRight, LogOut, Shield, Trophy, TrendingUp, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { useAuth } from '@/lib/auth-context';
import { api, UserStats } from '@/lib/api';

const SETTINGS = [
  { icon: Bell, title: 'Benachrichtigungen', value: 'Aktiv', color: Colors.primary },
  { icon: Shield, title: 'Datenschutz', value: '', color: Colors.secondary },
  { icon: User, title: 'Konto verwalten', value: '', color: Colors.textMuted },
];

function membershipYear(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear());
}

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 650;
  const { user, logout } = useAuth();
  const router = useRouter();
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

  const displayStats = [
    { label: 'Trainings', value: stats?.total_workouts ?? 0, icon: Trophy, color: Colors.primary },
    { label: 'Minuten', value: stats?.total_minutes ?? 0, icon: TrendingUp, color: Colors.secondary },
    { label: 'Serie', value: stats?.current_streak ?? 0, icon: Calendar, color: Colors.tertiary },
  ];
  const joinedYear = membershipYear(user?.created_at ?? '');

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scrollContent, isWide && styles.wideContent]} showsVerticalScrollIndicator={false}>
          <FadeIn delay={0}>
            <Text style={styles.pageTitle}>Profil</Text>
          </FadeIn>

          <FadeIn delay={100}>
            <View style={styles.guestCard}>
              <View style={styles.avatarBox}>
                <User size={40} color={Colors.textMuted} />
              </View>
              <Text style={styles.guestTitle}>FitPulse nutzen</Text>
              <Text style={styles.guestSub}>Melde dich an, um Trainings und Fortschritt zu synchronisieren.</Text>
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => router.push('/login')}>
                <Text style={styles.primaryBtnText}>Anmelden</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isWide && styles.wideContent]} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Profil</Text>
              <Text style={styles.pageSubtitle}>{user.email}</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <View style={[styles.userCard, isWide && styles.userCardWide]}>
            <View style={styles.avatarBox}>
              <User size={42} color={Colors.textMuted} />
            </View>
            <View style={styles.userCopy}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.memberText}>
                {joinedYear ? `Mitglied seit ${joinedYear}` : 'FitPulse Konto'}
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <View style={[styles.statsRow, !isWide && styles.statsWrap]}>
            {displayStats.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.label} style={[styles.statBox, !isWide && styles.statBoxMobile]}>
                  <View style={[styles.statIconBox, { backgroundColor: `${item.color}16` }]}>
                    <Icon size={20} color={item.color} />
                  </View>
                  <Text style={styles.statNumber}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </FadeIn>

        <FadeIn delay={260}>
          <Text style={styles.sectionTitle}>Einstellungen</Text>
          <View style={styles.settingsCard}>
            {SETTINGS.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity key={item.title} style={styles.settingItem} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconBox, { backgroundColor: `${item.color}14` }]}>
                      <Icon size={19} color={item.color} />
                    </View>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value ? <Text style={styles.settingValue}>{item.value}</Text> : null}
                    <ChevronRight size={18} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={[styles.settingItem, styles.lastItem]} activeOpacity={0.7} onPress={logout}>
              <View style={styles.settingLeft}>
                <View style={styles.logoutIconBox}>
                  <LogOut size={19} color={Colors.tertiary} />
                </View>
                <Text style={[styles.settingTitle, { color: Colors.tertiary }]}>Abmelden</Text>
              </View>
            </TouchableOpacity>
          </View>
        </FadeIn>

        <Text style={styles.version}>FitPulse v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 150, width: '100%', maxWidth: 860, alignSelf: 'center' },
  wideContent: { maxWidth: 960 },
  header: { marginTop: 12, marginBottom: 20 },
  pageTitle: { fontSize: 30, fontWeight: '800', color: Colors.text, lineHeight: 36 },
  pageSubtitle: { fontSize: 15, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },
  userCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: Colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  userCardWide: { padding: 22 },
  avatarBox: { width: 72, height: 72, borderRadius: 18, backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderSoft },
  userCopy: { flex: 1, minWidth: 0 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  memberText: { fontSize: 14, fontWeight: '500', color: Colors.textMuted },
  guestCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 22, borderWidth: 1, borderColor: Colors.borderSoft, alignItems: 'center', marginTop: 18 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 18, marginBottom: 6 },
  guestSub: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 22 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 12, minHeight: 48, paddingHorizontal: 26, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  statsWrap: { flexWrap: 'wrap' },
  statBox: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderSoft },
  statBoxMobile: { minWidth: '31%' },
  statIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statNumber: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  settingsCard: { backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.borderSoft, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  lastItem: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoutIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.tertiaryGlow },
  settingTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
});
