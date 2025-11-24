import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { useCreateRole } from '@/tanstack/useRoles';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function CreateRoleScreen() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateRole();

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [newPermission, setNewPermission] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  const isBusy = isPending;

  const handleAddPermission = useCallback(() => {
    const trimmed = newPermission.trim();
    if (!trimmed) return;
    if (permissions.includes(trimmed)) {
      setInlineStatus({ type: 'error', text: 'Permission already exists.' });
      return;
    }
    setPermissions((prev) => [...prev, trimmed]);
    setNewPermission('');
    setInlineStatus(null);
  }, [newPermission, permissions]);

  const handleRemovePermission = useCallback((permission: string) => {
    setPermissions((prev) => prev.filter((p) => p !== permission));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim().toLowerCase().replace(/\s+/g, '_');
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
      const result = await mutateAsync({
        name: trimmedName,
        displayName: trimmedDisplayName,
        description: trimmedDescription || undefined,
        permissions: permissions.length > 0 ? permissions : undefined,
        isActive,
      });

      const createdRole = result?.data?.role ?? result?.role;
      setInlineStatus({ type: 'success', text: 'Role created successfully.' });
      setTimeout(() => {
        if (createdRole?._id || createdRole?.id) {
          const id = createdRole._id || createdRole.id;
          router.replace(`/(authenticated)/roles/${id}`);
        } else {
          router.replace('/(authenticated)/roles');
        }
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to create role right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [name, displayName, description, permissions, isActive, mutateAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Create Role
          </ThemedText>

          <View className="mt-8 gap-5">
            <View className="gap-2">
              <Text className="form-label">Role Name *</Text>
              <TextInput
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setInlineStatus(null);
                }}
                placeholder="e.g. admin"
                autoCapitalize="none"
                className="form-input"
              />
              <Text className="text-xs text-gray-500">
                Use lowercase letters and underscores. Will be converted automatically.
              </Text>
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

            <View className="gap-2">
              <Text className="form-label">Permissions</Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <View className="flex-row gap-2 mb-3">
                  <TextInput
                    value={newPermission}
                    onChangeText={(v) => {
                      setNewPermission(v);
                      setInlineStatus(null);
                    }}
                    placeholder="e.g. users.create, users.edit"
                    className="form-input flex-1"
                    onSubmitEditing={handleAddPermission}
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={handleAddPermission}
                    disabled={!newPermission.trim()}
                    className="btn btn-primary px-4">
                    <MaterialIcons name="add" size={20} color="#ffffff" />
                  </Pressable>
                </View>
                {permissions.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {permissions.map((permission, index) => (
                      <View key={index} className="flex-row items-center gap-1 rounded-full bg-gray-200 px-3 py-1">
                        <Text className="font-inter text-xs text-gray-700 dark:text-gray-300">
                          {permission}
                        </Text>
                        <Pressable
                          onPress={() => handleRemovePermission(permission)}
                          className="ml-1">
                          <MaterialIcons name="close" size={14} color="#6b7280" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    No permissions added yet. Add permissions using the input above.
                  </Text>
                )}
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
                  <Text className="btn-text btn-text-primary">Create role</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

