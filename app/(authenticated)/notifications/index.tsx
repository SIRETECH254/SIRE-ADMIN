import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  useGetUserNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/tanstack/useNotifications';
import { formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

type CategoryFilter = 'all' | 'general' | 'project' | 'invoice' | 'payment' | 'quotation';
type StatusFilter = 'all' | 'read' | 'unread';

const categoryVariantMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  general: 'default',
  project: 'info',
  invoice: 'warning',
  payment: 'success',
  quotation: 'info',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [filterCategory, setFilterCategory] = useState<CategoryFilter>('all');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; subject?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Check if user is admin (can send notifications)
  const isAdmin = useMemo(() => {
    const role = user?.role;
    return role === 'super_admin' || role === 'admin';
  }, [user?.role]);

  // Build params
  const params = useMemo(() => {
    const p: any = {};
    if (filterCategory !== 'all') {
      p.category = filterCategory;
    }
    if (filterStatus !== 'all') {
      p.status = filterStatus === 'read' ? 'read' : 'unread';
    }
    return p;
  }, [filterCategory, filterStatus]);

  const { data, isLoading, error, refetch } = useGetUserNotifications(params);
  const { mutateAsync: markAsReadAsync, isPending: markingRead } = useMarkAsRead();
  const { mutateAsync: markAllAsReadAsync, isPending: markingAllRead } = useMarkAllAsRead();
  const { mutateAsync: deleteNotificationAsync, isPending: isDeleting } = useDeleteNotification();

  const notifications = useMemo(() => {
    const root = data?.data ?? {};
    return (root?.data?.notifications ?? root?.notifications ?? root?.data ?? []) as any[];
  }, [data]);

  const clearFilters = useCallback(() => {
    setFilterCategory('all');
    setFilterStatus('all');
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/notifications/${id}`);
    },
    [router]
  );

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadAsync(notificationId);
        await refetch();
      } catch (err: any) {
        // Error handled by mutation
      }
    },
    [markAsReadAsync, refetch]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadAsync();
      await refetch();
    } catch (err: any) {
      // Error handled by mutation
    }
  }, [markAllAsReadAsync, refetch]);

  const handleRequestDelete = useCallback((notification: any) => {
    const id = notification._id || notification.id;
    setDeleteError(null);
    setConfirmDelete({
      id,
      subject: notification?.subject,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setDeleteError(null);
      await deleteNotificationAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete notification.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteNotificationAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <View className="px-4 py-4">
        <View className="mb-4 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <View>
            <ThemedText type="title">Notifications</ThemedText>
            <Text className="text-gray-600 mt-1">
              Monitor alerts, reminders, and announcements.
            </Text>
          </View>
          <View className="flex-row gap-2 flex-wrap">
            {/* Settings Button */}
            <Link
              href="/(authenticated)/notifications/settings"
              className="btn btn-secondary">
              <MaterialIcons name="settings" size={18} color="#7b1c1c" />
              <Text className="btn-text btn-text-secondary ml-2">Settings</Text>
            </Link>
            {/* Send Notification Button (Admin only) */}
            {isAdmin && (
              <Link
                href="/(authenticated)/notifications/send"
                className="btn btn-primary">
                <MaterialIcons name="send" size={18} color="#ffffff" />
                <Text className="btn-text btn-text-primary ml-2">Send Notification</Text>
              </Link>
            )}
          </View>
        </View>

        {/* Filters Toolbar */}
        <View className="flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <View className="flex-row gap-2 flex-wrap">
            {/* Category Filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="category" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterCategory}
                  onValueChange={(v: CategoryFilter) => setFilterCategory(v)}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Category: All" value="all" />
                  <Picker.Item label="General" value="general" />
                  <Picker.Item label="Project" value="project" />
                  <Picker.Item label="Invoice" value="invoice" />
                  <Picker.Item label="Payment" value="payment" />
                  <Picker.Item label="Quotation" value="quotation" />
                </Picker>
              </View>
            </View>
            {/* Read/Unread Filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="filter-list" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterStatus}
                  onValueChange={(v: StatusFilter) => setFilterStatus(v)}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Status: All" value="all" />
                  <Picker.Item label="Read" value="read" />
                  <Picker.Item label="Unread" value="unread" />
                </Picker>
              </View>
            </View>
            {(filterCategory !== 'all' || filterStatus !== 'all') ? (
              <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                <Text className="text-xs text-gray-700">Clear</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="btn btn-secondary">
            {markingAllRead ? (
              <ActivityIndicator size="small" color="#7b1c1c" />
            ) : (
              <>
                <MaterialIcons name="done-all" size={18} color="#7b1c1c" />
                <Text className="btn-text btn-text-secondary ml-2">Mark All as Read</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pb-6">
        {errorMessage ? (
          <View className="mb-4">
            <Alert variant="error" message={errorMessage} className="w-full" />
          </View>
        ) : null}

        {/* Loading skeleton rows */}
        {isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <View
                key={`skeleton-${idx}`}
                className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="h-5 w-16 rounded-md bg-gray-300 animate-pulse" />
                  <View className="h-4 w-32 rounded-md bg-gray-300 animate-pulse" />
                </View>
                <View className="h-4 w-full rounded-md bg-gray-300 animate-pulse mb-2" />
                <View className="h-4 w-3/4 rounded-md bg-gray-300 animate-pulse" />
              </View>
            ))
          : null}

        {/* Empty state */}
        {!isLoading && !errorMessage && notifications.length === 0 ? (
          <View className="py-8 items-center">
            <MaterialIcons name="notifications-none" size={48} color="#9ca3af" />
            <Text className="mt-4 text-gray-700 dark:text-gray-300">No notifications found</Text>
          </View>
        ) : null}

        {/* Notification cards */}
        {!isLoading && !errorMessage && notifications.length > 0
          ? notifications.map((notification: any) => {
              const id = notification._id || notification.id;
              const category = (notification?.category ?? 'general').toLowerCase();
              const isRead = notification?.isRead ?? false;
              const categoryVariant = categoryVariantMap[category] ?? 'default';

              return (
                <View
                  key={id}
                  className={`mb-3 rounded-xl border ${
                    isRead
                      ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                      : 'border-brand-primary/30 bg-brand-tint/30 dark:border-brand-primary/50 dark:bg-brand-tint/20'
                  } p-4`}>
                  <View className="flex-row items-start justify-between gap-3 mb-2">
                    <View className="flex-1 flex-row items-center gap-2">
                      <Badge variant={categoryVariant} size="sm">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                      {!isRead && (
                        <View className="h-2 w-2 rounded-full bg-brand-primary" />
                      )}
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(notification?.createdAt)}
                    </Text>
                  </View>
                  <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-50 mb-1">
                    {notification?.subject ?? 'Notification'}
                  </Text>
                  <Text
                    className="font-inter text-sm text-gray-700 dark:text-gray-300 mb-3"
                    numberOfLines={2}>
                    {notification?.message ?? 'No message'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {!isRead && (
                      <Pressable
                        onPress={() => handleMarkAsRead(id)}
                        disabled={markingRead}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                        {markingRead ? (
                          <ActivityIndicator size="small" color="#7b1c1c" />
                        ) : (
                          <Text className="text-xs text-gray-700 dark:text-gray-300">
                            Mark as Read
                          </Text>
                        )}
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => handleView(id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                      <Text className="text-xs text-gray-700 dark:text-gray-300">View</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRequestDelete(notification)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                      <Text className="text-xs text-red-700 dark:text-red-300">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          : null}
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete notification"
        onClose={handleCancelDelete}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable onPress={handleCancelDelete} disabled={isDeleting} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmDelete}
              disabled={isDeleting}
              className="btn btn-primary min-w-[120px]">
              {isDeleting && deletingId === confirmDelete?.id ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          {deleteError ? <Alert variant="error" message={deleteError} className="w-full" /> : null}
          <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
            {`Are you sure you want to delete ${
              confirmDelete?.subject ? `"${confirmDelete.subject}"` : 'this notification'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}
