import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useSendNotification } from '@/tanstack/useNotifications';
import { useGetAllUsers } from '@/tanstack/useUsers';
import { useGetClients } from '@/tanstack/useClients';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type RecipientModel = 'user' | 'client';
type NotificationType = 'email' | 'sms' | 'in_app' | 'push';
type NotificationCategory = 'general' | 'project' | 'invoice' | 'payment' | 'quotation';

export default function SendNotificationScreen() {
  const router = useRouter();
  const { mutateAsync, isPending } = useSendNotification();
  const { data: usersData } = useGetAllUsers({ limit: 200 });
  const { data: clientsData } = useGetClients({ limit: 200 });

  const users = useMemo(() => {
    const root = usersData?.data ?? {};
    return (root?.data?.users ?? root?.users ?? root?.data ?? []) as any[];
  }, [usersData]);

  const clients = useMemo(() => {
    const root = clientsData?.data ?? {};
    return (root?.data?.clients ?? root?.clients ?? root?.data ?? []) as any[];
  }, [clientsData]);

  const [recipientModel, setRecipientModel] = useState<RecipientModel>('user');
  const [recipient, setRecipient] = useState('');
  const [type, setType] = useState<NotificationType>('in_app');
  const [category, setCategory] = useState<NotificationCategory>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [metadata, setMetadata] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  const recipients = recipientModel === 'user' ? users : clients;

  const isBusy = isPending;

  const handleSubmit = useCallback(async () => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const trimmedMetadata = metadata.trim();

    if (!recipient) {
      setInlineStatus({ type: 'error', text: 'Please select a recipient.' });
      return;
    }

    if (!trimmedSubject) {
      setInlineStatus({ type: 'error', text: 'Subject is required.' });
      return;
    }

    if (!trimmedMessage) {
      setInlineStatus({ type: 'error', text: 'Message is required.' });
      return;
    }

    setInlineStatus(null);
    try {
      const payload: any = {
        recipient,
        recipientModel,
        type,
        category,
        subject: trimmedSubject,
        message: trimmedMessage,
      };

      if (trimmedMetadata) {
        try {
          payload.metadata = JSON.parse(trimmedMetadata);
        } catch {
          setInlineStatus({
            type: 'error',
            text: 'Metadata must be valid JSON.',
          });
          return;
        }
      }

      await mutateAsync(payload);
      setInlineStatus({ type: 'success', text: 'Notification sent successfully.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to send notification right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [recipient, recipientModel, type, category, subject, message, metadata, mutateAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8 gap-6">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Send Notification
          </ThemedText>

          <View className="gap-5">
            {/* Recipient Model */}
            <View className="gap-2">
              <Text className="form-label">Recipient Type *</Text>
              <View className="flex-row gap-4">
                <Pressable
                  onPress={() => {
                    setRecipientModel('user');
                    setRecipient('');
                    setInlineStatus(null);
                  }}
                  className={`flex-1 rounded-xl border px-4 py-3 ${
                    recipientModel === 'user'
                      ? 'border-brand-primary bg-brand-tint'
                      : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                  }`}>
                  <Text
                    className={`font-inter text-base font-semibold ${
                      recipientModel === 'user'
                        ? 'text-brand-primary'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    User
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setRecipientModel('client');
                    setRecipient('');
                    setInlineStatus(null);
                  }}
                  className={`flex-1 rounded-xl border px-4 py-3 ${
                    recipientModel === 'client'
                      ? 'border-brand-primary bg-brand-tint'
                      : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                  }`}>
                  <Text
                    className={`font-inter text-base font-semibold ${
                      recipientModel === 'client'
                        ? 'text-brand-primary'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    Client
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Recipient */}
            <View className="gap-2">
              <Text className="form-label">Recipient *</Text>
              <View className="border border-gray-300 rounded-xl bg-white px-1">
                <Picker
                  selectedValue={recipient}
                  onValueChange={(value: string) => {
                    setRecipient(value);
                    setInlineStatus(null);
                  }}
                  style={{ height: 44 }}>
                  <Picker.Item label={`Select ${recipientModel}`} value="" />
                  {recipients.map((item: any) => {
                    const id = item._id || item.id;
                    const name =
                      `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() ||
                      item.company ||
                      item.email;
                    return <Picker.Item key={id} label={name} value={id} />;
                  })}
                </Picker>
              </View>
            </View>

            {/* Type */}
            <View className="gap-2">
              <Text className="form-label">Type *</Text>
              <View className="border border-gray-300 rounded-xl bg-white px-1">
                <Picker
                  selectedValue={type}
                  onValueChange={(value: NotificationType) => {
                    setType(value);
                    setInlineStatus(null);
                  }}
                  style={{ height: 44 }}>
                  <Picker.Item label="Email" value="email" />
                  <Picker.Item label="SMS" value="sms" />
                  <Picker.Item label="In-App" value="in_app" />
                  <Picker.Item label="Push" value="push" />
                </Picker>
              </View>
            </View>

            {/* Category */}
            <View className="gap-2">
              <Text className="form-label">Category *</Text>
              <View className="border border-gray-300 rounded-xl bg-white px-1">
                <Picker
                  selectedValue={category}
                  onValueChange={(value: NotificationCategory) => {
                    setCategory(value);
                    setInlineStatus(null);
                  }}
                  style={{ height: 44 }}>
                  <Picker.Item label="General" value="general" />
                  <Picker.Item label="Project" value="project" />
                  <Picker.Item label="Invoice" value="invoice" />
                  <Picker.Item label="Payment" value="payment" />
                  <Picker.Item label="Quotation" value="quotation" />
                </Picker>
              </View>
            </View>

            {/* Subject */}
            <View className="gap-2">
              <Text className="form-label">Subject *</Text>
              <TextInput
                value={subject}
                onChangeText={(v) => {
                  setSubject(v);
                  setInlineStatus(null);
                }}
                placeholder="Notification subject"
                className="form-input"
              />
            </View>

            {/* Message */}
            <View className="gap-2">
              <Text className="form-label">Message *</Text>
              <TextInput
                value={message}
                onChangeText={(v) => {
                  setMessage(v);
                  setInlineStatus(null);
                }}
                placeholder="Notification message"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="form-input"
              />
            </View>

            {/* Metadata */}
            <View className="gap-2">
              <Text className="form-label">Metadata (JSON, optional)</Text>
              <TextInput
                value={metadata}
                onChangeText={(v) => {
                  setMetadata(v);
                  setInlineStatus(null);
                }}
                placeholder='{"key": "value"}'
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="form-input font-mono"
              />
              <Text className="font-inter text-xs text-gray-500">
                Optional JSON metadata for the notification
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row items-center justify-end gap-3">
              <Pressable onPress={handleCancel} disabled={isBusy} className="btn btn-secondary">
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={isBusy}
                className="btn btn-primary min-w-[150px]">
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Send Notification</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

