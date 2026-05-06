import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { X, Clock, Zap, Target } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface QuickStartModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (duration: number, focus: string, intensity: string) => void;
  loading: boolean;
}

const DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
];

const FOCUS_AREAS = [
  { label: 'Ganzkörper', value: 'Full Body' },
  { label: 'Oberkörper', value: 'Upper Body' },
  { label: 'Unterkörper', value: 'Lower Body' },
  { label: 'Core', value: 'Core' },
];

const INTENSITIES = [
  { label: 'Leicht', value: 'Low' },
  { label: 'Mittel', value: 'Medium' },
  { label: 'Intensiv', value: 'High' },
];

export function QuickStartModal({ visible, onClose, onGenerate, loading }: QuickStartModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState('Full Body');
  const [intensity, setIntensity] = useState('Medium');

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={onClose}>
      <View style={[styles.overlay, isDesktop ? styles.centerOverlay : styles.bottomOverlay]}>
        <View style={[styles.content, isDesktop ? styles.desktopContent : styles.sheetContent]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Schnellstart</Text>
              <Text style={styles.subtitle}>Erstelle einen Trainingsvorschlag für heute.</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeBtn}>
              <X size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={18} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>Zeit</Text>
            </View>
            <View style={styles.chipRow}>
              {DURATIONS.map((item) => (
                <TouchableOpacity key={item.value} style={[styles.chip, duration === item.value && styles.chipActive]} onPress={() => setDuration(item.value)} disabled={loading}>
                  <Text style={[styles.chipText, duration === item.value && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={18} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>Fokus</Text>
            </View>
            <View style={styles.chipRow}>
              {FOCUS_AREAS.map((item) => (
                <TouchableOpacity key={item.value} style={[styles.chip, focus === item.value && styles.chipActive]} onPress={() => setFocus(item.value)} disabled={loading}>
                  <Text style={[styles.chipText, focus === item.value && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={18} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>Intensität</Text>
            </View>
            <View style={styles.chipRow}>
              {INTENSITIES.map((item) => (
                <TouchableOpacity key={item.value} style={[styles.chip, intensity === item.value && styles.chipActive]} onPress={() => setIntensity(item.value)} disabled={loading}>
                  <Text style={[styles.chipText, intensity === item.value && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.generateBtn, loading && styles.generateBtnDisabled]} onPress={() => onGenerate(duration, focus, intensity)} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.generateBtnText}>Training planen</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23,33,43,0.32)',
    padding: 18,
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    width: '100%',
  },
  desktopContent: {
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
  },
  sheetContent: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 22,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.cardLight,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  generateBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  generateBtnDisabled: {
    opacity: 0.65,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
