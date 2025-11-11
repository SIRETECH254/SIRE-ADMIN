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
import * as ImagePicker from 'expo-image-picker';
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

type AvatarAsset = {
  uri: string;
  name: string;
  type: string;
};

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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<AvatarAsset | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setPhone(profile.phone ?? '');
      setAvatarUri(profile.avatar ?? null);
      setAvatarFile(null);
      setAvatarRemoved(false);
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

  const handleChangeAvatar = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setInlineStatus({
          type: 'error',
          text: 'Photo library access is required to change your avatar.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      const assetName = asset.fileName ?? `avatar-${Date.now()}.jpg`;
      const assetType = asset.mimeType ?? 'image/jpeg';

      setAvatarUri(asset.uri);
      setAvatarFile({
        uri: asset.uri,
        name: assetName,
        type: assetType,
      });
      setAvatarRemoved(false);
      resetInlineStatus();
    } catch (err) {
      setInlineStatus({
        type: 'error',
        text: 'Unable to open your photo library right now. Please try again.',
      });
    }
  }, [resetInlineStatus]);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarUri(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
    resetInlineStatus();
  }, [resetInlineStatus]);

  const currentAvatar = useMemo(() => {
    if (avatarRemoved) {
      return null;
    }
    if (avatarUri) {
      return avatarUri;
    }
    return profile?.avatar ?? null;
  }, [avatarRemoved, avatarUri, profile?.avatar]);

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
      let payload: any = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phone: trimmedPhone || undefined,
      };

      if (avatarFile) {
        const formData = new FormData();
        formData.append('firstName', trimmedFirst);
        formData.append('lastName', trimmedLast);
        if (trimmedPhone) {
          formData.append('phone', trimmedPhone);
        }
        if (Platform.OS === 'web') {
          const fileResponse = await fetch(avatarFile.uri);
          const blob = await fileResponse.blob();
          formData.append('avatar', blob, avatarFile.name);
        } else {
          formData.append('avatar', {
            uri: avatarFile.uri,
            name: avatarFile.name,
            type: avatarFile.type,
          } as any);
        }
        payload = formData;
      } else if (avatarRemoved) {
        payload = {
          ...payload,
          avatar: null,
        };
      }

      const result = await mutateAsync(payload);

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
  }, [
    avatarFile,
    avatarRemoved,
    dispatch,
    firstName,
    lastName,
    mutateAsync,
    phone,
    router,
  ]);

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
                onPress={handleChangeAvatar}
                className="items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Change avatar">
                {currentAvatar ? (
                  <Image
                    source={{ uri: currentAvatar }}
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
                  Tap to change avatar
                </Text>
              </Pressable>
              {(currentAvatar || avatarRemoved) && (
                <Pressable
                  onPress={handleRemoveAvatar}
                  className="rounded-xl border border-transparent px-4 py-2"
                  accessibilityRole="button"
                  accessibilityLabel="Remove avatar">
                  <Text className="font-inter text-sm font-semibold text-brand-accent">
                    Remove avatar
                  </Text>
                </Pressable>
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
