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
import { useGetProjects, useDeleteProject } from '@/tanstack/useProjects';
import { formatDate as formatDateUtil } from '@/utils';

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent';

export default function ProjectsScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterPriority, setFilterPriority] = useState<PriorityFilter>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title?: string } | null>(null);
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
    if (filterStatus !== 'all') p.status = filterStatus;
    if (filterPriority !== 'all') p.priority = filterPriority;
    if (filterAssignee !== 'all') p.assignee = filterAssignee;
    return p;
  }, [currentPage, itemsPerPage, debouncedSearch, filterStatus, filterPriority, filterAssignee]);

  const { data, isLoading, error, refetch } = useGetProjects(params);
  const { mutateAsync: deleteProjectAsync, isPending: isDeleting } = useDeleteProject();

  const projects = useMemo(() => {
    const root = data?.data ?? {};
    return (root?.data?.projects ?? root?.projects ?? root?.data ?? []) as any[];
  }, [data]);

  const pagination = useMemo(() => {
    const root = data?.data ?? {};
    return root?.pagination ?? root?.meta ?? {};
  }, [data]);

  const totalItems = useMemo(() => {
    return (
      pagination?.totalDocs ??
      pagination?.totalProjects ??
      pagination?.total ??
      projects.length
    );
  }, [pagination, projects.length]);

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
    setFilterPriority('all');
    setFilterAssignee('all');
    setCurrentPage(1);
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/projects/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/projects/${id}/edit`);
    },
    [router]
  );

  const handleRequestDelete = useCallback((p: any) => {
    const id = p._id || p.id;
    setDeleteError(null);
    setConfirmDelete({
      id,
      title: p?.title,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setDeleteError(null);
      await deleteProjectAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete project.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteProjectAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const formatDate = (value?: string) => formatDateUtil(value);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'priority-high';
      case 'high':
        return 'arrow-upward';
      case 'medium':
        return 'remove';
      case 'low':
        return 'arrow-downward';
      default:
        return 'remove';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#2563eb';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'play-circle-filled';
      case 'on_hold':
        return 'pause-circle-filled';
      case 'cancelled':
        return 'cancel';
      default:
        return 'schedule';
    }
  };

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <View className="px-4 py-4">
        <View className="mb-4 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <View>
            <ThemedText type="title">Projects</ThemedText>
            <Text className="text-gray-600 mt-1">
              Manage your projects and track progress.
            </Text>
          </View>
          <Link href="/(authenticated)/projects/create" className="btn btn-primary">
            <Text className="btn-text btn-text-primary">Add Project</Text>
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
                placeholder="Search projects…"
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
                <MaterialIcons name="work" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterStatus}
                  onValueChange={(v: any) => { setFilterStatus(v); setCurrentPage(1); }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Status: All" value="all" />
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="In Progress" value="in_progress" />
                  <Picker.Item label="On Hold" value="on_hold" />
                  <Picker.Item label="Completed" value="completed" />
                  <Picker.Item label="Cancelled" value="cancelled" />
                </Picker>
              </View>
            </View>
            {/* Priority */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="priority-high" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterPriority}
                  onValueChange={(v: any) => { setFilterPriority(v); setCurrentPage(1); }}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Priority: All" value="all" />
                  <Picker.Item label="Low" value="low" />
                  <Picker.Item label="Medium" value="medium" />
                  <Picker.Item label="High" value="high" />
                  <Picker.Item label="Urgent" value="urgent" />
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
            {(filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all') ? (
              <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                <Text className="text-xs text-gray-700">Clear</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pb-6">
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ScrollView horizontal>
            <View className="min-w-[1000px]">
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Client</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Priority</DataTable.Title>
                  <DataTable.Title>Progress</DataTable.Title>
                  <DataTable.Title>Assigned</DataTable.Title>
                  <DataTable.Title>Created</DataTable.Title>
                  <DataTable.Title numeric>Actions</DataTable.Title>
                </DataTable.Header>

                {/* Loading skeleton rows */}
                {isLoading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <DataTable.Row key={`skeleton-${idx}`}>
                        <DataTable.Cell>
                          <View className="h-4 w-32 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-24 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-14 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-5 w-12 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-16 rounded-md bg-gray-300 animate-pulse" />
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View className="h-4 w-12 rounded-md bg-gray-300 animate-pulse" />
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
                    <DataTable.Cell />
                    <DataTable.Cell />
                    <DataTable.Cell />
                  </DataTable.Row>
                ) : null}

                {/* Empty row */}
                {!isLoading && !errorMessage && projects.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell colSpan={8}>
                      <View className="py-8">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="work-outline" size={20} color="#7b1c1c" />
                          <Text className="text-gray-700">No projects found</Text>
                        </View>
                        <Link href="/(authenticated)/projects/create" className="btn btn-primary mt-3 self-start">
                          <Text className="btn-text btn-text-primary">Add Project</Text>
                        </Link>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : null}

                {/* Data rows */}
                {!isLoading && !errorMessage && projects.length > 0
                  ? projects.map((p: any) => {
                      const id = p._id || p.id;
                      const clientName = p?.client
                        ? `${p.client.firstName ?? ''} ${p.client.lastName ?? ''}`.trim() || p.client.company || p.client.email
                        : '—';
                      const teamCount = p?.teamMembers?.length ?? 0;
                      const progress = p?.progress ?? 0;
                      return (
                        <DataTable.Row key={id}>
                          {/* Project cell */}
                          <DataTable.Cell>
                            <View className="min-w-0 max-w-[180px]">
                              <Text
                                className="text-sm font-semibold text-gray-900"
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {p?.projectNumber ? `#${p.projectNumber} ` : ''}
                                {p?.title ?? '—'}
                              </Text>
                            </View>
                          </DataTable.Cell>
                          {/* Client */}
                          <DataTable.Cell>
                            <Text className="text-sm text-gray-700" numberOfLines={1}>
                              {clientName}
                            </Text>
                          </DataTable.Cell>
                          {/* Status */}
                          <DataTable.Cell>
                            <Badge
                              variant={getStatusVariant(p?.status)}
                              size="sm"
                              icon={
                                <MaterialIcons
                                  name={getStatusIcon(p?.status) as any}
                                  size={14}
                                  color={
                                    p?.status === 'completed'
                                      ? '#059669'
                                      : p?.status === 'in_progress'
                                      ? '#2563eb'
                                      : p?.status === 'on_hold'
                                      ? '#f59e0b'
                                      : p?.status === 'cancelled'
                                      ? '#dc2626'
                                      : '#6b7280'
                                  }
                                />
                              }>
                              {p?.status?.replace('_', ' ') ?? 'pending'}
                            </Badge>
                          </DataTable.Cell>
                          {/* Priority */}
                          <DataTable.Cell>
                            <Badge
                              variant={getPriorityVariant(p?.priority)}
                              size="sm"
                              icon={
                                <MaterialIcons
                                  name={getPriorityIcon(p?.priority) as any}
                                  size={14}
                                  color={getPriorityColor(p?.priority)}
                                />
                              }>
                              {p?.priority ?? 'low'}
                            </Badge>
                          </DataTable.Cell>
                          {/* Progress */}
                          <DataTable.Cell>
                            <View className="flex-row items-center gap-2">
                              <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <View
                                  className="h-full bg-brand-primary"
                                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                />
                              </View>
                              <Text className="text-xs text-gray-600 w-10 text-right">
                                {progress}%
                              </Text>
                            </View>
                          </DataTable.Cell>
                          {/* Assigned */}
                          <DataTable.Cell>
                            <Text className="text-sm text-gray-700">
                              {teamCount > 0 ? `${teamCount} member${teamCount > 1 ? 's' : ''}` : 'Unassigned'}
                            </Text>
                          </DataTable.Cell>
                          {/* Created */}
                          <DataTable.Cell>{formatDate(p?.createdAt)}</DataTable.Cell>
                          {/* Actions */}
                          <DataTable.Cell numeric>
                            <View className="flex-row justify-end gap-2">
                              <Pressable onPress={() => handleView(id)} className="px-2 py-1" accessibilityLabel="View project">
                                <MaterialIcons name="visibility" size={18} color="#2563eb" />
                              </Pressable>
                              <Pressable onPress={() => handleEdit(id)} className="px-2 py-1" accessibilityLabel="Edit project">
                                <MaterialIcons name="edit" size={18} color="#7b1c1c" />
                              </Pressable>
                              <Pressable onPress={() => handleRequestDelete(p)} className="px-2 py-1" accessibilityLabel="Delete project">
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
        title="Delete project"
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
              confirmDelete?.title ? `"${confirmDelete.title}"` : 'this project'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}
