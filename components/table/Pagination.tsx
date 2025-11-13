import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
      <Text className="text-sm text-gray-600">
        Page {current_page_safe(currentPage)} of {totalPages || 1}
        {typeof totalItems === 'number' && typeof pageSize === 'number' ? (
          <> • {page_window_text(currentPage, pageSize, totalItems)}</>
        ) : null}
      </Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50">
          <Text className="text-sm text-gray-700">Prev</Text>
        </Pressable>
        <Pressable
          onPress={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50">
          <Text className="text-sm text-gray-700">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

function current_page_safe(p: number) {
  return p > 0 ? p : 1;
}

function page_window_text(page: number, size: number, total: number) {
  const start = (page - 1) * size + 1;
  const end = Math.min(page * size, total);
  return `${start}–${end} of ${total}`;
}

export default Pagination;


