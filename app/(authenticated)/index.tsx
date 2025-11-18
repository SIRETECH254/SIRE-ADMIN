import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { useGetAdminDashboard, useGetClientDashboard } from '@/tanstack/useDashboard';
import { formatCurrency, formatDate } from '@/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const { data: adminData, isLoading: adminLoading, error: adminError } = useGetAdminDashboard();
  const { data: clientData, isLoading: clientLoading, error: clientError } = useGetClientDashboard();

  const data = isClient ? clientData : adminData;
  const isLoading = isClient ? clientLoading : adminLoading;
  const error = isClient ? clientError : adminError;

  const overview = useMemo(() => {
    const root = data?.data ?? {};
    return root?.overview ?? {};
  }, [data]);

  const recentActivity = useMemo(() => {
    const root = data?.data ?? {};
    return root?.recentActivity ?? {};
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (isLoading) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <Loading fullScreen message="Loading dashboard..." />
      </ThemedView>
    );
  }

  if (errorMessage) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <View className="p-6">
          <Alert variant="error" message={errorMessage} className="w-full" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          {/* Header */}
          <View>
            <ThemedText type="title">Dashboard</ThemedText>
            {user && (
              <Text className="text-gray-600 mt-1">
                Welcome, {user.firstName} {user.lastName}!
              </Text>
            )}
          </View>

          {/* Statistics Cards */}
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-4">
              {/* Projects Card */}
              <StatCard
                title="Projects"
                value={overview?.projects?.total ?? 0}
                icon="work"
                iconColor="#7b1c1c"
                subtitle={
                  isClient
                    ? `${overview?.projects?.byStatus?.in_progress ?? 0} in progress`
                    : `${overview?.projects?.byStatus?.completed ?? 0} completed`
                }
              />

              {/* Invoices Card */}
              <StatCard
                title="Invoices"
                value={overview?.invoices?.total ?? 0}
                icon="receipt-long"
                iconColor="#2563eb"
                subtitle={
                  isClient
                    ? `${overview?.invoices?.byStatus?.paid ?? 0} paid`
                    : `${overview?.invoices?.byStatus?.paid ?? 0} paid`
                }
              />

              {/* Payments Card */}
              <StatCard
                title="Payments"
                value={overview?.payments?.total ?? 0}
                icon="account-balance-wallet"
                iconColor="#059669"
                subtitle={
                  isClient
                    ? formatCurrency(overview?.payments?.totalAmount ?? 0)
                    : `${overview?.payments?.completed ?? 0} completed`
                }
              />

              {/* Quotations Card */}
              <StatCard
                title="Quotations"
                value={overview?.quotations?.total ?? 0}
                icon="description"
                iconColor="#f59e0b"
                subtitle={
                  isClient
                    ? `${overview?.quotations?.byStatus?.accepted ?? 0} accepted`
                    : `${overview?.quotations?.byStatus?.converted ?? 0} converted`
                }
              />
            </View>

            {/* Admin-only cards */}
            {!isClient && (
              <View className="flex-row flex-wrap gap-4">
                {/* Clients Card */}
                <StatCard
                  title="Clients"
                  value={overview?.clients?.total ?? 0}
                  icon="group"
                  iconColor="#8b5cf6"
                  subtitle={`${overview?.clients?.active ?? 0} active`}
                />

                {/* Services Card */}
                <StatCard
                  title="Services"
                  value={overview?.services?.total ?? 0}
                  icon="build"
                  iconColor="#ec4899"
                  subtitle={`${overview?.services?.active ?? 0} active`}
                />

                {/* Revenue Card */}
                <StatCard
                  title="Revenue"
                  value={formatCurrency(overview?.revenue?.total ?? 0)}
                  icon="attach-money"
                  iconColor="#10b981"
                  subtitle={formatCurrency(overview?.revenue?.fromPayments ?? 0)}
                />
              </View>
            )}

            {/* Client-only financial card */}
            {isClient && overview?.financial && (
              <View className="flex-row flex-wrap gap-4">
                <StatCard
                  title="Total Spent"
                  value={formatCurrency(overview?.financial?.totalSpent ?? 0)}
                  icon="payments"
                  iconColor="#10b981"
                />
                <StatCard
                  title="Outstanding"
                  value={formatCurrency(overview?.financial?.outstandingBalance ?? 0)}
                  icon="account-balance"
                  iconColor="#f59e0b"
                />
              </View>
            )}
          </View>

          {/* Recent Activity */}
          <View className="gap-6">
            {/* Recent Projects */}
            {recentActivity?.projects && Array.isArray(recentActivity.projects) && recentActivity.projects.length > 0 && (
              <ActivitySection
                title="Recent Projects"
                icon="work"
                items={recentActivity.projects}
                onItemPress={(item: any) => {
                  const id = item._id || item.id;
                  if (id) router.push(`/(authenticated)/projects/${id}` as any);
                }}
                renderItem={(item: any) => (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                        {item.title ?? item.name ?? 'Untitled Project'}
                      </Text>
                      <Text className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.client
                          ? `${item.client.firstName ?? ''} ${item.client.lastName ?? ''}`.trim() || item.client.email
                          : '—'}
                      </Text>
                    </View>
                    <Badge
                      variant={getProjectStatusVariant(item.status)}
                      size="sm"
                      icon={
                        <MaterialIcons
                          name={getProjectStatusIcon(item.status)}
                          size={14}
                          color="#7b1c1c"
                        />
                      }>
                      {item.status ?? 'pending'}
                    </Badge>
                  </View>
                )}
              />
            )}

            {/* Recent Invoices */}
            {recentActivity?.invoices && Array.isArray(recentActivity.invoices) && recentActivity.invoices.length > 0 && (
              <ActivitySection
                title="Recent Invoices"
                icon="receipt-long"
                items={recentActivity.invoices}
                onItemPress={(item: any) => {
                  const id = item._id || item.id;
                  if (id) router.push(`/(authenticated)/invoices/${id}` as any);
                }}
                renderItem={(item: any) => (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                        {item.invoiceNumber ?? 'Invoice'}
                      </Text>
                      <Text className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatCurrency(item.totalAmount ?? item.total ?? 0)}
                      </Text>
                    </View>
                    <Badge
                      variant={getInvoiceStatusVariant(item.status)}
                      size="sm"
                      icon={
                        <MaterialIcons
                          name={getInvoiceStatusIcon(item.status)}
                          size={14}
                          color="#7b1c1c"
                        />
                      }>
                      {item.status ?? 'draft'}
                    </Badge>
                  </View>
                )}
              />
            )}

            {/* Recent Payments */}
            {recentActivity?.payments && Array.isArray(recentActivity.payments) && recentActivity.payments.length > 0 && (
              <ActivitySection
                title="Recent Payments"
                icon="account-balance-wallet"
                items={recentActivity.payments}
                onItemPress={(item: any) => {
                  const id = item._id || item.id;
                  if (id) router.push(`/(authenticated)/payments/${id}` as any);
                }}
                renderItem={(item: any) => (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                        {item.paymentNumber ?? `Payment ${(item._id || item.id || '').slice(0, 8)}`}
                      </Text>
                      <Text className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatCurrency(item.amount ?? 0, item.currency ?? 'KES')} • {formatDate(item.paymentDate ?? item.createdAt)}
                      </Text>
                    </View>
                    <Badge
                      variant={getPaymentStatusVariant(item.status)}
                      size="sm"
                      icon={
                        <MaterialIcons
                          name={getPaymentStatusIcon(item.status)}
                          size={14}
                          color="#7b1c1c"
                        />
                      }>
                      {item.status ?? 'pending'}
                    </Badge>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconColor,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  subtitle?: string;
}) {
  return (
    <View className="flex-1 min-w-[140px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <View className="flex-row items-center gap-3 mb-2">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconColor}15` }}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">{title}</Text>
      </View>
      <Text className="font-poppins text-2xl font-semibold text-gray-900 dark:text-gray-50">
        {value}
      </Text>
      {subtitle && (
        <Text className="font-inter text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</Text>
      )}
    </View>
  );
}

function ActivitySection({
  title,
  icon,
  items,
  onItemPress,
  renderItem,
}: {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  items: any[];
  onItemPress: (item: any) => void;
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <View className="flex-row items-center gap-2 mb-4">
        <MaterialIcons name={icon} size={20} color="#7b1c1c" />
        <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
          {title}
        </Text>
      </View>
      <View className="gap-3">
        {items.slice(0, 5).map((item, index) => {
          const id = item._id || item.id || index;
          return (
            <Pressable
              key={id}
              onPress={() => onItemPress(item)}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              {renderItem(item)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getProjectStatusVariant(status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'info',
    in_progress: 'info',
    on_hold: 'warning',
    completed: 'success',
    cancelled: 'error',
  };
  return statusMap[status?.toLowerCase() ?? ''] ?? 'default';
}

function getProjectStatusIcon(status?: string): keyof typeof MaterialIcons.glyphMap {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    pending: 'schedule',
    in_progress: 'play-circle',
    on_hold: 'pause-circle',
    completed: 'check-circle',
    cancelled: 'cancel',
  };
  return iconMap[status?.toLowerCase() ?? ''] ?? 'help';
}

function getInvoiceStatusVariant(status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    draft: 'default',
    sent: 'info',
    paid: 'success',
    partially_paid: 'warning',
    overdue: 'error',
    cancelled: 'error',
  };
  return statusMap[status?.toLowerCase() ?? ''] ?? 'default';
}

function getInvoiceStatusIcon(status?: string): keyof typeof MaterialIcons.glyphMap {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    draft: 'description',
    sent: 'send',
    paid: 'check-circle',
    partially_paid: 'payments',
    overdue: 'warning',
    cancelled: 'cancel',
  };
  return iconMap[status?.toLowerCase() ?? ''] ?? 'description';
}

function getPaymentStatusVariant(status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'info',
    processing: 'info',
    completed: 'success',
    failed: 'error',
    cancelled: 'error',
  };
  return statusMap[status?.toLowerCase() ?? ''] ?? 'default';
}

function getPaymentStatusIcon(status?: string): keyof typeof MaterialIcons.glyphMap {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    pending: 'schedule',
    processing: 'sync',
    completed: 'check-circle',
    failed: 'error',
    cancelled: 'cancel',
  };
  return iconMap[status?.toLowerCase() ?? ''] ?? 'schedule';
}
