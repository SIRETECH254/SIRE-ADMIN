import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetRole, useGetUsersByRole } from '@/tanstack/useRoles';
import { formatDate as formatDateUtil, getInitials } from '@/utils';

export default function RoleDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error } = useGetRole(id);
  const { data: usersData } = useGetUsersByRole(id, { limit: 50 });

  const role = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.role ?? root?.role ?? root?.data ?? root;
  }, [data]);

  const users = useMemo(() => {
    const root = usersData?.data ?? usersData;
    return (root?.data?.users ?? root?.users ?? root?.data ?? []) as any[];
  }, [usersData]);

  const formatDate = (value?: string) => formatDateUtil(value);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (isLoading && !role) {
    return <Loading fullScreen message="Loading role..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">Role Details</ThemedText>
              <Text className="text-gray-600 mt-1">Role ID: {id}</Text>
            </View>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          <View className="items-center gap-3">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-tint">
              <MaterialIcons name="admin-panel-settings" size={48} color="#7b1c1c" />
            </View>
            <View className="items-center gap-2">
              <Text className="font-poppins text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {role?.displayName ?? role?.name ?? '—'}
              </Text>
              <View className="flex-row items-center gap-2">
                <Badge
                  variant={role?.isActive !== false ? 'success' : 'error'}
                  size="sm"
                  icon={
                    <MaterialIcons
                      name={role?.isActive !== false ? 'check-circle' : 'block'}
                      size={14}
                      color={role?.isActive !== false ? '#059669' : '#a33c3c'}
                    />
                  }>
                  {role?.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </View>
            </View>
          </View>
          <View className="items-center">
            <Pressable
              onPress={() => router.push(`/(authenticated)/roles/${id}/edit`)}
              className="rounded-xl bg-brand-primary px-6 py-3"
              accessibilityRole="button"
              accessibilityLabel="Edit role">
              <Text className="font-inter text-base font-semibold text-white">
                Edit Role
              </Text>
            </Pressable>
          </View>

          <View className="gap-6">
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Role Information
              </Text>
              <View className="mt-4 gap-3">
                <InfoRow icon="badge" label="Name" value={role?.name ?? '—'} />
                <InfoRow icon="label" label="Display Name" value={role?.displayName ?? '—'} />
                <InfoRow icon="description" label="Description" value={role?.description ?? 'No description'} />
                <InfoRow icon="event-note" label="Created" value={formatDate(role?.createdAt)} />
                <InfoRow icon="update" label="Updated" value={formatDate(role?.updatedAt)} />
              </View>
            </View>

            {role?.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Permissions
                </Text>
                <View className="mt-4 gap-2">
                  {role.permissions.map((permission: string, index: number) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <MaterialIcons name="check-circle" size={18} color="#059669" />
                      <Text className="font-inter text-sm text-gray-700 dark:text-gray-300">
                        {permission}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Users with this Role ({users.length})
              </Text>
              <View className="mt-4 gap-3">
                {users.length === 0 ? (
                  <Text className="text-gray-600 dark:text-gray-300">
                    No users have this role assigned.
                  </Text>
                ) : (
                  users.map((user: any) => {
                    const userId = user._id || user.id;
                    const initials = getInitials({
                      firstName: user?.firstName,
                      lastName: user?.lastName,
                      email: user?.email,
                    });
                    return (
                      <Pressable
                        key={userId}
                        onPress={() => router.push(`/(authenticated)/users/${userId}`)}
                        className="flex-row items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                        <View className="h-10 w-10 rounded-full overflow-hidden bg-brand-tint items-center justify-center">
                          {user?.avatar ? (
                            <View className="h-10 w-10 rounded-full overflow-hidden">
                              {/* Image would go here */}
                            </View>
                          ) : (
                            <Text className="font-inter font-semibold text-sm text-brand-primary">
                              {initials}
                            </Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                            {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.email || '—'}
                          </Text>
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            {user?.email ?? '—'}
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
                      </Pressable>
                    );
                  })
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-100">
        {value ?? '—'}
      </Text>
    </View>
  );
}

