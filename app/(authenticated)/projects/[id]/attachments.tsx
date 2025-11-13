import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useGetProject, useUploadAttachment, useDeleteAttachment } from '@/tanstack/useProjects';
import { formatDate as formatDateUtil } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function AttachmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error } = useGetProject(id);
  const { mutateAsync: uploadAttachmentAsync, isPending: isUploading } = useUploadAttachment();
  const { mutateAsync: deleteAttachmentAsync, isPending: isDeleting } = useDeleteAttachment();

  const project = data?.data?.project ?? data?.data ?? null;
  const attachments = project?.attachments ?? [];

  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatDate = (value?: string) => formatDateUtil(value);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePickImages = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setUploadError('Photo library access is required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setSelectedImages(result.assets);
        setUploadError(null);
      }
    } catch (err: any) {
      setUploadError('Unable to open photo library right now. Please try again.');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedImages.length === 0) {
      setUploadError('Please select at least one image to upload.');
      return;
    }

    setUploading(true);
    setInlineStatus(null);
    setUploadError(null);

    try {
      // Upload each image individually
      for (const asset of selectedImages) {
        const formData = new FormData();
        const fileName = asset.fileName ?? `image-${Date.now()}.jpg`;
        const mimeType = asset.mimeType ?? 'image/jpeg';

        if (Platform.OS === 'web') {
          const fileResponse = await fetch(asset.uri);
          const blob = await fileResponse.blob();
          formData.append('file', blob, fileName);
        } else {
          formData.append('file', {
            uri: asset.uri,
            name: fileName,
            type: mimeType,
          } as any);
        }

        await uploadAttachmentAsync({ projectId: id, formData });
      }

      setSelectedImages([]);
      setInlineStatus({ type: 'success', text: `${selectedImages.length} image(s) uploaded successfully.` });
      setTimeout(() => setInlineStatus(null), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to upload images right now.';
      setUploadError(message);
      setInlineStatus({ type: 'error', text: message });
    } finally {
      setUploading(false);
    }
  }, [selectedImages, uploadAttachmentAsync, id]);

  const handleRequestDelete = useCallback((attachment: any) => {
    const attachmentId = attachment._id || attachment.id;
    setConfirmDelete(attachmentId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete);
      await deleteAttachmentAsync({ projectId: id, attachmentId: confirmDelete });
      setConfirmDelete(null);
      setInlineStatus({ type: 'success', text: 'Attachment deleted successfully.' });
      setTimeout(() => setInlineStatus(null), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to delete attachment right now.';
      setInlineStatus({ type: 'error', text: message });
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, deleteAttachmentAsync, id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);

  const handleDownload = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setInlineStatus({ type: 'error', text: 'Cannot open this file URL.' });
      }
    } catch (err: any) {
      setInlineStatus({ type: 'error', text: 'Unable to open file.' });
    }
  }, []);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (isLoading && !project) {
    return <Loading fullScreen message="Loading project..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">Project Attachments</ThemedText>
              <Text className="text-gray-600 mt-1">{project?.title ?? 'Project'}</Text>
            </View>
            <Pressable onPress={() => router.back()} className="px-3 py-2">
              <MaterialIcons name="arrow-back" size={24} color="#7b1c1c" />
            </Pressable>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {inlineStatus ? (
            <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
          ) : null}
          {uploadError ? (
            <Alert variant="error" message={uploadError} className="w-full" />
          ) : null}

          {/* Upload Section */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="gap-4">
              <Pressable
                onPress={handlePickImages}
                disabled={isUploading || uploading}
                className="btn btn-secondary self-start">
                <MaterialIcons name="add-photo-alternate" size={20} color="#7b1c1c" />
                <Text className="btn-text btn-text-secondary ml-2">Select Images</Text>
              </Pressable>

              {/* Selected Images Preview */}
              {selectedImages.length > 0 ? (
                <View className="image-preview-grid">
                  {selectedImages.map((image, index) => (
                    <View key={index} className="image-preview-item">
                      <Image
                        source={{ uri: image.uri }}
                        style={{ width: 100, height: 100, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                      <Pressable
                        onPress={() => {
                          setSelectedImages(selectedImages.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 bg-red-500 rounded-full p-1">
                        <MaterialIcons name="close" size={16} color="#ffffff" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}

              {selectedImages.length > 0 ? (
                <Pressable
                  onPress={handleUpload}
                  disabled={isUploading || uploading}
                  className="btn btn-primary self-start">
                  {isUploading || uploading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <MaterialIcons name="cloud-upload" size={20} color="#ffffff" />
                      <Text className="btn-text btn-text-primary ml-2">
                        Upload {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Attachments List */}
          <View className="gap-4">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
              Attachments ({attachments.length})
            </Text>

            {attachments.length === 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 items-center">
                <MaterialIcons name="attach-file" size={48} color="#9ca3af" />
                <Text className="font-inter text-base text-gray-500 dark:text-gray-400 mt-4">
                  No attachments yet. Upload one above to get started.
                </Text>
              </View>
            ) : (
              attachments.map((attachment: any) => {
                const attachmentId = attachment._id || attachment.id;
                const isDeletingThis = deletingId === attachmentId;
                const url = attachment.url || attachment.path;

                return (
                  <View
                    key={attachmentId}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1 gap-2">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="insert-drive-file" size={24} color="#7b1c1c" />
                          <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-100 flex-1">
                            {attachment.name || attachment.filename || 'Untitled'}
                          </Text>
                        </View>
                        <View className="gap-1">
                          {attachment.size ? (
                            <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                              Size: {formatFileSize(attachment.size)}
                            </Text>
                          ) : null}
                          {attachment.uploadedAt || attachment.createdAt ? (
                            <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                              Uploaded: {formatDate(attachment.uploadedAt || attachment.createdAt)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {url ? (
                          <Pressable
                            onPress={() => handleDownload(url)}
                            className="px-3 py-2"
                            accessibilityLabel="Download attachment">
                            <MaterialIcons name="download" size={20} color="#2563eb" />
                          </Pressable>
                        ) : null}
                        <Pressable
                          onPress={() => handleRequestDelete(attachment)}
                          disabled={isDeleting}
                          className="px-3 py-2"
                          accessibilityLabel="Delete attachment">
                          {isDeletingThis ? (
                            <ActivityIndicator size="small" color="#dc2626" />
                          ) : (
                            <MaterialIcons name="delete" size={20} color="#dc2626" />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete attachment"
        onClose={handleCancelDelete}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable onPress={handleCancelDelete} disabled={isDeleting} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirmDelete} disabled={isDeleting} className="btn btn-primary min-w-[120px]">
              {isDeleting && deletingId === confirmDelete ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
          Are you sure you want to delete this attachment? This action cannot be undone.
        </Text>
      </Modal>
    </ThemedView>
  );
}

