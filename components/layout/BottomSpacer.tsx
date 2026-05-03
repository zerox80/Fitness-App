import React from 'react';
import { View } from 'react-native';

export function BottomSpacer({ height = 40 }: { height?: number }) {
  return <View style={{ height }} />;
}
