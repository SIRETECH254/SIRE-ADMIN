import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  useGetTestimonials,
  useApproveTestimonial,
  usePublishTestimonial,
  useUnpublishTestimonial,
  useDeleteTestimonial,
} from '@/tanstack/useTestimonials';
import { formatDate, getInitials } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

type ApprovalFilter = 'all' | 'approved' | 'pending';
type PublishFilter = 'all' | 'published' | 'unpublished';
type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';

function StarRating({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <View className="flex-row items-center gap-1">
      {stars.map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rating ? 'star' : 'star-border'}
          size={18}
          color={star <= rating ? '#fbbf24' : '#d1d5db'}
        />
      ))}
    </View>
  );
}

export default function TestimonialsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterApproval, setFilterApproval] = useState<ApprovalFilter>('all');
  const [filterPublish, setFilterPublish] = useState<PublishFilter>('all');
  const [filterRating, setFilterRating] = useState<RatingFilter>('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; clientName?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    const role = user?.role;
    return role === 'super_admin' || role === 'finance' || role === 'project_manager';
  }, [user?.role]);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Build params
  const params = useMemo(() => {
    const p: any = {};
    if (debouncedSearch) {
      p.search = debouncedSearch;
    }
    if (filterApproval !== 'all') {
      p.isApproved = filterApproval === 'approved';
    }
    if (filterPublish !== 'all') {
      p.isPublished = filterPublish === 'published';
    }
    if (filterRating !== 'all') {
      p.rating = parseInt(filterRating);
    }
    return p;
  }, [debouncedSearch, filterApproval, filterPublish, filterRating]);

  const { data, isLoading, error, refetch } = useGetTestimonials(params);
  const { mutateAsync: approveAsync, isPending: approving } = useApproveTestimonial();
  const { mutateAsync: publishAsync, isPending: publishing } = usePublishTestimonial();
  const { mutateAsync: unpublishAsync, isPending: unpublishing } = useUnpublishTestimonial();
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteTestimonial();

  const testimonials = useMemo(() => {
    const root = data?.data ?? {};
    return (root?.data?.testimonials ?? root?.testimonials ?? root?.data ?? []) as any[];
  }, [data]);

  const clearFilters = useCallback(() => {
    setFilterApproval('all');
    setFilterPublish('all');
    setFilterRating('all');
    setSearchTerm('');
  }, []);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/(authenticated)/testimonials/${id}`);
    },
    [router]
  );

  const handleApprove = useCallback(
    async (testimonialId: string) => {
      try {
        await approveAsync({ testimonialId, isApproved: true });
        await refetch();
      } catch (err: any) {
        // Error handled by mutation
      }
    },
    [approveAsync, refetch]
  );

  const handlePublish = useCallback(
    async (testimonialId: string) => {
      try {
        await publishAsync(testimonialId);
        await refetch();
      } catch (err: any) {
        // Error handled by mutation
      }
    },
    [publishAsync, refetch]
  );

  const handleUnpublish = useCallback(
    async (testimonialId: string) => {
      try {
        await unpublishAsync(testimonialId);
        await refetch();
      } catch (err: any) {
        // Error handled by mutation
      }
    },
    [unpublishAsync, refetch]
  );

  const handleRequestDelete = useCallback((testimonial: any) => {
    const id = testimonial._id || testimonial.id;
    const client = testimonial.client;
    const clientName = client
      ? `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || client?.email
      : undefined;
    setDeleteError(null);
    setConfirmDelete({
      id,
      clientName,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete?.id) return;
    try {
      setDeletingId(confirmDelete.id);
      setDeleteError(null);
      await deleteAsync(confirmDelete.id);
      setConfirmDelete(null);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete testimonial.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteAsync, refetch]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const initials = (t: any) => {
    const client = t?.client;
    return getInitials({
      firstName: client?.firstName,
      lastName: client?.lastName,
      email: client?.email,
    });
  };

  const formatDateUtil = (value?: string) => formatDate(value);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <View className="px-4 py-4">
        <View className="mb-4">
          <ThemedText type="title">Testimonials</ThemedText>
          <Text className="text-gray-600 mt-1">
            Manage client testimonials, approvals, and publications.
          </Text>
        </View>

        {/* Filters Toolbar */}
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
                placeholder="Search by client name…"
                className="input-search pr-9"
              />
              {searchTerm ? (
                <Pressable
                  onPress={() => setSearchTerm('')}
                  className="absolute right-2 top-2.5"
                  accessibilityLabel="Clear search">
                  <MaterialIcons name="close" size={18} color="#9ca3af" />
                </Pressable>
              ) : null}
            </View>
          </View>
          <View className="flex-row gap-2 flex-wrap">
            {/* Approval Filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="verified" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterApproval}
                  onValueChange={(v: ApprovalFilter) => setFilterApproval(v)}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Approval: All" value="all" />
                  <Picker.Item label="Approved" value="approved" />
                  <Picker.Item label="Pending" value="pending" />
                </Picker>
              </View>
            </View>
            {/* Publish Filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="publish" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterPublish}
                  onValueChange={(v: PublishFilter) => setFilterPublish(v)}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Publish: All" value="all" />
                  <Picker.Item label="Published" value="published" />
                  <Picker.Item label="Unpublished" value="unpublished" />
                </Picker>
              </View>
            </View>
            {/* Rating Filter */}
            <View className="input-select">
              <View className="flex-row items-center">
                <MaterialIcons name="star" size={18} color="#9ca3af" />
                <Picker
                  selectedValue={filterRating}
                  onValueChange={(v: RatingFilter) => setFilterRating(v)}
                  style={{ flex: 1, height: 40 }}>
                  <Picker.Item label="Rating: All" value="all" />
                  <Picker.Item label="5 Stars" value="5" />
                  <Picker.Item label="4 Stars" value="4" />
                  <Picker.Item label="3 Stars" value="3" />
                  <Picker.Item label="2 Stars" value="2" />
                  <Picker.Item label="1 Star" value="1" />
                </Picker>
              </View>
            </View>
            {(filterApproval !== 'all' || filterPublish !== 'all' || filterRating !== 'all' || searchTerm) ? (
              <Pressable onPress={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                <Text className="text-xs text-gray-700">Clear</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pb-6">
        {errorMessage ? (
          <View className="mb-4">
            <Alert variant="error" message={errorMessage} className="w-full" />
          </View>
        ) : null}

        {/* Loading skeleton rows */}
        {isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <View
                key={`skeleton-${idx}`}
                className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
                  <View className="h-4 w-32 rounded-md bg-gray-300 animate-pulse" />
                </View>
                <View className="h-4 w-20 rounded-md bg-gray-300 animate-pulse mb-2" />
                <View className="h-4 w-full rounded-md bg-gray-300 animate-pulse mb-2" />
                <View className="h-4 w-3/4 rounded-md bg-gray-300 animate-pulse" />
              </View>
            ))
          : null}

        {/* Empty state */}
        {!isLoading && !errorMessage && testimonials.length === 0 ? (
          <View className="py-8 items-center">
            <MaterialIcons name="rate-review" size={48} color="#9ca3af" />
            <Text className="mt-4 text-gray-700 dark:text-gray-300">No testimonials found</Text>
          </View>
        ) : null}

        {/* Testimonial cards */}
        {!isLoading && !errorMessage && testimonials.length > 0
          ? testimonials.map((testimonial: any) => {
              const id = testimonial._id || testimonial.id;
              const client = testimonial.client ?? {};
              const rating = testimonial.rating ?? 0;
              const isApproved = testimonial.isApproved ?? false;
              const isPublished = testimonial.isPublished ?? false;
              const clientName = `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || client?.email || 'Unknown';

              return (
                <View
                  key={id}
                  className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <View className="flex-row items-start justify-between gap-3 mb-3">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="h-10 w-10 rounded-full overflow-hidden bg-brand-tint items-center justify-center">
                        {client?.avatar ? (
                          <Image source={{ uri: client.avatar }} style={{ height: 40, width: 40 }} />
                        ) : (
                          <Text className="font-inter font-semibold text-sm text-brand-primary">
                            {initials(testimonial)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-50">
                          {clientName}
                        </Text>
                        {client?.company ? (
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            {client.company}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Badge
                        variant={isApproved ? 'success' : 'warning'}
                        size="sm"
                        icon={
                          <MaterialIcons
                            name={isApproved ? 'verified' : 'pending'}
                            size={14}
                            color={isApproved ? '#059669' : '#f59e0b'}
                          />
                        }>
                        {isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                      {isPublished && (
                        <Badge
                          variant="info"
                          size="sm"
                          icon={
                            <MaterialIcons name="publish" size={14} color="#2563eb" />
                          }>
                          Published
                        </Badge>
                      )}
                    </View>
                  </View>
                  <View className="mb-2">
                    <StarRating rating={rating} />
                  </View>
                  <Text
                    className="font-inter text-sm text-gray-700 dark:text-gray-300 mb-3"
                    numberOfLines={2}>
                    {testimonial?.message ?? 'No message'}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateUtil(testimonial?.createdAt)}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        onPress={() => handleView(id)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                        <Text className="text-xs text-gray-700 dark:text-gray-300">View</Text>
                      </Pressable>
                      {isAdmin && !isApproved && (
                        <Pressable
                          onPress={() => handleApprove(id)}
                          disabled={approving}
                          className="px-3 py-1.5 rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                          {approving ? (
                            <ActivityIndicator size="small" color="#059669" />
                          ) : (
                            <Text className="text-xs text-green-700 dark:text-green-300">Approve</Text>
                          )}
                        </Pressable>
                      )}
                      {isAdmin && isApproved && !isPublished && (
                        <Pressable
                          onPress={() => handlePublish(id)}
                          disabled={publishing}
                          className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                          {publishing ? (
                            <ActivityIndicator size="small" color="#2563eb" />
                          ) : (
                            <Text className="text-xs text-blue-700 dark:text-blue-300">Publish</Text>
                          )}
                        </Pressable>
                      )}
                      {isAdmin && isPublished && (
                        <Pressable
                          onPress={() => handleUnpublish(id)}
                          disabled={unpublishing}
                          className="px-3 py-1.5 rounded-lg border border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                          {unpublishing ? (
                            <ActivityIndicator size="small" color="#f59e0b" />
                          ) : (
                            <Text className="text-xs text-orange-700 dark:text-orange-300">Unpublish</Text>
                          )}
                        </Pressable>
                      )}
                      {isAdmin && (
                        <Pressable
                          onPress={() => handleRequestDelete(testimonial)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                          <Text className="text-xs text-red-700 dark:text-red-300">Delete</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          : null}
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete testimonial"
        onClose={handleCancelDelete}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable onPress={handleCancelDelete} disabled={isDeleting} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmDelete}
              disabled={isDeleting}
              className="btn btn-primary min-w-[120px]">
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
            {`Are you sure you want to delete the testimonial from ${
              confirmDelete?.clientName ? confirmDelete.clientName : 'this client'
            }? This action cannot be undone.`}
          </Text>
        </View>
      </Modal>
    </ThemedView>
  );
}


