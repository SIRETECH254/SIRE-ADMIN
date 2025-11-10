import { ActivityIndicator, View, Text, type ViewProps } from 'react-native';
import { BrandColors } from '@/constants/theme';

export interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  size = 'large',
  message,
  fullScreen = false,
  className = '',
  ...props
}: LoadingProps) {
  const containerClass = fullScreen
    ? 'flex-1 justify-center items-center bg-white'
    : 'justify-center items-center py-8';

  return (
    <View className={`${containerClass} ${className}`} {...props}>
      <ActivityIndicator
        size={size}
        color={BrandColors.primary}
      />
      {message && (
        <Text className="font-inter text-base text-gray-600 mt-4">
          {message}
        </Text>
      )}
    </View>
  );
}

