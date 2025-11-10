import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ContactScreen() {
  return (
    <ThemedView style={styles.wrapper}>
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Contact Messages
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage inbound contact requests, assign follow-ups, and maintain response history. Replace
          this placeholder with a full inbox workflow.
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
    maxWidth: 480,
    fontSize: 16,
    lineHeight: 24,
  },
});


