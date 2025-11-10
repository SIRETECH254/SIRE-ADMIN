import { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

export interface ModalProps {
  visible: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  showAccentStrip?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function Modal({
  visible,
  title,
  children,
  onClose,
  showAccentStrip = false,
  actions,
  className = '',
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center p-6">
        {/* Backdrop - closes modal on press */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}>
          <View className="flex-1 bg-black/50" />
        </Pressable>
        {/* Content - positioned on top, captures touches */}
        <View
          className={`bg-white rounded-2xl p-6 w-full max-w-md ${className}`}
          style={styles.content}>
          {showAccentStrip && (
            <View className="h-1 bg-brand-primary rounded-t-2xl -mt-6 -mx-6 mb-4" />
          )}
          {title && (
            <Text className="font-poppins font-semibold text-2xl text-brand-primary mb-4">
              {title}
            </Text>
          )}
          <View className="mb-6">{children}</View>
          {actions && (
            <View className="flex-row justify-end gap-3">{actions}</View>
          )}
          {!actions && (
            <TouchableOpacity
              onPress={onClose}
              className="self-end mt-4 px-4 py-2">
              <Text className="text-brand-primary font-inter font-semibold text-base">
                Close
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  content: {
    // Content is positioned on top and will capture all touch events
    // preventing backdrop from being triggered when touching content
  },
});

