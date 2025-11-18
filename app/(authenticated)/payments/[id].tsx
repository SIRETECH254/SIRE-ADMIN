import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useGetPayment, useUpdatePayment, useDeletePayment } from '@/tanstack/usePayments';
import { formatCurrency, formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type ActionType = 'updateStatus' | 'delete' | null;

const statusVariantMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'info' | 'success' | 'warning' | 'error';
    icon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  pending: { label: 'Pending', variant: 'info', icon: 'schedule' },
  processing: { label: 'Processing', variant: 'info', icon: 'sync' },
  completed: { label: 'Completed', variant: 'success', icon: 'check-circle' },
  failed: { label: 'Failed', variant: 'error', icon: 'error' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'cancel' },
};

const statusOptions = ['pending', 'processing', 'completed', 'failed', 'cancelled'];

export default function PaymentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const paymentId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetPayment(paymentId);
  const { mutateAsync: updatePaymentAsync, isPending: updatePending } = useUpdatePayment();
  const { mutateAsync: deletePaymentAsync, isPending: deletePending } = useDeletePayment();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const payment = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.payment ?? root?.payment ?? root?.data ?? root;
  }, [data]);

  const statusValue = (payment?.status ?? 'pending').toLowerCase();
  const statusConfig = statusVariantMap[statusValue] ?? statusVariantMap.pending;
  const amount = payment?.amount ?? 0;
  const currency = payment?.currency ?? 'KES';
  const method = payment?.paymentMethod?.toLowerCase() ?? 'unknown';
  const isMpesa = method === 'mpesa';

  const invoice = payment?.invoice ?? payment?.invoiceId;
  const invoiceNumber = invoice?.invoiceNumber ?? invoice?._id ?? invoice ?? '—';

  const client = payment?.client ?? payment?.clientId;
  const clientName = useMemo(() => {
    if (!client) return '—';
    const fullName = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
    return fullName || client.company || client.email || 'Client';
  }, [client]);

  const isActionBusy = updatePending || deletePending;

  const handleAction = useCallback((action: ActionType) => {
    setActionError(null);
    setActiveAction(action);
    if (action === 'updateStatus') {
      setNewStatus(statusValue);
    }
  }, [statusValue]);

  const performAction = useCallback(async () => {
    if (!paymentId || !activeAction) return;
    setActionError(null);
    try {
      if (activeAction === 'updateStatus') {
        await updatePaymentAsync({
          paymentId,
          paymentData: { status: newStatus },
        });
        setInlineStatus({ type: 'success', text: 'Payment status updated successfully.' });
        await refetch();
      } else if (activeAction === 'delete') {
        await deletePaymentAsync(paymentId);
        setInlineStatus({ type: 'success', text: 'Payment deleted successfully.' });
        setTimeout(() => {
          router.replace('/(authenticated)/payments');
        }, 600);
      }
      setActiveAction(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to complete the action.';
      setActionError(message);
    }
  }, [activeAction, deletePaymentAsync, newStatus, paymentId, refetch, updatePaymentAsync, router]);

  if (!paymentId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Payment ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading && !payment) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading payment..." />
      </ThemedView>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (errorMessage && !payment) {
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

  const paymentDate = payment?.paymentDate ?? payment?.createdAt;
  const createdAt = payment?.createdAt;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <View className="flex-row items-center justify-between flex-wrap gap-3">
              <View>
                <ThemedText type="title">
                  {payment?.paymentNumber ?? `Payment ${paymentId.slice(0, 8)}`}
                </ThemedText>
                <Text className="text-gray-600">{formatDate(createdAt)}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Badge
                  variant={isMpesa ? 'info' : 'default'}
                  size="md"
                  icon={
                    <MaterialIcons
                      name={isMpesa ? 'phone-android' : 'credit-card'}
                      size={16}
                      color="#7b1c1c"
                    />
                  }>
                  {isMpesa ? 'M-Pesa' : method === 'paystack' ? 'Paystack' : method}
                </Badge>
                <Badge
                  variant={statusConfig.variant}
                  size="md"
                  icon={
                    <MaterialIcons
                      name={statusConfig.icon}
                      size={16}
                      color={
                        statusConfig.variant === 'error'
                          ? '#a33c3c'
                          : statusConfig.variant === 'success'
                          ? '#059669'
                          : '#7b1c1c'
                      }
                    />
                  }>
                  {statusConfig.label}
                </Badge>
              </View>
            </View>
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Pressable
              onPress={() => handleAction('updateStatus')}
              className="btn btn-secondary"
              disabled={isActionBusy}>
              {updatePending ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Update Status</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => handleAction('delete')}
              className="btn btn-secondary"
              disabled={isActionBusy}>
              {deletePending ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Delete</Text>
              )}
            </Pressable>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Transaction Details
            </Text>
            <View className="mt-4 gap-3">
              <InfoRow icon="attach-money" label="Amount" value={formatCurrency(amount, currency)} />
              <InfoRow icon="event" label="Payment Date" value={formatDate(paymentDate)} />
              <InfoRow icon="event-available" label="Created" value={formatDate(createdAt)} />
              {payment?.transactionReference && (
                <InfoRow
                  icon="confirmation-number"
                  label="Transaction Reference"
                  value={payment.transactionReference}
                />
              )}
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Invoice Reference
            </Text>
            <View className="mt-4 gap-3">
              <InfoRow icon="description" label="Invoice Number" value={invoiceNumber} />
              {invoice && typeof invoice === 'object' && invoice._id ? (
                <Pressable
                  onPress={() => router.push(`/(authenticated)/invoices/${invoice._id}`)}
                  className="btn btn-secondary self-start">
                  <Text className="btn-text btn-text-secondary">View Invoice</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Client Information
            </Text>
            <View className="mt-4 gap-3">
              <InfoRow icon="person" label="Client" value={clientName} />
              {client && typeof client === 'object' && client.email && (
                <InfoRow icon="mail-outline" label="Email" value={client.email} />
              )}
              {client && typeof client === 'object' && client._id ? (
                <Pressable
                  onPress={() => router.push(`/(authenticated)/clients/${client._id}`)}
                  className="btn btn-secondary self-start">
                  <Text className="btn-text btn-text-secondary">View Client</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Payment Method Details
            </Text>
            <View className="mt-4 gap-3">
              {isMpesa ? (
                <>
                  {payment?.phoneNumber && (
                    <InfoRow icon="phone" label="Phone Number" value={payment.phoneNumber} />
                  )}
                  {payment?.checkoutRequestId && (
                    <InfoRow
                      icon="receipt"
                      label="Checkout Request ID"
                      value={payment.checkoutRequestId}
                    />
                  )}
                  {payment?.merchantRequestId && (
                    <InfoRow
                      icon="receipt-long"
                      label="Merchant Request ID"
                      value={payment.merchantRequestId}
                    />
                  )}
                </>
              ) : (
                <>
                  {payment?.email && <InfoRow icon="mail-outline" label="Email" value={payment.email} />}
                  {payment?.authorizationCode && (
                    <InfoRow
                      icon="verified"
                      label="Authorization Code"
                      value={payment.authorizationCode}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          {payment?.notes && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Notes
              </Text>
              <Text className="mt-3 text-gray-700 dark:text-gray-200">{payment.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={activeAction === 'updateStatus'}
        title="Update Payment Status"
        onClose={() => {
          if (isActionBusy) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (isActionBusy) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={isActionBusy}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={isActionBusy}>
              {isActionBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Update</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Select new status:
          </Text>
          <View className="border border-gray-300 rounded-xl bg-white px-1">
            <Picker
              selectedValue={newStatus}
              onValueChange={setNewStatus}
              style={{ height: 44 }}>
              {statusOptions.map((status) => {
                const config = statusVariantMap[status] ?? statusVariantMap.pending;
                return (
                  <Picker.Item
                    key={status}
                    label={config.label}
                    value={status}
                  />
                );
              })}
            </Picker>
          </View>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>

      <Modal
        visible={activeAction === 'delete'}
        title="Delete Payment"
        onClose={() => {
          if (isActionBusy) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (isActionBusy) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={isActionBusy}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={isActionBusy}>
              {isActionBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to delete this payment? This action cannot be undone.
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

