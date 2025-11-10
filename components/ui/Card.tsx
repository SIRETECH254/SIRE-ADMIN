import { ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';

export interface CardProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  title?: string;
  showAccentStrip?: boolean;
  className?: string;
}

export function Card({
  children,
  title,
  showAccentStrip = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}
      {...props}>
      {showAccentStrip && (
        <View className="h-1 bg-brand-primary rounded-t-2xl -mt-6 -mx-6 mb-4" />
      )}
      {title && (
        <Text className="font-poppins font-semibold text-2xl text-black mb-4">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

