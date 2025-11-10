import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotificationsScreen() {
  return (
    <ThemedView style={styles.wrapper}>
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Notifications
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Monitor alerts, reminders, and announcements tailored to each admin. Replace this placeholder
          with in-app notification feeds and filters.
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


