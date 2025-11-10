/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7b1c1c',      // Primary Red - Buttons, active icons, highlights
          accent: '#a33c3c',       // Accent Red - Hover states, alerts, emphasis
          soft: '#d86a6a',         // Soft Red - Secondary elements, info tags
          tint: '#faeaea',         // Light Tint - Card backgrounds, subtle highlights
        },
        // Semantic colors
        error: '#a33c3c',          // Error states (matches accent)
        success: '#d86a6a',        // Success states (matches soft red)
        disabled: '#f0f0f0',       // Disabled states
        disabledText: '#999999',   // Disabled text
        // Text and background
        text: {
          DEFAULT: '#000000',      // Main readable text
          secondary: '#333333',    // Secondary text
          muted: '#555555',        // Muted text
          placeholder: '#999999',  // Placeholder text
        },
        background: {
          DEFAULT: '#ffffff',      // Page backgrounds, card surfaces
          secondary: '#fafafa',    // Secondary backgrounds
        },
        border: {
          DEFAULT: '#e5e5e5',      // Dividers, section separators, inputs
          focus: '#7b1c1c',        // Focus border (matches primary)
          error: '#a33c3c',        // Error border (matches accent)
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        // Legacy support
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'serif'],
        rounded: ['ui-rounded', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        // Typography system - Headings
        'h1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],      // 28-32px range
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],      // 22-26px range
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],      // 18-20px range
        // Body text
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],    // 14-16px range
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],   // 12-14px range
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '300' }], // 12px
      },
      spacing: {
        // 4-Point Spacing Scale - Extends default Tailwind spacing
        // Default Tailwind already provides: 0, 1 (0.25rem/4px), 2 (0.5rem/8px), 3 (0.75rem/12px), 
        // 4 (1rem/16px), 6 (1.5rem/24px), 8 (2rem/32px), 12 (3rem/48px), 16 (4rem/64px)
        // Custom aliases for semantic clarity (these extend, not replace, default spacing)
        'xs': '0.25rem',   // 4px - Tight spacing, icons (alias for p-1)
        'sm': '0.5rem',    // 8px - Compact elements (alias for p-2)
        'md': '0.75rem',   // 12px - Small gaps (alias for p-3)
        'base': '1rem',    // 16px - Standard padding (minimum) (alias for p-4)
        'lg': '1.5rem',    // 24px - Section spacing (alias for p-6)
        'xl': '2rem',      // 32px - Large gaps (alias for p-8)
        '2xl': '3rem',     // 48px - Major sections (alias for p-12)
        '3xl': '4rem',     // 64px - Page-level spacing (alias for p-16)
      },
      borderRadius: {
        'xl': '12px',   // Standard button radius
        '2xl': '16px',  // Card radius
        'lg': '8px',    // Input radius
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

