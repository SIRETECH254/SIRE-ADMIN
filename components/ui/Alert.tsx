import { ReactNode } from 'react';
import { View, TouchableOpacity, Text, type ViewProps } from 'react-native';

export interface AlertProps extends Omit<ViewProps, 'children'> {
  variant: 'success' | 'error' | 'info';
  message: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant,
  message,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}: AlertProps) {
  const variantStyles = {
    success: 'form-message-success',
    error: 'form-message-error',
    info: 'form-message-info',
  };

  return (
    <View
      className={`rounded-lg p-4 flex-row items-center ${variantStyles[variant]} ${className}`}
      {...props}>
      {icon && <View className="mr-2">{icon}</View>}
      <Text className="flex-1 font-inter text-base">
        {message}
      </Text>
      {dismissible && onDismiss && (
        <TouchableOpacity onPress={onDismiss} className="ml-2">
          <Text className="font-inter text-base">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

