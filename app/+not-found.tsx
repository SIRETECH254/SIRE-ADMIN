import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            404
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            This screen doesn't exist.
          </ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedText type="link" style={styles.linkText}>
              Go to home screen
            </ThemedText>
          </Link>
        </View>
      </ThemedView>
    </>
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
    fontSize: 48,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    marginTop: 16,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
  },
});

