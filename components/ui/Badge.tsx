import { ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';

export interface BadgeProps extends Omit<ViewProps, 'children'> {
  variant: 'success' | 'error' | 'warning' | 'info' | 'default';
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  variant,
  children,
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-brand-soft',
    error: 'bg-brand-accent',
    warning: 'bg-yellow-500',
    info: 'bg-brand-tint',
    default: 'bg-gray-200',
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

  const textColor =
    variant === 'info' || variant === 'default'
      ? variant === 'info'
        ? 'text-black'
        : 'text-gray-700'
      : 'text-white';

  return (
    <View
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}>
      <Text
        className={`font-inter font-medium ${textSizeStyles[size]} ${textColor}`}>
        {children}
      </Text>
    </View>
  );
}

