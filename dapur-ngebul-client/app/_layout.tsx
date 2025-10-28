import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="confirm-order" options={{ title: 'Konfirmasi Order' }} />
        {/** order-detail is now nested under (tabs), keep this as safety if deep-linked */}
        <Stack.Screen name="order-detail" options={{ title: 'Detail Order', presentation: 'card' }} />
      </Stack>
      <StatusBar style="auto" />
      {mounted && globalLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8, fontWeight: '700' }}>Memuat...</Text>
          </View>
        </View>
      )}
    </ThemeProvider>
  );
}

import { registerGlobalLoading } from '@/lib/loading';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

registerGlobalLoading((v: boolean) => {
  // lazy attach to global state via closure; will be replaced after mount
});

const styles = StyleSheet.create({
  loadingOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  loadingCard: { backgroundColor: '#fff', padding: 20, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
});
