import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, ChevronRight, Shield } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/forms/Button';
import { FadeIn } from '@/components/FadeIn';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

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

        <FadeIn delay={300}>
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
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  header: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 12,
    marginBottom: 24,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
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
    fontWeight: '600',
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
