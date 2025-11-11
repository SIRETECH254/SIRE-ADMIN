import React, { useMemo } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { useGetProfile } from '@/tanstack/useUsers';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useThemeToggle();
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetProfile();

  const profile = useMemo(() => {
    return data?.data?.user ?? user ?? null;
  }, [data?.data?.user, user]);

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

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    null;

  const handleEdit = () => {
    router.push('/(authenticated)/profile/edit');
  };

  if (isLoading && !profile) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        <View className="px-6 py-8 gap-6">
          <View className="items-center gap-4">
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
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
                {profile
                  ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() ||
                    profile.email
                  : '—'}
              </Text>
              <View className="flex-row items-center gap-2">
                <Badge variant="info" size="sm">
                  {profile?.role ?? '—'}
                </Badge>
                <Badge variant={profile?.isActive ? 'success' : 'error'} size="sm">
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </View>
            </View>
            <Pressable
              onPress={handleEdit}
              className="rounded-xl bg-brand-primary px-6 py-3"
              accessibilityRole="button"
              accessibilityLabel="Edit profile">
              <Text className="font-inter text-base font-semibold text-white">
                Edit Profile
              </Text>
            </Pressable>
          </View>

          {errorMessage ? (
            <Alert
              variant="error"
              message={errorMessage}
              className="w-full"
            />
          ) : null}

          <View className="gap-6">
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Contact Information
              </Text>
              <View className="mt-4 gap-3">
                <ProfileRow
                  label="Email"
                  icon="mail-outline"
                  value={profile?.email ?? '—'}
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  valueClassName="max-w-[60%]"
                />
                <ProfileRow
                  label="Phone"
                  icon="call"
                  value={profile?.phone ?? 'Not provided'}
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  valueClassName="max-w-[60%]"
                />
              </View>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Account Details
              </Text>
              <View className="mt-4 gap-3">
                <ProfileRow
                  label="Role"
                  icon="workspace-premium"
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  badgeContent={
                    <Badge variant="info" size="sm">
                      {profile?.role ?? '—'}
                    </Badge>
                  }
                />
                <ProfileRow
                  label="Status"
                  icon="shield"
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  badgeContent={
                    <Badge variant={profile?.isActive ? 'success' : 'error'} size="sm">
                      {profile?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  }
                />
                <ProfileRow
                  label="Email Verified"
                  icon="verified"
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  badgeContent={
                    <Badge variant={profile?.emailVerified ? 'success' : 'warning'} size="sm">
                      {profile?.emailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  }
                />
                <ProfileRow
                  label="Created"
                  icon="event-note"
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  value={formatDate(profile?.createdAt)}
                />
                <ProfileRow
                  label="Updated"
                  icon="update"
                  iconColor={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                  value={formatDate(profile?.updatedAt)}
                />
              </View>
            </View>
          </View>
      </View>
      </ScrollView>
    </ThemedView>
  );
}

type ProfileRowProps = {
  label: string;
  value?: string;
  icon: MaterialIcons['props']['name'];
  iconColor: string;
  badgeContent?: React.ReactNode;
  valueClassName?: string;
};

function ProfileRow({ label, value, icon, iconColor, badgeContent, valueClassName }: ProfileRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color={iconColor} />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      {badgeContent ? (
        badgeContent
      ) : (
        <Text
          className={`text-right font-inter text-base text-gray-900 dark:text-gray-100 ${valueClassName ?? ''}`}>
          {value ?? '—'}
        </Text>
      )}
    </View>
  );
}
