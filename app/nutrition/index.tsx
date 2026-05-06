import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FadeIn } from '@/components/FadeIn';
import { Colors } from '@/constants/Colors';

export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <ScreenHeader title="Ernährung" subtitle="Tracke deine Mahlzeiten & Makros" />
        </FadeIn>
        <FadeIn delay={100}>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.addButton} onPress={() => console.log('Add meal')} activeOpacity={0.85}>
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Mahlzeit hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>
        <FadeIn delay={200}>
          <EmptyState
            title="Noch keine Einträge"
            subtitle="Füge deine erste Mahlzeit hinzu, um deine Ernährung zu tracken."
          />
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
    paddingBottom: 150,
  },
  actions: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  addButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
