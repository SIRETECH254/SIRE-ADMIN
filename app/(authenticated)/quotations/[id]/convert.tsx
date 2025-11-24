import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useConvertToInvoice, useGetQuotation } from '@/tanstack/useQuotations';
import { formatCurrency, formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function ConvertQuotationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const quotationId = Array.isArray(id) ? id[0] : id;

  const { data, isLoading, error, refetch } = useGetQuotation(quotationId ?? '');
  const { mutateAsync: convertAsync, isPending } = useConvertToInvoice();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [internalNotes, setInternalNotes] = useState('');

  const quotation = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.quotation ?? root?.quotation ?? root;
  }, [data]);

  const currency = quotation?.currency ?? quotation?.totals?.currency ?? 'KES';
  const total =
    quotation?.grandTotal ??
    quotation?.totals?.grandTotal ??
    quotation?.total ??
    quotation?.totalAmount ??
    0;
  const statusValue = (quotation?.status ?? 'draft').toLowerCase();
  const isConverted = statusValue === 'converted';
  const items = Array.isArray(quotation?.items) ? quotation.items : [];

  const handleConvert = useCallback(async () => {
    if (!quotationId) {
      setInlineStatus({ type: 'error', text: 'Quotation ID missing.' });
      return;
    }
    setInlineStatus(null);
    try {
      const result = await convertAsync(quotationId);
      setInlineStatus({ type: 'success', text: 'Quotation converted to invoice.' });

      setTimeout(() => {
        router.replace('/(authenticated)/invoices');
      }, 800);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to convert quotation right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [convertAsync, quotationId, router]);

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
        <Loading fullScreen message="Preparing quotation…" />
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
        <View className="px-6 py-8 gap-6">
          <View className="gap-1">
            <ThemedText type="title">Convert Quotation</ThemedText>
            <Text className="text-gray-600">
              Turn {quotation?.quotationNumber ?? 'this quotation'} into an invoice.
            </Text>
          </View>

          {inlineStatus ? <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" /> : null}

          <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-3">
            <Text className="font-poppins font-semibold text-lg text-gray-900">Summary</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Client</Text>
              <Text className="text-gray-900">
                {`${quotation?.client?.firstName ?? ''} ${quotation?.client?.lastName ?? ''}`.trim() ||
                  quotation?.client?.company ||
                  quotation?.client?.email ||
                  '—'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Project</Text>
              <Text className="text-gray-900">{quotation?.project?.title ?? quotation?.project?.name ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Valid Until</Text>
              <Text className="text-gray-900">{formatDate(quotation?.validUntil)}</Text>
            </View>
            <View className="flex-row justify-between border-t border-gray-200 pt-2 mt-2">
              <Text className="font-poppins font-semibold text-gray-900">Total</Text>
              <Text className="font-poppins font-semibold text-gray-900">
                {formatCurrency(Number(total), currency)}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-3">
            <Text className="font-poppins font-semibold text-lg text-gray-900">Items Preview</Text>
            {items.length === 0 ? (
              <Text className="text-gray-500">No line items available.</Text>
            ) : (
              items.map((item: any, index: number) => (
                <View
                  key={item?._id ?? index}
                  className="flex-row justify-between border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
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

          <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-3">
            <Text className="font-poppins font-semibold text-lg text-gray-900">Internal Notes (optional)</Text>
            <TextInput
              value={internalNotes}
              onChangeText={setInternalNotes}
              placeholder="Add reminders for the invoice or finance team"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="form-input"
            />
            <Text className="text-sm text-gray-500">
              Notes here are for internal reference. Update the invoice after conversion if these notes should be client-facing.
            </Text>
          </View>

          {isConverted ? (
            <Alert
              variant="info"
              message="This quotation is already converted. Review the invoice from the invoices module."
              className="w-full"
            />
          ) : null}

          <View className="flex-row flex-wrap gap-3 justify-end">
            <Pressable onPress={() => router.back()} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConvert}
              className="btn btn-primary min-w-[180px]"
              disabled={isPending || isConverted}>
              {isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">
                  {isConverted ? 'Already Converted' : 'Convert to Invoice'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


