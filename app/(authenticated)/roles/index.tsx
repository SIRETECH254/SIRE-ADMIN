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
import { useGetAllRoles, useDeleteRole } from '@/tanstack/useRoles';
import { formatDate as formatDateUtil } from '@/utils';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function RolesScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Build params
  const params = useMemo(() => {
    const p: any = { page: currentPage, limit: itemsPerPage };
    if (debouncedSearch) p.search = debouncedSearch;
    if (filterStatus !== 'all') {
      p.isActive = filterStatus === 'active';
    }
    return p;
  }, [currentPage, itemsPerPage, debouncedSearch, filterStatus]);

  const { data, isLoading, error, refetch } = useGetAllRoles(params);
  const { mutateAsync: deleteRoleAsync, isPending: isDeleting } = useDeleteRole();

  const roles = useMemo(() => {
    const root = data?.data ?? {};
    return (root?.data?.roles ?? root?.roles ?? root?.data ?? []) as any[];
  }, [data]);

  const pagination = useMemo(() => {
    const root = data?.data ?? {};
    return root?.pagination ?? root?.meta ?? {};
  }, [data]);

  const totalItems = useMemo(() => {
    return (
      pagination?.totalDocs ??
      pagination?.totalRoles ??
      pagination?.total ??
      roles.length
    );
  }, [pagination, roles.length]);

  const totalPages = useMemo(() => {
    const p = pagination?.totalPages;
    if (p && typeof p === 'number') return p;
    return Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)));
  }, [pagination, totalItems, itemsPerPage]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setCurrentPage(1);
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/roles/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/roles/${id}/edit`);
    },
    [router]
  );

  const handleRequestDelete = useCallback((role: any) => {
    const id = role._id || role.id;
    setDeleteError(null);
    setConfirmDelete({
      id,
      name: role?.displayName || role?.name,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setDeleteError(null);
      await deleteRoleAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete role.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteRoleAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const formatDate = (value?: string) => formatDateUtil(value);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView nestedScrollEnabled={true}>
        <View className="px-4 py-4">
          <View className="mb-4 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <View>
              <ThemedText type="title">Roles</ThemedText>
              <Text className="text-gray-600 mt-1">
                Manage system roles and permissions.
              </Text>
            </View>
            <Link href="/(authenticated)/roles/create" className="btn btn-primary">
              <Text className="btn-text btn-text-primary">Add Role</Text>
            </Link>
          </View>

          {/* Toolbar */}
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
                  placeholder="Search roles…"
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
              {/* Status */}
              <View className="input-select">
                <View className="flex-row items-center">
                  <MaterialIcons name="verified-user" size={18} color="#9ca3af" />
                  <Picker
                    selectedValue={filterStatus}
                    onValueChange={(v: any) => { setFilterStatus(v); setCurrentPage(1); }}
                    style={{ flex: 1, height: 40 }}>
                    <Picker.Item label="Status: All" value="all" />
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Inactive" value="inactive" />
                  </Picker>
                </View>
              </View>
              {/* Rows per page */}
              <View className="input-select">
                <View className="flex-row items-center">
                  <MaterialIcons name="list" size={18} color="#9ca3af" />
                  <Picker
                    selectedValue={itemsPerPage}
                    onValueChange={(v: any) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
                    style={{ flex: 1, height: 40 }}>
                    <Picker.Item label="Rows: 10" value={10} />
                    <Picker.Item label="Rows: 20" value={20} />
                    <Picker.Item label="Rows: 50" value={50} />
                  </Picker>
                </View>
              </View>
              {filterStatus !== 'all' ? (
                <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                  <Text className="text-xs text-gray-700">Clear</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Content */}
      <View className="px-4 pb-6">
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ScrollView horizontal>
            <View className="min-w-[700px]">
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Role Name</DataTable.Title>
                  <DataTable.Title>Display Name</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Created</DataTable.Title>
                  <DataTable.Title numeric>Actions</DataTable.Title>
                </DataTable.Header>

                {/* Loading skeleton rows */}
                {isLoading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <DataTable.Row key={`skeleton-${idx}`}>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-14 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-16 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <View className="flex-row justify-end gap-2">
                            <View className="h-4 w-6 rounded-md bg-gray-300 animate-pulse" />
                            <View className="h-4 w-6 rounded-md bg-gray-300 animate-pulse" />
                            <View className="h-4 w-6 rounded-md bg-gray-300 animate-pulse" />
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))
                  : null}

                {/* Error row */}
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
                  </DataTable.Row>
                ) : null}

                {/* Empty row */}
                {!isLoading && !errorMessage && roles.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell colSpan={5}>
                      <View className="py-8">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="admin-panel-settings" size={20} color="#7b1c1c" />
                          <Text className="text-gray-700">No roles found</Text>
                        </View>
                        <Link href="/(authenticated)/roles/create" className="btn btn-primary mt-3 self-start">
                          <Text className="btn-text btn-text-primary">Add Role</Text>
                        </Link>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {/* Data rows */}
                {!isLoading && !errorMessage && roles.length > 0
                  ? roles.map((role: any) => {
                      const id = role._id || role.id;
                      return (
                        <DataTable.Row key={id}>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm font-semibold text-gray-900">
                              {role?.name ?? '—'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Text className="font-inter text-sm text-gray-900">
                              {role?.displayName ?? '—'}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Badge
                              variant={role?.isActive !== false ? 'success' : 'error'}
                              size="sm"
                              icon={
                                <MaterialIcons
                                  name={role?.isActive !== false ? 'check-circle' : 'block'}
                                  size={14}
                                  color={role?.isActive !== false ? '#059669' : '#a33c3c'}
                                />
                              }>
                              {role?.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </DataTable.Cell>
                          <DataTable.Cell>{formatDate(role?.createdAt)}</DataTable.Cell>
                          <DataTable.Cell numeric>
                            <View className="flex-row justify-end gap-2">
                              <Pressable onPress={() => handleView(id)} className="px-2 py-1" accessibilityLabel="View role">
                                <MaterialIcons name="visibility" size={18} color="#2563eb" />
                              </Pressable>
                              <Pressable onPress={() => handleEdit(id)} className="px-2 py-1" accessibilityLabel="Edit role">
                                <MaterialIcons name="edit" size={18} color="#7b1c1c" />
                              </Pressable>
                              <Pressable onPress={() => handleRequestDelete(role)} className="px-2 py-1" accessibilityLabel="Delete role">
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

          {/* Pagination: show only when more than one page */}
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
      </View>
      {/* Delete confirmation modal */}
      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete role"
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
            {`Are you sure you want to delete ${
              confirmDelete?.name ? `"${confirmDelete.name}"` : 'this role'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}

