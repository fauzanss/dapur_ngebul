import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ConnectionError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.icon}>📶</Text>
        <Text style={styles.title}>Gagal Terhubung</Text>
        <Text style={styles.subtitle}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Coba Lagi</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderWidth: 2,
    borderColor: '#000',
  },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#222', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 14 },
  button: { backgroundColor: '#B22222', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '800' },
});


