import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { X, Mail, Lock, User as UserIcon, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { FadeIn } from '@/components/FadeIn';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const cardWidth = Math.min(460, Math.max(340, width * 0.42));
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.flex, isDesktop && styles.desktopFlex]}>
        <FadeIn delay={0} style={isDesktop ? [styles.card, { width: cardWidth }] : styles.mobileContent}>
          <View style={styles.contentInner}>
            {user && (
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <X size={22} color={Colors.text} />
              </TouchableOpacity>
            )}

            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Activity size={30} color={Colors.primary} />
              </View>
              <Text style={styles.brandText}>FitPulse</Text>
              <Text style={styles.tagline}>{isRegister ? 'Konto erstellen' : 'Willkommen zurück'}</Text>
            </View>

            <View style={styles.form}>
              {isRegister && (
                <View style={styles.field}>
                  <Text style={styles.label}>Name</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Alex Müller" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} autoCapitalize="words" />
                  </View>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>E-Mail</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="alex@example.com" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Passwort</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
                </View>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>{isRegister ? 'Konto erstellen' : 'Anmelden'}</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => { setIsRegister(!isRegister); setError(''); }} style={styles.switchWrap}>
              <Text style={styles.switchText}>
                {isRegister ? 'Du hast schon ein Konto? ' : 'Noch kein Konto? '}
                <Text style={styles.switchBold}>{isRegister ? 'Anmelden' : 'Registrieren'}</Text>
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
  mobileContent: { flex: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 34,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  contentInner: { width: '100%' },
  closeBtn: { position: 'absolute', top: -10, right: -10, width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderSoft, zIndex: 10 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: Colors.borderSoft },
  brandText: { fontSize: 30, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  tagline: { fontSize: 16, color: Colors.textMuted, fontWeight: '500' },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: Colors.text, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderSoft, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: Colors.text, fontSize: 16, fontWeight: '500' },
  error: { color: Colors.tertiary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  switchWrap: { marginTop: 26, alignItems: 'center' },
  switchText: { color: Colors.textMuted, fontSize: 15, fontWeight: '500' },
  switchBold: { color: Colors.primary, fontWeight: '800' },
});
