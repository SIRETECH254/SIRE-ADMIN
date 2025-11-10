import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Dashboard
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Dashboard placeholder - Coming soon
        </ThemedText>
        {user && (
          <ThemedText style={styles.userInfo}>
            Welcome, {user.firstName} {user.lastName}!
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
  userInfo: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});

