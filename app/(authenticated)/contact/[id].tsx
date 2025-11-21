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
  useGetMessage,
  useMarkMessageAsRead,
  useArchiveMessage,
  useDeleteMessage,
} from '@/tanstack/useContact';
import { formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type ActionType = 'delete' | 'archive' | null;

const statusVariantMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  unread: 'error',
  read: 'default',
  replied: 'success',
  archived: 'info',
};

export default function ContactDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const messageId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetMessage(messageId);
  const { mutateAsync: markAsReadAsync, isPending: markingRead } = useMarkMessageAsRead();
  const { mutateAsync: archiveMessageAsync, isPending: archiving } = useArchiveMessage();
  const { mutateAsync: deleteMessageAsync, isPending: deleting } = useDeleteMessage();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const message = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.message ?? root?.message ?? root?.data ?? root;
  }, [data]);

  const status = (message?.status ?? 'unread').toLowerCase();
  const statusVariant = statusVariantMap[status] ?? 'default';
  const isUnread = status === 'unread';
  const isReplied = status === 'replied';

  const handleMarkAsRead = useCallback(async () => {
    if (!messageId || !isUnread) return;
    try {
      await markAsReadAsync(messageId);
      setInlineStatus({ type: 'success', text: 'Message marked as read.' });
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to mark as read.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [messageId, isUnread, markAsReadAsync, refetch]);

  const handleReply = useCallback(() => {
    router.push(`/(authenticated)/contact/${messageId}/reply`);
  }, [router, messageId]);

  const handleAction = useCallback((action: ActionType) => {
    setActionError(null);
    setActiveAction(action);
  }, []);

  const performAction = useCallback(async () => {
    if (!messageId || !activeAction) return;
    setActionError(null);
    try {
      if (activeAction === 'delete') {
        await deleteMessageAsync(messageId);
        setInlineStatus({ type: 'success', text: 'Message deleted successfully.' });
        setTimeout(() => {
          router.replace('/(authenticated)/contact');
        }, 600);
      } else if (activeAction === 'archive') {
        await archiveMessageAsync(messageId);
        setInlineStatus({ type: 'success', text: 'Message archived successfully.' });
        await refetch();
      }
      setActiveAction(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to complete the action.';
      setActionError(message);
    }
  }, [activeAction, deleteMessageAsync, archiveMessageAsync, messageId, router, refetch]);

  if (!messageId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Message ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading && !message) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading message…" />
      </ThemedView>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (errorMessage && !message) {
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

  const createdAt = message?.createdAt;
  const repliedBy = message?.repliedBy;
  const repliedAt = message?.repliedAt;
  const reply = message?.reply;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <View className="flex-row items-center justify-between flex-wrap gap-3">
              <View>
                <ThemedText type="title">Contact Message</ThemedText>
                <Text className="text-gray-600">{formatDate(createdAt)}</Text>
              </View>
              <Badge variant={statusVariant} size="md">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </View>
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-3">
            {isUnread && (
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
            {!isReplied && (
              <Pressable onPress={handleReply} className="btn btn-secondary">
                <Text className="btn-text btn-text-secondary">Reply</Text>
              </Pressable>
            )}
            {status !== 'archived' && (
              <Pressable
                onPress={() => handleAction('archive')}
                className="btn btn-secondary"
                disabled={archiving}>
                {archiving ? (
                  <ActivityIndicator size="small" color="#7b1c1c" />
                ) : (
                  <Text className="btn-text btn-text-secondary">Archive</Text>
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
              Sender Information
            </Text>
            <View className="gap-3">
              <InfoRow icon="person" label="Name" value={message?.name ?? '—'} />
              <InfoRow icon="email" label="Email" value={message?.email ?? '—'} />
              {message?.phone && (
                <InfoRow icon="phone" label="Phone" value={message.phone} />
              )}
              <InfoRow icon="event" label="Created" value={formatDate(createdAt)} />
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Message
            </Text>
            <View className="gap-3">
              <InfoRow icon="subject" label="Subject" value={message?.subject ?? '—'} />
              <View className="mt-2">
                <Text className="font-inter text-base text-gray-700 dark:text-gray-200">
                  {message?.message ?? 'No message content'}
                </Text>
              </View>
            </View>
          </View>

          {isReplied && reply ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Reply
              </Text>
              <View className="gap-3">
                <View className="mt-2">
                  <Text className="font-inter text-base text-gray-700 dark:text-gray-200 mb-3">
                    {reply}
                  </Text>
                </View>
                {repliedBy && (
                  <InfoRow
                    icon="person"
                    label="Replied by"
                    value={
                      typeof repliedBy === 'object'
                        ? `${repliedBy.firstName ?? ''} ${repliedBy.lastName ?? ''}`.trim() ||
                          repliedBy.email ||
                          '—'
                        : '—'
                    }
                  />
                )}
                {repliedAt && (
                  <InfoRow icon="event" label="Replied at" value={formatDate(repliedAt)} />
                )}
              </View>
            </View>
          ) : (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Reply
              </Text>
              <Text className="font-inter text-base text-gray-700 dark:text-gray-200 mb-4">
                No reply has been sent yet.
              </Text>
              <Pressable onPress={handleReply} className="btn btn-primary self-start">
                <Text className="btn-text btn-text-primary">Send Reply</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Archive confirmation modal */}
      <Modal
        visible={activeAction === 'archive'}
        title="Archive Message"
        onClose={() => {
          if (archiving) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (archiving) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={archiving}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={archiving}>
              {archiving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Archive</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to archive this message?
          </Text>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={activeAction === 'delete'}
        title="Delete Message"
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
            Are you sure you want to delete this message? This action cannot be undone.
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

