import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetClient } from '@/tanstack/useClients';
import { getInitials, formatDate as formatDateUtil } from '@/utils';

export default function ClientDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error } = useGetClient(id);
  const client = data?.data?.client ?? data?.data ?? null;

  const initials = useMemo(() => getInitials(client ? { firstName: client?.firstName, lastName: client?.lastName, email: client?.email } : null), [client]);
  const formatDate = (value?: string) => formatDateUtil(value);
  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (isLoading && !client) {
    return <Loading fullScreen message="Loading client..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">Client Details</ThemedText>
              <Text className="text-gray-600 mt-1">Client ID: {id}</Text>
            </View>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          <View className="items-center gap-3">
            {client?.avatar ? (
              <Image
                source={{ uri: client.avatar }}
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
                {client
                  ? `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || client.email
                  : '—'}
              </Text>
              <View className="flex-row items-center gap-2">
                <Badge
                  variant={client?.emailVerified ? 'success' : 'error'}
                  size="sm"
                  icon={
                    <MaterialIcons
                      name={client?.emailVerified ? 'verified' : 'error-outline'}
                      size={14}
                      color={client?.emailVerified ? '#059669' : '#a33c3c'}
                    />
                  }>
                  {client?.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge
                  variant={client?.isActive ? 'success' : 'error'}
                  size="sm"
                  icon={
                    <MaterialIcons
                      name={client?.isActive ? 'verified-user' : 'block'}
                      size={14}
                      color={client?.isActive ? '#059669' : '#a33c3c'}
                    />
                  }>
                  {client?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </View>
            </View>
          </View>
          <View className="items-center">
            <Pressable
              onPress={() => router.push(`/(authenticated)/clients/${id}/edit`)}
              className="rounded-xl bg-brand-primary px-6 py-3"
              accessibilityRole="button"
              accessibilityLabel="Edit client">
              <Text className="font-inter text-base font-semibold text-white">
                Edit Client
              </Text>
            </Pressable>
          </View>

          <View className="gap-6">
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Contact Information
              </Text>
              <View className="mt-4 gap-3">
                <InfoRow icon="mail-outline" label="Email" value={client?.email ?? '—'} />
                <InfoRow icon="call" label="Phone" value={client?.phone ?? 'Not provided'} />
                <InfoRow icon="business" label="Company" value={client?.company ?? '—'} />
              </View>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Address
              </Text>
              <View className="mt-4 gap-3">
                <InfoRow icon="place" label="Address" value={client?.address ?? '—'} />
                <InfoRow icon="location-city" label="City" value={client?.city ?? '—'} />
                <InfoRow icon="public" label="Country" value={client?.country ?? '—'} />
              </View>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Account Details
              </Text>
              <View className="mt-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="verified" size={18} color="#9ca3af" />
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                      Verified
                    </Text>
                  </View>
                  <Badge
                    variant={client?.emailVerified ? 'success' : 'error'}
                    size="sm"
                    icon={
                      <MaterialIcons
                        name={client?.emailVerified ? 'verified' : 'error-outline'}
                        size={14}
                        color={client?.emailVerified ? '#059669' : '#a33c3c'}
                      />
                    }>
                    {client?.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="shield" size={18} color="#9ca3af" />
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </Text>
                  </View>
                  <Badge
                    variant={client?.isActive ? 'success' : 'error'}
                    size="sm"
                    icon={
                      <MaterialIcons
                        name={client?.isActive ? 'verified-user' : 'block'}
                        size={14}
                        color={client?.isActive ? '#059669' : '#a33c3c'}
                      />
                    }>
                    {client?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </View>
                <InfoRow icon="event-note" label="Created" value={formatDate(client?.createdAt)} />
                <InfoRow icon="update" label="Updated" value={formatDate(client?.updatedAt)} />
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


