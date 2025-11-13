import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetProject } from '@/tanstack/useProjects';
import { getInitials, formatDate as formatDateUtil } from '@/utils';

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error } = useGetProject(id);
  const project = data?.data?.project ?? data?.data ?? null;

  const formatDate = (value?: string) => formatDateUtil(value);
  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'play-circle-filled';
      case 'on_hold':
        return 'pause-circle-filled';
      case 'cancelled':
        return 'cancel';
      default:
        return 'schedule';
    }
  };

  const progress = project?.progress ?? 0;
  const milestones = project?.milestones ?? [];
  const attachments = project?.attachments ?? [];
  const teamMembers = project?.teamMembers ?? [];
  const services = project?.services ?? [];

  if (isLoading && !project) {
    return <Loading fullScreen message="Loading project..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">Project Details</ThemedText>
              <Text className="text-gray-600 mt-1">
                {project?.projectNumber ? `Project #${project.projectNumber}` : `Project ID: ${id}`}
              </Text>
            </View>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {/* Project Header */}
          <View className="gap-3">
            <View>
              <Text className="font-poppins text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {project?.title ?? '—'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 flex-wrap">
              <Badge
                variant={getStatusVariant(project?.status)}
                size="sm"
                icon={
                  <MaterialIcons
                    name={getStatusIcon(project?.status) as any}
                    size={14}
                    color={
                      project?.status === 'completed'
                        ? '#059669'
                        : project?.status === 'in_progress'
                        ? '#2563eb'
                        : project?.status === 'on_hold'
                        ? '#f59e0b'
                        : project?.status === 'cancelled'
                        ? '#dc2626'
                        : '#6b7280'
                    }
                  />
                }>
                {project?.status?.replace('_', ' ') ?? 'pending'}
              </Badge>
              <Badge variant={getPriorityVariant(project?.priority)} size="sm">
                {project?.priority ?? 'low'} priority
              </Badge>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 flex-wrap">
            <Pressable
              onPress={() => router.push(`/(authenticated)/projects/${id}/edit`)}
              className="rounded-xl bg-brand-primary px-6 py-3"
              accessibilityRole="button"
              accessibilityLabel="Edit project">
              <Text className="font-inter text-base font-semibold text-white">Edit Project</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/(authenticated)/projects/${id}/milestones`)}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900"
              accessibilityRole="button"
              accessibilityLabel="Manage milestones">
              <Text className="font-inter text-base font-semibold text-gray-700 dark:text-gray-300">
                Milestones
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/(authenticated)/projects/${id}/attachments`)}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900"
              accessibilityRole="button"
              accessibilityLabel="Manage attachments">
              <Text className="font-inter text-base font-semibold text-gray-700 dark:text-gray-300">
                Attachments
              </Text>
            </Pressable>
          </View>

          <View className="gap-6">
            {/* Description */}
            {project?.description ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Description
                </Text>
                <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                  {project.description}
                </Text>
              </View>
            ) : null}

            {/* Client Information */}
            {project?.client ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Client Information
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/(authenticated)/clients/${project.client._id || project.client.id}`)}
                    className="flex-row items-center gap-1">
                    <Text className="font-inter text-sm text-brand-primary">View Client</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#7b1c1c" />
                  </Pressable>
                </View>
                <View className="gap-3">
                  <InfoRow
                    icon="person"
                    label="Name"
                    value={
                      `${project.client.firstName ?? ''} ${project.client.lastName ?? ''}`.trim() ||
                      project.client.email ||
                      '—'
                    }
                  />
                  <InfoRow icon="mail-outline" label="Email" value={project.client.email ?? '—'} />
                  <InfoRow icon="call" label="Phone" value={project.client.phone ?? 'Not provided'} />
                  {project.client.company ? (
                    <InfoRow icon="business" label="Company" value={project.client.company} />
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Services */}
            {services.length > 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  Services Included
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {services.map((service: any) => (
                    <Badge key={service._id || service.id} variant="info" size="sm">
                      {service.name ?? service.title ?? '—'}
                    </Badge>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Team Members */}
            {teamMembers.length > 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  Assigned Team Members
                </Text>
                <View className="gap-3">
                  {teamMembers.map((member: any) => {
                    const memberId = member._id || member.id;
                    const memberName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.email;
                    const initials = getInitials({
                      firstName: member.firstName,
                      lastName: member.lastName,
                      email: member.email,
                    });
                    return (
                      <View key={memberId} className="flex-row items-center gap-3">
                        {member.avatar ? (
                          <Image
                            source={{ uri: member.avatar }}
                            className="h-10 w-10 rounded-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-10 w-10 rounded-full bg-brand-tint items-center justify-center">
                            <Text className="font-inter font-semibold text-sm text-brand-primary">
                              {initials}
                            </Text>
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
                            {memberName}
                          </Text>
                          {member.role ? (
                            <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                              {member.role}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Timeline */}
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Timeline
              </Text>
              <View className="gap-3">
                <InfoRow icon="event" label="Start Date" value={formatDate(project?.startDate)} />
                <InfoRow icon="event" label="End Date" value={formatDate(project?.endDate)} />
                {project?.completionDate ? (
                  <InfoRow icon="check-circle" label="Completion Date" value={formatDate(project.completionDate)} />
                ) : null}
              </View>
            </View>

            {/* Progress */}
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Progress
                </Text>
                <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100">
                  {progress}%
                </Text>
              </View>
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-brand-primary"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </View>
            </View>

            {/* Milestones Preview */}
            {milestones.length > 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Milestones
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/(authenticated)/projects/${id}/milestones`)}
                    className="flex-row items-center gap-1">
                    <Text className="font-inter text-sm text-brand-primary">View All</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#7b1c1c" />
                  </Pressable>
                </View>
                <View className="gap-3">
                  {milestones.slice(0, 5).map((milestone: any) => {
                    const milestoneId = milestone._id || milestone.id;
                    return (
                      <View key={milestoneId} className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <View className="flex-1">
                          <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100">
                            {milestone.title ?? '—'}
                          </Text>
                          {milestone.dueDate ? (
                            <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Due: {formatDate(milestone.dueDate)}
                            </Text>
                          ) : null}
                        </View>
                        <Badge
                          variant={milestone.completed ? 'success' : 'default'}
                          size="sm"
                          icon={
                            <MaterialIcons
                              name={milestone.completed ? 'check-circle' : 'schedule'}
                              size={14}
                              color={milestone.completed ? '#059669' : '#6b7280'}
                            />
                          }>
                          {milestone.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Attachments Preview */}
            {attachments.length > 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Attachments
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/(authenticated)/projects/${id}/attachments`)}
                    className="flex-row items-center gap-1">
                    <Text className="font-inter text-sm text-brand-primary">View All ({attachments.length})</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#7b1c1c" />
                  </Pressable>
                </View>
                <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                  {attachments.length} attachment{attachments.length > 1 ? 's' : ''} available
                </Text>
              </View>
            ) : null}

            {/* Notes */}
            {project?.notes ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Notes
                </Text>
                <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                  {project.notes}
                </Text>
              </View>
            ) : null}

            {/* Project Details */}
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Project Details
              </Text>
              <View className="gap-3">
                <InfoRow icon="event-note" label="Created" value={formatDate(project?.createdAt)} />
                <InfoRow icon="update" label="Updated" value={formatDate(project?.updatedAt)} />
              </View>
            </View>
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
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-100">
        {value ?? '—'}
      </Text>
    </View>
  );
}

