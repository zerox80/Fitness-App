import { Tabs, router } from 'expo-router';
import React from 'react';
import { Activity, ClipboardList, Home, Plus, User } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';

const tabColors = {
  active: '#178864',
  inactive: '#79818A',
  background: '#FFFFFF',
  border: '#E9EEF1',
  shadow: 'rgba(24, 32, 42, 0.08)',
};

function CenterPlusButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Task erstellen"
      onPress={() => router.push('/(tabs)/tasks?create=1' as never)}
      style={({ pressed }) => [styles.plusButtonWrap, pressed && styles.plusButtonPressed]}
    >
      <View style={styles.plusButton}>
        <Plus size={30} color="#FFFFFF" strokeWidth={2.3} />
      </View>
    </Pressable>
  );
}

function EmptyLabel() {
  return <Text style={styles.emptyLabel}> </Text>;
}

import { WebLayout } from '../../components/layout/WebLayout';

export default function TabLayout() {
  return (
    <WebLayout>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tabColors.active,
          tabBarInactiveTintColor: tabColors.inactive,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: Platform.OS === 'web' ? styles.tabBarHidden : styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Übersicht',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconStack}>
                <Home size={25} color={color} fill={focused ? color : 'transparent'} strokeWidth={2.3} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Aktivität',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconStack}>
                <Activity size={25} color={color} strokeWidth={2.1} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarButton: CenterPlusButton,
            tabBarLabel: EmptyLabel,
            tabBarIcon: () => null,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Trainings',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconStack}>
                <ClipboardList size={25} color={color} strokeWidth={2.1} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconStack}>
                <User size={25} color={color} strokeWidth={2.1} />
              </View>
            ),
          }}
        />
      </Tabs>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 96 : 84,
    paddingTop: 9,
    paddingBottom: Platform.OS === 'ios' ? 25 : 13,
    backgroundColor: tabColors.background,
    borderTopWidth: 1,
    borderTopColor: tabColors.border,
    shadowColor: tabColors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  tabBarHidden: {
    display: 'none',
    height: 0,
    opacity: 0,
    position: 'absolute',
    borderTopWidth: 0,
  },
  tabBarItem: {
    height: 58,
  },
  tabBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  iconStack: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  plusButtonPressed: {
    opacity: 0.82,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: tabColors.active,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tabColors.active,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyLabel: {
    fontSize: 13,
  },
});
