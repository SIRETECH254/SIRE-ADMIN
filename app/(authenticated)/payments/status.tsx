import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useGetPayment, useQueryMpesaStatus } from '@/tanstack/usePayments';
import { formatCurrency, formatDate } from '@/utils';
import { API_BASE_URL } from '@/api/config';

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

const statusVariantMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'info' | 'success' | 'warning' | 'error';
    icon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  pending: { label: 'Pending', variant: 'info', icon: 'schedule' },
  processing: { label: 'Processing', variant: 'info', icon: 'sync' },
  completed: { label: 'Completed', variant: 'success', icon: 'check-circle' },
  failed: { label: 'Failed', variant: 'error', icon: 'error' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'cancel' },
};

const FALLBACK_TIMEOUT = 60000; // 60 seconds for M-Pesa fallback query

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ paymentId?: string; checkoutId?: string }>();
  const paymentId = params.paymentId || '';
  const checkoutId = params.checkoutId || '';

  const { data, isLoading, error, refetch } = useGetPayment(paymentId);
  const { data: mpesaStatusData, refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId || '', {
    enabled: false, // Only fetch when manually triggered after 60 seconds
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<PaymentStatus | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingActiveRef = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const payment = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.payment ?? root?.payment ?? root?.data ?? root;
  }, [data]);

  // Use websocket status if available, otherwise use payment status
  const currentStatus = useMemo(() => {
    if (wsStatus) return wsStatus;
    return (payment?.status ?? 'pending').toLowerCase() as PaymentStatus;
  }, [payment?.status, wsStatus]);

  const statusConfig = statusVariantMap[currentStatus] ?? statusVariantMap.pending;
  const isMpesa = payment?.paymentMethod?.toLowerCase() === 'mpesa' || !!checkoutId;
  const isCompleted = currentStatus === 'completed';
  const isFailed = currentStatus === 'failed' || currentStatus === 'cancelled';

  // Clear all timers and connections
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (err) {
        console.error('Error closing WebSocket:', err);
      }
      wsRef.current = null;
    }
  }, []);

  // Handle M-Pesa result codes (similar to PaymentStatus.jsx)
  const handleMpesaResultCode = useCallback(
    (resultCode: number, resultMessage: string) => {
      clearPaymentTimers();

      switch (resultCode) {
        case 0: {
          // SUCCESS
          setWsStatus('completed');
          break;
        }
        case 1: {
          setWsStatus('failed');
          setWsError('Insufficient M-Pesa balance');
          break;
        }
        case 1032: {
          setWsStatus('cancelled');
          setWsError('Payment cancelled by user');
          break;
        }
        case 1037: {
          setWsStatus('failed');
          setWsError('Payment timeout - could not reach your phone');
          break;
        }
        case 2001: {
          setWsStatus('failed');
          setWsError('Wrong PIN entered');
          break;
        }
        case 1001: {
          setWsStatus('failed');
          setWsError('Unable to complete transaction');
          break;
        }
        case 1019: {
          setWsStatus('failed');
          setWsError('Transaction expired');
          break;
        }
        case 1025: {
          setWsStatus('failed');
          setWsError('Invalid phone number');
          break;
        }
        case 1026: {
          setWsStatus('failed');
          setWsError('System error occurred');
          break;
        }
        case 1036: {
          setWsStatus('failed');
          setWsError('Internal error occurred');
          break;
        }
        case 1050: {
          setWsStatus('failed');
          setWsError('Too many payment attempts');
          break;
        }
        case 9999: {
          // Keep waiting - don't clear timers
          setWsStatus('processing');
          break;
        }
        default: {
          setWsStatus('failed');
          setWsError(resultMessage || `Transaction failed with code ${resultCode}`);
          break;
        }
      }
    },
    [clearPaymentTimers, paymentId, router]
  );

  // Start payment tracking function (similar to PaymentStatus.jsx)
  const startTracking = useCallback(
    (trackingPaymentId: string = paymentId, trackingMethod: string = isMpesa ? 'mpesa' : 'paystack') => {
      clearPaymentTimers();

      // Only connect WebSocket for M-Pesa and Paystack
      const shouldConnectSocket = ['mpesa', 'paystack'].includes(trackingMethod);
      if (!shouldConnectSocket) {
        console.log(`Skipping socket connection for method: ${trackingMethod}`);
        return;
      }

      // WebSocket connection for real-time updates
      if (isMpesa && checkoutId) {
        try {
          const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/ws/payments/${checkoutId}`;
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            console.log('WebSocket connected, subscribing to payment:', trackingPaymentId);
            setWsConnected(true);
            setWsError(null);
            pollingActiveRef.current = false;
          };

          ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              
              // Handle M-Pesa callback.received event
              if (message.CODE !== undefined) {
                const resultCode = message.CODE;
                const resultMessage = message.message || 'Payment processing completed';
                handleMpesaResultCode(resultCode, resultMessage);
              } else if (message.status) {
                // Handle payment.updated event
                const status = message.status.toLowerCase() as PaymentStatus;
                setWsStatus(status);
                
                if (status === 'completed' || status === 'failed' || status === 'cancelled') {
                  clearPaymentTimers();
                }
              }
            } catch (err) {
              console.error('Error parsing websocket message:', err);
            }
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsError('WebSocket connection error');
            setWsConnected(false);
          };

          ws.onclose = () => {
            setWsConnected(false);
          };
        } catch (err) {
          console.error('Error creating WebSocket:', err);
          setWsError('Failed to connect to WebSocket');
        }
      }

      // Fallback: Query M-Pesa status after 60 seconds (M-PESA ONLY)
      if (trackingMethod === 'mpesa' && checkoutId) {
        timeoutRef.current = setTimeout(async () => {
          try {
            setIsFallbackActive(true);
            console.log('Fallback: Querying M-Pesa status from Safaricom...');
            
            const res = await refetchMpesaStatus();
            const responseData = res?.data?.data ?? res?.data ?? res;
            // resultCode can be string "0" or number 0, parse it
            const resultCodeStr = responseData?.resultCode ?? responseData?.raw?.ResultCode ?? responseData?.CODE;
            const resultCode = typeof resultCodeStr === 'string' ? parseInt(resultCodeStr, 10) : (resultCodeStr ?? -1);
            const resultDesc = responseData?.resultDesc ?? responseData?.raw?.ResultDesc ?? responseData?.message ?? 'Payment status unknown';
            
            console.log('Fallback Query Result:', { resultCode, resultDesc, responseData });
            
            handleMpesaResultCode(resultCode, resultDesc);
          } catch (error) {
            console.error('Fallback query error:', error);
            setWsStatus('failed');
            setWsError('Could not verify payment status. You can retry the payment.');
          } finally {
            setIsFallbackActive(false);
            clearPaymentTimers();
          }
        }, FALLBACK_TIMEOUT);
      }

    },
    [
      paymentId,
      isMpesa,
      checkoutId,
      isCompleted,
      wsError,
      router,
      clearPaymentTimers,
      handleMpesaResultCode,
      refetchMpesaStatus,
    ]
  );

  // Initialize payment tracking
  useEffect(() => {
    if (!paymentId) return;

    const method = isMpesa ? 'mpesa' : 'paystack';
    startTracking(paymentId, method);

    return () => {
      clearPaymentTimers();
    };
  }, [paymentId, isMpesa, checkoutId, startTracking, clearPaymentTimers]);


  const handleViewDetails = useCallback(() => {
    if (paymentId) {
      router.push(`/(authenticated)/payments/${paymentId}`);
    }
  }, [paymentId, router]);

  const handleRetry = useCallback(() => {
    if (payment?.invoiceId) {
      router.replace(`/(authenticated)/payments/initiate?invoiceId=${payment.invoiceId}`);
    } else {
      router.replace('/(authenticated)/payments/initiate');
    }
  }, [payment?.invoiceId, router]);

  if (!paymentId) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Alert variant="error" message="Payment ID is missing." className="w-full" />
      </ThemedView>
    );
  }

  if (isLoading && !payment) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading payment status..." />
      </ThemedView>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  const amount = payment?.amount ?? 0;
  const currency = payment?.currency ?? 'KES';
  const invoice = payment?.invoice ?? payment?.invoiceId;
  const invoiceNumber = invoice?.invoiceNumber ?? invoice?._id ?? invoice ?? '—';

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="px-6 py-6 gap-6">
          <View className="gap-3">
            <View className="flex-row items-center justify-between flex-wrap gap-3">
              <View>
                <ThemedText type="title">Payment Status</ThemedText>
                <Text className="text-gray-600 mt-1">
                  {payment?.paymentNumber ?? `Payment ${paymentId.slice(0, 8)}`}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Badge
                  variant={isMpesa ? 'info' : 'default'}
                  size="md"
                  icon={
                    <MaterialIcons
                      name={isMpesa ? 'phone-android' : 'credit-card'}
                      size={16}
                      color="#7b1c1c"
                    />
                  }>
                  {isMpesa ? 'M-Pesa' : 'Paystack'}
                </Badge>
                <Badge
                  variant={statusConfig.variant}
                  size="md"
                  icon={
                    <MaterialIcons
                      name={statusConfig.icon}
                      size={16}
                      color={
                        statusConfig.variant === 'error'
                          ? '#a33c3c'
                          : statusConfig.variant === 'success'
                          ? '#059669'
                          : '#7b1c1c'
                      }
                    />
                  }>
                  {statusConfig.label}
                </Badge>
              </View>
            </View>
            {errorMessage ? (
              <Alert variant="error" message={errorMessage} className="w-full" />
            ) : null}
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="items-center gap-4">
              {!isCompleted && !isFailed ? (
                <ActivityIndicator size="large" color="#7b1c1c" />
              ) : isCompleted ? (
                <MaterialIcons name="check-circle" size={64} color="#059669" />
              ) : (
                <MaterialIcons name="error" size={64} color="#a33c3c" />
              )}
              <View className="items-center gap-2">
                <Text className="font-poppins text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {isCompleted
                    ? 'Payment Completed'
                    : isFailed
                    ? 'Payment Failed'
                    : 'Processing Payment'}
                </Text>
                <Text className="font-inter text-base text-gray-600 dark:text-gray-400 text-center">
                  {isCompleted
                    ? 'Your payment has been successfully processed.'
                    : isFailed
                    ? 'The payment could not be completed. Please try again.'
                    : isMpesa && wsConnected
                    ? 'Waiting for payment confirmation via M-Pesa...'
                    : isMpesa && !wsConnected && !pollingActiveRef.current
                    ? 'Connecting to payment gateway...'
                    : 'Checking payment status...'}
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Payment Details
            </Text>
            <View className="gap-3">
              <InfoRow icon="attach-money" label="Amount" value={formatCurrency(amount, currency)} />
              <InfoRow icon="description" label="Invoice" value={invoiceNumber} />
              <InfoRow
                icon="event"
                label="Date"
                value={formatDate(payment?.paymentDate ?? payment?.createdAt)}
              />
              {isMpesa && checkoutId && (
                <InfoRow icon="receipt" label="Checkout ID" value={checkoutId} />
              )}
              {payment?.transactionReference && (
                <InfoRow
                  icon="confirmation-number"
                  label="Transaction Reference"
                  value={payment.transactionReference}
                />
              )}
            </View>
          </View>

          {isMpesa && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Connection Status
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons
                      name={wsConnected ? 'wifi' : 'wifi-off'}
                      size={18}
                      color={wsConnected ? '#059669' : '#9ca3af'}
                    />
                    <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                      WebSocket
                    </Text>
                  </View>
                  <Badge
                    variant={wsConnected ? 'success' : 'default'}
                    size="sm">
                    {wsConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </View>
                {(pollingActiveRef.current || isFallbackActive) && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="sync" size={18} color="#7b1c1c" />
                      <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                        {isFallbackActive ? 'Checking payment status...' : 'API Polling'}
                      </Text>
                    </View>
                    <Badge variant="info" size="sm">
                      Active
                    </Badge>
                  </View>
                )}
                {wsError && (
                  <Alert variant="error" message={wsError} className="w-full" />
                )}
              </View>
            </View>
          )}

          <View className="flex-row flex-wrap gap-3">
            <Pressable onPress={handleViewDetails} className="btn btn-primary flex-1">
              <Text className="btn-text btn-text-primary">View Details</Text>
            </Pressable>
            {isFailed && (
              <Pressable onPress={handleRetry} className="btn btn-secondary flex-1">
                <Text className="btn-text btn-text-secondary">Retry Payment</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
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

