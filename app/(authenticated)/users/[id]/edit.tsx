import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, Image, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetUserById, useUpdateUser } from '@/tanstack/useUsers';

type RoleOption =
  | 'super_admin'
  | 'admin'
  | 'finance'
  | 'project_manager'
  | 'staff'
  | 'client';

export default function EditUserScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading } = useGetUserById(id);
  const { mutateAsync, isPending } = useUpdateUser();

  const existing = data?.data?.user ?? data?.data ?? null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleOption>('staff');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [inlineStatus, setInlineStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  useEffect(() => {
    if (existing) {
      setFirstName(existing.firstName ?? '');
      setLastName(existing.lastName ?? '');
      setEmail(existing.email ?? '');
      setPhone(existing.phone ?? '');
      setRole(existing.role ?? 'staff');
      setIsActive(Boolean(existing.isActive));
      setInlineStatus(null);
      setAvatarUri(existing.avatar ?? null);
      setAvatarFile(null);
      setAvatarRemoved(false);
    }
  }, [existing]);

  const isBusy = isPending;

  const handleChangeAvatar = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setInlineStatus({ text: 'Photo library access is required to change your avatar.', type: 'error' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      const name = asset.fileName ?? `avatar-${Date.now()}.jpg`;
      const type = asset.mimeType ?? 'image/jpeg';
      setAvatarUri(asset.uri);
      setAvatarFile({ uri: asset.uri, name, type });
      setAvatarRemoved(false);
      setInlineStatus(null);
    } catch {
      setInlineStatus({ type: 'error', text: 'Unable to open your photo library.' });
    }
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarUri(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
    setInlineStatus(null);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedFirst || !trimmedLast) {
      setInlineStatus({ type: 'error', text: 'First name and last name are required.' });
      return;
    }
    setInlineStatus(null);
    try {
      let userData: any = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phone: trimmedPhone || undefined,
        role,
        isActive,
      };
      if (avatarFile) {
        const formData = new FormData();
        formData.append('firstName', trimmedFirst);
        formData.append('lastName', trimmedLast);
        if (trimmedPhone) formData.append('phone', trimmedPhone);
        formData.append('role', role);
        formData.append('isActive', String(isActive));
        if (avatarFile.uri.startsWith('file:')) {
          formData.append('avatar', { uri: avatarFile.uri, name: avatarFile.name, type: avatarFile.type } as any);
        } else {
          const resp = await fetch(avatarFile.uri);
          const blob = await resp!.blob();
          // @ts-ignore
          formData.append('avatar', blob, avatarFile.name);
        }
        userData = formData;
      } else if (avatarRemoved) {
        userData = { ...userData, avatar: null };
      }
      await mutateAsync({ userId: id, userData });
      setInlineStatus({ type: 'success', text: 'User updated successfully.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to update user right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [firstName, lastName, phone, role, isActive, mutateAsync, id, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading && !existing) {
    return <Loading fullScreen message="Loading user..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Edit User
          </ThemedText>

          {/* Avatar picker */}
          <View className="mt-8 items-center gap-3">
            <Pressable onPress={handleChangeAvatar} className="items-center justify-center" accessibilityRole="button" accessibilityLabel="Change avatar">
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} resizeMode="cover" className="h-28 w-28 rounded-full border-4 border-white shadow-md" />
              ) : existing?.avatar ? (
                <Image source={{ uri: existing.avatar }} resizeMode="cover" className="h-28 w-28 rounded-full border-4 border-white shadow-md" />
              ) : (
                <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-tint">
                  <Text className="font-poppins text-3xl font-semibold text-brand-primary">
                    {(existing?.firstName?.[0] ?? existing?.email?.[0] ?? '?').toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="mt-2 font-inter text-sm text-brand-primary">Tap to change avatar</Text>
            </Pressable>
            {(avatarUri || existing?.avatar) && (
              <Pressable onPress={handleRemoveAvatar} className="rounded-xl border border-transparent px-4 py-2" accessibilityRole="button" accessibilityLabel="Remove avatar">
                <Text className="font-inter text-sm font-semibold text-brand-accent">Remove avatar</Text>
              </Pressable>
            )}
          </View>

          <View className="mt-8 gap-5">
            <View className="gap-2">
              <Text className="form-label">First name</Text>
              <TextInput
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  setInlineStatus(null);
                }}
                placeholder="Jane"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Last name</Text>
              <TextInput
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  setInlineStatus(null);
                }}
                placeholder="Doe"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Email</Text>
              <TextInput value={email} editable={false} className="form-input-disabled" />
            </View>

            <View className="gap-2">
              <Text className="form-label">Phone (optional)</Text>
              <TextInput
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  setInlineStatus(null);
                }}
                placeholder="e.g. +254712345678"
                className="form-input"
                keyboardType="phone-pad"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Role</Text>
              <View className="border border-gray-300 rounded-lg bg-white px-2">
                <Picker selectedValue={role} onValueChange={(v: any) => setRole(v)} style={{ height: 44 }}>
                  <Picker.Item label="Staff" value="staff" />
                  <Picker.Item label="Project Manager" value="project_manager" />
                  <Picker.Item label="Finance" value="finance" />
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Super Admin" value="super_admin" />
                  <Picker.Item label="Client" value="client" />
                </Picker>
              </View>
            </View>

            <View className="gap-2">
              <Text className="form-label">Status</Text>
              <View className="flex-row items-center gap-3">
                <Switch value={isActive} onValueChange={setIsActive} />
                <Text className="font-inter text-base text-gray-900">
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row items-center justify-end gap-3">
              <Pressable onPress={handleCancel} disabled={isBusy} className="btn btn-secondary">
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} disabled={isBusy} className="btn btn-primary min-w-[140px]">
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Save changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


