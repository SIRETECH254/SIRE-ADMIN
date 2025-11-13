import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetClient, useUpdateClient, useUpdateClientStatus } from '@/tanstack/useClients';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function EditClientScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading } = useGetClient(id);
  const { mutateAsync: updateClientAsync, isPending: updatingProfile } = useUpdateClient();
  const { mutateAsync: updateStatusAsync, isPending: updatingStatus } = useUpdateClientStatus();

  const existing = data?.data?.client ?? data?.data ?? null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  useEffect(() => {
    if (existing) {
      setFirstName(existing.firstName ?? '');
      setLastName(existing.lastName ?? '');
      setEmail(existing.email ?? '');
      setPhone(existing.phone ?? '');
      setCompany(existing.company ?? '');
      setAddress(existing.address ?? '');
      setCity(existing.city ?? '');
      setCountry(existing.country ?? '');
      setIsActive(Boolean(existing.isActive));
      setInlineStatus(null);
    }
  }, [existing]);

  const isBusy = updatingProfile || updatingStatus;
  const originalActive = useMemo(() => Boolean(existing?.isActive), [existing?.isActive]);

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCompany = company.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();
    if (!trimmedFirst || !trimmedLast) {
      setInlineStatus({ type: 'error', text: 'First name and last name are required.' });
      return;
    }
    setInlineStatus(null);
    try {
      // Profile fields update
      await updateClientAsync({
        clientId: id,
        clientData: {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          phone: trimmedPhone || undefined,
          company: trimmedCompany || undefined,
          address: trimmedAddress || undefined,
          city: trimmedCity || undefined,
          country: trimmedCountry || undefined,
        },
      });

      // Status update if changed
      if (isActive !== originalActive) {
        await updateStatusAsync({ clientId: id, isActive });
      }

      setInlineStatus({ type: 'success', text: 'Client updated successfully.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to update client right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [
    firstName,
    lastName,
    phone,
    company,
    address,
    city,
    country,
    isActive,
    originalActive,
    updateClientAsync,
    updateStatusAsync,
    id,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading && !existing) {
    return <Loading fullScreen message="Loading client..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Edit Client
          </ThemedText>

          <View className="mt-8 gap-5">
            <View className="gap-2">
              <Text className="form-label">First name</Text>
              <TextInput
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  setInlineStatus(null);
                }}
                placeholder="Jane"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Last name</Text>
              <TextInput
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  setInlineStatus(null);
                }}
                placeholder="Doe"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Email</Text>
              <TextInput value={email} editable={false} className="form-input-disabled" />
            </View>

            <View className="gap-2">
              <Text className="form-label">Phone (optional)</Text>
              <TextInput
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  setInlineStatus(null);
                }}
                placeholder="e.g. +254712345678"
                className="form-input"
                keyboardType="phone-pad"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Company (optional)</Text>
              <TextInput
                value={company}
                onChangeText={(v) => {
                  setCompany(v);
                  setInlineStatus(null);
                }}
                placeholder="Acme Corp"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Address (optional)</Text>
              <TextInput
                value={address}
                onChangeText={(v) => {
                  setAddress(v);
                  setInlineStatus(null);
                }}
                placeholder="123 Main Street"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">City (optional)</Text>
              <TextInput
                value={city}
                onChangeText={(v) => {
                  setCity(v);
                  setInlineStatus(null);
                }}
                placeholder="Nairobi"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Country (optional)</Text>
              <TextInput
                value={country}
                onChangeText={(v) => {
                  setCountry(v);
                  setInlineStatus(null);
                }}
                placeholder="Kenya"
                className="form-input"
              />
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
                  <Text className="btn-text btn-text-primary">Save changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


