import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useGetAllUsers, useDeleteUser } from '@/tanstack/useUsers';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';
import { getInitials, formatDate as formatDateUtil } from '@/utils';
import Pagination from '@/components/table/Pagination';

type RoleOption =
  | 'super_admin'
  | 'admin'
  | 'finance'
  | 'project_manager'
  | 'staff'
  | 'client';

export default function UsersScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | RoleOption>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name?: string; email?: string } | null>(null);
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
    if (filterRole !== 'all') p.role = filterRole;
    if (filterStatus === 'active') p.isActive = true;
    if (filterStatus === 'inactive') p.isActive = false;
    return p;
  }, [currentPage, itemsPerPage, debouncedSearch, filterRole, filterStatus]);

  const { data, isLoading, error, refetch } = useGetAllUsers(params);
  const { mutateAsync: deleteUserAsync, isPending: isDeleting } = useDeleteUser();

  const users = useMemo(() => {
    // expect response.data?.data || response?.data?.users
    const root = data?.data ?? {};
    return (root?.data?.users ?? root?.users ?? root?.data ?? []) as any[];
  }, [data]);

  const pagination = useMemo(() => {
    const root = data?.data ?? {};
    return root?.pagination ?? root?.meta ?? {};
  }, [data]);

  const totalItems = useMemo(() => {
    return (
      pagination?.totalDocs ??
      pagination?.totalUsers ??
      pagination?.total ??
      users.length
    );
  }, [pagination, users.length]);

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
    setFilterRole('all');
    setFilterStatus('all');
    setCurrentPage(1);
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/users/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/users/${id}/edit`);
    },
    [router]
  );

  const handleRequestDelete = useCallback((u: any) => {
    const id = u._id || u.id;
    setDeleteError(null);
    setConfirmDelete({
      id,
      name: `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() || undefined,
      email: u?.email,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setDeleteError(null);
      await deleteUserAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete user.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteUserAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const initials = (u: any) => getInitials({ firstName: u?.firstName, lastName: u?.lastName, email: u?.email });

  const formatDate = (value?: string) => formatDateUtil(value);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <View className="px-4 py-4">
        <View className="mb-4 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <View>
            <ThemedText type="title">Users</ThemedText>
            <Text className="text-gray-600 mt-1">
              Manage your admin and staff users.
            </Text>
          </View>
          <Link href="/(authenticated)/users/create" className="btn btn-primary">
            <Text className="btn-text btn-text-primary">Add User</Text>
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
                placeholder="Search users…"
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
            {/* Role */}
            <View className="border border-gray-300 rounded-lg bg-white px-2">
              <View className="flex-row items-center">
                <MaterialIcons name="admin-panel-settings" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterRole}
                  onValueChange={(v: any) => { setFilterRole(v); setCurrentPage(1); }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Role: All" value="all" />
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Super Admin" value="super_admin" />
                  <Picker.Item label="Project Manager" value="project_manager" />
                  <Picker.Item label="Staff" value="staff" />
                  <Picker.Item label="Finance" value="finance" />
                  <Picker.Item label="Client" value="client" />
                </Picker>
              </View>
            </View>
            {/* Status */}
            <View className="border border-gray-300 rounded-lg bg-white px-2">
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
            <View className="border border-gray-300 rounded-lg bg-white px-2">
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
            
          </View>
        </View>

        {/* Simple touch handlers removed; dropdowns above now control filters */}
        <View className="hidden">
          <Pressable
            onPress={() =>
              setFilterRole((prev) =>
                prev === 'all' ? 'admin' : prev === 'admin' ? 'project_manager' : prev === 'project_manager' ? 'staff' : prev === 'staff' ? 'finance' : prev === 'finance' ? 'super_admin' : prev === 'super_admin' ? 'client' : 'all'
              )
            }
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
            <Text className="text-xs text-gray-700">Toggle role</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              setFilterStatus((prev) =>
                prev === 'all' ? 'active' : prev === 'active' ? 'inactive' : 'all'
              )
            }
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
            <Text className="text-xs text-gray-700">Toggle status</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setItemsPerPage((prev) => {
                const next = prev === 10 ? 20 : prev === 20 ? 50 : 10;
                setCurrentPage(1);
                return next;
              });
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
            <Text className="text-xs text-gray-700">Toggle rows</Text>
          </Pressable>
          {(filterRole !== 'all' || filterStatus !== 'all') && (
            <Pressable
              onPress={clearFilters}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
              <Text className="text-xs text-gray-700">Clear</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pb-6">
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ScrollView horizontal>
            <View className="min-w-[900px]">
              <DataTable >
                <DataTable.Header>
                  <DataTable.Title>User</DataTable.Title>
                  <DataTable.Title>Email</DataTable.Title>
                  <DataTable.Title>Role</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Created</DataTable.Title>
                  <DataTable.Title numeric>Actions</DataTable.Title>
                </DataTable.Header>

                {/* Loading skeleton rows */}
                {isLoading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <DataTable.Row key={`skeleton-${idx}`}>
                        <DataTable.Cell>
                          <View className="flex-row items-center gap-3">
                            <View className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
                            <View className="h-4 w-20 rounded-md bg-gray-300 animate-pulse" />
                          </View>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-32 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-12 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-12 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded-md bg-gray-300 animate-pulse" />
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
                    <DataTable.Cell />
                  </DataTable.Row>
                ) : null}

                {/* Empty row */}
                {!isLoading && !errorMessage && users.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell colSpan={6}>
                      <View className="py-8">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="group" size={20} color="#7b1c1c" />
                          <Text className="text-gray-700">No users found</Text>
                        </View>
                        <Link href="/(authenticated)/users/create" className="btn btn-primary mt-3 self-start">
                          <Text className="btn-text btn-text-primary">Add User</Text>
                        </Link>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {/* Data rows */}
                {!isLoading && !errorMessage && users.length > 0
                  ? users.map((u: any) => {
                      const id = u._id || u.id;
                      return (
                        <DataTable.Row key={id}>
                          <DataTable.Cell>
                            <View className="flex-row items-center gap-3">
                              <View className="h-8 w-8 rounded-full overflow-hidden bg-brand-tint items-center justify-center">
                                {u?.avatar ? (
                                  <Image source={{ uri: u.avatar }} style={{ height: 32, width: 32 }} />
                                ) : (
                                  <Text className="font-inter font-semibold text-sm text-brand-primary">
                                    {initials(u)}
                                  </Text>
                                )}
                              </View>
                              <View>
                                <Text className="text-sm text-gray-900">
                                  {`${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() || '—'}
                                </Text>
                              </View>
                            </View>
                          </DataTable.Cell>
                          <DataTable.Cell>{u?.email ?? '—'}</DataTable.Cell>
                          <DataTable.Cell>
                            <Badge variant="info" size="sm">{u?.role ?? '—'}</Badge>
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <Badge variant={u?.isActive ? 'success' : 'error'} size="sm">
                              {u?.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </DataTable.Cell>
                          <DataTable.Cell>{formatDate(u?.createdAt)}</DataTable.Cell>
                          <DataTable.Cell numeric>
                            <View className="flex-row justify-end gap-2">
                              <Pressable onPress={() => handleView(id)} className="px-2 py-1" accessibilityLabel="View user">
                                <MaterialIcons name="visibility" size={18} color="#2563eb" />
                              </Pressable>
                              <Pressable onPress={() => handleEdit(id)} className="px-2 py-1" accessibilityLabel="Edit user">
                                <MaterialIcons name="edit" size={18} color="#7b1c1c" />
                              </Pressable>
                              <Pressable onPress={() => handleRequestDelete(u)} className="px-2 py-1" accessibilityLabel="Delete user">
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
        title="Delete user"
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
              confirmDelete?.name ? confirmDelete.name : confirmDelete?.email ? confirmDelete.email : 'this user'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}

