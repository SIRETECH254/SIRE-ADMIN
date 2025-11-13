import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal as RNModal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useGetProject, useAddMilestone, useUpdateMilestone, useDeleteMilestone } from '@/tanstack/useProjects';
import { formatDate as formatDateUtil } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

export default function MilestonesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data, isLoading, error } = useGetProject(id);
  const { mutateAsync: addMilestoneAsync, isPending: isAdding } = useAddMilestone();
  const { mutateAsync: updateMilestoneAsync, isPending: isUpdating } = useUpdateMilestone();
  const { mutateAsync: deleteMilestoneAsync, isPending: isDeleting } = useDeleteMilestone();

  const project = data?.data?.project ?? data?.data ?? null;
  const milestones = project?.milestones ?? [];

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState<Date | null>(null);
  const [showNewDueDatePicker, setShowNewDueDatePicker] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [showEditDueDatePicker, setShowEditDueDatePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  const formatDate = (value?: string) => formatDateUtil(value);

  const handleAddMilestone = useCallback(async () => {
    const trimmedTitle = newMilestoneTitle.trim();
    if (!trimmedTitle) {
      setInlineStatus({ type: 'error', text: 'Milestone title is required.' });
      return;
    }

    setInlineStatus(null);
    try {
      await addMilestoneAsync({
        projectId: id,
        milestoneData: {
          title: trimmedTitle,
          description: newMilestoneDescription.trim() || undefined,
          dueDate: newMilestoneDueDate ? newMilestoneDueDate.toISOString().split('T')[0] : undefined,
        },
      });
      setNewMilestoneTitle('');
      setNewMilestoneDescription('');
      setNewMilestoneDueDate(null);
      setInlineStatus({ type: 'success', text: 'Milestone added successfully.' });
      setTimeout(() => setInlineStatus(null), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to add milestone right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [newMilestoneTitle, newMilestoneDescription, newMilestoneDueDate, addMilestoneAsync, id]);

  const handleStartEdit = useCallback((milestone: any) => {
    const milestoneId = milestone._id || milestone.id;
    setEditingMilestoneId(milestoneId);
    setEditTitle(milestone.title ?? '');
    setEditDescription(milestone.description ?? '');
    setEditDueDate(milestone.dueDate ? new Date(milestone.dueDate) : null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMilestoneId(null);
    setEditTitle('');
    setEditDescription('');
    setEditDueDate(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingMilestoneId) return;
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setInlineStatus({ type: 'error', text: 'Milestone title is required.' });
      return;
    }

    setInlineStatus(null);
    try {
      await updateMilestoneAsync({
        projectId: id,
        milestoneId: editingMilestoneId,
        milestoneData: {
          title: trimmedTitle,
          description: editDescription.trim() || undefined,
          dueDate: editDueDate ? editDueDate.toISOString().split('T')[0] : undefined,
        },
      });
      handleCancelEdit();
      setInlineStatus({ type: 'success', text: 'Milestone updated successfully.' });
      setTimeout(() => setInlineStatus(null), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to update milestone right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [editingMilestoneId, editTitle, editDescription, editDueDate, updateMilestoneAsync, id, handleCancelEdit]);

  const handleToggleCompleted = useCallback(
    async (milestone: any) => {
      const milestoneId = milestone._id || milestone.id;
      try {
        await updateMilestoneAsync({
          projectId: id,
          milestoneId,
          milestoneData: {
            completed: !milestone.completed,
          },
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || 'Unable to update milestone right now.';
        setInlineStatus({ type: 'error', text: message });
      }
    },
    [updateMilestoneAsync, id]
  );

  const handleRequestDelete = useCallback((milestone: any) => {
    const milestoneId = milestone._id || milestone.id;
    setConfirmDelete(milestoneId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await deleteMilestoneAsync({ projectId: id, milestoneId: confirmDelete });
      setConfirmDelete(null);
      setInlineStatus({ type: 'success', text: 'Milestone deleted successfully.' });
      setTimeout(() => setInlineStatus(null), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to delete milestone right now.';
      setInlineStatus({ type: 'error', text: message });
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteMilestoneAsync, id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  if (isLoading && !project) {
    return <Loading fullScreen message="Loading project..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <ThemedText type="title">Project Milestones</ThemedText>
              <Text className="text-gray-600 mt-1">{project?.title ?? 'Project'}</Text>
            </View>
            <Pressable onPress={() => router.back()} className="px-3 py-2">
              <MaterialIcons name="arrow-back" size={24} color="#7b1c1c" />
            </Pressable>
          </View>

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {inlineStatus ? (
            <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
          ) : null}

          {/* Add Milestone Form */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Add New Milestone
            </Text>
            <View className="gap-4">
              <View className="gap-2">
                <Text className="form-label">Title *</Text>
                <TextInput
                  value={newMilestoneTitle}
                  onChangeText={(v) => {
                    setNewMilestoneTitle(v);
                    setInlineStatus(null);
                  }}
                  placeholder="Milestone title"
                  className="form-input"
                />
              </View>
              <View className="gap-2">
                <Text className="form-label">Description (optional)</Text>
                <TextInput
                  value={newMilestoneDescription}
                  onChangeText={(v) => {
                    setNewMilestoneDescription(v);
                    setInlineStatus(null);
                  }}
                  placeholder="Milestone description"
                  multiline
                  numberOfLines={3}
                  className="form-input"
                  textAlignVertical="top"
                />
              </View>
              <View className="gap-2">
                <Text className="form-label">Due Date (optional)</Text>
                <Pressable
                  onPress={() => setShowNewDueDatePicker(true)}
                  className="input-date flex-row items-center justify-between">
                  <Text className={newMilestoneDueDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                    {newMilestoneDueDate ? newMilestoneDueDate.toLocaleDateString() : 'Select due date'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
                </Pressable>
              </View>
              <Pressable
                onPress={handleAddMilestone}
                disabled={isAdding}
                className="btn btn-primary self-start">
                {isAdding ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Add Milestone</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Milestones List */}
          <View className="gap-4">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
              Milestones ({milestones.length})
            </Text>

            {milestones.length === 0 ? (
              <View className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 items-center">
                <MaterialIcons name="event-busy" size={48} color="#9ca3af" />
                <Text className="font-inter text-base text-gray-500 dark:text-gray-400 mt-4">
                  No milestones yet. Add one above to get started.
                </Text>
              </View>
            ) : (
              milestones.map((milestone: any) => {
                const milestoneId = milestone._id || milestone.id;
                const isEditing = editingMilestoneId === milestoneId;

                if (isEditing) {
                  return (
                    <View
                      key={milestoneId}
                      className="rounded-2xl border border-brand-primary bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-50 mb-4">
                        Edit Milestone
                      </Text>
                      <View className="gap-4">
                        <View className="gap-2">
                          <Text className="form-label">Title *</Text>
                          <TextInput
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="Milestone title"
                            className="form-input"
                          />
                        </View>
                        <View className="gap-2">
                          <Text className="form-label">Description (optional)</Text>
                          <TextInput
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Milestone description"
                            multiline
                            numberOfLines={3}
                            className="form-input"
                            textAlignVertical="top"
                          />
                        </View>
                        <View className="gap-2">
                          <Text className="form-label">Due Date (optional)</Text>
                          <Pressable
                            onPress={() => setShowEditDueDatePicker(true)}
                            className="input-date flex-row items-center justify-between">
                            <Text className={editDueDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                              {editDueDate ? editDueDate.toLocaleDateString() : 'Select due date'}
                            </Text>
                            <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
                          </Pressable>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <Pressable
                            onPress={handleSaveEdit}
                            disabled={isUpdating}
                            className="btn btn-primary flex-1">
                            {isUpdating ? (
                              <ActivityIndicator color="#ffffff" />
                            ) : (
                              <Text className="btn-text btn-text-primary">Save</Text>
                            )}
                          </Pressable>
                          <Pressable
                            onPress={handleCancelEdit}
                            disabled={isUpdating}
                            className="btn btn-secondary flex-1">
                            <Text className="btn-text btn-text-secondary">Cancel</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                }

                return (
                  <View
                    key={milestoneId}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1 gap-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-poppins text-base font-semibold text-gray-900 dark:text-gray-100">
                            {milestone.title ?? '—'}
                          </Text>
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
                        {milestone.description ? (
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            {milestone.description}
                          </Text>
                        ) : null}
                        {milestone.dueDate ? (
                          <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                            Due: {formatDate(milestone.dueDate)}
                          </Text>
                        ) : null}
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() => handleToggleCompleted(milestone)}
                          disabled={isUpdating}
                          className="px-3 py-2">
                          <MaterialIcons
                            name={milestone.completed ? 'undo' : 'check-circle'}
                            size={20}
                            color={milestone.completed ? '#6b7280' : '#059669'}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => handleStartEdit(milestone)}
                          disabled={isUpdating}
                          className="px-3 py-2">
                          <MaterialIcons name="edit" size={20} color="#7b1c1c" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleRequestDelete(milestone)}
                          disabled={isDeleting}
                          className="px-3 py-2">
                          <MaterialIcons name="delete" size={20} color="#dc2626" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={Boolean(confirmDelete)}
        title="Delete milestone"
        onClose={handleCancelDelete}
        showAccentStrip
        actions={
          <View className="flex-row items-center justify-end gap-3">
            <Pressable onPress={handleCancelDelete} disabled={isDeleting} className="btn btn-secondary">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirmDelete} disabled={isDeleting} className="btn btn-primary min-w-[120px]">
              {isDeleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Delete</Text>
              )}
            </Pressable>
          </View>
        }>
        <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
          Are you sure you want to delete this milestone? This action cannot be undone.
        </Text>
      </Modal>

      {/* Date Pickers */}
      {Platform.OS === 'ios' ? (
        <RNModal visible={showNewDueDatePicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Pressable onPress={() => setShowNewDueDatePicker(false)}>
                  <Text className="text-brand-primary font-semibold">Cancel</Text>
                </Pressable>
                <Text className="font-semibold text-lg">Select Due Date</Text>
                <Pressable
                  onPress={() => {
                    setShowNewDueDatePicker(false);
                    setInlineStatus(null);
                  }}>
                  <Text className="text-brand-primary font-semibold">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={newMilestoneDueDate || new Date()}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    setNewMilestoneDueDate(date);
                  }
                }}
              />
            </View>
          </View>
        </RNModal>
      ) : (
        showNewDueDatePicker && (
          <DateTimePicker
            value={newMilestoneDueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowNewDueDatePicker(false);
              if (event.type === 'set' && date) {
                setNewMilestoneDueDate(date);
                setInlineStatus(null);
              }
            }}
          />
        )
      )}

      {Platform.OS === 'ios' ? (
        <RNModal visible={showEditDueDatePicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Pressable onPress={() => setShowEditDueDatePicker(false)}>
                  <Text className="text-brand-primary font-semibold">Cancel</Text>
                </Pressable>
                <Text className="font-semibold text-lg">Select Due Date</Text>
                <Pressable
                  onPress={() => {
                    setShowEditDueDatePicker(false);
                    setInlineStatus(null);
                  }}>
                  <Text className="text-brand-primary font-semibold">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={editDueDate || new Date()}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    setEditDueDate(date);
                  }
                }}
              />
            </View>
          </View>
        </RNModal>
      ) : (
        showEditDueDatePicker && (
          <DateTimePicker
            value={editDueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowEditDueDatePicker(false);
              if (event.type === 'set' && date) {
                setEditDueDate(date);
                setInlineStatus(null);
              }
            }}
          />
        )
      )}
    </ThemedView>
  );
}

