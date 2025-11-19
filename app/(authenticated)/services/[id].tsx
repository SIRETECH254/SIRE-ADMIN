import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useGetService, useToggleServiceStatus, useDeleteService } from '@/tanstack/useServices';
import { formatDate as formatDateUtil } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error, refetch } = useGetService(id);
  const { mutateAsync: toggleStatusAsync, isPending: isToggling } = useToggleServiceStatus();
  const { mutateAsync: deleteServiceAsync, isPending: isDeleting } = useDeleteService();

  const service = data?.data?.service ?? data?.data ?? null;
  const formatDate = (value?: string) => formatDateUtil(value);
  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const features = Array.isArray(service?.features) ? service.features : [];

  const handleEdit = useCallback(() => {
    router.push(`/(authenticated)/services/${id}/edit`);
  }, [id, router]);

  const handleToggleStatus = useCallback(async () => {
    try {
      await toggleStatusAsync(id);
      setInlineStatus({ type: 'success', text: 'Service status updated successfully.' });
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to toggle service status.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [id, toggleStatusAsync, refetch]);

  const handleRequestDelete = useCallback(() => {
    setDeleteError(null);
    setConfirmDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setDeleteError(null);
      await deleteServiceAsync(id);
      setInlineStatus({ type: 'success', text: 'Service deleted successfully.' });
      setTimeout(() => {
        router.replace('/(authenticated)/services');
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Unable to delete service.';
      setDeleteError(message);
    }
  }, [id, deleteServiceAsync, router]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(false);
    setDeleteError(null);
  }, []);

  if (isLoading && !service) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading service..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">{service?.title ?? 'Service'}</ThemedText>
              <Text className="text-gray-600 mt-1">Service ID: {id}</Text>
            </View>
            <Badge
              variant={service?.isActive ? 'success' : 'error'}
              size="md"
              icon={
                <MaterialIcons
                  name={service?.isActive ? 'check-circle' : 'cancel'}
                  size={16}
                  color={service?.isActive ? '#059669' : '#a33c3c'}
                />
              }>
              {service?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {inlineStatus ? (
            <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
          ) : null}

          <View className="items-center gap-3">
            {service?.icon ? (
              <Image
                source={{ uri: service.icon }}
                resizeMode="cover"
                className="h-32 w-32 rounded-2xl border-4 border-white shadow-md"
              />
            ) : (
              <View className="h-32 w-32 items-center justify-center rounded-2xl bg-brand-tint">
                <MaterialIcons name="build" size={48} color="#7b1c1c" />
              </View>
            )}
          </View>

          <View className="items-center gap-2">
            <View className="flex-row items-center gap-3 flex-wrap justify-center">
              <Pressable
                onPress={handleEdit}
                className="rounded-xl bg-brand-primary px-6 py-3"
                accessibilityRole="button"
                accessibilityLabel="Edit service">
                <Text className="font-inter text-base font-semibold text-white">Edit Service</Text>
              </Pressable>
              <Pressable
                onPress={handleToggleStatus}
                disabled={isToggling}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900"
                accessibilityRole="button"
                accessibilityLabel="Toggle service status">
                {isToggling ? (
                  <ActivityIndicator size="small" color="#7b1c1c" />
                ) : (
                  <Text className="font-inter text-base font-semibold text-gray-700 dark:text-gray-300">
                    {service?.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={handleRequestDelete}
                className="rounded-xl border border-red-300 bg-red-50 px-6 py-3 dark:border-red-800 dark:bg-red-900/20"
                accessibilityRole="button"
                accessibilityLabel="Delete service">
                <Text className="font-inter text-base font-semibold text-red-700 dark:text-red-300">
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="gap-6">
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Description
              </Text>
              <Text className="mt-3 font-inter text-base text-gray-700 dark:text-gray-200">
                {service?.description ?? 'No description provided.'}
              </Text>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Features
              </Text>
              {features.length === 0 ? (
                <Text className="text-gray-600 dark:text-gray-300">No features listed.</Text>
              ) : (
                <View className="gap-2">
                  {features.map((feature: string, index: number) => (
                    <View key={index} className="flex-row items-start gap-2">
                      <MaterialIcons name="check-circle" size={18} color="#059669" style={{ marginTop: 2 }} />
                      <Text className="flex-1 font-inter text-base text-gray-700 dark:text-gray-200">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Service Details
              </Text>
              <View className="mt-4 gap-3">
                <InfoRow icon="toggle-on" label="Status" value={service?.isActive ? 'Active' : 'Inactive'} />
                <InfoRow icon="event-note" label="Created" value={formatDate(service?.createdAt)} />
                <InfoRow icon="update" label="Updated" value={formatDate(service?.updatedAt)} />
                {service?.createdBy && typeof service.createdBy === 'object' ? (
                  <InfoRow
                    icon="person"
                    label="Created By"
                    value={
                      `${service.createdBy.firstName ?? ''} ${service.createdBy.lastName ?? ''}`.trim() ||
                      service.createdBy.email ||
                      '—'
                    }
                  />
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        visible={confirmDelete}
        title="Delete service"
        onClose={handleCancelDelete}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable onPress={handleCancelDelete} disabled={isDeleting} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirmDelete} disabled={isDeleting} className="btn btn-primary min-w-[120px]">
              {isDeleting ? (
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
            {`Are you sure you want to delete "${service?.title ?? 'this service'}"? This action cannot be undone.`}
          </Text>
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
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-100">
        {value ?? '—'}
      </Text>
    </View>
  );
}

