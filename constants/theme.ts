/**
 * SIRE TECH Admin UI Design System
 * 
 * This file contains the brand palette, typography system, and spacing constants
 * used throughout the admin interface. Colors are neutralized reds designed for
 * long-term readability in admin contexts.
 * 
 * Design Philosophy: Corporate • Minimal • Efficient • Redefined
 */

import { Platform } from 'react-native';

// ============================================================================
// BRAND PALETTE - SIRE TECH Brand Colors
// ============================================================================

/**
 * SIRE TECH Brand Colors - Neutralized Reds for Admin Readability
 */
export const BrandColors = {
  // Primary Brand Colors
  primary: '#7b1c1c',      // Primary Red - Buttons, active icons, highlights
  accent: '#a33c3c',       // Accent Red - Hover states, alerts, emphasis
  soft: '#d86a6a',         // Soft Red - Secondary elements, info tags
  lightTint: '#faeaea',    // Light Tint - Card tints, backgrounds
  
  // Neutral Colors
  text: '#000000',         // Main readable text
  background: '#ffffff',   // Page background
  border: '#e5e5e5',       // Dividers, section separators
  
  // Semantic Colors
  error: '#a33c3c',        // Error states (matches accent)
  success: '#d86a6a',      // Success states (matches soft red)
  disabled: '#f0f0f0',     // Disabled states
  disabledText: '#999999', // Disabled text
};

// ============================================================================
// LEGACY COLORS - For backward compatibility with themed components
// ============================================================================

const tintColorLight = BrandColors.primary;  // Updated to use brand primary
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,  // Updated to use brand primary
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

/**
 * Typography System - Consistent typography for visual hierarchy
 */
export const Typography = {
  // Headings
  h1: {
    fontFamily: 'Poppins',
    fontWeight: '700' as const,
    fontSize: 28,  // 28-32px range
    color: BrandColors.text,
    lineHeight: 33.6, // 1.2x font size
  },
  h2: {
    fontFamily: 'Poppins',
    fontWeight: '600' as const,
    fontSize: 24,  // 22-26px range
    color: BrandColors.text,
    lineHeight: 31.2, // 1.3x font size
  },
  h3: {
    fontFamily: 'Poppins',
    fontWeight: '600' as const,
    fontSize: 20,  // 18-20px range
    color: BrandColors.text,
    lineHeight: 28, // 1.4x font size
  },
  
  // Body Text
  body: {
    fontFamily: 'Inter',
    fontWeight: '400' as const,
    fontSize: 16,  // 14-16px range
    color: '#111111',
    lineHeight: 25.6, // 1.6x font size
  },
  
  // Caption/Labels
  caption: {
    fontFamily: 'Inter',
    fontWeight: '300' as const,
    fontSize: 12,
    color: '#555555',
    lineHeight: 16.8, // 1.4x font size
  },
  
  // Small text
  small: {
    fontFamily: 'Inter',
    fontWeight: '400' as const,
    fontSize: 14,  // 12-14px range
    color: '#333333',
    lineHeight: 21, // 1.5x font size
  },
};

// ============================================================================
// FONT FAMILIES
// ============================================================================

/**
 * Platform-specific font fallbacks
 */
export const Fonts = Platform.select({
  ios: {
    poppins: 'Poppins',
    inter: 'Inter',
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  android: {
    poppins: 'Poppins',
    inter: 'Inter',
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    poppins: "'Poppins', system-ui, sans-serif",
    inter: "'Inter', system-ui, sans-serif",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    poppins: 'Poppins',
    inter: 'Inter',
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

// ============================================================================
// SPACING SYSTEM
// ============================================================================

/**
 * 4-Point Scale for consistent spacing
 */
export const Spacing = {
  xs: 4,      // Tight spacing, icons
  sm: 8,      // Compact elements
  md: 12,     // Small gaps
  base: 16,   // Standard padding (minimum)
  lg: 24,     // Section spacing
  xl: 32,     // Large gaps
  '2xl': 48,  // Major sections
  '3xl': 64,  // Page-level spacing (max on desktop)
};

// Tailwind spacing equivalents:
// p-2 (8px) | p-4 (16px) | gap-6 (24px) | py-8 (32px)

// ============================================================================
// USAGE GUIDELINES
// ============================================================================

/**
 * Usage Guidelines:
 * - Minimum padding: 16px (p-4)
 * - Section spacing: 64px desktop, 32px mobile
 * - Maintain vertical rhythm using the 4-point scale
 * - Use red colors strategically to guide attention
 * - Maintain neutral backgrounds for content readability
 * - Ensure contrast ratios meet WCAG AA standards (≥4.5:1)
 */
