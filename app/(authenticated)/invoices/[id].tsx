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
  useCancelInvoice,
  useGetInvoice,
  useMarkAsOverdue,
  useSendInvoice,
} from '@/tanstack/useInvoices';
import { useGetInvoicePayments } from '@/tanstack/usePayments';
import { formatCurrency, formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type ActionType = 'markOverdue' | 'cancel' | 'send' | null;

const statusVariantMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'info' | 'success' | 'warning' | 'error';
    icon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  draft: { label: 'Draft', variant: 'default', icon: 'description' },
  sent: { label: 'Sent', variant: 'info', icon: 'send' },
  paid: { label: 'Paid', variant: 'success', icon: 'check-circle' },
  partially_paid: { label: 'Partially Paid', variant: 'warning', icon: 'payments' },
  overdue: { label: 'Overdue', variant: 'error', icon: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'cancel' },
};

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetInvoice(invoiceId);
  const { data: paymentsData } = useGetInvoicePayments(invoiceId);
  const { mutateAsync: markAsOverdueAsync, isPending: markOverduePending } = useMarkAsOverdue();
  const { mutateAsync: cancelInvoiceAsync, isPending: cancelPending } = useCancelInvoice();
  const { mutateAsync: sendInvoiceAsync, isPending: sendPending } = useSendInvoice();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const invoice = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.invoice ?? root?.invoice ?? root;
  }, [data]);

  const payments = useMemo(() => {
    const root = paymentsData?.data ?? paymentsData;
    return (root?.data?.payments ?? root?.payments ?? root?.data ?? []) as any[];
  }, [paymentsData]);

  const items = Array.isArray(invoice?.items) ? invoice.items : [];
  const client = invoice?.client ?? invoice?.clientId;
  const statusValue = (invoice?.status ?? 'draft').toLowerCase();
  const statusConfig = statusVariantMap[statusValue] ?? statusVariantMap.draft;
  const totalAmount = invoice?.totalAmount ?? invoice?.total ?? 0;
  const taxAmount = invoice?.tax ?? 0;
  const discountAmount = invoice?.discount ?? 0;
  const subtotal =
    invoice?.subtotal ??
    items.reduce((sum: number, item: any) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      return sum + quantity * unitPrice;
    }, 0);
  const paidAmount = invoice?.paidAmount ?? 0;
  const remainingBalance = Math.max(0, totalAmount - paidAmount);
  const currency = invoice?.currency ?? 'KES';

  const isPaid = statusValue === 'paid';
  const isCancelled = statusValue === 'cancelled';
  const canPay = !isPaid && !isCancelled;
  const canMarkOverdue = !isPaid && !isCancelled && statusValue !== 'overdue';
  const canCancel = !isPaid && !isCancelled;
  const clientHasEmail = Boolean(client?.email ?? client?.contactEmail);

  const isActionBusy = markOverduePending || cancelPending || sendPending;

  const clientName = useMemo(() => {
    if (!client) return '—';
    const fullName = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
    return fullName || client.company || client.email || 'Client';
  }, [client]);

  const handleAction = useCallback((action: ActionType) => {
    setActionError(null);
    setActiveAction(action);
  }, []);

  const performAction = useCallback(async () => {
    if (!invoiceId || !activeAction) return;
    setActionError(null);
    try {
      if (activeAction === 'markOverdue') {
        await markAsOverdueAsync(invoiceId);
        setInlineStatus({ type: 'success', text: 'Invoice marked as overdue.' });
      } else if (activeAction === 'cancel') {
        await cancelInvoiceAsync(invoiceId);
        setInlineStatus({ type: 'success', text: 'Invoice cancelled.' });
      } else if (activeAction === 'send') {
        await sendInvoiceAsync(invoiceId);
        setInlineStatus({ type: 'success', text: 'Invoice sent to the client.' });
      }
      await refetch();
      setActiveAction(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to complete the action.';
      setActionError(message);
    }
  }, [activeAction, cancelInvoiceAsync, invoiceId, markAsOverdueAsync, refetch, sendInvoiceAsync]);

  const handleEdit = useCallback(() => {
    if (!invoiceId) return;
    router.push(`/(authenticated)/invoices/${invoiceId}/edit`);
  }, [invoiceId, router]);

  if (!invoiceId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Invoice ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading invoice…" />
      </ThemedView>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (errorMessage) {
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

  const dueDate = invoice?.dueDate ?? invoice?.paymentDueDate;
  const createdAt = invoice?.createdAt ?? invoice?.created_on;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <View className="flex-row items-center justify-between flex-wrap gap-3">
              <View>
                <ThemedText type="title">{invoice?.invoiceNumber ?? 'Invoice'}</ThemedText>
                <Text className="text-gray-600">{formatDate(createdAt)}</Text>
              </View>
              <Badge
                variant={statusConfig.variant}
                size="md"
                icon={
                  <MaterialIcons
                    name={statusConfig.icon}
                    size={16}
                    color={statusConfig.variant === 'error' ? '#a33c3c' : '#7b1c1c'}
                  />
                }>
                {statusConfig.label}
              </Badge>
            </View>
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Pressable onPress={handleEdit} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAction('send')}
              className="btn btn-secondary"
              disabled={!clientHasEmail || isActionBusy}>
              {sendPending ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Send</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                const projectId = invoice?.project?._id ?? invoice?.projectId;
                const url = projectId
                  ? `/(authenticated)/payments/initiate?invoiceId=${invoiceId}&projectId=${projectId}` as any
                  : `/(authenticated)/payments/initiate?invoiceId=${invoiceId}` as any;
                router.push(url);
              }}
              className="btn btn-primary"
              disabled={!canPay}>
              <Text className="btn-text btn-text-primary">Pay</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAction('markOverdue')}
              className="btn btn-secondary"
              disabled={!canMarkOverdue}>
              {markOverduePending ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Mark Overdue</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => handleAction('cancel')}
              className="btn btn-secondary"
              disabled={!canCancel}>
              {cancelPending ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              )}
            </Pressable>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
              Billing Summary
            </Text>
            <View className="mt-4 gap-3">
              <InfoRow icon="person" label="Client" value={clientName} />
              <InfoRow icon="mail-outline" label="Email" value={client?.email ?? '—'} />
              <InfoRow icon="assignment" label="Project" value={invoice?.projectTitle ?? '—'} />
              <InfoRow icon="event" label="Due Date" value={formatDate(dueDate)} />
              <InfoRow icon="event-available" label="Created" value={formatDate(createdAt)} />
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
              Items
            </Text>
            <View className="mt-4 border border-gray-200 rounded-2xl overflow-hidden dark:border-gray-700">
              <View className="flex-row bg-brand-tint px-4 py-2">
                <Text className="flex-2 font-inter text-sm font-semibold text-gray-800">Description</Text>
                <Text className="flex-1 font-inter text-sm font-semibold text-gray-800 text-center">
                  Qty
                </Text>
                <Text className="flex-1 font-inter text-sm font-semibold text-gray-800 text-right">
                  Unit Price
                </Text>
                <Text className="flex-1 font-inter text-sm font-semibold text-gray-800 text-right">
                  Total
                </Text>
              </View>
              {items.length === 0 ? (
                <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <Text className="text-gray-500">No items available.</Text>
                </View>
              ) : (
                items.map((item: any, index: number) => {
                  const quantity = Number(item.quantity) || 0;
                  const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                  const lineTotal = quantity * unitPrice;
                  return (
                    <View
                      key={item._id ?? `${item.description}-${index}`}
                      className="flex-row px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <Text className="flex-2 font-inter text-sm text-gray-900 dark:text-gray-50">
                        {item.description ?? 'Item'}
                      </Text>
                      <Text className="flex-1 font-inter text-sm text-center text-gray-700 dark:text-gray-200">
                        {quantity}
                      </Text>
                      <Text className="flex-1 font-inter text-sm text-right text-gray-700 dark:text-gray-200">
                        {formatCurrency(unitPrice, currency)}
                      </Text>
                      <Text className="flex-1 font-inter text-sm text-right text-gray-900 dark:text-gray-50">
                        {formatCurrency(lineTotal, currency)}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
            <View className="mt-4 gap-2">
              <InfoRow icon="calculate" label="Subtotal" value={formatCurrency(subtotal, currency)} />
              <InfoRow icon="request-quote" label="Tax" value={formatCurrency(taxAmount, currency)} />
              <InfoRow icon="local-offer" label="Discount" value={formatCurrency(discountAmount, currency)} />
              <InfoRow icon="attach-money" label="Grand Total" value={formatCurrency(totalAmount, currency)} />
              <InfoRow icon="account-balance" label="Paid Amount" value={formatCurrency(paidAmount, currency)} />
              <InfoRow icon="account-balance-wallet" label="Balance Due" value={formatCurrency(remainingBalance, currency)} />
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
              Payment History
            </Text>
            <View className="mt-4 gap-3">
              {payments.length === 0 ? (
                <Text className="text-gray-600 dark:text-gray-300">No payments recorded yet.</Text>
              ) : (
                payments.map((payment: any) => {
                  const id = payment._id || payment.id;
                  return (
                    <View
                      key={id}
                      className="flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                      <View>
                        <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
                          {formatCurrency(payment.amount ?? 0, currency)}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.paymentMethod ?? 'Payment'} • {formatDate(payment.paymentDate)}
                        </Text>
                      </View>
                      <Badge
                        variant={payment.status === 'completed' ? 'success' : 'info'}
                        size="sm">
                        {payment.status ?? 'completed'}
                      </Badge>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {invoice?.notes ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Notes
              </Text>
              <Text className="mt-3 text-gray-700 dark:text-gray-200">{invoice.notes}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(activeAction)}
        title={
          activeAction === 'markOverdue'
            ? 'Mark as Overdue'
            : activeAction === 'cancel'
            ? 'Cancel Invoice'
            : activeAction === 'send'
            ? 'Send Invoice'
            : ''
        }
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
                <Text className="btn-text btn-text-primary">Confirm</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            {activeAction === 'markOverdue'
              ? 'Mark this invoice as overdue?'
              : activeAction === 'cancel'
              ? 'Cancel this invoice? This action cannot be undone.'
              : 'Send this invoice to the client via email?'}
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

