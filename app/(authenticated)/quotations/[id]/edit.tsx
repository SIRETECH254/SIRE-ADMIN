import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DatePickerModal } from 'react-native-paper-dates';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetQuotation, useSendQuotation, useUpdateQuotation } from '@/tanstack/useQuotations';
import { formatCurrency, formatDate } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type ItemInput = {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const currencyCode = 'KES';

function makeItemFromExisting(item: any, fallbackKey: string): ItemInput {
  return {
    key: item?._id ?? fallbackKey,
    description: item?.description ?? '',
    quantity: String(item?.quantity ?? 1),
    unitPrice: String(item?.unitPrice ?? item?.price ?? 0),
  };
}

export default function EditQuotationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const quotationId = Array.isArray(id) ? id[0] : id;

  const { data, isLoading, error, refetch } = useGetQuotation(quotationId ?? '');
  const { mutateAsync: updateQuotationAsync, isPending } = useUpdateQuotation();
  const { mutateAsync: sendQuotationAsync } = useSendQuotation();

  const quotation = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.quotation ?? root?.quotation ?? root;
  }, [data]);

  const [taxRate, setTaxRate] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemInput[]>([]);
  const [validUntilDate, setValidUntilDate] = useState<Date | null>(null);
  const [validPickerOpen, setValidPickerOpen] = useState(false);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [resendAfterSave, setResendAfterSave] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (quotation && !formInitialized) {
      setTaxRate(String(quotation?.tax ?? quotation?.taxRate ?? quotation?.totals?.taxRate ?? 0));
      setDiscount(String(quotation?.discount ?? 0));
      setNotes(quotation?.notes ?? '');
      setValidUntilDate(quotation?.validUntil ? new Date(quotation.validUntil) : null);
      const incomingItems = Array.isArray(quotation?.items)
        ? quotation.items.map((item: any, index: number) => makeItemFromExisting(item, `existing-${index}`))
        : [makeItemFromExisting({}, 'default')];
      setItems(incomingItems.length > 0 ? incomingItems : [makeItemFromExisting({}, 'default')]);
      setFormInitialized(true);
    }
  }, [quotation, formInitialized]);

  const isConverted = quotation?.status === 'converted';
  const isAccepted = quotation?.status === 'accepted';
  const editingLocked = isConverted;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    const rate = parseFloat(taxRate) || 0;
    return (subtotal * rate) / 100;
  }, [subtotal, taxRate]);

  const discountAmount = useMemo(() => {
    const disc = parseFloat(discount) || 0;
    return disc > 0 ? (subtotal * disc) / 100 : 0;
  }, [subtotal, discount]);

  const grandTotal = useMemo(() => subtotal + taxAmount - discountAmount, [subtotal, taxAmount, discountAmount]);

  const validUntilDisplay = validUntilDate ? formatDate(validUntilDate, 'en-KE') : '';

  const handleItemChange = useCallback(
    (key: string, field: keyof ItemInput, value: string) => {
      setItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
    },
    []
  );

  const handleAddItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: '',
        quantity: '1',
        unitPrice: '0',
      },
    ]);
  }, []);

  const handleRemoveItem = useCallback((key: string) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)));
  }, []);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!quotationId) {
      setInlineStatus({ type: 'error', text: 'Quotation ID missing.' });
      return;
    }

    if (editingLocked) {
      setInlineStatus({ type: 'error', text: 'Converted quotations cannot be edited.' });
      return;
    }

    if (!validUntilDate) {
      setInlineStatus({ type: 'error', text: 'Valid until date is required.' });
      return;
    }

    const sanitizedItems = items
      .map((item) => ({
        description: item.description.trim(),
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
      }))
      .filter((item) => item.description && item.quantity > 0);

    if (sanitizedItems.length === 0) {
      setInlineStatus({ type: 'error', text: 'Add at least one line item.' });
      return;
    }

    setInlineStatus(null);
    try {
      const payload: any = {
        tax: parseFloat(taxRate) || 0,
        discount: parseFloat(discount) || 0,
        validUntil: validUntilDate?.toISOString(),
        items: sanitizedItems,
        notes: notes.trim() || undefined,
      };

      await updateQuotationAsync({ quotationId, quotationData: payload });

      if (resendAfterSave) {
        await sendQuotationAsync(quotationId);
      }

      setInlineStatus({ type: 'success', text: 'Quotation updated successfully.' });
      setTimeout(() => router.replace(`/(authenticated)/quotations/${quotationId}`), 700);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to update quotation.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [discount, editingLocked, items, notes, quotationId, resendAfterSave, router, sendQuotationAsync, taxRate, updateQuotationAsync, validUntilDate]);

  const handleSelectValidUntil = useCallback(
    ({ date }: { date?: Date }) => {
      if (date) {
        setValidUntilDate(date);
      }
      setValidPickerOpen(false);
    },
    []
  );

  const handleDismissPicker = useCallback(() => setValidPickerOpen(false), []);

  if (!quotationId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Quotation ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading && !formInitialized) {
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

  const renderItemRow = (item: ItemInput, index: number) => (
    <View key={item.key} className="border border-gray-200 rounded-xl p-4 gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-inter font-semibold text-gray-900">Item {index + 1}</Text>
        {items.length > 1 ? (
          <Pressable onPress={() => handleRemoveItem(item.key)} className="flex-row items-center gap-1">
            <MaterialIcons name="close" size={16} color="#dc2626" />
            <Text className="text-sm text-red-600">Remove</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="gap-2">
        <Text className="form-label">Description</Text>
        <TextInput
          value={item.description}
          editable={!editingLocked}
          onChangeText={(value) => handleItemChange(item.key, 'description', value)}
          placeholder="Line item description"
          multiline
          className="form-input"
        />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 gap-2">
          <Text className="form-label">Quantity</Text>
          <TextInput
            value={item.quantity}
            onChangeText={(value) => handleItemChange(item.key, 'quantity', value.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            editable={!editingLocked}
            className="form-input"
          />
        </View>
        <View className="flex-1 gap-2">
          <Text className="form-label">Unit Price</Text>
          <TextInput
            value={item.unitPrice}
            onChangeText={(value) => handleItemChange(item.key, 'unitPrice', value.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            editable={!editingLocked}
            className="form-input"
          />
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-8 gap-6">
          <View className="gap-1">
            <ThemedText type="title">Edit Quotation</ThemedText>
            <Text className="text-gray-600">Update amounts and resend if needed.</Text>
          </View>

          {inlineStatus ? <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" /> : null}

          <View className="rounded-2xl border border-gray-200 bg-white p-4 gap-3">
            <Text className="font-poppins font-semibold text-lg text-gray-900">{quotation?.quotationNumber ?? 'Quotation'}</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Status</Text>
              <Text className="font-inter font-medium text-gray-900 capitalize">{quotation?.status ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Project</Text>
              <Text className="font-inter text-gray-900">{quotation?.project?.title ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Client</Text>
              <Text className="font-inter text-gray-900">
                {`${quotation?.client?.firstName ?? ''} ${quotation?.client?.lastName ?? ''}`.trim() ||
                  quotation?.client?.company ||
                  quotation?.client?.email ||
                  '—'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Created</Text>
              <Text className="font-inter text-gray-900">{formatDate(quotation?.createdAt)}</Text>
            </View>
          </View>

          {isConverted ? (
            <Alert variant="info" message="This quotation has already been converted to an invoice and can no longer be edited." />
          ) : null}

          {isAccepted && !isConverted ? (
            <Alert
              variant="info"
              message="Accepted quotations can still be edited for minor adjustments, but backend validation may reject certain updates."
            />
          ) : null}

          <View className="gap-5">
            <View className="gap-2">
              <Text className="form-label">Valid Until *</Text>
              <Pressable onPress={() => setValidPickerOpen(true)}>
                <TextInput
                  value={validUntilDisplay}
                  placeholder="Pick a date"
                  editable={false}
                  pointerEvents="none"
                  className="form-input"
                />
              </Pressable>
              <DatePickerModal
                locale="en-KE"
                mode="single"
                visible={validPickerOpen}
                date={validUntilDate ?? undefined}
                onDismiss={handleDismissPicker}
                onConfirm={handleSelectValidUntil}
              />
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-poppins font-semibold text-lg text-gray-900">Line Items</Text>
                <Pressable onPress={handleAddItem} className="btn btn-secondary" disabled={editingLocked}>
                  <Text className="btn-text btn-text-secondary">Add Item</Text>
                </Pressable>
              </View>
              <View className="gap-3">{items.map((item, index) => renderItemRow(item, index))}</View>
            </View>

            <View className="gap-3">
              <View className="flex-row gap-3">
                <View className="flex-1 gap-2">
                  <Text className="form-label">Tax %</Text>
                  <TextInput
                    value={taxRate}
                    onChangeText={(value) => setTaxRate(value.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    editable={!editingLocked}
                    className="form-input"
                  />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="form-label">Discount %</Text>
                  <TextInput
                    value={discount}
                    onChangeText={(value) => setDiscount(value.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    editable={!editingLocked}
                    className="form-input"
                  />
                </View>
              </View>

              <View className="gap-1 rounded-2xl border border-gray-200 bg-white p-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Subtotal</Text>
                  <Text className="font-semibold text-gray-900">{formatCurrency(subtotal || 0, currencyCode)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Tax</Text>
                  <Text className="font-semibold text-gray-900">{formatCurrency(taxAmount || 0, currencyCode)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Discount</Text>
                  <Text className="font-semibold text-gray-900">{formatCurrency(discountAmount || 0, currencyCode)}</Text>
                </View>
                <View className="flex-row justify-between border-t border-gray-200 pt-2 mt-2">
                  <Text className="font-poppins font-semibold text-gray-900">Total</Text>
                  <Text className="font-poppins font-semibold text-gray-900">{formatCurrency(grandTotal || 0, currencyCode)}</Text>
                </View>
              </View>
            </View>

            <View className="gap-2">
              <Text className="form-label">Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                editable={!editingLocked}
                placeholder="Optional notes"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="form-input"
              />
            </View>

            <View className="flex-row items-center justify-between border border-gray-200 rounded-xl p-4 bg-white">
              <View className="flex-1 pr-4">
                <Text className="font-inter font-semibold text-gray-900">Send email after saving</Text>
                <Text className="text-sm text-gray-600">
                  If enabled, the updated quotation will be emailed immediately.
                </Text>
              </View>
              <Switch value={resendAfterSave} onValueChange={setResendAfterSave} disabled={editingLocked} />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3 justify-end">
            <Pressable onPress={handleCancel} className="btn btn-secondary" disabled={isPending}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} className="btn btn-primary min-w-[160px]" disabled={isPending || editingLocked}>
              {isPending ? <ActivityIndicator color="#ffffff" /> : <Text className="btn-text btn-text-primary">Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

