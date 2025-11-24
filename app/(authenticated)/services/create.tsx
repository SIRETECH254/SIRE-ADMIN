import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useCreateService, useUploadServiceIcon } from '@/tanstack/useServices';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function CreateServiceScreen() {
  const router = useRouter();
  const { mutateAsync: createServiceAsync, isPending: isCreating } = useCreateService();
  const { mutateAsync: uploadIconAsync, isPending: isUploadingIcon } = useUploadServiceIcon();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [iconFile, setIconFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  const isBusy = isCreating || isUploadingIcon;

  const handleAddFeature = useCallback(() => {
    setFeatures((prev) => [...prev, '']);
    setInlineStatus(null);
  }, []);

  const handleRemoveFeature = useCallback(
    (index: number) => {
      if (features.length === 1) {
        setInlineStatus({ type: 'error', text: 'At least one feature is required.' });
        return;
      }
      setFeatures((prev) => prev.filter((_, i) => i !== index));
      setInlineStatus(null);
    },
    [features.length]
  );

  const handleFeatureChange = useCallback((index: number, value: string) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setInlineStatus(null);
  }, []);

  const handlePickIcon = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setInlineStatus({
          type: 'error',
          text: 'Photo library access is required to upload an icon.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (asset) {
        setIconFile(asset);
        setInlineStatus(null);
      }
    } catch (err: any) {
      setInlineStatus({
        type: 'error',
        text: 'Unable to open photo library right now. Please try again.',
      });
    }
  }, []);

  const handleRemoveIcon = useCallback(() => {
    setIconFile(null);
    setInlineStatus(null);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedFeatures = features.map((f) => f.trim()).filter((f) => f.length > 0);

    if (!trimmedTitle) {
      setInlineStatus({ type: 'error', text: 'Title is required.' });
      return;
    }

    if (!trimmedDescription) {
      setInlineStatus({ type: 'error', text: 'Description is required.' });
      return;
    }

    if (trimmedFeatures.length === 0) {
      setInlineStatus({ type: 'error', text: 'At least one feature is required.' });
      return;
    }

    setInlineStatus(null);

    try {
      // Create service
      const result = await createServiceAsync({
        title: trimmedTitle,
        description: trimmedDescription,
        features: trimmedFeatures,
        isActive,
      });

      const createdService = result?.data?.service ?? result?.service;
      const serviceId = createdService?._id || createdService?.id;

      // Upload icon if provided
      if (iconFile && serviceId) {
        const formData = new FormData();
        const fileName = iconFile.fileName ?? `icon-${Date.now()}.jpg`;
        const mimeType = iconFile.mimeType ?? 'image/jpeg';

        if (Platform.OS === 'web') {
          const fileResponse = await fetch(iconFile.uri);
          const blob = await fileResponse.blob();
          formData.append('icon', blob, fileName);
        } else {
          formData.append('icon', {
            uri: iconFile.uri,
            name: fileName,
            type: mimeType,
          } as any);
        }

        await uploadIconAsync({ serviceId, formData });
      }

      setInlineStatus({ type: 'success', text: 'Service created successfully.' });
      setTimeout(() => {
        if (serviceId) {
          router.replace(`/(authenticated)/services/${serviceId}`);
        } else {
          router.replace('/(authenticated)/services');
        }
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to create service right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [title, description, features, isActive, iconFile, createServiceAsync, uploadIconAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Create Service
          </ThemedText>

          <View className="mt-8 gap-5">
            <View className="gap-2">
              <Text className="form-label">Title *</Text>
              <TextInput
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  setInlineStatus(null);
                }}
                placeholder="Service title"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Description *</Text>
              <TextInput
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  setInlineStatus(null);
                }}
                placeholder="Service description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="form-input"
              />
            </View>

            <View className="gap-4">
              <Text className="form-label">Features *</Text>
              {features.map((feature, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                  <TextInput
                    value={feature}
                    onChangeText={(value) => handleFeatureChange(index, value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1 form-input"
                  />
                  {features.length > 1 ? (
                    <Pressable
                      onPress={() => handleRemoveFeature(index)}
                      className="px-2 py-1"
                      accessibilityLabel="Remove feature">
                      <MaterialIcons name="close" size={20} color="#dc2626" />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable onPress={handleAddFeature} className="btn btn-secondary self-start">
                <MaterialIcons name="add" size={18} color="#7b1c1c" />
                <Text className="btn-text btn-text-secondary ml-2">Add Feature</Text>
              </Pressable>
            </View>

            <View className="gap-3">
              <Text className="form-label">Icon (optional)</Text>
              {iconFile ? (
                <View className="gap-3">
                  <Image
                    source={{ uri: iconFile.uri }}
                    resizeMode="cover"
                    className="h-32 w-32 rounded-xl border border-gray-200 self-center"
                  />
                  <View className="flex-row gap-2 justify-center">
                    <Pressable onPress={handlePickIcon} className="btn btn-secondary">
                      <Text className="btn-text btn-text-secondary">Change Icon</Text>
                    </Pressable>
                    <Pressable onPress={handleRemoveIcon} className="btn btn-secondary">
                      <Text className="btn-text btn-text-secondary">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={handlePickIcon} className="btn btn-secondary self-start">
                  <MaterialIcons name="image" size={18} color="#7b1c1c" />
                  <Text className="btn-text btn-text-secondary ml-2">Upload Icon</Text>
                </Pressable>
              )}
            </View>

            <View className="gap-2">
              <Text className="form-label">Status</Text>
              <View className="flex-row items-center gap-3">
                <Switch value={isActive} onValueChange={setIsActive} />
                <Text className="font-inter text-base text-gray-900">
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row items-center justify-end gap-3">
              <Pressable onPress={handleCancel} disabled={isBusy} className="btn btn-secondary">
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} disabled={isBusy} className="btn btn-primary min-w-[140px]">
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Create Service</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

