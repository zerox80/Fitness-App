import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, X, Mail, Lock, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { FadeIn } from '@/components/FadeIn';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, register } = useAuth();

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, name, password);
      else await login(email, password);
      // navigation handled by RootLayout
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Background for Desktop */}
      {isDesktop && (
        <LinearGradient
          colors={[Colors.primaryGlow, Colors.background, '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[styles.flex, isDesktop && styles.desktopFlex]}
      >
        <FadeIn delay={0} style={isDesktop ? styles.desktopCard : styles.mobileContent}>
          <View style={styles.contentInner}>
            {user && (
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            )}

            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Zap size={32} color={Colors.primary} fill={Colors.primary} />
              </View>
              <Text style={styles.brandText}>FitPulse</Text>
              <Text style={styles.tagline}>
                {isRegister ? 'Join the community' : 'Welcome back'}
              </Text>
            </View>

            <View style={styles.form}>
              {isRegister && (
                <View style={styles.field}>
                  <Text style={styles.label}>Name</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Alex Johnson"
                      placeholderTextColor={Colors.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="alex@example.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.8} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => { setIsRegister(!isRegister); setError(''); }} style={styles.switchWrap}>
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchBold}>{isRegister ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </FadeIn>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  desktopFlex: { alignItems: 'center', justifyContent: 'center' },
  mobileContent: { flex: 1, justifyContent: 'center', padding: 32 },
  desktopCard: {
    width: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  contentInner: { width: '100%' },
  closeBtn: { position: 'absolute', top: -16, right: -16, width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.glassBorder, zIndex: 10 },
  brand: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: Colors.glassBorder },
  brandText: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -0.8, marginBottom: 6 },
  tagline: { fontSize: 17, color: Colors.textMuted, fontWeight: '500' },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '800', color: Colors.text, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, color: Colors.text, fontSize: 16, fontWeight: '600' },
  error: { color: Colors.tertiary, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btn: { backgroundColor: Colors.primary, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  switchWrap: { marginTop: 32, alignItems: 'center' },
  switchText: { color: Colors.textMuted, fontSize: 15, fontWeight: '500' },
  switchBold: { color: Colors.primary, fontWeight: '900' },
});
