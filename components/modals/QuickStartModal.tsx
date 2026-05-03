import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, Clock, Zap, Target, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';

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
  { label: 'Full Body', value: 'Full Body' },
  { label: 'Upper Body', value: 'Upper Body' },
  { label: 'Lower Body', value: 'Lower Body' },
  { label: 'Core', value: 'Core' },
];

const INTENSITIES = [
  { label: 'Easy', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Hard', value: 'High' },
];

export function QuickStartModal({ visible, onClose, onGenerate, loading }: QuickStartModalProps) {
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState('Full Body');
  const [intensity, setIntensity] = useState('Medium');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={24} color={Colors.primary} />
              <Text style={styles.title}>AI Schnellstart</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Generiere dein personalisiertes Training in Sekunden.</Text>

          {/* Duration */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={18} color={Colors.text} />
              <Text style={styles.sectionTitle}>Zeit</Text>
            </View>
            <View style={styles.chipRow}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.chip, duration === d.value && styles.chipActive]}
                  onPress={() => setDuration(d.value)}
                  disabled={loading}
                >
                  <Text style={[styles.chipText, duration === d.value && styles.chipTextActive]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Focus */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={18} color={Colors.text} />
              <Text style={styles.sectionTitle}>Fokus</Text>
            </View>
            <View style={styles.chipRow}>
              {FOCUS_AREAS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.chip, focus === f.value && styles.chipActive]}
                  onPress={() => setFocus(f.value)}
                  disabled={loading}
                >
                  <Text style={[styles.chipText, focus === f.value && styles.chipTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Intensity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={18} color={Colors.text} />
              <Text style={styles.sectionTitle}>Intensität</Text>
            </View>
            <View style={styles.chipRow}>
              {INTENSITIES.map((i) => (
                <TouchableOpacity
                  key={i.value}
                  style={[styles.chip, intensity === i.value && styles.chipActive]}
                  onPress={() => setIntensity(i.value)}
                  disabled={loading}
                >
                  <Text style={[styles.chipText, intensity === i.value && styles.chipTextActive]}>{i.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
            onPress={() => onGenerate(duration, focus, intensity)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.generateBtnText}>Training generieren</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: Colors.background,
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.cardLight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
