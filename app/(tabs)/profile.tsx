import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings, ChevronRight, Bell, Heart, Shield, LogOut,
  Trophy, TrendingUp, Calendar, Zap, User, Flame, Dumbbell, Timer
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { useAuth } from '@/lib/auth-context';
import { api, UserStats } from '@/lib/api';

const SETTINGS = [
  { icon: Bell, title: 'Notifications', value: 'On', color: Colors.primary },
  { icon: Heart, title: 'Health Data', value: 'Connected', color: Colors.tertiary },
  { icon: Shield, title: 'Privacy', value: '', color: Colors.secondary },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => { if (user) loadStats(); }, [user]);

  async function loadStats() {
    try { setStats(await api.stats.get()); } catch {}
  }

  const displayStats = [
    { label: 'Workouts', value: (stats?.total_workouts ?? 142).toString(), icon: Trophy, color: Colors.primary, glow: Colors.primaryGlow },
    { label: 'Minutes', value: (stats?.total_minutes ?? 8450).toLocaleString(), icon: TrendingUp, color: Colors.secondary, glow: Colors.secondaryGlow },
    { label: 'Streak', value: (stats?.current_streak ?? 12).toString(), icon: Calendar, color: Colors.tertiary, glow: Colors.tertiaryGlow },
  ];

  // ─── GUEST ───
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeIn delay={0}>
            <Text style={styles.pageTitle}>Profile</Text>
          </FadeIn>

          <FadeIn delay={100}>
            <View style={styles.guestCard}>
              <LinearGradient colors={['rgba(32,183,127,0.08)', 'rgba(34,199,188,0.05)']} style={StyleSheet.absoluteFillObject} />
              <View style={styles.guestIconBox}>
                <Zap size={36} color={Colors.primary} />
              </View>
              <Text style={styles.guestTitle}>Welcome to FitPulse</Text>
              <Text style={styles.guestSub}>Sign in to sync workouts, track progress, and unlock all features.</Text>
              <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8} onPress={() => router.push('/login')}>
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.registerBtn} activeOpacity={0.8} onPress={() => router.push('/login')}>
                <Text style={styles.registerBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>

          <FadeIn delay={200}>
            <View style={styles.guestStatsRow}>
              {[
                { icon: Dumbbell, label: 'Workouts', value: '0', color: Colors.primary, glow: Colors.primaryGlow },
                { icon: Timer, label: 'Minutes', value: '0', color: Colors.secondary, glow: Colors.secondaryGlow },
                { icon: Flame, label: 'Calories', value: '0', color: Colors.tertiary, glow: Colors.tertiaryGlow },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <View key={i} style={[styles.guestStatBox, { backgroundColor: s.glow }]}>
                    <Icon size={22} color={s.color} />
                    <Text style={styles.guestStatValue}>{s.value}</Text>
                    <Text style={styles.guestStatLabel}>{s.label}</Text>
                  </View>
                );
              })}
            </View>
          </FadeIn>

          <FadeIn delay={300}>
            <Text style={styles.version}>FitPulse v1.0.0</Text>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── LOGGED IN ───
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Profile</Text>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Settings size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <View style={styles.profileSection}>
            <View style={styles.avatarWrap}>
              <View style={[styles.ringOuter, { borderColor: Colors.tertiary }]} />
              <View style={[styles.ringInner, { borderColor: Colors.primary }]} />
              <View style={styles.avatarBox}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }} style={styles.avatar} />
              </View>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO MEMBER</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          <View style={styles.statsRow}>
            {displayStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <View key={i} style={[styles.statBox, { backgroundColor: s.glow }]}>
                  <View style={styles.statIconBox}>
                    <Icon size={18} color={s.color} />
                  </View>
                  <Text style={styles.statNumber}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              );
            })}
          </View>
        </FadeIn>

        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {SETTINGS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity key={idx} style={[styles.settingItem, idx === SETTINGS.length - 1 && { borderBottomWidth: 0 }]} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconBox, { backgroundColor: `${item.color}15` }]}>
                      <Icon size={20} color={item.color} />
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

            <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={logout}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(142,142,147,0.08)' }]}>
                  <LogOut size={20} color={Colors.textMuted} />
                </View>
                <Text style={[styles.settingTitle, { color: Colors.textMuted }]}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={400}>
          <Text style={styles.version}>FitPulse v1.0.0</Text>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 150 },
  pageTitle: { fontSize: 36, fontWeight: '900', color: Colors.text, letterSpacing: -1.2, marginTop: 12, marginBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 28 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.glassBorder },

  // Guest
  guestCard: { backgroundColor: Colors.glass, borderRadius: 32, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder, marginBottom: 24, overflow: 'hidden' },
  guestIconBox: { width: 80, height: 80, borderRadius: 26, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: Colors.glassBorder },
  guestTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  guestSub: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 28, fontWeight: '500', lineHeight: 22 },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center', width: '100%', marginBottom: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  registerBtn: { backgroundColor: Colors.card, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: Colors.glassBorder },
  registerBtnText: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  guestStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  guestStatBox: { flex: 1, borderRadius: 24, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
  guestStatValue: { fontSize: 20, fontWeight: '900', color: Colors.text, marginTop: 8, marginBottom: 2 },
  guestStatLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },

  // Logged in
  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrap: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarBox: { width: 110, height: 110, borderRadius: 34, overflow: 'hidden', borderWidth: 3, borderColor: Colors.card },
  avatar: { width: '100%', height: '100%', borderRadius: 32 },
  ringOuter: { position: 'absolute', width: 128, height: 128, borderRadius: 42, borderWidth: 3, opacity: 0.5 },
  ringInner: { position: 'absolute', width: 118, height: 118, borderRadius: 38, borderWidth: 2, opacity: 0.35 },
  name: { fontSize: 26, fontWeight: '900', color: Colors.text, marginBottom: 10, letterSpacing: -0.5 },
  proBadge: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  proBadgeText: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBox: { flex: 1, borderRadius: 24, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
  statIconBox: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: Colors.glassBorder },
  statNumber: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 2 },
  statLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 16, letterSpacing: -0.5 },
  settingsCard: { backgroundColor: Colors.glass, borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  settingTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, marginRight: 8, color: Colors.textMuted, fontWeight: '700' },
  version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
});
