import React, { useCallback, useState } from 'react';
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
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

type InlineMessage =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setInlineMessage({
        type: 'error',
        text: 'Please enter your email address.',
      });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to send reset link.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, forgotPassword]);

  const handleBackToLogin = useCallback(() => {
    setInlineMessage(null);
    router.push('/(public)/login');
  }, [router]);

  const isBusy = isLoading || isSubmitting;
  const errorMessage = inlineMessage ?? (error ? { type: 'error', text: error } : null);

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
                  Forgot password?
                </Text>
                <Text className="text-center text-base text-gray-600">
                  Enter your email address and we&apos;ll send you reset instructions.
                </Text>
              </View>

              <View className="space-y-5">
                <View className="w-full space-y-2">
                  <Text className="text-base font-semibold text-gray-800">Email</Text>
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
                  />
                </View>

                {errorMessage ? (
                  <View
                    className={`rounded-lg px-3 py-2 ${
                      errorMessage.type === 'success'
                        ? 'bg-green-100'
                        : 'bg-brand-accent/10'
                    }`}>
                    <Text
                      className={`text-sm ${
                        errorMessage.type === 'success'
                          ? 'text-green-700'
                          : 'text-brand-accent'
                      }`}>
                      {errorMessage.text}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isBusy}
                  className="mt-2 w-full items-center justify-center rounded-xl bg-brand-primary py-3 disabled:bg-disabled">
                  {isBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-base font-semibold text-white">Send reset link</Text>
                  )}
                </Pressable>
              </View>

              <View className="flex-row justify-center space-x-2">
                <Text className="text-sm text-gray-600">Remembered your password?</Text>
                <Pressable onPress={handleBackToLogin}>
                  <Text className="text-sm font-semibold text-brand-primary">Back to sign in</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}