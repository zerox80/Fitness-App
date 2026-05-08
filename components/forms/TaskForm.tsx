import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';
import {
  TaskRecurrence, TaskCategory, Weekday,
  TASK_RECURRENCE_LABELS, TASK_CATEGORY_LABELS, WEEKDAY_LABELS,
} from '@/types';
import { CreateTaskData } from '@/lib/api';

const CUSTOM_DAYS_REQUIRED_MESSAGE = 'Bitte wähle mindestens einen Wochentag aus.';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => Promise<void> | void;
}

export function TaskForm({ visible, onClose, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('daily');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [customDays, setCustomDays] = useState<Weekday[]>([]);
  const [targetSets, setTargetSets] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const trimmedTitle = title.trim();
  const requiresCustomDays = recurrence === 'custom' && customDays.length === 0;
  const canSubmit = trimmedTitle.length > 0 && !requiresCustomDays && !submitting;
  const visibleSubmitError = submitError ?? (trimmedTitle && requiresCustomDays ? CUSTOM_DAYS_REQUIRED_MESSAGE : null);

  const toggleDay = (day: Weekday) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setSubmitError(null);
  };

  const handleRecurrenceChange = (nextRecurrence: TaskRecurrence) => {
    setRecurrence(nextRecurrence);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!trimmedTitle || submitting) return;

    if (requiresCustomDays) {
      setSubmitError(CUSTOM_DAYS_REQUIRED_MESSAGE);
      return;
    }

    const parsedTargetSets = Number.parseInt(targetSets, 10);
    const nextTargetSets = Number.isNaN(parsedTargetSets) ? 1 : parsedTargetSets;
    if (nextTargetSets < 1 || nextTargetSets > 50) {
      setSubmitError('Anzahl Sätze muss zwischen 1 und 50 liegen.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        recurrence,
        category,
        custom_days: recurrence === 'custom' ? customDays : undefined,
        target_sets: nextTargetSets,
      });
      resetForm();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Aufgabe konnte nicht erstellt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRecurrence('daily');
    setCategory('general');
    setCustomDays([]);
    setTargetSets('1');
    setSubmitError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Neue Aufgabe</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <X size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Input
            label="Titel"
            value={title}
            onChangeText={setTitle}
            placeholder="z.B. 30 Minuten joggen"
            error={title.trim() === '' ? undefined : undefined}
          />

          <Input
            label="Beschreibung (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Optionale Beschreibung"
          />

          <Text style={styles.label}>Wiederholung</Text>
          <View style={styles.optionGrid}>
            {(Object.keys(TASK_RECURRENCE_LABELS) as TaskRecurrence[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.optionBtn, recurrence === r && styles.optionBtnActive]}
                onPress={() => handleRecurrenceChange(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, recurrence === r && styles.optionTextActive]}>
                  {TASK_RECURRENCE_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {recurrence === 'custom' && (
            <>
              <Text style={styles.label}>Wochentage</Text>
              <View style={styles.daysRow}>
                {([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayBtn, customDays.includes(day) && styles.dayBtnActive]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayText, customDays.includes(day) && styles.dayTextActive]}>
                      {WEEKDAY_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>Kategorie</Text>
          <View style={styles.optionGrid}>
            {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.optionBtn, category === c && styles.optionBtnActive]}
                onPress={() => setCategory(c)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, category === c && styles.optionTextActive]}>
                  {TASK_CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Anzahl Sätze"
            value={targetSets}
            onChangeText={setTargetSets}
            keyboardType="number-pad"
            placeholder="z.B. 3"
          />

          {visibleSubmitError ? <Text style={styles.errorText}>{visibleSubmitError}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Aufgabe erstellen"
            onPress={handleSubmit}
            variant="primary"
            loading={submitting}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 20,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  optionBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  dayTextActive: {
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
  },
  errorText: {
    color: Colors.tertiary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
});
