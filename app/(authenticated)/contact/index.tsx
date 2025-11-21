import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  useGetAllMessages,
  useMarkMessageAsRead,
  useArchiveMessage,
  useDeleteMessage,
} from '@/tanstack/useContact';
import { formatDate } from '@/utils';

type StatusFilter = 'all' | 'unread' | 'read' | 'replied' | 'archived';

const statusVariantMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  unread: 'error',
  read: 'default',
  replied: 'success',
  archived: 'info',
};

export default function ContactScreen() {
  const router = useRouter();

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; subject?: string } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: string; subject?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Build params
  const params = useMemo(() => {
    const p: any = {};
    if (filterStatus !== 'all') {
      p.status = filterStatus;
    }
    if (searchQuery.trim()) {
      p.search = searchQuery.trim();
    }
    return p;
  }, [filterStatus, searchQuery]);

  const { data, isLoading, error, refetch } = useGetAllMessages(params);
  const { mutateAsync: markAsReadAsync, isPending: markingRead } = useMarkMessageAsRead();
  const { mutateAsync: archiveMessageAsync, isPending: archiving } = useArchiveMessage();
  const { mutateAsync: deleteMessageAsync, isPending: isDeleting } = useDeleteMessage();

  const messages = useMemo(() => {
    const root = data?.data ?? {};
    return (root?.data?.messages ?? root?.messages ?? root?.data ?? []) as any[];
  }, [data]);

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setSearchQuery('');
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/contact/${id}`);
    },
    [router]
  );

  const handleReply = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/contact/${id}/reply`);
    },
    [router]
  );

  const handleMarkAsRead = useCallback(
    async (messageId: string) => {
      try {
        await markAsReadAsync(messageId);
        await refetch();
      } catch (err: any) {
        // Error handled by mutation
      }
    },
    [markAsReadAsync, refetch]
  );

  const handleRequestArchive = useCallback((message: any) => {
    const id = message._id || message.id;
    setActionError(null);
    setConfirmArchive({
      id,
      subject: message?.subject,
    });
  }, []);

  const handleConfirmArchive = useCallback(async () => {
    if (!confirmArchive?.id) return;
    try {
      setArchivingId(confirmArchive.id);
      setActionError(null);
      await archiveMessageAsync(confirmArchive.id);
      setConfirmArchive(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to archive message.';
      setActionError(message);
    } finally {
      setArchivingId(null);
    }
  }, [confirmArchive, archiveMessageAsync, refetch]);

  const handleCancelArchive = useCallback(() => {
    setConfirmArchive(null);
    setActionError(null);
  }, []);

  const handleRequestDelete = useCallback((message: any) => {
    const id = message._id || message.id;
    setActionError(null);
    setConfirmDelete({
      id,
      subject: message?.subject,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setActionError(null);
      await deleteMessageAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete message.';
      setActionError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteMessageAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setActionError(null);
  }, []);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <View className="px-4 py-4">
        <View className="mb-4">
          <ThemedText type="title">Contact Messages</ThemedText>
          <Text className="text-gray-600 mt-1">
            Manage inbound contact requests and maintain response history.
          </Text>
        </View>

        {/* Filters Toolbar */}
        <View className="flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <View className="flex-row gap-2 flex-wrap">
            {/* Status Filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="filter-list" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterStatus}
                  onValueChange={(v: StatusFilter) => setFilterStatus(v)}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Status: All" value="all" />
                  <Picker.Item label="Unread" value="unread" />
                  <Picker.Item label="Read" value="read" />
                  <Picker.Item label="Replied" value="replied" />
                  <Picker.Item label="Archived" value="archived" />
                </Picker>
              </View>
            </View>
            {/* Search Input */}
            <View className="flex-1 min-w-[200px]">
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white dark:border-gray-700 dark:bg-gray-900">
                <MaterialIcons name="search" size={18} color="#9ca3af" />
                <TextInput
                  placeholder="Search by name, email, subject..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-2 text-gray-900 dark:text-gray-100"
                />
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery('')} className="ml-2">
                    <MaterialIcons name="close" size={18} color="#9ca3af" />
                  </Pressable>
                ) : null}
              </View>
            </View>
            {(filterStatus !== 'all' || searchQuery.trim()) ? (
              <Pressable
                onPress={clearFilters}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                <Text className="text-xs text-gray-700 dark:text-gray-300">Clear</Text>
              </Pressable>
            ) : null}
          </View>
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
        {!isLoading && !errorMessage && messages.length === 0 ? (
          <View className="py-8 items-center">
            <MaterialIcons name="mail-outline" size={48} color="#9ca3af" />
            <Text className="mt-4 text-gray-700 dark:text-gray-300">No contact messages found</Text>
          </View>
        ) : null}

        {/* Message cards */}
        {!isLoading && !errorMessage && messages.length > 0
          ? messages.map((message: any) => {
              const id = message._id || message.id;
              const status = (message?.status ?? 'unread').toLowerCase();
              const statusVariant = statusVariantMap[status] ?? 'default';

              return (
                <View
                  key={id}
                  className={`mb-3 rounded-xl border ${
                    status === 'unread'
                      ? 'border-brand-primary/30 bg-brand-tint/30 dark:border-brand-primary/50 dark:bg-brand-tint/20'
                      : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                  } p-4`}>
                  <View className="flex-row items-start justify-between gap-3 mb-2">
                    <View className="flex-1 flex-row items-center gap-2 flex-wrap">
                      <Badge variant={statusVariant} size="sm">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                      {status === 'unread' && (
                        <View className="h-2 w-2 rounded-full bg-brand-primary" />
                      )}
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(message?.createdAt)}
                    </Text>
                  </View>
                  <View className="mb-2">
                    <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-50 mb-1">
                      {message?.name ?? 'Unknown Sender'}
                    </Text>
                    <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                      {message?.email ?? 'No email'}
                    </Text>
                  </View>
                  <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-50 mb-1">
                    {message?.subject ?? 'No subject'}
                  </Text>
                  <Text
                    className="font-inter text-sm text-gray-700 dark:text-gray-300 mb-3"
                    numberOfLines={2}>
                    {message?.message ?? 'No message'}
                  </Text>
                  <View className="flex-row items-center gap-2 flex-wrap">
                    {status === 'unread' && (
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
                    {status !== 'replied' && (
                      <Pressable
                        onPress={() => handleReply(id)}
                        className="px-3 py-1.5 rounded-lg border border-brand-primary bg-brand-tint dark:border-brand-primary/50 dark:bg-brand-tint/20">
                        <Text className="text-xs text-brand-primary dark:text-brand-primary">
                          Reply
                        </Text>
                      </Pressable>
                    )}
                    {status !== 'archived' && (
                      <Pressable
                        onPress={() => handleRequestArchive(message)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                        <Text className="text-xs text-gray-700 dark:text-gray-300">Archive</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => handleRequestDelete(message)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                      <Text className="text-xs text-red-700 dark:text-red-300">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          : null}
      </ScrollView>

      {/* Archive confirmation modal */}
      <Modal
        visible={Boolean(confirmArchive)}
        title="Archive message"
        onClose={handleCancelArchive}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={handleCancelArchive}
              disabled={archiving}
              className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmArchive}
              disabled={archiving}
              className="btn btn-primary min-w-[120px]">
              {archiving && archivingId === confirmArchive?.id ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Archive</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
          <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
            {`Are you sure you want to archive ${
              confirmArchive?.subject ? `"${confirmArchive.subject}"` : 'this message'
            }?`}
          </Text>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete message"
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
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
          <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
            {`Are you sure you want to delete ${
              confirmDelete?.subject ? `"${confirmDelete.subject}"` : 'this message'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}
