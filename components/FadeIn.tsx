import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  style?: any;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 700,
  translateY = 24,
  style,
}: FadeInProps) {
  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }

  return (
    <NativeFadeIn delay={delay} duration={duration} translateY={translateY} style={style}>
      {children}
    </NativeFadeIn>
  );
}

function NativeFadeIn({
  children,
  delay = 0,
  duration = 700,
  translateY = 24,
  style,
}: FadeInProps) {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
    offset.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
