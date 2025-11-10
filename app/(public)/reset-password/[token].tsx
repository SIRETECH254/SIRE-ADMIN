import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Reset Password
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Reset password page placeholder - Coming soon
        </ThemedText>
        {token && (
          <ThemedText style={styles.token}>
            Token: {token}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  token: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
});

