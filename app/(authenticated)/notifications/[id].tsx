import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import {
  useGetNotification,
  useMarkAsRead,
  useDeleteNotification,
} from '@/tanstack/useNotifications';
import { formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type ActionType = 'delete' | null;

const categoryVariantMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  general: 'default',
  project: 'info',
  invoice: 'warning',
  payment: 'success',
  quotation: 'info',
};

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const notificationId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetNotification(notificationId);
  const { mutateAsync: markAsReadAsync, isPending: markingRead } = useMarkAsRead();
  const { mutateAsync: deleteNotificationAsync, isPending: deleting } = useDeleteNotification();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const notification = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.notification ?? root?.notification ?? root?.data ?? root;
  }, [data]);

  const category = (notification?.category ?? 'general').toLowerCase();
  const categoryVariant = categoryVariantMap[category] ?? 'default';
  const isRead = notification?.isRead ?? false;
  const type = notification?.type ?? 'in_app';
  const actions = notification?.actions ?? [];

  const handleMarkAsRead = useCallback(async () => {
    if (!notificationId || isRead) return;
    try {
      await markAsReadAsync(notificationId);
      setInlineStatus({ type: 'success', text: 'Notification marked as read.' });
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to mark as read.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [notificationId, isRead, markAsReadAsync, refetch]);

  const handleAction = useCallback((action: ActionType) => {
    setActionError(null);
    setActiveAction(action);
  }, []);

  const performAction = useCallback(async () => {
    if (!notificationId || !activeAction) return;
    setActionError(null);
    try {
      if (activeAction === 'delete') {
        await deleteNotificationAsync(notificationId);
        setInlineStatus({ type: 'success', text: 'Notification deleted successfully.' });
        setTimeout(() => {
          router.replace('/(authenticated)/notifications');
        }, 600);
      }
      setActiveAction(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to complete the action.';
      setActionError(message);
    }
  }, [activeAction, deleteNotificationAsync, notificationId, router]);

  const handleActionClick = useCallback(
    (action: any) => {
      if (action.type === 'api') {
        // Handle API action - would need to make API call
        console.log('API action:', action);
      } else if (action.type === 'navigate') {
        // Handle navigation action
        if (action.route) {
          router.push(action.route as any);
        }
      }
    },
    [router]
  );

  if (!notificationId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Notification ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading && !notification) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading notification…" />
      </ThemedView>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (errorMessage && !notification) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <View className="p-6 gap-4">
          <Alert variant="error" message={errorMessage} className="w-full" />
          <Pressable onPress={() => refetch()} className="btn btn-primary self-start">
            <Text className="btn-text btn-text-primary">Retry</Text>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const createdAt = notification?.createdAt;
  const sentAt = notification?.sentAt ?? notification?.createdAt;
  const metadata = notification?.metadata;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <View className="flex-row items-center justify-between flex-wrap gap-3">
              <View>
                <ThemedText type="title">Notification Details</ThemedText>
                <Text className="text-gray-600">{formatDate(createdAt)}</Text>
              </View>
              <Badge variant={categoryVariant} size="md">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            </View>
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-3">
            {!isRead && (
              <Pressable
                onPress={handleMarkAsRead}
                disabled={markingRead}
                className="btn btn-primary">
                {markingRead ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Mark as Read</Text>
                )}
              </Pressable>
            )}
            <Pressable
              onPress={() => handleAction('delete')}
              className="btn btn-secondary"
              disabled={deleting}>
              {deleting ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Delete</Text>
              )}
            </Pressable>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Notification Information
            </Text>
            <View className="gap-3">
              <InfoRow icon="label" label="Category" value={category} />
              <InfoRow icon="subject" label="Subject" value={notification?.subject ?? '—'} />
              <InfoRow icon="message" label="Type" value={type} />
              <InfoRow
                icon="visibility"
                label="Read Status"
                value={isRead ? 'Read' : 'Unread'}
              />
              <InfoRow icon="event" label="Created" value={formatDate(createdAt)} />
              {sentAt && sentAt !== createdAt && (
                <InfoRow icon="send" label="Sent" value={formatDate(sentAt)} />
              )}
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Message
            </Text>
            <Text className="font-inter text-base text-gray-700 dark:text-gray-200">
              {notification?.message ?? 'No message content'}
            </Text>
          </View>

          {metadata && Object.keys(metadata).length > 0 && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Metadata
              </Text>
              <View className="gap-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <View key={key} className="flex-row items-start gap-2">
                    <Text className="font-inter text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {key}:
                    </Text>
                    <Text className="flex-1 font-inter text-sm text-gray-900 dark:text-gray-100">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {actions.length > 0 && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Actions
              </Text>
              <View className="gap-2">
                {actions.map((action: any, index: number) => (
                  <Pressable
                    key={index}
                    onPress={() => handleActionClick(action)}
                    className="btn btn-secondary">
                    <Text className="btn-text btn-text-secondary">
                      {action.label ?? `Action ${index + 1}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={activeAction === 'delete'}
        title="Delete Notification"
        onClose={() => {
          if (deleting) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (deleting) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={deleting}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={deleting}>
              {deleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to delete this notification? This action cannot be undone.
          </Text>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>
    </ThemedView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-50">
        {value ?? '—'}
      </Text>
    </View>
  );
}

