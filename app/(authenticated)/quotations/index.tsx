import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Pagination from '@/components/table/Pagination';
import { useGetClients } from '@/tanstack/useClients';
import {
  useDeleteQuotation,
  useGetQuotations,
  useSendQuotation,
} from '@/tanstack/useQuotations';
import { formatCurrency, formatDate } from '@/utils';

type StatusFilter =
  | 'all'
  | 'draft'
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'converted';

const statusVariantMap: Record<StatusFilter | string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  pending: 'warning',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  converted: 'info',
  all: 'default',
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
  all: 'label',
};

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

const columnStyles = {
  quotation: { flex: 1.3 },
  project: { flex: 1.2 },
  amount: { flex: 1 },
  status: { flex: 1 },
  valid: { flex: 1 },
  actions: { flex: 1 },
} as const;

export default function QuotationsScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const currencyCode = 'KES';

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const params = useMemo(() => {
    const base: Record<string, any> = { page: currentPage, limit: itemsPerPage };
    if (debouncedSearch) base.search = debouncedSearch;
    if (statusFilter !== 'all') base.status = statusFilter;
    if (clientFilter) base.clientId = clientFilter;
    return base;
  }, [currentPage, debouncedSearch, itemsPerPage, statusFilter, clientFilter]);

  const { data, isLoading, error, refetch } = useGetQuotations(params);
  const { mutateAsync: deleteQuotationAsync, isPending: isDeleting } = useDeleteQuotation();
  const { mutateAsync: sendQuotationAsync, isPending: isSending } = useSendQuotation();
  const { data: clientsData } = useGetClients({ limit: 200 });

  const quotations = useMemo(() => {
    const root = data?.data ?? data;
    return (
      root?.data?.quotations ??
      root?.data?.data ??
      root?.quotations ??
      root?.data ??
      root ??
      []
    ) as any[];
  }, [data]);

  const pagination = useMemo(() => {
    const root = data?.data ?? data;
    return root?.pagination ?? root?.meta ?? root?.data?.pagination ?? {};
  }, [data]);

  const clients = useMemo(() => {
    const root = clientsData?.data ?? clientsData;
    return (
      root?.data?.clients ??
      root?.clients ??
      root?.data ??
      []
    ) as any[];
  }, [clientsData]);

  const totalItems = useMemo(() => {
    return (
      pagination?.totalDocs ??
      pagination?.totalQuotations ??
      pagination?.total ??
      quotations.length
    );
  }, [pagination, quotations.length]);

  const totalPages = useMemo(() => {
    const p = pagination?.totalPages;
    if (p && typeof p === 'number') return p;
    return Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)));
  }, [pagination, totalItems, itemsPerPage]);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setClientFilter('');
    setCurrentPage(1);
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/quotations/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/quotations/${id}/edit`);
    },
    [router]
  );

  const handleConvert = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/quotations/${id}/convert`);
    },
    [router]
  );

  const handleRequestDelete = useCallback((q: any) => {
    const id = q?._id || q?.id;
    if (!id) return;
    setConfirmDelete({
      id,
      label: q?.quotationNumber ?? q?.number ?? id,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      await deleteQuotationAsync(confirmDelete.id);
      setInlineStatus({ type: 'success', text: 'Quotation deleted successfully.' });
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to delete quotation.';
      setInlineStatus({ type: 'error', text: message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteQuotationAsync, refetch]);

  const handleSendQuotation = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        setSendingId(id);
        setInlineStatus(null);
        await sendQuotationAsync(id);
        setInlineStatus({ type: 'success', text: 'Quotation sent successfully.' });
      } catch (err: any) {
        const message = err?.response?.data?.message ?? err?.message ?? 'Failed to send quotation.';
        setInlineStatus({ type: 'error', text: message });
      } finally {
        setSendingId(null);
      }
    },
    [sendQuotationAsync]
  );

  const badgeForStatus = (statusValue?: string) => {
    const key = (statusValue ?? 'draft').toLowerCase() as StatusFilter;
    const variant = statusVariantMap[key] ?? 'default';
    return (
      <Badge
        variant={variant}
        size="sm"
        icon={
          <MaterialIcons
            name={statusIconMap[key] ?? 'label'}
            size={14}
            color="#7b1c1c"
          />
        }>
        {statusLabelMap[key] ?? statusValue ?? 'Draft'}
      </Badge>
    );
  };

  const clientOptions = useMemo(() => {
    return clients.map((client: any) => {
      const id = client?._id || client?.id;
      const name =
        `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || client?.company || client?.email || id;
      return { id, label: name };
    });
  }, [clients]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView nestedScrollEnabled={true}>
        <View className="px-4 py-4">
          <View className="flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <View>
              <ThemedText type="title">Quotations</ThemedText>
              <Text className="text-gray-600 mt-1">Track, send, and convert sales quotations.</Text>
            </View>
            <Link href="/(authenticated)/quotations/create" className="btn btn-primary self-start">
              <Text className="btn-text btn-text-primary">Create Quotation</Text>
            </Link>
          </View>

          {/* Toolbar */}
          <View className="mt-6 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <View className="flex-1">
            <View className="relative">
              <MaterialIcons name="search" size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search quotations…"
                className="input-search pr-9"
              />
              {searchTerm ? (
                <Pressable onPress={clearSearch} className="absolute right-2 top-2.5" accessibilityLabel="Clear search">
                  <MaterialIcons name="close" size={18} color="#9ca3af" />
                </Pressable>
              ) : null}
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {/* Status filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="flag" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(value: StatusFilter) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Status: All" value="all" />
                  <Picker.Item label="Draft" value="draft" />
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Sent" value="sent" />
                  <Picker.Item label="Accepted" value="accepted" />
                  <Picker.Item label="Rejected" value="rejected" />
                  <Picker.Item label="Converted" value="converted" />
                </Picker>
              </View>
            </View>
            {/* Client filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="person" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={clientFilter}
                  onValueChange={(value: string) => {
                    setClientFilter(value);
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Client: All" value="" />
                  {clientOptions.map((client) => (
                    <Picker.Item key={client.id} label={client.label} value={client.id} />
                  ))}
                </Picker>
              </View>
            </View>
            {/* Rows per page */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="list" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={itemsPerPage}
                  onValueChange={(v: any) => {
                    setItemsPerPage(Number(v));
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Rows: 10" value={10} />
                  <Picker.Item label="Rows: 20" value={20} />
                  <Picker.Item label="Rows: 50" value={50} />
                </Picker>
              </View>
            </View>
            {statusFilter !== 'all' || clientFilter ? (
              <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                <Text className="text-xs text-gray-700">Clear</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {inlineStatus ? (
          <View className="mt-4">
            <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
          </View>
        ) : null}
      </View>

      {/* Table */}
      <View className="px-4 pb-6">
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ScrollView horizontal>
            <View className="min-w-[960px]">
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={columnStyles.quotation} numberOfLines={2}>
                    Quotation / Client
                  </DataTable.Title>
                  <DataTable.Title style={columnStyles.project}>Project</DataTable.Title>
                  <DataTable.Title style={columnStyles.amount} numeric>
                    Amount
                  </DataTable.Title>
                  <DataTable.Title style={columnStyles.status}>Status</DataTable.Title>
                  <DataTable.Title style={columnStyles.valid}>Valid Until</DataTable.Title>
                  <DataTable.Title style={columnStyles.actions} numeric>
                    Actions
                  </DataTable.Title>
                </DataTable.Header>

                {isLoading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <DataTable.Row key={`skeleton-${idx}`}>
                        {Array.from({ length: 7 }).map((__, cellIdx) => (
                          <DataTable.Cell key={cellIdx} numeric={cellIdx >= 3}>
                            <View className="h-4 w-24 rounded-md bg-gray-200 animate-pulse" />
                          </DataTable.Cell>
                        ))}
                      </DataTable.Row>
                    ))
                  : null}

                {!isLoading && errorMessage ? (
                  <DataTable.Row>
                    <DataTable.Cell>
                      <View className="py-4">
                        <Alert variant="error" message={errorMessage} className="w-full" />
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                  </DataTable.Row>
                ) : null}

                {!isLoading && !errorMessage && quotations.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell>
                      <View className="py-8">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="insert-drive-file" size={20} color="#7b1c1c" />
                          <Text className="text-gray-700">No quotations found</Text>
                        </View>
                        <Link href="/(authenticated)/quotations/create" className="btn btn-primary mt-3 self-start">
                          <Text className="btn-text btn-text-primary">Create Quotation</Text>
                        </Link>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {!isLoading && !errorMessage && quotations.length > 0
                  ? quotations.map((quotation: any) => {
                      const id = quotation?._id || quotation?.id;
                      const number = quotation?.quotationNumber ?? quotation?.number ?? '—';
                      const client = quotation?.client ?? quotation?.clientId;
                      const clientName =
                        typeof client === 'string'
                          ? client
                          : `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() ||
                            client?.company ||
                            client?.email ||
                            '—';
                      const project = quotation?.project ?? quotation?.projectId;
                      const projectTitle =
                        typeof project === 'string'
                          ? project
                          : project?.title ?? project?.name ?? '—';
                      const currency = quotation?.currency ?? quotation?.totals?.currency ?? 'USD';
                      const totalAmount =
                        quotation?.grandTotal ??
                        quotation?.totals?.grandTotal ??
                        quotation?.total ??
                        quotation?.totalAmount ??
                        0;
                      const statusValue = (quotation?.status ?? 'draft').toLowerCase();
                      const validUntil = quotation?.validUntil ?? quotation?.validityDate;

                      return (
                        <DataTable.Row key={id}>
                          <DataTable.Cell style={columnStyles.quotation}>
                            <View className="flex-row items-center gap-3 min-w-0">
                              <View className="h-9 w-9 rounded-full bg-brand-tint items-center justify-center">
                                <Text className="font-inter font-semibold text-sm text-brand-primary">
                                  {number?.slice(0, 2) ?? 'Q'}
                                </Text>
                              </View>
                              <View className="min-w-0 flex-1">
                                <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                                  {number}
                                </Text>
                                <Text className="text-xs text-gray-600" numberOfLines={1}>
                                  {clientName}
                                </Text>
                              </View>
                            </View>
                          </DataTable.Cell>
                          <DataTable.Cell style={columnStyles.project}>
                            <Text className="text-sm text-gray-900" numberOfLines={1}>
                              {projectTitle || '—'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={columnStyles.amount} numeric>
                            {formatCurrency(Number(totalAmount), currencyCode)}
                          </DataTable.Cell>
                          <DataTable.Cell style={columnStyles.status}>{badgeForStatus(statusValue)}</DataTable.Cell>
                          <DataTable.Cell style={columnStyles.valid}>{formatDate(validUntil)}</DataTable.Cell>
                          <DataTable.Cell style={columnStyles.actions} numeric>
                            <View className="flex-row justify-end gap-1">
                              <Pressable
                                onPress={() => handleView(id)}
                                className="px-2 py-1"
                                accessibilityLabel="View quotation">
                                <MaterialIcons name="visibility" size={18} color="#2563eb" />
                              </Pressable>
                              <Pressable
                                onPress={() => handleEdit(id)}
                                className="px-2 py-1"
                                accessibilityLabel="Edit quotation">
                                <MaterialIcons name="edit" size={18} color="#7b1c1c" />
                              </Pressable>
                              <Pressable
                                onPress={() => handleSendQuotation(id)}
                                className="px-2 py-1"
                                accessibilityLabel="Send quotation"
                                disabled={isSending && sendingId === id}>
                                {isSending && sendingId === id ? (
                                  <ActivityIndicator size="small" color="#7b1c1c" />
                                ) : (
                                  <MaterialIcons name="send" size={18} color="#0ea5e9" />
                                )}
                              </Pressable>
                              <Pressable
                                onPress={() => handleConvert(id)}
                                className="px-2 py-1"
                                accessibilityLabel="Convert quotation">
                                <MaterialIcons name="repeat" size={18} color="#9333ea" />
                              </Pressable>
                              <Pressable
                                onPress={() => handleRequestDelete(quotation)}
                                className="px-2 py-1"
                                accessibilityLabel="Delete quotation">
                                <MaterialIcons name="delete" size={18} color="#dc2626" />
                              </Pressable>
                            </View>
                          </DataTable.Cell>
                        </DataTable.Row>
                      );
                    })
                  : null}
              </DataTable>
            </View>
          </ScrollView>
          {totalPages > 1 ? (
            <Pagination
              currentPage={pagination?.page ?? currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          ) : null}
        </View>
      </View>
      </ScrollView>

      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete quotation"
        onClose={() => setConfirmDelete(null)}
        showAccentStrip
        actions={
          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={() => setConfirmDelete(null)}
              className="btn btn-secondary"
              disabled={isDeleting && deletingId === confirmDelete?.id}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmDelete}
              className="btn btn-primary min-w-[120px]"
              disabled={isDeleting && deletingId === confirmDelete?.id}>
              {isDeleting && deletingId === confirmDelete?.id ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="text-gray-800 font-inter">
            {`Are you sure you want to delete quotation ${
              confirmDelete?.label ?? confirmDelete?.id ?? ''
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}

