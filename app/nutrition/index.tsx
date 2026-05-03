import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { UtensilsCrossed, Plus } from 'lucide-react-native';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/forms/Button';
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
            <Button title="+ Mahlzeit hinzufügen" size="md" onPress={() => console.log('Add meal')} />
          </View>
        </FadeIn>
        <FadeIn delay={200}>
          <EmptyState
            icon="🥗"
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
    paddingHorizontal: 24,
    marginBottom: 12,
  },
});
