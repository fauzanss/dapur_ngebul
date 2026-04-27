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
  
  // Load Material Icons font IMMEDIATELY (synchronous if possible)
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    // Prevent @expo/vector-icons from loading font files
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      // Block MaterialIcons font file requests
      if (url.includes('MaterialIcons') && url.endsWith('.ttf')) {
        return Promise.reject(new Error('Material Icons font blocked - using Google Fonts'));
      }
      return originalFetch.apply(this, args);
    };

    // Intercept expo-font registerStaticFont to handle "material" font
    if (typeof window !== 'undefined' && (window as any).expo) {
      const expoFont = (window as any).expo?.modules?.expoFont;
      if (expoFont && expoFont.registerStaticFont) {
        const originalRegisterStaticFont = expoFont.registerStaticFont;
        expoFont.registerStaticFont = function(fontFamily: string, source: any) {
          if (fontFamily === 'material' && (!source || source === null || source === undefined || Object.keys(source).length === 0)) {
            source = { uri: 'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2' };
          }
          return originalRegisterStaticFont.call(this, fontFamily, source);
        };
      }
    }

    // Load Google Fonts Material Icons link
    const existingLink = document.querySelector('link[href*="Material+Icons"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      document.head.insertBefore(link, document.head.firstChild);
    }

    // Inject CSS to force Material Icons to use Google Fonts
    const styleId = 'material-icons-override';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @font-face {
          font-family: 'Material Icons';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
        }
        @font-face {
          font-family: 'MaterialIcons';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
        }
        @font-face {
          font-family: 'material';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
        }
        .material-icons,
        .material-icons-outlined,
        [class*="material-icons"],
        [class*="MaterialIcons"],
        [class*="ExpoVectorIcons"],
        span[data-icon],
        *[class*="Icon"],
        *[data-testid*="icon"],
        *[role="img"],
        *[style*="font-family"][style*="Material"] {
          font-family: 'Material Icons' !important;
          font-weight: normal !important;
          font-style: normal !important;
          font-size: inherit !important;
          line-height: 1 !important;
          letter-spacing: normal !important;
          text-transform: none !important;
          display: inline-block !important;
          white-space: nowrap !important;
          word-wrap: normal !important;
          direction: ltr !important;
          -webkit-font-feature-settings: 'liga' !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          speak: none !important;
          font-variant: normal !important;
          text-rendering: optimizeLegibility !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  useEffect(() => setMounted(true), []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.appRoot}>
        <View style={styles.container}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="confirm-order" options={{ title: 'Konfirmasi Order' }} />
            {/** order-detail is now nested under (tabs), keep this as safety if deep-linked */}
            <Stack.Screen name="order-detail" options={{ title: 'Detail Order', presentation: 'card' }} />
          </Stack>

          {mounted && globalLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8, fontWeight: '700' }}>Memuat...</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { registerGlobalLoading } from '@/lib/loading';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

registerGlobalLoading((v: boolean) => {
  // lazy attach to global state via closure; will be replaced after mount
});

const styles = StyleSheet.create({
  appRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2', paddingVertical: 24 },
  container: { flex: 1, width: '100%', maxWidth: 430, backgroundColor: '#ffffff', position: 'relative', borderWidth: 3, borderColor: '#000000', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  loadingOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  loadingCard: { backgroundColor: '#fff', padding: 20, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
});
