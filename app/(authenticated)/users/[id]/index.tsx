import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { getInitials, formatDate as formatDateUtil } from '@/utils';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetUserById } from '@/tanstack/useUsers';

export default function UserDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch, isRefetching } = useGetUserById(id);
  const user = data?.data?.user ?? data?.data ?? null;

  const initials = useMemo(() => getInitials(user ? { firstName: user?.firstName, lastName: user?.lastName, email: user?.email } : null), [user]);

  const formatDate = (value?: string) => formatDateUtil(value);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (isLoading && !user) {
    return <Loading fullScreen message="Loading user..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">User Details</ThemedText>
              <Text className="text-gray-600 mt-1">User ID: {id}</Text>
            </View>
            <Pressable
              onPress={() => router.push(`/(authenticated)/users/${id}/edit`)}
              className="rounded-xl bg-brand-primary px-4 py-3"
              accessibilityLabel="Edit user">
              <Text className="font-inter text-base font-semibold text-white">
                Edit User
              </Text>
            </Pressable>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          <View className="items-center gap-3">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                resizeMode="cover"
                className="h-24 w-24 rounded-full border-4 border-white shadow-md"
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-tint">
                <Text className="font-poppins text-3xl font-semibold text-brand-primary">
                  {initials}
                </Text>
              </View>
            )}
            <View className="items-center gap-2">
              <Text className="font-poppins text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {user
                  ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
                  : '—'}
              </Text>
              <View className="flex-row items-center gap-2">
                <Badge variant="info" size="sm">{user?.role ?? '—'}</Badge>
                <Badge variant={user?.isActive ? 'success' : 'error'} size="sm">
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </View>
            </View>
          </View>

          <View className="gap-6">
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Contact Information
              </Text>
              <View className="mt-4 gap-3">
                <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '—'} />
                <InfoRow icon="call" label="Phone" value={user?.phone ?? 'Not provided'} />
              </View>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Account Details
              </Text>
              <View className="mt-4 gap-3">
                <InfoRow icon="workspace-premium" label="Role" value={user?.role ?? '—'} />
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="verified" size={18} color="#9ca3af" />
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </Text>
                  </View>
                  <Badge variant={user?.isActive ? 'success' : 'error'} size="sm">
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </View>
                <InfoRow icon="event-note" label="Created" value={formatDate(user?.createdAt)} />
                <InfoRow icon="update" label="Updated" value={formatDate(user?.updatedAt)} />
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


