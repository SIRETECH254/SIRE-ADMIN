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
import { useGetPayments, useDeletePayment } from '@/tanstack/usePayments';
import { formatCurrency, formatDate as formatDateUtil } from '@/utils';

type StatusFilter = 'all' | 'pending' | 'completed' | 'failed';
type MethodFilter = 'all' | 'mpesa' | 'paystack';

const statusVariantMap: Record<
  string,
  { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'error'; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  pending: { label: 'Pending', variant: 'info', icon: 'schedule' },
  processing: { label: 'Processing', variant: 'info', icon: 'sync' },
  completed: { label: 'Completed', variant: 'success', icon: 'check-circle' },
  failed: { label: 'Failed', variant: 'error', icon: 'error' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'cancel' },
};

export default function PaymentsScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterMethod, setFilterMethod] = useState<MethodFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; number?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const params = useMemo(() => {
    const query: Record<string, any> = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (debouncedSearch) {
      query.search = debouncedSearch;
    }
    if (filterStatus !== 'all') {
      query.status = filterStatus;
    }
    if (filterMethod !== 'all') {
      query.paymentMethod = filterMethod;
    }
    return query;
  }, [currentPage, itemsPerPage, debouncedSearch, filterStatus, filterMethod]);

  const { data, isLoading, error, refetch } = useGetPayments(params);
  const { mutateAsync: deletePaymentAsync, isPending: isDeleting } = useDeletePayment();

  const payments = useMemo(() => {
    const root = data?.data ?? data;
    return (root?.data?.payments ?? root?.payments ?? root?.data ?? []) as any[];
  }, [data]);

  const pagination = useMemo(() => {
    const root = data?.data ?? data;
    return root?.pagination ?? root?.meta ?? {};
  }, [data]);

  const totalItems = useMemo(() => {
    return (
      pagination?.totalPayments ??
      pagination?.totalDocs ??
      pagination?.total ??
      payments.length
    );
  }, [pagination, payments.length]);

  const totalPages = useMemo(() => {
    if (pagination?.totalPages) {
      return pagination.totalPages;
    }
    if (!itemsPerPage) return 1;
    return Math.max(1, Math.ceil((totalItems || 0) / itemsPerPage));
  }, [itemsPerPage, pagination, totalItems]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setFilterMethod('all');
    setCurrentPage(1);
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/payments/${id}`);
    },
    [router]
  );

  const handleRequestDelete = useCallback((p: any) => {
    const id = p._id || p.id;
    setDeleteError(null);
    setConfirmDelete({
      id,
      number: p?.paymentNumber ?? p?.transactionReference,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setDeleteError(null);
      await deletePaymentAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete payment.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deletePaymentAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const formatDate = (value?: string) => formatDateUtil(value);

  const formatClientName = useCallback((payment: any) => {
    const client = payment?.client ?? payment?.clientId;
    if (!client) return '—';
    const fullName = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
    return fullName || client.company || client.email || 'Client';
  }, []);


  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView className="flex-1" nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-4 py-4">
          <View className="mb-4 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <View>
              <ThemedText type="title">Payments</ThemedText>
              <Text className="text-gray-600 mt-1">
                Monitor payment transactions and status.
              </Text>
            </View>
            <Link href="/(authenticated)/payments/initiate" className="btn btn-primary self-start">
              <Text className="btn-text btn-text-primary">Initiate Payment</Text>
            </Link>
          </View>

          <View className="flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <View className="flex-1">
              <View className="relative">
                <MaterialIcons
                  name="search"
                  size={18}
                  color="#9ca3af"
                  style={{ position: 'absolute', left: 12, top: 14 }}
                />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search payments…"
                  className="input-search pr-9"
                />
                {searchTerm ? (
                  <Pressable
                    onPress={clearSearch}
                    className="absolute right-2 top-2.5"
                    accessibilityLabel="Clear search">
                    <MaterialIcons name="close" size={18} color="#9ca3af" />
                  </Pressable>
                ) : null}
              </View>
            </View>
            <View className="flex-row gap-2 flex-wrap">
              <View className="input-select">
                <View className="flex-row items-center">
                  <MaterialIcons name="filter-alt" size={18} color="#9ca3af" />
                  <Picker
                    selectedValue={filterStatus}
                    onValueChange={(v: StatusFilter) => {
                      setFilterStatus(v);
                      setCurrentPage(1);
                    }}
                    style={{ flex: 1, height: 40 }}>
                    <Picker.Item label="Status: All" value="all" />
                    <Picker.Item label="Pending" value="pending" />
                    <Picker.Item label="Completed" value="completed" />
                    <Picker.Item label="Failed" value="failed" />
                  </Picker>
                </View>
              </View>
              <View className="input-select">
                <View className="flex-row items-center">
                  <MaterialIcons name="payment" size={18} color="#9ca3af" />
                  <Picker
                    selectedValue={filterMethod}
                    onValueChange={(v: MethodFilter) => {
                      setFilterMethod(v);
                      setCurrentPage(1);
                    }}
                    style={{ flex: 1, height: 40 }}>
                    <Picker.Item label="Method: All" value="all" />
                    <Picker.Item label="M-Pesa" value="mpesa" />
                    <Picker.Item label="Paystack" value="paystack" />
                  </Picker>
                </View>
              </View>
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
              {(filterStatus !== 'all' || filterMethod !== 'all') ? (
                <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                  <Text className="text-xs text-gray-700">Clear</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <View className="px-4 pb-6">
          <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ScrollView horizontal>
              <View className="min-w-[800px]">
                <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Payment</DataTable.Title>
                  <DataTable.Title>Client</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Method</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title numeric>Actions</DataTable.Title>
                </DataTable.Header>

                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <DataTable.Row key={`skeleton-${index}`}>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-14 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <View className="flex-row justify-end gap-2">
                            <View className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
                            <View className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))
                  : null}

                {!isLoading && errorMessage ? (
                  <DataTable.Row>
                    <DataTable.Cell>
                      <View className="w-full py-3">
                        <Alert variant="error" message={errorMessage} className="w-full" />
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                  </DataTable.Row>
                ) : null}

                {!isLoading && !errorMessage && payments.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell colSpan={7}>
                      <View className="py-8">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="payment" size={20} color="#7b1c1c" />
                          <Text className="text-gray-700">No payments found</Text>
                        </View>
                        <Link href="/(authenticated)/payments/initiate" className="btn btn-primary mt-3 self-start">
                          <Text className="btn-text btn-text-primary">Initiate Payment</Text>
                        </Link>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {!isLoading && !errorMessage && payments.length > 0
                  ? payments.map((payment: any) => {
                      const id = payment._id || payment.id;
                      const paymentNumber = payment.paymentNumber ?? `PAY-${id.slice(0, 8)}`;
                      const statusValue = (payment.status ?? 'pending').toLowerCase();
                      const statusConfig = statusVariantMap[statusValue] ?? statusVariantMap.pending;
                      const method = payment.paymentMethod?.toLowerCase() ?? 'unknown';
                      const amount = payment.amount ?? 0;
                      const currency = payment.currency ?? 'KES';
                      const paymentDate = payment.paymentDate ?? payment.createdAt;

                      return (
                        <DataTable.Row key={id}>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm text-gray-900" numberOfLines={1}>
                              {paymentNumber}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm text-gray-900" numberOfLines={1}>
                              {formatClientName(payment)}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm text-gray-900">
                              {formatCurrency(amount, currency)}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Badge
                              variant={method === 'mpesa' ? 'info' : 'default'}
                              size="sm"
                              icon={
                                <MaterialIcons
                                  name={method === 'mpesa' ? 'phone-android' : 'credit-card'}
                                  size={14}
                                  color="#7b1c1c"
                                />
                              }>
                              {method === 'mpesa' ? 'M-Pesa' : method === 'paystack' ? 'Paystack' : method}
                            </Badge>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Badge
                              variant={statusConfig.variant}
                              size="sm"
                              icon={
                                <MaterialIcons
                                  name={statusConfig.icon}
                                  size={14}
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
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm text-gray-900">
                              {formatDate(paymentDate)}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell numeric>
                            <View className="flex-row justify-end gap-2">
                              <Pressable
                                onPress={() => handleView(id)}
                                className="px-2 py-1"
                                accessibilityLabel="View payment">
                                <MaterialIcons name="visibility" size={18} color="#2563eb" />
                              </Pressable>
                              <Pressable
                                onPress={() => handleRequestDelete(payment)}
                                className="px-2 py-1"
                                accessibilityLabel="Delete payment">
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
        </View>

        {totalPages > 1 ? (
          <Pagination
            currentPage={pagination?.page ?? currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        ) : null}
      </View>
    </ScrollView>

      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete payment"
        onClose={handleCancelDelete}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable onPress={handleCancelDelete} disabled={isDeleting} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirmDelete} disabled={isDeleting} className="btn btn-primary min-w-[120px]">
              {isDeleting && deletingId === confirmDelete?.id ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          {deleteError ? <Alert variant="error" message={deleteError} className="w-full" /> : null}
          <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
            {`Are you sure you want to delete payment ${
              confirmDelete?.number ? confirmDelete.number : 'this payment'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}
