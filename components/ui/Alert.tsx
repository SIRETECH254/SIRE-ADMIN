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
    success: 'bg-emerald-100 border border-emerald-200',
    error: 'bg-brand-accent',
    info: 'bg-brand-tint border border-brand-tint/50',
  };

  const textColor =
    variant === 'success'
      ? 'text-emerald-800'
      : variant === 'info'
      ? 'text-gray-900'
      : 'text-white';

  return (
    <View
      className={`rounded-lg p-4 flex-row items-center ${variantStyles[variant]} ${className}`}
      {...props}>
      {icon && <View className="mr-2">{icon}</View>}
      <Text className={`flex-1 font-inter text-base ${textColor}`}>
        {message}
      </Text>
      {dismissible && onDismiss && (
        <TouchableOpacity onPress={onDismiss} className="ml-2">
          <Text className={`font-inter text-base ${textColor}`}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

