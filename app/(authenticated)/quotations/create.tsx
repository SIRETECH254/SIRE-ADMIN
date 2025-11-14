import React, { useCallback, useMemo, useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { DatePickerModal } from 'react-native-paper-dates';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { useGetProjects } from '@/tanstack/useProjects';
import { useCreateQuotation, useSendQuotation } from '@/tanstack/useQuotations';
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

function makeItem(): ItemInput {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    quantity: '1',
    unitPrice: '0',
  };
}

export default function CreateQuotationScreen() {
  const router = useRouter();
  const { mutateAsync: createQuotationAsync, isPending } = useCreateQuotation();
  const { mutateAsync: sendQuotationAsync } = useSendQuotation();
  const { data: projectsData } = useGetProjects({ limit: 200 });

  const projects = useMemo(() => {
    const root = projectsData?.data ?? projectsData;
    return (
      root?.data?.projects ?? root?.projects ?? root?.data ?? []
    ) as any[];
  }, [projectsData]);

  const [projectId, setProjectId] = useState<string>('');
  const [validUntilDate, setValidUntilDate] = useState<Date | null>(null);
  const [validPickerOpen, setValidPickerOpen] = useState(false);
  const [taxRate, setTaxRate] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [autoSend, setAutoSend] = useState(false);
  const [items, setItems] = useState<ItemInput[]>([makeItem()]);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

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

  const selectedProject = useMemo(() => {
    return projects.find((project: any) => (project?._id || project?.id) === projectId);
  }, [projects, projectId]);

  const derivedClient = selectedProject?.client;
  const validUntilDisplay = validUntilDate ? formatDate(validUntilDate, 'en-KE') : '';

  const handleItemChange = useCallback((key: string, field: keyof ItemInput, value: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  }, []);

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, makeItem()]);
  }, []);

  const handleRemoveItem = useCallback((key: string) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)));
  }, []);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    const trimmedNotes = notes.trim();

    if (!projectId) {
      setInlineStatus({ type: 'error', text: 'Project selection is required.' });
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
      setInlineStatus({ type: 'error', text: 'Add at least one line item with quantity and price.' });
      return;
    }

    setInlineStatus(null);
    try {
      const payload: any = {
        project: projectId,
        validUntil: validUntilDate?.toISOString(),
        tax: parseFloat(taxRate) || 0,
        discount: parseFloat(discount) || 0,
        items: sanitizedItems,
        notes: trimmedNotes || undefined,
      };

      const result = await createQuotationAsync(payload);
      const createdQuotation = result?.data?.quotation ?? result?.quotation ?? result?.data ?? result;
      const newId = createdQuotation?._id || createdQuotation?.id;

      if (autoSend && newId) {
        await sendQuotationAsync(newId);
      }

      setInlineStatus({ type: 'success', text: 'Quotation created successfully.' });
      setTimeout(() => {
        if (newId) {
          router.replace(`/(authenticated)/quotations/${newId}`);
        } else {
          router.replace('/(authenticated)/quotations');
        }
      }, 700);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to create quotation right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [autoSend, createQuotationAsync, discount, items, notes, projectId, router, sendQuotationAsync, taxRate, validUntilDate]);

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
            className="form-input"
          />
        </View>
        <View className="flex-1 gap-2">
          <Text className="form-label">Unit Price</Text>
          <TextInput
            value={item.unitPrice}
            onChangeText={(value) => handleItemChange(item.key, 'unitPrice', value.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            className="form-input"
          />
        </View>
      </View>
    </View>
  );

  const isBusy = isPending;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-8 gap-6">
          <View className="gap-2">
            <ThemedText type="title">Create Quotation</ThemedText>
            <Text className="text-gray-600">Quotations inherit clients from projects. Choose a project to begin.</Text>
          </View>

          {inlineStatus ? (
            <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
          ) : null}

          <View className="gap-5">
            <View className="gap-2">
              <Text className="form-label">Project *</Text>
              <View className="border border-gray-300 rounded-lg bg-white px-2">
                <Picker selectedValue={projectId} onValueChange={(value: string) => setProjectId(value)} style={{ height: 44 }}>
                  <Picker.Item label="Select a project" value="" />
                  {projects.map((project: any) => {
                    const id = project?._id || project?.id;
                    const label = project?.title ?? project?.name ?? id;
                    return <Picker.Item key={id} label={label} value={id} />;
                  })}
                </Picker>
              </View>
            </View>

            {selectedProject ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-4 gap-1">
                <Text className="text-sm font-semibold text-gray-900">Client</Text>
                <Text className="font-inter text-base text-gray-900">
                  {`${derivedClient?.firstName ?? ''} ${derivedClient?.lastName ?? ''}`.trim() ||
                    derivedClient?.company ||
                    derivedClient?.email ||
                    '—'}
                </Text>
                <Text className="text-sm text-gray-600">{derivedClient?.email ?? 'No email on record'}</Text>
                <Text className="text-sm text-gray-600">
                  {derivedClient?.company ?? selectedProject?.clientCompany ?? 'No company specified'}
                </Text>
              </View>
            ) : null}

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
                <Pressable onPress={handleAddItem} className="btn btn-secondary">
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
                    className="form-input"
                  />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="form-label">Discount %</Text>
                  <TextInput
                    value={discount}
                    onChangeText={(value) => setDiscount(value.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
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
                <View className="flex-row justify-between pt-2 border-t border-gray-200 mt-2">
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
                placeholder="Optional notes"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="form-input"
              />
            </View>

            <View className="flex-row items-center justify-between border border-gray-200 rounded-xl p-4 bg-white">
              <View className="flex-1">
                <Text className="font-inter font-semibold text-gray-900">Auto-send after creation</Text>
                <Text className="text-sm text-gray-600">
                  We’ll email the quotation immediately once it is saved successfully.
                </Text>
              </View>
              <Switch value={autoSend} onValueChange={setAutoSend} />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3 justify-end">
            <Pressable onPress={handleCancel} className="btn btn-secondary" disabled={isBusy}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} className="btn btn-primary min-w-[160px]" disabled={isBusy}>
              {isBusy ? <ActivityIndicator color="#ffffff" /> : <Text className="btn-text btn-text-primary">Save Quotation</Text>}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

