import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, usePathname, useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { AUTH_NAV_ITEMS } from '@/constants/navigation';

type HeaderProps = {
  onToggleSidebar: (event?: GestureResponderEvent) => void;
  isSidebarOpen: boolean;
};

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme } = useThemeToggle();

  const activeNav = useMemo(() => {
    const match = AUTH_NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
    return match?.label ?? 'Dashboard';
  }, [pathname]);

  const userInitials = useMemo(() => {
    if (!user) return 'U';
    const initials = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((value) => value?.[0]?.toUpperCase())
      .join('');
    return initials || 'U';
  }, [user]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  const handleProfile = () => {
    setIsMenuOpen(false);
    router.push('/(authenticated)/profile');
  };

  return (
    <View className="relative z-20 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          className="lg:hidden rounded-full p-2 bg-gray-100 dark:bg-gray-800"
          onPress={onToggleSidebar}>
          <MaterialIcons
            name={isSidebarOpen ? 'close' : 'menu'}
            size={22}
            color={colorScheme === 'dark' ? '#ffffff' : '#111827'}
          />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Image
            source={require('@/assets/images/icon.png')}
            resizeMode="contain"
            style={{ height: 32, width: 32, borderRadius: 8 }}
          />
          <Text className="font-poppins text-xl font-semibold text-brand-primary">
            Sire Admin
          </Text>
        </View>
      </View>

      <View className="hidden flex-1 flex-row items-center justify-center lg:flex">
        <Text className="font-inter text-base text-gray-600 dark:text-gray-300">
          {activeNav}
        </Text>
      </View>

      <View className="flex-row items-center gap-4">
        <Link
          href="/(authenticated)/notifications"
          className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
          <MaterialIcons
            name="notifications-none"
            size={22}
            color={colorScheme === 'dark' ? '#ffffff' : '#111827'}
          />
        </Link>
        <View className="relative">
          <Pressable
            onPress={() => setIsMenuOpen((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Account menu"
            className="h-10 w-10 items-center justify-center rounded-full bg-brand-primary">
            <Text className="font-inter text-base font-semibold text-white">
              {userInitials}
            </Text>
          </Pressable>
          {isMenuOpen && (
            <View className="absolute right-0 z-10 mt-3 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <Text className="font-poppins text-lg font-semibold text-brand-primary">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </Text>
              <Text className="mt-1 font-inter text-sm text-gray-600 dark:text-gray-300">
                {user?.email ?? 'No email available'}
              </Text>
              <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <Pressable
                  onPress={handleProfile}
                  className="flex-row items-center gap-2 rounded-lg px-2 py-2 hover:bg-brand-tint dark:hover:bg-gray-800">
                  <MaterialIcons
                    name="manage-accounts"
                    size={20}
                    color={colorScheme === 'dark' ? '#f3f4f6' : '#111827'}
                  />
                  <Text className="font-inter text-sm text-gray-700 dark:text-gray-200">
                    View Profile
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleLogout}
                  className="mt-2 flex-row items-center gap-2 rounded-lg px-2 py-2 hover:bg-brand-tint dark:hover:bg-gray-800">
                  <MaterialIcons name="logout" size={20} color="#a33c3c" />
                  <Text className="font-inter text-sm text-brand-accent">Logout</Text>
                </Pressable>
              </View>
            </View>
          )}
          {isMenuOpen && (
            <Pressable
              onPress={() => setIsMenuOpen(false)}
              className="absolute right-0 top-0 h-10 w-10"
              accessibilityElementsHidden
            />
          )}
        </View>
      </View>
    </View>
  );
}


