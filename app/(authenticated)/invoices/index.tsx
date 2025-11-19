import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/table/Pagination';
import { useGetInvoices } from '@/tanstack/useInvoices';
import { useGetClients } from '@/tanstack/useClients';
import { formatCurrency, formatDate } from '@/utils';

type StatusFilter =
  | 'all'
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled';

const statusVariantMap: Record<
  string,
  { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'error'; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  draft: { label: 'Draft', variant: 'default', icon: 'description' },
  sent: { label: 'Sent', variant: 'info', icon: 'send' },
  paid: { label: 'Paid', variant: 'success', icon: 'check-circle' },
  partially_paid: { label: 'Partially Paid', variant: 'warning', icon: 'payments' },
  overdue: { label: 'Overdue', variant: 'error', icon: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'cancel' },
};

export default function InvoicesScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }
    if (clientFilter !== 'all') {
      query.client = clientFilter;
    }
    return query;
  }, [clientFilter, currentPage, debouncedSearch, itemsPerPage, statusFilter]);

  const { data, isLoading, error, refetch } = useGetInvoices(params);
  const { data: clientsData } = useGetClients({ limit: 200 });

  const invoices = useMemo(() => {
    const root = data?.data ?? data;
    return (root?.data?.invoices ?? root?.invoices ?? root?.data ?? []) as any[];
  }, [data]);

  const pagination = useMemo(() => {
    const root = data?.data ?? data;
    return root?.pagination ?? root?.meta ?? {};
  }, [data]);

  const totalItems = useMemo(() => {
    return (
      pagination?.totalInvoices ??
      pagination?.totalDocs ??
      pagination?.total ??
      invoices.length
    );
  }, [pagination, invoices.length]);

  const totalPages = useMemo(() => {
    if (pagination?.totalPages) {
      return pagination.totalPages;
    }
    if (!itemsPerPage) return 1;
    return Math.max(1, Math.ceil((totalItems || 0) / itemsPerPage));
  }, [itemsPerPage, pagination, totalItems]);

  const clients = useMemo(() => {
    const root = clientsData?.data ?? {};
    return (root?.data?.clients ?? root?.clients ?? root?.data ?? []) as any[];
  }, [clientsData]);

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setClientFilter('all');
    setCurrentPage(1);
  }, []);

  const handleView = useCallback(
    (invoiceId: string) => {
      router.push(`/(authenticated)/invoices/${invoiceId}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (invoiceId: string) => {
      router.push(`/(authenticated)/invoices/${invoiceId}/edit`);
    },
    [router]
  );

  const formatClientName = useCallback((invoice: any) => {
    const client = invoice?.client ?? invoice?.clientId;
    if (!client) return '—';
    const fullName = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
    return fullName || client.company || client.email || 'Client';
  }, []);

  const invoicesError =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView nestedScrollEnabled={true}>
        <View className="px-4 py-4">
          <View className="flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <View>
              <ThemedText type="title">Invoices</ThemedText>
              <Text className="text-gray-600 mt-1">
                Monitor billing, payment status, and reminders.
              </Text>
            </View>
            <Link href="/(authenticated)/invoices/create" className="btn btn-primary self-start">
              <Text className="btn-text btn-text-primary">Create Invoice</Text>
            </Link>
          </View>

          <View className="mt-6 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                placeholder="Search invoices…"
                className="input-search pr-9"
              />
              {searchTerm ? (
                <Pressable
                  onPress={() => setSearchTerm('')}
                  className="absolute right-2 top-2.5"
                  accessibilityLabel="Clear search term">
                  <MaterialIcons name="close" size={18} color="#9ca3af" />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="filter-alt" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(value: StatusFilter) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Status: All" value="all" />
                  <Picker.Item label="Draft" value="draft" />
                  <Picker.Item label="Sent" value="sent" />
                  <Picker.Item label="Paid" value="paid" />
                  <Picker.Item label="Partially Paid" value="partially_paid" />
                  <Picker.Item label="Overdue" value="overdue" />
                  <Picker.Item label="Cancelled" value="cancelled" />
                </Picker>
              </View>
            </View>

            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="group" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={clientFilter}
                  onValueChange={(value: string) => {
                    setClientFilter(value);
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Client: All" value="all" />
                  {clients.map((client: any) => {
                    const id = client._id || client.id;
                    const name =
                      `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() ||
                      client.company ||
                      client.email;
                    return <Picker.Item key={id} label={name} value={id} />;
                  })}
                </Picker>
              </View>
            </View>

            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="format-list-numbered" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={itemsPerPage}
                  onValueChange={(value: number) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Rows: 10" value={10} />
                  <Picker.Item label="Rows: 20" value={20} />
                  <Picker.Item label="Rows: 50" value={50} />
                </Picker>
              </View>
            </View>

            {(statusFilter !== 'all' || clientFilter !== 'all') && (
              <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                <Text className="text-xs text-gray-700">Clear</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View className="px-4 pb-6 flex-1">
        <View className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <ScrollView horizontal>
            <View className="min-w-[900px]">
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Invoice</DataTable.Title>
                  <DataTable.Title>Client</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Total</DataTable.Title>
                  <DataTable.Title>Due Date</DataTable.Title>
                  <DataTable.Title>Created</DataTable.Title>
                  <DataTable.Title numeric>Actions</DataTable.Title>
                </DataTable.Header>

                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <DataTable.Row key={`skeleton-${index}`}>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <View className="flex-row justify-end gap-2">
                            <View className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
                            <View className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
                            <View className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))
                  : null}

                {!isLoading && invoicesError ? (
                  <DataTable.Row>
                    <DataTable.Cell>
                      <Alert variant="error" message={invoicesError} className="w-full" />
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {!isLoading && !invoicesError && invoices.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell>
                      <View className="py-6">
                        <Text className="text-gray-700">No invoices found.</Text>
                        <Link href="/(authenticated)/invoices/create" className="btn btn-primary mt-3 self-start">
                          <Text className="btn-text btn-text-primary">Create Invoice</Text>
                        </Link>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {!isLoading && !invoicesError
                  ? invoices.map((invoice: any) => {
                      const id = invoice._id || invoice.id;
                      const invoiceNumber = invoice.invoiceNumber ?? 'Invoice';
                      const statusValue = (invoice.status ?? 'draft').toLowerCase();
                      const statusConfig = statusVariantMap[statusValue] ?? statusVariantMap.draft;
                      const totalAmount = invoice.totalAmount ?? invoice.total ?? 0;
                      const paidAmount = invoice.paidAmount ?? 0;
                      const dueDate = invoice.dueDate ?? invoice.paymentDueDate;
                      const createdAt = invoice.createdAt ?? invoice.created_on;
                      const isPaid = statusValue === 'paid';
                      const isCancelled = statusValue === 'cancelled';
                      const canPayInvoice = !isPaid && !isCancelled;
                      const projectId = invoice.project?._id ?? invoice.projectId;
                      return (
                        <DataTable.Row key={id}>
                          <DataTable.Cell>
                            <View className="min-w-0">
                              <Text className="font-inter text-sm text-gray-900" numberOfLines={1}>
                                {invoiceNumber}
                              </Text>
                              <Text className="text-xs text-gray-500" numberOfLines={1}>
                                {invoice.projectTitle ?? '—'}
                              </Text>
                            </View>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm text-gray-900" numberOfLines={1}>
                              {formatClientName(invoice)}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Badge
                              variant={statusConfig.variant}
                              size="sm"
                              icon={
                                <MaterialIcons
                                  name={statusConfig.icon}
                                  size={14}
                                  color="#7b1c1c"
                                />
                              }>
                              {statusConfig.label}
                            </Badge>
                          </DataTable.Cell>
                          <DataTable.Cell>{formatCurrency(totalAmount)}</DataTable.Cell>
                          <DataTable.Cell>{formatDate(dueDate)}</DataTable.Cell>
                          <DataTable.Cell>{formatDate(createdAt)}</DataTable.Cell>
                          <DataTable.Cell numeric>
                            <View className="flex-row justify-end gap-2">
                              <Pressable
                                onPress={() => handleView(id)}
                                className="px-2 py-1"
                                accessibilityLabel="View invoice">
                                <MaterialIcons name="visibility" size={18} color="#2563eb" />
                              </Pressable>
                              <Pressable
                                onPress={() => handleEdit(id)}
                                className="px-2 py-1"
                                accessibilityLabel="Edit invoice">
                                <MaterialIcons name="edit" size={18} color="#7b1c1c" />
                              </Pressable>
                              {canPayInvoice && (
                                <Pressable
                                  onPress={() => {
                                    const url = projectId
                                      ? `/(authenticated)/payments/initiate?invoiceId=${id}&projectId=${projectId}` as any
                                      : `/(authenticated)/payments/initiate?invoiceId=${id}` as any;
                                    router.push(url);
                                  }}
                                  className="px-2 py-1"
                                  accessibilityLabel="Pay invoice">
                                  <MaterialIcons name="payment" size={18} color="#059669" />
                                </Pressable>
                              )}
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
              onPageChange={setCurrentPage}
            />
          ) : null}
        </View>
      </View>
      </ScrollView>

    </ThemedView>
  );
}
