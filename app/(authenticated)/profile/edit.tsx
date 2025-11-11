import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/redux/slices/authSlice';
import { useGetProfile, useUpdateProfile } from '@/tanstack/useUsers';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { data, isLoading } = useGetProfile();
  const { mutateAsync, isPending } = useUpdateProfile();

  const profile = useMemo(() => {
    return data?.data?.user ?? user ?? null;
  }, [data?.data?.user, user]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [isAvatarHintVisible, setIsAvatarHintVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const isBusy = isPending;

  const initials = useMemo(() => {
    if (!profile) return '?';
    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    if (parts.length === 0) {
      return profile.email?.[0]?.toUpperCase() ?? '?';
    }
    return parts
      .map((value: string) => value.charAt(0).toUpperCase())
      .join('');
  }, [profile]);

  const resetInlineStatus = useCallback(() => {
    if (inlineStatus) {
      setInlineStatus(null);
    }
  }, [inlineStatus]);

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirst || !trimmedLast) {
      setInlineStatus({
        type: 'error',
        text: 'First name and last name are required.',
      });
      return;
    }

    setInlineStatus(null);

    try {
      const result = await mutateAsync({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phone: trimmedPhone || undefined,
      });

      const updatedUser = result?.data?.user ?? result?.user;
      if (updatedUser) {
        dispatch(updateUser(updatedUser));
      }

      setInlineStatus({
        type: 'success',
        text: 'Profile updated successfully.',
      });

      setTimeout(() => {
        router.back();
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to update profile right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [dispatch, firstName, lastName, mutateAsync, phone, router]);

  const handleCancel = () => {
    router.back();
  };

  if (isLoading && !profile) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 py-8">
            <ThemedText type="title" style={{ textAlign: 'center' }}>
              Edit Profile
            </ThemedText>

            <View className="mt-8 items-center gap-3">
              <Pressable
                onPress={() => setIsAvatarHintVisible(true)}
                className="items-center justify-center">
                {profile?.avatar ? (
                  <Image
                    source={{ uri: profile.avatar }}
                    resizeMode="cover"
                    className="h-28 w-28 rounded-full border-4 border-white shadow-md"
                  />
                ) : (
                  <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-tint">
                    <Text className="font-poppins text-3xl font-semibold text-brand-primary">
                      {initials}
                    </Text>
                  </View>
                )}
                <Text className="mt-2 font-inter text-sm text-brand-primary">
                  Change avatar (coming soon)
                </Text>
              </Pressable>
              {isAvatarHintVisible && (
                <Alert
                  variant="info"
                  message="Avatar uploads will be available in a future update."
                  dismissible
                  onDismiss={() => setIsAvatarHintVisible(false)}
                  className="w-full"
                />
              )}
            </View>

            <View className="mt-10 gap-5">
              <View className="gap-2">
                <Text className="form-label">First name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={(value) => {
                    setFirstName(value);
                    resetInlineStatus();
                  }}
                  autoCapitalize="words"
                  placeholder="Jane"
                  className="form-input"
                />
              </View>

              <View className="gap-2">
                <Text className="form-label">Last name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={(value) => {
                    setLastName(value);
                    resetInlineStatus();
                  }}
                  autoCapitalize="words"
                  placeholder="Doe"
                  className="form-input"
                />
              </View>

              <View className="gap-2">
                <Text className="form-label">Email</Text>
                <TextInput
                  value={profile?.email ?? ''}
                  editable={false}
                  selectTextOnFocus={false}
                  className="form-input-disabled"
                />
              </View>

              <View className="gap-2">
                <Text className="form-label">Phone (optional)</Text>
                <TextInput
                  value={phone}
                  onChangeText={(value) => {
                    setPhone(value);
                    resetInlineStatus();
                  }}
                  keyboardType="phone-pad"
                  placeholder="e.g. +254712345678"
                  className="form-input"
                />
              </View>
            </View>

            <View className="mt-6 gap-3">
              {inlineStatus ? (
                <Alert
                  variant={inlineStatus.type}
                  message={inlineStatus.text}
                  className="w-full"
                />
              ) : null}

              <View className="flex-row items-center justify-end gap-3">
                <Pressable
                  onPress={handleCancel}
                  disabled={isBusy}
                  className="btn btn-secondary">
                  <Text className="btn-text btn-text-secondary">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={isBusy}
                  className="btn btn-primary min-w-[140px]">
                  {isBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="btn-text btn-text-primary">
                      Save changes
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
