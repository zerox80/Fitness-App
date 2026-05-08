import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Flame, Send, Trash2 } from 'lucide-react-native';

import { api } from '@/lib/api';
import type { ActivityEntry, CalorieChatMessage, CalorieEstimate, DailyActivity } from '@/lib/api';
import { Colors } from '@/constants/Colors';
import { formatLocalDateKey } from '@/utils/date';
import { styles } from './CalorieChatCard.styles';

const initialMessages: CalorieChatMessage[] = [
  {
    role: 'assistant',
    content: 'Was hast du heute gemacht?',
  },
];

const MAX_CHAT_REQUEST_MESSAGES = 20;

function messagesForCalorieRequest(messages: CalorieChatMessage[]) {
  const recentMessages = messages.slice(-MAX_CHAT_REQUEST_MESSAGES);

  if (
    recentMessages.length === MAX_CHAT_REQUEST_MESSAGES &&
    recentMessages[0]?.role === 'assistant'
  ) {
    return recentMessages.slice(1);
  }

  return recentMessages;
}

interface CalorieChatCardProps {
  onActivityUpdated?: (activity: DailyActivity) => void;
}

export function CalorieChatCard({ onActivityUpdated }: CalorieChatCardProps) {
  const [activityDate] = useState(() => formatLocalDateKey(new Date()));
  const [messages, setMessages] = useState<CalorieChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [estimate, setEstimate] = useState<CalorieEstimate | null>(null);
  const [estimateDate, setEstimateDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedInput = input.trim();
  const canSubmit = trimmedInput.length > 0 && !submitting;

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    try {
      setEntries(await api.activity.entries.list({ date: activityDate }));
    } catch {
      setError('Gespeicherte Zusatzaktivitaeten konnten nicht geladen werden.');
    } finally {
      setEntriesLoading(false);
    }
  }, [activityDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const submitMessage = async () => {
    if (!canSubmit) {
      return;
    }

    const userMessage: CalorieChatMessage = { role: 'user', content: trimmedInput };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setEstimate(null);
    setEstimateDate(null);
    setApplied(false);
    setError(null);
    setSubmitting(true);

    try {
      const response = await api.activity.estimateCalories({
        date: activityDate,
        messages: messagesForCalorieRequest(nextMessages),
      });

      setMessages([...nextMessages, { role: 'assistant', content: response.reply }]);
      const nextEstimate = response.status === 'estimated' ? response.estimate ?? null : null;
      setEstimate(nextEstimate);
      setEstimateDate(nextEstimate ? activityDate : null);
    } catch {
      setEstimateDate(null);
      setError('Kalorien konnten gerade nicht geschätzt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyEstimate = async () => {
    if (!estimate || applying) {
      return;
    }

    if (!estimateDate) {
      setError('Schätzung konnte nicht übernommen werden.');
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const response = await api.activity.entries.create({
        date: estimateDate,
        entries: estimate.activities.map((activity) => ({
          name: activity.name,
          duration_minutes: Math.round(activity.duration_minutes),
          intensity: activity.intensity,
          calories: Math.round(activity.calories),
          source: 'ai',
        })),
      });

      setEntries(response.entries);
      onActivityUpdated?.(response.activity);
      setApplied(true);
    } catch {
      setError('Schätzung konnte nicht übernommen werden.');
    } finally {
      setApplying(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (deletingEntryId) {
      return;
    }

    setDeletingEntryId(entryId);
    setError(null);

    try {
      const response = await api.activity.entries.delete(entryId);
      setEntries(response.entries);
      onActivityUpdated?.(response.activity);
    } catch {
      setError('Zusatzaktivitaet konnte nicht geloescht werden.');
    } finally {
      setDeletingEntryId(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Flame size={20} color={Colors.primary} fill={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>KI-Kalorienzähler</Text>
          <Text style={styles.subtitle}>Verbrannte Kalorien aus deinen Aktivitäten schätzen</Text>
        </View>
      </View>

      <View style={styles.messages}>
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <View
              key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
              style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}
            >
              <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                {message.content}
              </Text>
            </View>
          );
        })}
        {submitting && (
          <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.assistantText}>Kimi rechnet...</Text>
          </View>
        )}
      </View>

      {estimate && (
        <View style={styles.estimateBox}>
          <View style={styles.estimateHeader}>
            <Text style={styles.estimateValue}>{Math.round(estimate.total_calories)} kcal</Text>
            <Text style={styles.estimateMeta}>
              {Math.round(estimate.active_minutes)} aktive Min. · {Math.round(estimate.confidence * 100)}% sicher
            </Text>
          </View>
          {estimate.activities.map((activity, index) => (
            <View key={`${activity.name}-${index}`} style={styles.activityRow}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityMeta}>
                {Math.round(activity.duration_minutes)} Min. · {activity.intensity} · {Math.round(activity.calories)} kcal
              </Text>
            </View>
          ))}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Kalorienschaetzung uebernehmen"
            style={[styles.applyButton, (applying || applied) && styles.applyButtonDisabled]}
            onPress={applyEstimate}
            disabled={applying || applied}
            activeOpacity={0.82}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={18} color="#FFFFFF" />
            )}
            <Text style={styles.applyButtonText}>
              {applied ? 'Gespeichert' : 'Als Zusatzaktivitaet speichern'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.entriesBox}>
        <View style={styles.entriesHeader}>
          <Text style={styles.entriesTitle}>Zusatzaktivitaeten heute</Text>
          {entriesLoading && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>
        {!entriesLoading && entries.length === 0 ? (
          <Text style={styles.entriesEmpty}>Noch keine Zusatzaktivitaeten gespeichert.</Text>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryRow}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryMeta}>
                  {Math.round(entry.duration_minutes)} Min. Â· {entry.intensity} Â· {Math.round(entry.calories)} kcal
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${entry.name} loeschen`}
                style={styles.deleteButton}
                onPress={() => deleteEntry(entry.id)}
                disabled={deletingEntryId === entry.id}
                activeOpacity={0.82}
              >
                {deletingEntryId === entry.id ? (
                  <ActivityIndicator size="small" color={Colors.tertiary} />
                ) : (
                  <Trash2 size={16} color={Colors.tertiary} />
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Aktivitaet beschreiben"
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="z.B. 45 Min Joggen, mittel intensiv"
          placeholderTextColor={Colors.textSoft}
          multiline
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Kalorien schaetzen"
          style={[styles.sendButton, !canSubmit && styles.sendButtonDisabled]}
          onPress={submitMessage}
          disabled={!canSubmit}
          activeOpacity={0.82}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
