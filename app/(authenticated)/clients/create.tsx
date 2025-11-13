import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useRegisterClient } from '@/tanstack/useClients';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function CreateClientScreen() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRegisterClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isBusy = isPending;

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phone.trim();
    const trimmedCompany = company.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !trimmedPassword) {
      setInlineStatus({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }
    setInlineStatus(null);
    try {
      const result = await mutateAsync({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        password: trimmedPassword,
        phone: trimmedPhone || undefined,
        company: trimmedCompany || undefined,
        address: trimmedAddress || undefined,
        city: trimmedCity || undefined,
        country: trimmedCountry || undefined,
      } as any);
      const createdClient = result?.data?.client ?? result?.client;
      setInlineStatus({ type: 'success', text: 'Client created successfully.' });
      setTimeout(() => {
        if (createdClient?._id || createdClient?.id) {
          const id = createdClient._id || createdClient.id;
          router.replace(`/(authenticated)/clients/${id}`);
        } else {
          router.replace('/(authenticated)/clients');
        }
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to create client right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [firstName, lastName, email, password, phone, company, address, city, country, mutateAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Create Client
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
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setInlineStatus(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="client@example.com"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Password</Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setInlineStatus(null);
                  }}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="••••••••"
                  className="form-input pr-10"
                />
                <Pressable
                  onPress={() => setIsPasswordVisible((p) => !p)}
                  className="absolute right-3 top-3.5">
                  <MaterialIcons
                    name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#7b1c1c"
                  />
                </Pressable>
              </View>
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
                  <Text className="btn-text btn-text-primary">Create client</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


