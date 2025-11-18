import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/tanstack/useUsers';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type CategoryPreference = {
  email: boolean;
  sms: boolean;
  inApp: boolean;
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetNotificationPreferences();
  const { mutateAsync, isPending } = useUpdateNotificationPreferences();

  const preferences = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.preferences ?? root?.preferences ?? root?.data ?? root;
  }, [data]);

  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [categoryPreferences, setCategoryPreferences] = useState<
    Record<string, CategoryPreference>
  >({
    general: { email: true, sms: false, inApp: true },
    project: { email: true, sms: false, inApp: true },
    invoice: { email: true, sms: true, inApp: true },
    payment: { email: true, sms: true, inApp: true },
    quotation: { email: true, sms: false, inApp: true },
  });
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  useEffect(() => {
    if (preferences) {
      setEmail(preferences.email ?? true);
      setSms(preferences.sms ?? true);
      setInApp(preferences.inApp ?? true);
      if (preferences.categories) {
        setCategoryPreferences(preferences.categories);
      }
    }
  }, [preferences]);

  const isBusy = isPending;

  const handleCategoryPreferenceChange = useCallback(
    (category: string, channel: 'email' | 'sms' | 'inApp', value: boolean) => {
      setCategoryPreferences((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [channel]: value,
        },
      }));
      setInlineStatus(null);
    },
    []
  );

  const handleSave = useCallback(async () => {
    setInlineStatus(null);
    try {
      await mutateAsync({
        email,
        sms,
        inApp,
        categories: categoryPreferences,
      });
      setInlineStatus({ type: 'success', text: 'Notification preferences updated successfully.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to update preferences right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [email, sms, inApp, categoryPreferences, mutateAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading && !preferences) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading preferences…" />
      </ThemedView>
    );
  }

  const categories = ['general', 'project', 'invoice', 'payment', 'quotation'];

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8 gap-6">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Notification Preferences
          </ThemedText>

          <View className="gap-5">
            {/* Global Preferences */}
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Global Preferences
              </Text>
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                      Email Notifications
                    </Text>
                    <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via email
                    </Text>
                  </View>
                  <Switch value={email} onValueChange={setEmail} />
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                      SMS Notifications
                    </Text>
                    <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via SMS
                    </Text>
                  </View>
                  <Switch value={sms} onValueChange={setSms} />
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                      In-App Notifications
                    </Text>
                    <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                      Show notifications in the app
                    </Text>
                  </View>
                  <Switch value={inApp} onValueChange={setInApp} />
                </View>
              </View>
            </View>

            {/* Category-Specific Preferences */}
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Category Preferences
              </Text>
              <View className="gap-6">
                {categories.map((category) => {
                  const prefs = categoryPreferences[category] ?? {
                    email: true,
                    sms: false,
                    inApp: true,
                  };
                  return (
                    <View key={category} className="gap-3">
                      <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50 capitalize">
                        {category}
                      </Text>
                      <View className="gap-3 pl-4">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-inter text-sm text-gray-700 dark:text-gray-300">
                            Email
                          </Text>
                          <Switch
                            value={prefs.email}
                            onValueChange={(value) =>
                              handleCategoryPreferenceChange(category, 'email', value)
                            }
                          />
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="font-inter text-sm text-gray-700 dark:text-gray-300">
                            SMS
                          </Text>
                          <Switch
                            value={prefs.sms}
                            onValueChange={(value) =>
                              handleCategoryPreferenceChange(category, 'sms', value)
                            }
                          />
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="font-inter text-sm text-gray-700 dark:text-gray-300">
                            In-App
                          </Text>
                          <Switch
                            value={prefs.inApp}
                            onValueChange={(value) =>
                              handleCategoryPreferenceChange(category, 'inApp', value)
                            }
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View className="gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row items-center justify-end gap-3">
              <Pressable onPress={handleCancel} disabled={isBusy} className="btn btn-secondary">
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isBusy}
                className="btn btn-primary min-w-[140px]">
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

