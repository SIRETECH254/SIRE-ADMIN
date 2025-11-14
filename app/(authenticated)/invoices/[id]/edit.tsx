import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import {
  useGetInvoice,
  useUpdateInvoice,
} from '@/tanstack/useInvoices';
import { formatCurrency } from '@/utils';

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

const makeItemFromInvoice = (item: any, index: number): ItemInput => ({
  key: item._id || `invoice-item-${index}`,
  description: item.description ?? '',
  quantity: String(item.quantity ?? 1),
  unitPrice: String(item.unitPrice ?? item.price ?? 0),
});

export default function EditInvoiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetInvoice(invoiceId);
  const { mutateAsync, isPending } = useUpdateInvoice();

  const invoice = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.invoice ?? root?.invoice ?? root;
  }, [data]);

  const [projectTitle, setProjectTitle] = useState('');
  const [items, setItems] = useState<ItemInput[]>([makeItemFromInvoice({}, 0)]);
  const [tax, setTax] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  useEffect(() => {
    if (!invoice) return;
    setProjectTitle(invoice.projectTitle ?? '');
    setItems(
      Array.isArray(invoice.items) && invoice.items.length > 0
        ? invoice.items.map(makeItemFromInvoice)
        : [makeItemFromInvoice({}, Date.now())]
    );
    setTax(String(invoice.tax ?? 0));
    setDiscount(String(invoice.discount ?? 0));
    setDueDate(invoice.dueDate ? invoice.dueDate.split('T')[0] : '');
    setNotes(invoice.notes ?? '');
  }, [invoice]);

  const isBusy = isPending;
  const statusValue = (invoice?.status ?? 'draft').toLowerCase();
  const isReadOnly = statusValue === 'paid';

  const handleItemChange = useCallback((key: string, field: keyof ItemInput, value: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  }, []);

  const handleAddItem = useCallback(() => {
    if (isReadOnly) return;
    setItems((prev) => [...prev, makeItemFromInvoice({}, prev.length + 1)]);
  }, [isReadOnly]);

  const handleRemoveItem = useCallback((key: string) => {
    if (isReadOnly) return;
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.key !== key)));
  }, [isReadOnly]);

  const itemsTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  }, [items]);

  const taxAmount = Number(tax) || 0;
  const discountAmount = Number(discount) || 0;
  const grandTotal = itemsTotal + taxAmount - discountAmount;

  const handleSave = useCallback(async () => {
    if (!invoiceId) return;
    if (isReadOnly) {
      setInlineStatus({
        type: 'error',
        text: 'Paid invoices cannot be edited.',
      });
      return;
    }
    const trimmedProjectTitle = projectTitle.trim();
    const trimmedDueDate = dueDate.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedProjectTitle) {
      setInlineStatus({ type: 'error', text: 'Project title is required.' });
      return;
    }

    const sanitizedItems = items
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      }))
      .filter((item) => item.description && item.quantity > 0);

    if (sanitizedItems.length === 0) {
      setInlineStatus({ type: 'error', text: 'Please keep at least one valid line item.' });
      return;
    }

    setInlineStatus(null);
    try {
      const payload: Record<string, any> = {
        projectTitle: trimmedProjectTitle,
        items: sanitizedItems,
        tax: taxAmount,
        discount: discountAmount,
        notes: trimmedNotes || undefined,
      };
      if (trimmedDueDate) {
        payload.dueDate = new Date(trimmedDueDate).toISOString();
      }

      await mutateAsync({ invoiceId, invoiceData: payload });
      setInlineStatus({ type: 'success', text: 'Invoice updated successfully.' });
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to update invoice right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [
    discountAmount,
    dueDate,
    invoiceId,
    isReadOnly,
    items,
    mutateAsync,
    notes,
    projectTitle,
    refetch,
    taxAmount,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

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

  return (
    <>
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8 gap-6">
            <ThemedText type="title" style={{ textAlign: 'center' }}>
              Edit Invoice
            </ThemedText>
          {isReadOnly ? (
            <Alert
              variant="info"
              message="This invoice is paid and cannot be edited."
              className="w-full"
            />
          ) : null}

          <View className="gap-5">
            <View className="gap-2">
              <Text className="form-label">Project Title *</Text>
              <TextInput
                value={projectTitle}
                editable={!isReadOnly}
                onChangeText={(value) => {
                  setProjectTitle(value);
                  setInlineStatus(null);
                }}
                placeholder="Project title"
                className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
              />
            </View>

            <View className="gap-4">
              <Text className="font-poppins text-lg text-gray-900 dark:text-gray-50">Line Items</Text>
              {items.map((item) => (
                <View
                  key={item.key}
                  className="rounded-2xl border border-gray-200 bg-white p-4 gap-3 dark:border-gray-800 dark:bg-gray-900">
                  <View className="gap-2">
                    <Text className="form-label">Description</Text>
                    <TextInput
                      value={item.description}
                      editable={!isReadOnly}
                      onChangeText={(value) => handleItemChange(item.key, 'description', value)}
                      placeholder="Service description"
                      className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
                    />
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1 gap-2">
                      <Text className="form-label">Quantity</Text>
                      <TextInput
                        value={item.quantity}
                        editable={!isReadOnly}
                        onChangeText={(value) => handleItemChange(item.key, 'quantity', value)}
                        keyboardType="numeric"
                        className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
                      />
                    </View>
                    <View className="flex-1 gap-2">
                      <Text className="form-label">Unit Price</Text>
                      <TextInput
                        value={item.unitPrice}
                        editable={!isReadOnly}
                        onChangeText={(value) => handleItemChange(item.key, 'unitPrice', value)}
                        keyboardType="numeric"
                        className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
                      />
                    </View>
                  </View>
                  {!isReadOnly && items.length > 1 ? (
                    <Pressable
                      onPress={() => handleRemoveItem(item.key)}
                      className="self-end"
                      accessibilityLabel="Remove item">
                      <Text className="text-brand-accent font-inter text-sm">Remove</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}

              {!isReadOnly ? (
                <Pressable onPress={handleAddItem} className="btn btn-secondary self-start">
                  <Text className="btn-text btn-text-secondary">Add Item</Text>
                </Pressable>
              ) : null}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="form-label">Tax</Text>
                <TextInput
                  value={tax}
                  editable={!isReadOnly}
                  onChangeText={(value) => {
                    setTax(value);
                    setInlineStatus(null);
                  }}
                  keyboardType="numeric"
                  className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="form-label">Discount</Text>
                <TextInput
                  value={discount}
                  editable={!isReadOnly}
                  onChangeText={(value) => {
                    setDiscount(value);
                    setInlineStatus(null);
                  }}
                  keyboardType="numeric"
                  className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="form-label">Due Date</Text>
              <Pressable
                onPress={() => {
                  if (isReadOnly) return;
                  setDueDatePickerOpen(true);
                }}
                className={`input-date flex-row items-center justify-between ${isReadOnly ? 'opacity-60' : ''}`}>
                <Text className={dueDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                  {dueDate
                    ? new Date(dueDate).toLocaleDateString()
                    : 'Select due date'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="form-label">Notes</Text>
              <TextInput
                value={notes}
                editable={!isReadOnly}
                onChangeText={(value) => {
                  setNotes(value);
                  setInlineStatus(null);
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`form-input ${isReadOnly ? 'opacity-60' : ''}`}
              />
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg text-gray-900 dark:text-gray-50">
                Summary
              </Text>
              <View className="mt-3 gap-2">
                <SummaryRow label="Items Total" value={formatCurrency(itemsTotal)} />
                <SummaryRow label="Tax" value={formatCurrency(taxAmount)} />
                <SummaryRow label="Discount" value={formatCurrency(discountAmount)} />
                <SummaryRow label="Grand Total" value={formatCurrency(grandTotal)} highlight />
              </View>
            </View>
          </View>

          <View className="gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row justify-end gap-3">
              <Pressable onPress={handleCancel} className="btn btn-secondary" disabled={isBusy}>
                <Text className="btn-text btn-text-secondary">Back</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="btn btn-primary min-w-[150px]"
                disabled={isBusy || isReadOnly}>
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
        </ScrollView>
      </ThemedView>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={dueDatePickerOpen}
        date={dueDate ? new Date(dueDate) : undefined}
        onDismiss={() => setDueDatePickerOpen(false)}
        onConfirm={({ date }) => {
          setDueDatePickerOpen(false);
          if (date && !isReadOnly) {
            setDueDate(date.toISOString().split('T')[0]);
            setInlineStatus(null);
          }
        }}
      />
    </>
  );
}
function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">{label}</Text>
      <Text
        className={`font-inter text-base ${
          highlight ? 'text-brand-primary font-semibold' : 'text-gray-900 dark:text-gray-50'
        }`}>
        {value}
      </Text>
    </View>
  );
}

