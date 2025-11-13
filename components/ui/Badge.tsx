import { ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';

export interface BadgeProps extends Omit<ViewProps, 'children'> {
  variant: 'success' | 'error' | 'warning' | 'info' | 'default';
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

export function Badge({
  variant,
  children,
  size = 'md',
  className = '',
  icon,
  ...props
}: BadgeProps) {
  // Prefer global css utility classes for badges
  const containerStyles = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'rounded-full bg-yellow-100 px-3 py-1',
    info: 'rounded-full bg-brand-tint px-3 py-1',
    default: 'rounded-full bg-gray-200 px-3 py-1',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 rounded-lg',
    md: 'px-3 py-1 rounded-lg',
    lg: 'px-4 py-2 rounded-lg',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Explicit text colors to ensure visibility in React Native
  const textColorByVariant = {
    success: 'text-emerald-700',
    error: 'text-brand-accent',
    warning: 'text-yellow-700',
    info: 'text-black',
    default: 'text-gray-700',
  } as const;

  return (
    <View className={`${containerStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      <View className="flex-row items-center gap-1">
        {icon ? <View>{icon}</View> : null}
        <Text className={`font-inter font-medium ${textSizeStyles[size]} ${textColorByVariant[variant]}`}>
          {children}
        </Text>
      </View>
    </View>
  );
}

