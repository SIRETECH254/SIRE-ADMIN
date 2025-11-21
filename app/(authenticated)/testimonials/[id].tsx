import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import {
  useGetTestimonial,
  useApproveTestimonial,
  usePublishTestimonial,
  useUnpublishTestimonial,
  useDeleteTestimonial,
} from '@/tanstack/useTestimonials';
import { formatDate, getInitials } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type ActionType = 'approve' | 'publish' | 'unpublish' | 'delete' | null;

function StarRating({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <View className="flex-row items-center gap-1">
      {stars.map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rating ? 'star' : 'star-border'}
          size={24}
          color={star <= rating ? '#fbbf24' : '#d1d5db'}
        />
      ))}
      <Text className="ml-2 font-inter text-base text-gray-600 dark:text-gray-400">
        ({rating}/5)
      </Text>
    </View>
  );
}

export default function TestimonialDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const testimonialId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetTestimonial(testimonialId);
  const { mutateAsync: approveAsync, isPending: approving } = useApproveTestimonial();
  const { mutateAsync: publishAsync, isPending: publishing } = usePublishTestimonial();
  const { mutateAsync: unpublishAsync, isPending: unpublishing } = useUnpublishTestimonial();
  const { mutateAsync: deleteAsync, isPending: deleting } = useDeleteTestimonial();

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    const role = user?.role;
    return role === 'super_admin' || role === 'finance' || role === 'project_manager';
  }, [user?.role]);

  const testimonial = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.testimonial ?? root?.testimonial ?? root?.data ?? root;
  }, [data]);

  const client = testimonial?.client ?? {};
  const project = testimonial?.project;
  const rating = testimonial?.rating ?? 0;
  const isApproved = testimonial?.isApproved ?? false;
  const isPublished = testimonial?.isPublished ?? false;
  const approvedBy = testimonial?.approvedBy;
  const clientName = `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || client?.email || 'Unknown';

  const handleAction = useCallback((action: ActionType) => {
    setActionError(null);
    setActiveAction(action);
  }, []);

  const performAction = useCallback(async () => {
    if (!testimonialId || !activeAction) return;
    setActionError(null);
    try {
      if (activeAction === 'approve') {
        await approveAsync({ testimonialId, isApproved: true });
        setInlineStatus({ type: 'success', text: 'Testimonial approved successfully.' });
        await refetch();
      } else if (activeAction === 'publish') {
        await publishAsync(testimonialId);
        setInlineStatus({ type: 'success', text: 'Testimonial published successfully.' });
        await refetch();
      } else if (activeAction === 'unpublish') {
        await unpublishAsync(testimonialId);
        setInlineStatus({ type: 'success', text: 'Testimonial unpublished successfully.' });
        await refetch();
      } else if (activeAction === 'delete') {
        await deleteAsync(testimonialId);
        setInlineStatus({ type: 'success', text: 'Testimonial deleted successfully.' });
        setTimeout(() => {
          router.replace('/(authenticated)/testimonials');
        }, 600);
      }
      setActiveAction(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to complete the action.';
      setActionError(message);
      setInlineStatus({ type: 'error', text: message });
    }
  }, [
    activeAction,
    approveAsync,
    publishAsync,
    unpublishAsync,
    deleteAsync,
    testimonialId,
    refetch,
    router,
  ]);

  if (!testimonialId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Testimonial ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading && !testimonial) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading testimonial…" />
      </ThemedView>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (errorMessage && !testimonial) {
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

  const initials = getInitials({
    firstName: client?.firstName,
    lastName: client?.lastName,
    email: client?.email,
  });

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <ThemedText type="title">Testimonial Details</ThemedText>
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
          </View>

          {/* Client Information */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="h-16 w-16 rounded-full overflow-hidden bg-brand-tint items-center justify-center">
                {client?.avatar ? (
                  <Image source={{ uri: client.avatar }} style={{ height: 64, width: 64 }} />
                ) : (
                  <Text className="font-poppins text-2xl font-semibold text-brand-primary">
                    {initials}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="font-poppins text-xl font-semibold text-gray-900 dark:text-gray-50">
                  {clientName}
                </Text>
                {client?.company ? (
                  <Text className="font-inter text-base text-gray-600 dark:text-gray-400">
                    {client.company}
                  </Text>
                ) : null}
                {client?.email ? (
                  <Text className="font-inter text-sm text-gray-500 dark:text-gray-500">
                    {client.email}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Related Project */}
          {project && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
                Related Project
              </Text>
              <Pressable
                onPress={() => router.push(`/(authenticated)/projects/${project._id || project.id}`)}
                className="flex-row items-center gap-2">
                <MaterialIcons name="folder" size={20} color="#7b1c1c" />
                <Text className="font-inter text-base text-brand-primary">
                  {project.title || project.projectNumber || 'View Project'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#7b1c1c" />
              </Pressable>
            </View>
          )}

          {/* Star Rating */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
              Rating
            </Text>
            <StarRating rating={rating} />
          </View>

          {/* Status Badges */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
              Status
            </Text>
            <View className="flex-row items-center gap-3 flex-wrap">
              <Badge
                variant={isApproved ? 'success' : 'warning'}
                size="md"
                icon={
                  <MaterialIcons
                    name={isApproved ? 'verified' : 'pending'}
                    size={16}
                    color={isApproved ? '#059669' : '#f59e0b'}
                  />
                }>
                {isApproved ? 'Approved' : 'Pending Approval'}
              </Badge>
              <Badge
                variant={isPublished ? 'info' : 'default'}
                size="md"
                icon={
                  <MaterialIcons
                    name={isPublished ? 'publish' : 'unpublished'}
                    size={16}
                    color={isPublished ? '#2563eb' : '#6b7280'}
                  />
                }>
                {isPublished ? 'Published' : 'Unpublished'}
              </Badge>
            </View>
          </View>

          {/* Action Buttons */}
          {isAdmin && (
            <View className="flex-row flex-wrap gap-3">
              {!isApproved && (
                <Pressable
                  onPress={() => handleAction('approve')}
                  disabled={approving}
                  className="btn btn-primary">
                  {approving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="btn-text btn-text-primary">Approve</Text>
                  )}
                </Pressable>
              )}
              {isApproved && !isPublished && (
                <Pressable
                  onPress={() => handleAction('publish')}
                  disabled={publishing}
                  className="btn btn-primary">
                  {publishing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="btn-text btn-text-primary">Publish</Text>
                  )}
                </Pressable>
              )}
              {isPublished && (
                <Pressable
                  onPress={() => handleAction('unpublish')}
                  disabled={unpublishing}
                  className="btn btn-secondary">
                  {unpublishing ? (
                    <ActivityIndicator size="small" color="#7b1c1c" />
                  ) : (
                    <Text className="btn-text btn-text-secondary">Unpublish</Text>
                  )}
                </Pressable>
              )}
              <Pressable
                onPress={() => handleAction('delete')}
                className="btn btn-secondary"
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color="#7b1c1c" />
                ) : (
                  <Text className="btn-text btn-text-secondary">Delete</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Metadata */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Testimonial Information
            </Text>
            <View className="gap-3">
              <InfoRow icon="event" label="Created" value={formatDate(testimonial?.createdAt)} />
              {isApproved && testimonial?.approvedAt && (
                <InfoRow icon="verified" label="Approved" value={formatDate(testimonial.approvedAt)} />
              )}
              {approvedBy && (
                <InfoRow
                  icon="person"
                  label="Approved By"
                  value={`${approvedBy?.firstName ?? ''} ${approvedBy?.lastName ?? ''}`.trim() || approvedBy?.email || '—'}
                />
              )}
            </View>
          </View>

          {/* Message */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Testimonial Message
            </Text>
            <Text className="font-inter text-base text-gray-700 dark:text-gray-200 leading-6">
              {testimonial?.message ?? 'No message content'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Modals */}
      <Modal
        visible={activeAction === 'approve'}
        title="Approve Testimonial"
        onClose={() => {
          if (approving) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (approving) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={approving}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={approving}>
              {approving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Approve</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to approve this testimonial? Once approved, it can be published.
          </Text>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>

      <Modal
        visible={activeAction === 'publish'}
        title="Publish Testimonial"
        onClose={() => {
          if (publishing) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (publishing) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={publishing}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={publishing}>
              {publishing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Publish</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to publish this testimonial? It will be visible on the public website.
          </Text>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>

      <Modal
        visible={activeAction === 'unpublish'}
        title="Unpublish Testimonial"
        onClose={() => {
          if (unpublishing) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (unpublishing) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={unpublishing}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={unpublishing}>
              {unpublishing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Unpublish</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to unpublish this testimonial? It will no longer be visible on the public website.
          </Text>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>

      <Modal
        visible={activeAction === 'delete'}
        title="Delete Testimonial"
        onClose={() => {
          if (deleting) return;
          setActiveAction(null);
          setActionError(null);
        }}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => {
                if (deleting) return;
                setActiveAction(null);
                setActionError(null);
              }}
              className="btn btn-secondary"
              disabled={deleting}>
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={performAction}
              className="btn btn-primary min-w-[130px]"
              disabled={deleting}>
              {deleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <View className="gap-3">
          <Text className="font-inter text-base text-gray-900 dark:text-gray-50">
            Are you sure you want to delete this testimonial? This action cannot be undone.
          </Text>
          {actionError ? <Alert variant="error" message={actionError} className="w-full" /> : null}
        </View>
      </Modal>
    </ThemedView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-50">
        {value ?? '—'}
      </Text>
    </View>
  );
}

