import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

type InlineMessage =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const resetToken = Array.isArray(params.token) ? params.token[0] : params.token ?? '';

  const { resetPassword, isLoading, error, clearError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const clearInlineMessage = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);

  const handleNavigateToLogin = useCallback(() => {
    clearInlineMessage();
    router.push('/(public)/login');
  }, [clearInlineMessage, router]);

  const handleSubmit = useCallback(async () => {
    if (!resetToken) {
      setInlineMessage({
        type: 'error',
        text: 'Reset link is missing or invalid.',
      });
      return;
    }

    if (!password || !confirmPassword) {
      setInlineMessage({
        type: 'error',
        text: 'Enter and confirm your new password.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setInlineMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
      const result = await resetPassword(resetToken, password);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to reset password.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Password updated! Redirecting to sign in…',
      });

      setTimeout(() => {
        router.replace('/(public)/login');
      }, 1500);
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, password, resetPassword, resetToken, router]);

  const isBusy = isLoading || isSubmitting;
  const statusMessage = inlineMessage ?? (error ? { type: 'error', text: error } : null);
  const canSubmit = useMemo(() => Boolean(password && confirmPassword && !isBusy), [
    password,
    confirmPassword,
    isBusy,
  ]);

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-center px-6 py-10">
            <View className="w-full max-w-md space-y-8">
              <View className="space-y-2">
                <Text className="text-center text-3xl font-bold text-gray-900">
                  Reset password
                </Text>
                <Text className="text-center text-base text-gray-600">
                  Choose a new password to secure your account.
                </Text>
              </View>

              <View className="space-y-5">
                <View className="w-full space-y-2">
                  <Text className="form-label">New password</Text>
                  <View className="relative w-full">
                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearInlineMessage();
                      }}
                      autoComplete="password"
                      textContentType="newPassword"
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

                <View className="w-full space-y-2">
                  <Text className="form-label">Confirm password</Text>
                  <View className="relative w-full">
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        clearInlineMessage();
                      }}
                      autoComplete="password"
                      textContentType="password"
                      secureTextEntry={!isConfirmPasswordVisible}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <Pressable
                      onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                      accessibilityLabel={
                        isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'
                      }
                      className="absolute right-3 top-3.5">
                      <MaterialIcons
                        name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#7b1c1c"
                      />
                    </Pressable>
                  </View>
                </View>

                {statusMessage ? (
                  <View
                    className={
                      statusMessage.type === 'success'
                        ? 'form-message-success'
                        : 'form-message-error'
                    }>
                    <Text className="text-sm">
                      {statusMessage.text}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  className="btn btn-primary mt-2 w-full disabled:opacity-70">
                  {isBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="btn-text btn-text-primary">Update password</Text>
                  )}
                </Pressable>
              </View>

              <View className="flex-row justify-center space-x-2">
                <Text className="text-sm text-gray-600">Remembered your password?</Text>
                <Pressable onPress={handleNavigateToLogin}>
                  <Text className="text-sm font-semibold text-brand-primary">
                    Back to sign in
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