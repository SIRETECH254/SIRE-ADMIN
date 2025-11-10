import { Fragment } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { AUTH_NAV_ITEMS } from '@/constants/navigation';

type SidebarProps = {
  isVisible: boolean;
  onClose: (event?: GestureResponderEvent) => void;
};

export function Sidebar({ isVisible, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { colorScheme, toggleTheme } = useThemeToggle();

  const handleNavigate = (href: Href) => {
    onClose();
    router.push(href);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const content = (
    <View className="flex h-full w-72 border-r border-gray-200 bg-white px-4 pb-6 pt-8 shadow-2xl dark:border-gray-700 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {AUTH_NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Pressable
              key={item.href}
              accessibilityRole="button"
              onPress={() => handleNavigate(item.href)}
              className={`mb-2 flex-row items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                isActive
                  ? 'bg-brand-tint text-brand-primary dark:bg-gray-800/80'
                  : 'bg-transparent'
              }`}>
              <MaterialIcons
                name={item.icon}
                size={20}
                color={isActive ? '#7b1c1c' : colorScheme === 'dark' ? '#e5e7eb' : '#374151'}
              />
              <Text
                className={`font-inter text-sm ${
                  isActive
                    ? 'text-brand-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
        <Pressable
          onPress={toggleTheme}
          accessibilityRole="button"
          className="mb-3 flex-row items-center gap-3 rounded-xl bg-gray-100 px-3 py-3 dark:bg-gray-800">
          <MaterialIcons
            name={colorScheme === 'dark' ? 'light-mode' : 'dark-mode'}
            size={20}
            color={colorScheme === 'dark' ? '#f9fafb' : '#111827'}
          />
          <Text className="font-inter text-base text-gray-800 dark:text-gray-100">
            {colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          className="flex-row items-center gap-3 rounded-xl bg-brand-accent px-3 py-3">
          <MaterialIcons name="logout" size={20} color="#ffffff" />
          <Text className="font-inter text-base font-semibold text-white">Logout</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Fragment>
      <View className="hidden h-full w-72 shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950 lg:flex">
        {content}
      </View>
      {isVisible && (
        <Pressable
          onPress={onClose}
          className="absolute inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}
      {isVisible && (
        <View className="absolute left-0 top-0 z-50 h-full w-72 lg:hidden">
          {content}
        </View>
      )}
    </Fragment>
  );
}


