import React from 'react';
import { View, ScrollView } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WebSidebar } from '@/components/dashboard/WebSidebar';
import { WebTopBar } from '@/components/dashboard/WebTopBar';
import { webStyles } from '@/components/dashboard/dashboard-web.styles';

export default function WebLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />
      <View style={webStyles.webShell}>
        {/* Die Sidebar bleibt links immer stehen */}
        <WebSidebar />
        
        <View style={webStyles.webMain}>
          {/* Die TopBar ist immer oben fixiert */}
          <WebTopBar />
          
          <ScrollView 
            contentContainerStyle={webStyles.webScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <View style={webStyles.webContent}>
              {/* Hier werden die einzelnen Seiten (index, tasks, etc.) reingeladen */}
              <Slot />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
