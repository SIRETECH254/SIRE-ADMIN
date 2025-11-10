import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ClientsScreen() {
  return (
    <ThemedView style={styles.wrapper}>
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Clients
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          A dedicated space to manage client records, view engagement history, and launch client
          workflows.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 460,
    fontSize: 16,
    lineHeight: 24,
  },
});


