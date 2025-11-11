import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineError(null);
  }, [error, clearError]);

  const handleForgotPassword = useCallback(() => {
    setInlineError(null);
    router.push('/(public)/forgot-password');
  }, [router]);

  const handleNavigateToRegister = useCallback(() => {
    setInlineError(null);
    router.push('/(public)/register');
  }, [router]);

  const onSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setInlineError('Please enter both email and password.');
      return;
    }

    setInlineError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email: trimmedEmail, password });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to sign in');
        return;
      }

      if (!rememberMe) {
        await AsyncStorage.removeItem('refreshToken');
      }

      router.replace('/(authenticated)');
    } catch {
      setInlineError('Unexpected error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, rememberMe, login, router]);

  const isBusy = isSubmitting || isLoading;
  const errorMessage = inlineError || error;

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-center px-6 py-10">
            <View className="w-full max-w-md space-y-8">
              <View className="space-y-2">
                <Text className="text-center text-3xl font-bold text-gray-900">
                  Welcome back
                </Text>
                <Text className="text-center text-base text-gray-600">
                  Sign in to your account
                </Text>
              </View>

              <View className="space-y-5">
                <View className="w-full space-y-2">
                  <Text className="form-label">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      handleInputChange();
                    }}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="admin@example.com"
                    className="form-input"
                  />
                </View>

                <View className="w-full space-y-2">
                  <Text className="form-label">Password</Text>
                  <View className="relative w-full">
                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        handleInputChange();
                      }}
                      autoComplete="password"
                      textContentType="password"
                      secureTextEntry={!isPasswordVisible}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <Pressable
                      onPress={() => setIsPasswordVisible((prev) => !prev)}
                      accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-3.5">
                      <MaterialIcons
                        name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#7b1c1c"
                      />
                    </Pressable>
                  </View>
                </View>

                <View className="mt-2 flex-row items-center justify-between">
                  <Pressable
                    onPress={() => {
                      const next = !rememberMe;
                      setRememberMe(next);
                      handleInputChange();
                    }}
                    className="flex-row items-center space-x-3">
                    <MaterialIcons
                      name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={rememberMe ? '#7b1c1c' : '#9ca3af'}
                    />
                    <Text className="text-sm text-gray-700">Remember me</Text>
                  </Pressable>
                  <Pressable onPress={handleForgotPassword}>
                    <Text className="text-sm font-semibold text-brand-primary">
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>

                {errorMessage ? (
                  <Text className="form-message-error">
                    {errorMessage}
                  </Text>
                ) : null}

                <Pressable
                  onPress={onSubmit}
                  disabled={isBusy}
                  className="btn btn-primary mt-2 w-full">
                  {isBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="btn-text btn-text-primary">
                      Sign in
                    </Text>
                  )}
                </Pressable>
              </View>

              <View className="flex-row justify-center space-x-2">
                <Text className="text-sm text-gray-600">
                  Don&apos;t have an account?
                </Text>
                <Pressable onPress={handleNavigateToRegister}>
                  <Text className="text-sm font-semibold text-brand-primary">
                    Create account
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
  );
}
