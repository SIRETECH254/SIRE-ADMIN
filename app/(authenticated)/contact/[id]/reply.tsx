import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { formatDate } from '@/utils';
import { useGetMessage, useReplyToMessage } from '@/tanstack/useContact';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function ContactReplyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const messageId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetMessage(messageId);
  const { mutateAsync: replyToMessageAsync, isPending: isSubmitting } = useReplyToMessage();

  const [reply, setReply] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const message = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.message ?? root?.message ?? root?.data ?? root;
  }, [data]);

  const validateReply = useCallback((): boolean => {
    setValidationError(null);
    const trimmedReply = reply.trim();
    if (!trimmedReply) {
      setValidationError('Reply message is required');
      return false;
    }
    if (trimmedReply.length < 10) {
      setValidationError('Reply must be at least 10 characters');
      return false;
    }
    if (trimmedReply.length > 2000) {
      setValidationError('Reply cannot exceed 2000 characters');
      return false;
    }
    return true;
  }, [reply]);

  const handleSubmit = useCallback(async () => {
    if (!validateReply()) return;

    try {
      setInlineStatus(null);
      await replyToMessageAsync({
        messageId,
        replyData: { reply: reply.trim() },
      });
      setInlineStatus({ type: 'success', text: 'Reply sent successfully.' });
      setTimeout(() => {
        router.replace(`/(authenticated)/contact/${messageId}`);
      }, 1000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to send reply.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [reply, messageId, replyToMessageAsync, router, validateReply]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

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
  const replyLength = reply.trim().length;
  const isReplyValid = replyLength >= 10 && replyLength <= 2000;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <ThemedText type="title">Reply to Message</ThemedText>
            {inlineStatus ? (
              <Alert
                variant={inlineStatus.type}
                message={inlineStatus.text}
                className="w-full"
              />
            ) : null}
          </View>

          {/* Original Message */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Original Message
            </Text>
            <View className="gap-3">
              <InfoRow icon="person" label="From" value={message?.name ?? '—'} />
              <InfoRow icon="email" label="Email" value={message?.email ?? '—'} />
              {message?.phone && (
                <InfoRow icon="phone" label="Phone" value={message.phone} />
              )}
              <InfoRow icon="subject" label="Subject" value={message?.subject ?? '—'} />
              <InfoRow icon="event" label="Date" value={formatDate(createdAt)} />
              <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Message:
                </Text>
                <Text className="font-inter text-base text-gray-700 dark:text-gray-200">
                  {message?.message ?? 'No message content'}
                </Text>
              </View>
            </View>
          </View>

          {/* Reply Form */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Your Reply
            </Text>
            <View className="gap-3">
              <View>
                <Text className="font-inter text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Reply Message <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  multiline
                  numberOfLines={8}
                  placeholder="Enter your reply (minimum 10 characters, maximum 2000 characters)..."
                  placeholderTextColor="#9ca3af"
                  value={reply}
                  onChangeText={(text) => {
                    setReply(text);
                    setValidationError(null);
                    setInlineStatus(null);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 min-h-[120px]"
                  textAlignVertical="top"
                />
                <View className="flex-row items-center justify-between mt-2">
                  <View>
                    {validationError ? (
                      <Text className="text-brand-accent text-sm">{validationError}</Text>
                    ) : null}
                  </View>
                  <Text
                    className={`text-xs ${
                      replyLength > 2000
                        ? 'text-brand-accent'
                        : replyLength < 10
                          ? 'text-gray-500'
                          : 'text-gray-600'
                    }`}>
                    {replyLength} / 2000
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={handleCancel}
              disabled={isSubmitting}
              className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !isReplyValid}
              className={`btn btn-primary min-w-[140px] ${
                !isReplyValid ? 'opacity-50' : ''
              }`}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Submit Reply</Text>
              )}
            </Pressable>
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

