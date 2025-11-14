import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useCreateInvoice } from '@/tanstack/useInvoices';
import { useGetQuotations } from '@/tanstack/useQuotations';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateInvoice();
  const { data: quotationsData } = useGetQuotations({ limit: 200 });

  const quotations = useMemo(() => {
    const root = quotationsData?.data ?? {};
    return (root?.data?.quotations ?? root?.quotations ?? root?.data ?? []) as any[];
  }, [quotationsData]);

  const [quotationId, setQuotationId] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  const isBusy = isPending;

  const handleSave = useCallback(async () => {
    if (!quotationId) {
      setInlineStatus({ type: 'error', text: 'Select a quotation to create the invoice.' });
      return;
    }

    setInlineStatus(null);
    try {
      const payload = { quotation: quotationId };

      const result = await mutateAsync(payload);
      const createdInvoice = result?.data?.invoice ?? result?.invoice;
      setInlineStatus({ type: 'success', text: 'Invoice created successfully.' });
      setTimeout(() => {
        if (createdInvoice?._id || createdInvoice?.id) {
          const id = createdInvoice._id || createdInvoice.id;
          router.replace(`/(authenticated)/invoices/${id}`);
        } else {
          router.replace('/(authenticated)/invoices');
        }
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to create invoice right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [mutateAsync, quotationId, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8 gap-6">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Create Invoice
          </ThemedText>

          <View className="gap-5">
            <View className="gap-2">
              <Text className="form-label">Quotation *</Text>
              <View className="border border-gray-300 rounded-xl bg-white px-1">
                <Picker
                  selectedValue={quotationId}
                  onValueChange={(value: string) => {
                    setQuotationId(value);
                    setInlineStatus(null);
                  }}
                  style={{ height: 44 }}>
                  <Picker.Item label="Select quotation" value="" />
                  {quotations.map((quotation: any) => {
                    const id = quotation._id || quotation.id;
                    const label = `${quotation.quotationNumber ?? 'Quotation'} • ${quotation.client?.company ?? quotation.client?.email ?? 'Client'}`;
                    return <Picker.Item key={id} label={label} value={id} />;
                  })}
                </Picker>
              </View>
            </View>

            <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <Text className="font-inter text-sm text-amber-900 dark:text-amber-100">
                Invoices are created directly from quotations. Selecting a quotation automatically
                carries over the client, project, items, totals, and notes—no extra input needed.
              </Text>
              <Text className="mt-2 font-inter text-xs text-amber-800 dark:text-amber-100/90">
                You can update the invoice later if needed, but creation requires only the quotation
                per backend workflow.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row justify-end gap-3">
              <Pressable onPress={handleCancel} className="btn btn-secondary" disabled={isBusy}>
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="btn btn-primary min-w-[150px]"
                disabled={isBusy}>
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Create Invoice</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

