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
  useDeleteQuotation,
  useGetQuotation,
  useSendQuotation,
} from '@/tanstack/useQuotations';
import { formatCurrency, formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

const statusVariantMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  pending: 'warning',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  converted: 'info',
};

const statusLabelMap: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  converted: 'Converted',
};

const statusIconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  draft: 'description',
  pending: 'hourglass-empty',
  sent: 'send',
  accepted: 'check-circle',
  rejected: 'cancel',
  converted: 'repeat',
};

export default function QuotationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const quotationId = Array.isArray(id) ? id[0] : id;

  const { data, isLoading, error, refetch } = useGetQuotation(quotationId ?? '');
  const { mutateAsync: deleteQuotationAsync, isPending: isDeleting } = useDeleteQuotation();
  const { mutateAsync: sendQuotationAsync, isPending: isSending } = useSendQuotation();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sending, setSending] = useState(false);

  const quotation = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.quotation ?? root?.quotation ?? root;
  }, [data]);

  const client = quotation?.client ?? quotation?.clientId;
  const project = quotation?.project ?? quotation?.projectId;
  const items = Array.isArray(quotation?.items) ? quotation.items : [];

  const statusValue = (quotation?.status ?? 'draft').toLowerCase();
  const badgeVariant = statusVariantMap[statusValue] ?? 'default';
  const badgeLabel = statusLabelMap[statusValue] ?? quotation?.status ?? 'Draft';

  const currency = quotation?.currency ?? quotation?.totals?.currency ?? 'KES';
  const subtotal =
    quotation?.subtotal ?? quotation?.totals?.subTotal ?? quotation?.totals?.subtotal ?? 0;
  const taxAmount =
    quotation?.taxAmount ?? quotation?.totals?.tax ?? quotation?.totals?.taxAmount ?? 0;
  const discountAmount =
    quotation?.discountAmount ?? quotation?.totals?.discount ?? quotation?.discount ?? 0;
  const grandTotal =
    quotation?.grandTotal ??
    quotation?.totals?.grandTotal ??
    quotation?.total ??
    quotation?.totalAmount ??
    subtotal + taxAmount - discountAmount;

  const isConverted = statusValue === 'converted';

  const handleEdit = useCallback(() => {
    if (!quotationId) return;
    router.push(`/(authenticated)/quotations/${quotationId}/edit`);
  }, [quotationId, router]);

  const handleConvert = useCallback(() => {
    if (!quotationId) return;
    router.push(`/(authenticated)/quotations/${quotationId}/convert`);
  }, [quotationId, router]);

  const handleSend = useCallback(async () => {
    if (!quotationId) return;
    try {
      setSending(true);
      setInlineStatus(null);
      await sendQuotationAsync(quotationId);
      setInlineStatus({ type: 'success', text: 'Quotation sent successfully.' });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to send quotation.';
      setInlineStatus({ type: 'error', text: message });
    } finally {
      setSending(false);
    }
  }, [quotationId, sendQuotationAsync]);

  const handleDelete = useCallback(async () => {
    if (!quotationId) return;
    try {
      await deleteQuotationAsync(quotationId);
      setInlineStatus({ type: 'success', text: 'Quotation deleted.' });
      setTimeout(() => router.replace('/(authenticated)/quotations'), 600);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to delete quotation.';
      setInlineStatus({ type: 'error', text: message });
    } finally {
      setConfirmDelete(false);
    }
  }, [deleteQuotationAsync, quotationId, router]);

  if (!quotationId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Quotation ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading quotation…" />
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

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3 flex-wrap">
              <View className="flex-1">
                <ThemedText type="title">{quotation?.quotationNumber ?? 'Quotation'}</ThemedText>
                <Text className="text-gray-600">{formatDate(quotation?.issueDate)}</Text>
              </View>
              <Badge
                variant={badgeVariant}
                size="md"
                icon={
                  <MaterialIcons
                    name={statusIconMap[statusValue] ?? 'info-outline'}
                    size={14}
                    color="#7b1c1c"
                  />
                }>
                {badgeLabel}
              </Badge>
            </View>
            {inlineStatus ? <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" /> : null}
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Pressable onPress={handleEdit} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Edit</Text>
            </Pressable>
            <Pressable onPress={handleSend} className="btn btn-secondary" disabled={sending || isSending}>
              {sending || isSending ? (
                <ActivityIndicator size="small" color="#7b1c1c" />
              ) : (
                <Text className="btn-text btn-text-secondary">Send</Text>
              )}
            </Pressable>
            <Pressable onPress={handleConvert} className="btn btn-secondary" disabled={isConverted}>
              <Text className="btn-text btn-text-secondary">
                {isConverted ? 'Converted' : 'Convert to Invoice'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setConfirmDelete(true)} className="btn btn-primary bg-red-600 border-red-600">
              <Text className="btn-text btn-text-primary">Delete</Text>
            </Pressable>
          </View>

          <View className="gap-4">
            <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-3">
              <Text className="font-poppins font-semibold text-lg text-gray-900">Client</Text>
              <View className="gap-1">
                <Text className="font-inter text-base text-gray-900">
                  {`${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() ||
                    client?.company ||
                    client?.email ||
                    '—'}
                </Text>
                <Text className="text-sm text-gray-600">{client?.email ?? '—'}</Text>
                <Text className="text-sm text-gray-600">{client?.phone ?? '—'}</Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-3">
              <Text className="font-poppins font-semibold text-lg text-gray-900">Project</Text>
              <Text className="font-inter text-base text-gray-900">
                {project?.title ?? project?.name ?? '—'}
              </Text>
              <Text className="text-sm text-gray-600">{project?.status ? `Status: ${project.status}` : ''}</Text>
            </View>

            <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-3">
              <Text className="font-poppins font-semibold text-lg text-gray-900">Meta</Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Issue Date</Text>
                <Text className="text-gray-900">{formatDate(quotation?.issueDate)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Valid Until</Text>
                <Text className="text-gray-900">{formatDate(quotation?.validUntil)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Created</Text>
                <Text className="text-gray-900">{formatDate(quotation?.createdAt)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Updated</Text>
                <Text className="text-gray-900">{formatDate(quotation?.updatedAt)}</Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-4">
            <Text className="font-poppins font-semibold text-lg text-gray-900">Items</Text>
            <View className="gap-3">
              {items.length === 0 ? (
                <Text className="text-gray-500">No line items.</Text>
              ) : (
                items.map((item: any, index: number) => (
                  <View key={`${item?._id ?? index}`} className="flex-row justify-between border-b border-gray-100 pb-3">
                    <View className="flex-1 pr-3">
                      <Text className="font-inter font-medium text-gray-900">{item?.description ?? '—'}</Text>
                      <Text className="text-sm text-gray-600">
                        Qty {item?.quantity ?? 0} × {formatCurrency(Number(item?.unitPrice ?? item?.price ?? 0), currency)}
                      </Text>
                    </View>
                    <Text className="font-inter font-semibold text-gray-900">
                      {formatCurrency(
                        Number(item?.total ?? item?.lineTotal ?? (item?.quantity || 0) * (item?.unitPrice || 0)),
                        currency
                      )}
                    </Text>
                  </View>
                ))
              )}
            </View>
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal</Text>
                <Text className="text-gray-900">{formatCurrency(Number(subtotal), currency)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Tax</Text>
                <Text className="text-gray-900">{formatCurrency(Number(taxAmount), currency)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Discount</Text>
                <Text className="text-gray-900">{formatCurrency(Number(discountAmount), currency)}</Text>
              </View>
              <View className="flex-row justify-between border-t border-gray-200 pt-2 mt-2">
                <Text className="font-poppins font-semibold text-gray-900">Total</Text>
                <Text className="font-poppins font-semibold text-gray-900">
                  {formatCurrency(Number(grandTotal), currency)}
                </Text>
              </View>
            </View>
          </View>

          {quotation?.notes ? (
            <View className="bg-white rounded-2xl border border-gray-200 p-5">
              <Text className="font-poppins font-semibold text-lg text-gray-900 mb-2">Notes</Text>
              <Text className="text-gray-700">{quotation.notes}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={confirmDelete}
        title="Delete quotation"
        onClose={() => setConfirmDelete(false)}
        showAccentStrip
        actions={
          <View className="flex-row justify-end gap-3">
            <Pressable onPress={() => setConfirmDelete(false)} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleDelete} className="btn btn-primary min-w-[120px]" disabled={isDeleting}>
              {isDeleting ? <ActivityIndicator color="#ffffff" /> : <Text className="btn-text btn-text-primary">Delete</Text>}
            </Pressable>
          </View>
        }>
        <Text className="text-gray-800">
          Are you sure you want to delete quotation{' '}
          {quotation?.quotationNumber ?? quotationId ?? ''}? This action cannot be undone.
        </Text>
      </Modal>
    </ThemedView>
  );
}


