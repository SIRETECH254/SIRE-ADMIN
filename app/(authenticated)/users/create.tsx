import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useAdminCreateUser } from '@/tanstack/useUsers';

type RoleOption =
  | 'super_admin'
  | 'admin'
  | 'finance'
  | 'project_manager'
  | 'staff'
  | 'client';

export default function CreateUserScreen() {
  const router = useRouter();
  const { mutateAsync, isPending } = useAdminCreateUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleOption>('staff');
  const [inlineStatus, setInlineStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isBusy = isPending;

  const cycleRole = useCallback(() => {
    const order: RoleOption[] = ['staff', 'project_manager', 'finance', 'admin', 'super_admin', 'client'];
    const idx = order.indexOf(role);
    const next = order[(idx + 1) % order.length];
    setRole(next);
  }, [role]);

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phone.trim();

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
        role,
      } as any);
      const createdUser = result?.data?.user ?? result?.user;
      setInlineStatus({ type: 'success', text: 'User created successfully.' });
      setTimeout(() => {
        if (createdUser?._id || createdUser?.id) {
          const id = createdUser._id || createdUser.id;
          router.replace(`/(authenticated)/users/${id}`);
        } else {
          router.replace('/(authenticated)/users');
        }
      }, 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to create user right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [firstName, lastName, email, password, phone, role, mutateAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Create User
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
                placeholder="admin@example.com"
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
              <Text className="form-label">Role</Text>
              <View className="border border-gray-300 rounded-lg bg-white px-2">
                <Picker
                  selectedValue={role}
                  onValueChange={(v: any) => setRole(v)}
                  style={{ height: 44 }}>
                  <Picker.Item label="Staff" value="staff" />
                  <Picker.Item label="Project Manager" value="project_manager" />
                  <Picker.Item label="Finance" value="finance" />
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Super Admin" value="super_admin" />
                  <Picker.Item label="Client" value="client" />
                </Picker>
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
                  <Text className="btn-text btn-text-primary">Create user</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


