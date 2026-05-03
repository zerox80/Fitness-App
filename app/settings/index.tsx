import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Moon, Volume2, Info, ChevronRight, Shield } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/forms/Button';
import { FadeIn } from '@/components/FadeIn';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [soundEffects, setSoundEffects] = React.useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <Text style={styles.header}>Einstellungen</Text>
        </FadeIn>

        <FadeIn delay={100}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Konto</Text>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>E-Mail</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{user?.email || 'Nicht angemeldet'}</Text>
                <ChevronRight size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>Name</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{user?.name || '—'}</Text>
                <ChevronRight size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: Colors.primaryGlow }]}>
                  <Bell size={18} color={Colors.primary} />
                </View>
                <Text style={styles.rowLabel}>Benachrichtigungen</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.cardLight, true: `${Colors.primary}40` }}
                thumbColor={notifications ? Colors.primary : Colors.textMuted}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: Colors.secondaryGlow }]}>
                  <Moon size={18} color={Colors.secondary} />
                </View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.cardLight, true: `${Colors.secondary}40` }}
                thumbColor={darkMode ? Colors.secondary : Colors.textMuted}
              />
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: Colors.tertiaryGlow }]}>
                  <Volume2 size={18} color={Colors.tertiary} />
                </View>
                <Text style={styles.rowLabel}>Sound-Effekte</Text>
              </View>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: Colors.cardLight, true: `${Colors.tertiary}40` }}
                thumbColor={soundEffects ? Colors.tertiary : Colors.textMuted}
              />
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Über</Text>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: Colors.cardLight }]}>
                  <Info size={18} color={Colors.textMuted} />
                </View>
                <Text style={styles.rowLabel}>Version</Text>
              </View>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: Colors.cardLight }]}>
                  <Shield size={18} color={Colors.textMuted} />
                </View>
                <Text style={styles.rowLabel}>Build</Text>
              </View>
              <Text style={styles.rowValue}>2026.04.23</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={400}>
          <View style={styles.logoutSection}>
            <Button title="Abmelden" variant="danger" onPress={logout} />
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  header: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 12,
    marginBottom: 24,
  },
  section: {
    backgroundColor: Colors.glass,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 8,
  },
});
