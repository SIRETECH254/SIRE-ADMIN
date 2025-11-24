import type { ComponentProps } from 'react';
import type { Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type AuthNavItem = {
  label: string;
  description?: string;
  href: Href;
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

export const AUTH_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/(authenticated)/',
    icon: 'dashboard',
  },
  {
    label: 'Clients',
    href: '/(authenticated)/clients',
    icon: 'group',
  },
  {
    label: 'Services',
    href: '/(authenticated)/services',
    icon: 'build',
  },
  {
    label: 'Quotations',
    href: '/(authenticated)/quotations',
    icon: 'description',
  },
  {
    label: 'Invoices',
    href: '/(authenticated)/invoices',
    icon: 'receipt-long',
  },
  {
    label: 'Payments',
    href: '/(authenticated)/payments',
    icon: 'account-balance-wallet',
  },
  {
    label: 'Projects',
    href: '/(authenticated)/projects',
    icon: 'work',
  },
  {
    label: 'Testimonials',
    href: '/(authenticated)/testimonials',
    icon: 'rate-review',
  },
  {
    label: 'Notifications',
    href: '/(authenticated)/notifications',
    icon: 'notifications',
  },
  {
    label: 'Contact',
    href: '/(authenticated)/contact',
    icon: 'mail',
  },
  {
    label: 'Users',
    href: '/(authenticated)/users',
    icon: 'admin-panel-settings',
  },
  {
    label: 'Profile',
    href: '/(authenticated)/profile',
    icon: 'person',
  },
  {
    label: 'Settings',
    href: '/(authenticated)/settings',
    icon: 'settings',
  },
] as const satisfies ReadonlyArray<AuthNavItem>;


