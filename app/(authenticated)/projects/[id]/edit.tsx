import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { DatePickerModal } from 'react-native-paper-dates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { useGetProject, useUpdateProject } from '@/tanstack/useProjects';
import { useGetClients } from '@/tanstack/useClients';
import { useGetServices } from '@/tanstack/useServices';
import { useGetAllUsers } from '@/tanstack/useUsers';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type StatusOption = 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
type PriorityOption = 'low' | 'medium' | 'high' | 'urgent';

export default function EditProjectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading } = useGetProject(id);
  const { mutateAsync, isPending } = useUpdateProject();
  const { data: clientsData } = useGetClients({ limit: 100 });
  const { data: servicesData } = useGetServices({ limit: 100 });
  const { data: usersData } = useGetAllUsers({ limit: 100 });

  const existing = data?.data?.project ?? data?.data ?? null;

  const clients = useMemo(() => {
    const root = clientsData?.data ?? {};
    return (root?.data?.clients ?? root?.clients ?? root?.data ?? []) as any[];
  }, [clientsData]);

  const services = useMemo(() => {
    const root = servicesData?.data ?? {};
    return (root?.data?.services ?? root?.services ?? root?.data ?? []) as any[];
  }, [servicesData]);

  const users = useMemo(() => {
    const root = usersData?.data ?? {};
    return (root?.data?.users ?? root?.users ?? root?.data ?? []) as any[];
  }, [usersData]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusOption>('pending');
  const [priority, setPriority] = useState<PriorityOption>('low');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);
  const [progress, setProgress] = useState('0');
  const [notes, setNotes] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title ?? '');
      setDescription(existing.description ?? '');
      setClientId(existing.client?._id || existing.client?.id || existing.client || '');
      setServiceIds(
        (existing.services ?? []).map((s: any) => s._id || s.id || s).filter(Boolean)
      );
      setStatus(existing.status ?? 'pending');
      setPriority(existing.priority ?? 'low');
      setTeamMemberIds(
        (existing.teamMembers ?? []).map((m: any) => m._id || m.id || m).filter(Boolean)
      );
      setStartDate(existing.startDate ? new Date(existing.startDate) : null);
      setEndDate(existing.endDate ? new Date(existing.endDate) : null);
      setProgress(String(existing.progress ?? 0));
      setNotes(existing.notes ?? '');
      setInlineStatus(null);
    }
  }, [existing]);

  const isBusy = isPending;

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
    const trimmedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';
    const trimmedNotes = notes.trim();

    if (!trimmedTitle || !clientId) {
      setInlineStatus({ type: 'error', text: 'Title and client are required.' });
      return;
    }

    const progressNum = parseInt(progress, 10);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setInlineStatus({ type: 'error', text: 'Progress must be between 0 and 100.' });
      return;
    }

    setInlineStatus(null);
    try {
      const projectData: any = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        client: clientId,
        services: serviceIds.length > 0 ? serviceIds : undefined,
        status,
        priority,
        teamMembers: teamMemberIds.length > 0 ? teamMemberIds : undefined,
        startDate: trimmedStartDate || undefined,
        endDate: trimmedEndDate || undefined,
        progress: progressNum,
        notes: trimmedNotes || undefined,
      };

      await mutateAsync({ projectId: id, projectData });
      setInlineStatus({ type: 'success', text: 'Project updated successfully.' });
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to update project right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [
    title,
    description,
    clientId,
    serviceIds,
    status,
    priority,
    teamMemberIds,
    startDate,
    endDate,
    progress,
    notes,
    mutateAsync,
    id,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);


  if (isLoading && !existing) {
    return <Loading fullScreen message="Loading project..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Edit Project
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
                placeholder="Project title"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Description (optional)</Text>
              <TextInput
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  setInlineStatus(null);
                }}
                placeholder="Project description"
                multiline
                numberOfLines={4}
                className="form-input"
                textAlignVertical="top"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Client *</Text>
              <View className="border border-gray-300 rounded-lg bg-white px-2">
                <Picker
                  selectedValue={clientId}
                  onValueChange={(v: any) => {
                    setClientId(v);
                    setInlineStatus(null);
                  }}
                  style={{ height: 44 }}>
                  <Picker.Item label="Select a client" value="" />
                  {clients.map((client: any) => {
                    const clientIdValue = client._id || client.id;
                    const name = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || client.email;
                    return <Picker.Item key={clientIdValue} label={name} value={clientIdValue} />;
                  })}
                </Picker>
              </View>
            </View>

            <View className="gap-2">
              <Text className="form-label">Services (optional)</Text>
              <MultiSelect
                style={{}}
                className="input-multiselect"
                placeholder="Select services"
                data={services.map((service: any) => ({
                  label: service.name ?? service.title ?? '—',
                  value: service._id || service.id,
                }))}
                labelField="label"
                valueField="value"
                value={serviceIds}
                onChange={(items) => {
                  setServiceIds(items);
                  setInlineStatus(null);
                }}
                renderSelectedItem={(item, unSelect) => (
                  <Pressable
                    onPress={() => unSelect && unSelect(item)}
                    className="px-3 py-2 m-1 rounded-lg border border-brand-primary bg-brand-tint">
                    <Text className="font-inter text-sm text-brand-primary font-semibold">
                      {item.label} ×
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Status</Text>
              <View className="border border-gray-300 rounded-lg bg-white px-2">
                <Picker selectedValue={status} onValueChange={(v: any) => setStatus(v)} style={{ height: 44 }}>
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="In Progress" value="in_progress" />
                  <Picker.Item label="On Hold" value="on_hold" />
                  <Picker.Item label="Completed" value="completed" />
                  <Picker.Item label="Cancelled" value="cancelled" />
                </Picker>
              </View>
            </View>

            <View className="gap-2">
              <Text className="form-label">Priority</Text>
              <View className="border border-gray-300 rounded-lg bg-white px-2">
                <Picker selectedValue={priority} onValueChange={(v: any) => setPriority(v)} style={{ height: 44 }}>
                  <Picker.Item label="Low" value="low" />
                  <Picker.Item label="Medium" value="medium" />
                  <Picker.Item label="High" value="high" />
                  <Picker.Item label="Urgent" value="urgent" />
                </Picker>
              </View>
            </View>

            <View className="gap-2">
              <Text className="form-label">Team Members (optional)</Text>
              <MultiSelect
                style={{}}
                className="input-multiselect"
                placeholder="Select team members"
                data={users
                  .filter((u: any) => u.role !== 'client')
                  .map((user: any) => ({
                    label: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
                    value: user._id || user.id,
                  }))}
                labelField="label"
                valueField="value"
                value={teamMemberIds}
                onChange={(items) => {
                  setTeamMemberIds(items);
                  setInlineStatus(null);
                }}
                renderSelectedItem={(item, unSelect) => (
                  <Pressable
                    onPress={() => unSelect && unSelect(item)}
                    className="px-3 py-2 m-1 rounded-lg border border-brand-primary bg-brand-tint">
                    <Text className="font-inter text-sm text-brand-primary font-semibold">
                      {item.label} ×
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Start Date (optional)</Text>
              <Pressable
                onPress={() => setStartPickerOpen(true)}
                className="input-date flex-row items-center justify-between">
                <Text className={startDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                  {startDate ? startDate.toLocaleDateString() : 'Select start date'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="form-label">End Date (optional)</Text>
              <Pressable
                onPress={() => setEndPickerOpen(true)}
                className="input-date flex-row items-center justify-between">
                <Text className={endDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                  {endDate ? endDate.toLocaleDateString() : 'Select end date'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="form-label">Progress (0-100)</Text>
              <TextInput
                value={progress}
                onChangeText={(v) => {
                  setProgress(v);
                  setInlineStatus(null);
                }}
                placeholder="0"
                keyboardType="numeric"
                className="form-input"
              />
            </View>

            <View className="gap-2">
              <Text className="form-label">Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={(v) => {
                  setNotes(v);
                  setInlineStatus(null);
                }}
                placeholder="Project notes"
                multiline
                numberOfLines={8}
                className="form-input"
                textAlignVertical="top"
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
                  <Text className="btn-text btn-text-primary">Save changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={startPickerOpen}
        date={startDate ?? undefined}
        onDismiss={() => setStartPickerOpen(false)}
        onConfirm={({ date }) => {
          setStartPickerOpen(false);
          if (date) {
            setStartDate(date);
            setInlineStatus(null);
          }
        }}
      />

      <DatePickerModal
        locale="en"
        mode="single"
        visible={endPickerOpen}
        date={endDate ?? undefined}
        onDismiss={() => setEndPickerOpen(false)}
        onConfirm={({ date }) => {
          setEndPickerOpen(false);
          if (date) {
            setEndDate(date);
            setInlineStatus(null);
          }
        }}
      />
    </ThemedView>
  );
}

