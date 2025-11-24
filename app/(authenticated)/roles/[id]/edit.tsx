import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetRole, useUpdateRole } from '@/tanstack/useRoles';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function EditRoleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading } = useGetRole(id);
  const { mutateAsync, isPending } = useUpdateRole();

  const existing = data?.data?.role ?? data?.data ?? data?.role ?? null;

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? '');
      setDisplayName(existing.displayName ?? '');
      setDescription(existing.description ?? '');
      setIsActive(existing.isActive !== false);
      setInlineStatus(null);
    }
  }, [existing]);

  const isBusy = isPending;

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedDisplayName = displayName.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setInlineStatus({ type: 'error', text: 'Role name is required.' });
      return;
    }

    if (!trimmedDisplayName) {
      setInlineStatus({ type: 'error', text: 'Display name is required.' });
      return;
    }

    setInlineStatus(null);
    try {
      await mutateAsync({
        roleId: id,
        roleData: {
          name: trimmedName,
          displayName: trimmedDisplayName,
          description: trimmedDescription || undefined,
          isActive,
        },
      });

      setInlineStatus({ type: 'success', text: 'Role updated successfully.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to update role right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [name, displayName, description, isActive, mutateAsync, id, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading && !existing) {
    return <Loading fullScreen message="Loading role..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Edit Role
          </ThemedText>

          <View className="mt-8 gap-5">
            <View className="gap-2">
              <Text className="form-label">Role Name *</Text>
              <TextInput
                value={name}
                editable={false}
                onChangeText={(v) => {
                  setName(v);
                  setInlineStatus(null);
                }}
                placeholder="e.g. admin"
                className="form-input-disabled"
              />
              <Text className="text-xs text-gray-500">Role name cannot be changed after creation.</Text>
            </View>

            <View className="gap-2">
              <Text className="form-label">Display Name *</Text>
              <TextInput
                value={displayName}
                onChangeText={(v) => {
                  setDisplayName(v);
                  setInlineStatus(null);
                }}
                placeholder="e.g. Administrator"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Description (optional)</Text>
              <TextInput
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  setInlineStatus(null);
                }}
                placeholder="Role description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="form-input"
              />
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

