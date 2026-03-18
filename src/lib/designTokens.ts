// Design tokens for REET TV
// Centralized design system values

export const designTokens = {
  // Colors
  colors: {
    // Primary
    primary: {
      50: 'hsl(220, 100%, 96%)',
      100: 'hsl(220, 100%, 92%)',
      200: 'hsl(220, 100%, 84%)',
      300: 'hsl(220, 100%, 76%)',
      400: 'hsl(220, 100%, 68%)',
      500: 'hsl(220, 90%, 56%)',
      600: 'hsl(220, 85%, 44%)',
      700: 'hsl(220, 80%, 32%)',
      800: 'hsl(220, 75%, 20%)',
      900: 'hsl(220, 70%, 10%)',
    },
    // Secondary
    secondary: {
      50: 'hsl(280, 100%, 96%)',
      100: 'hsl(280, 100%, 92%)',
      200: 'hsl(280, 100%, 84%)',
      300: 'hsl(280, 100%, 76%)',
      400: 'hsl(280, 100%, 68%)',
      500: 'hsl(280, 90%, 56%)',
      600: 'hsl(280, 85%, 44%)',
      700: 'hsl(280, 80%, 32%)',
      800: 'hsl(280, 75%, 20%)',
      900: 'hsl(280, 70%, 10%)',
    },
    // Accent
    accent: {
      50: 'hsl(20, 100%, 96%)',
      100: 'hsl(20, 100%, 92%)',
      200: 'hsl(20, 100%, 84%)',
      300: 'hsl(20, 100%, 76%)',
      400: 'hsl(20, 100%, 68%)',
      500: 'hsl(20, 90%, 56%)',
      600: 'hsl(20, 85%, 44%)',
      700: 'hsl(20, 80%, 32%)',
      800: 'hsl(20, 75%, 20%)',
      900: 'hsl(20, 70%, 10%)',
    },
    // Semantic
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(207, 89%, 50%)',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ],
      mono: [
        'Menlo',
        'Monaco',
        '"Courier New"',
        'monospace',
      ],
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '28px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36px'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '48px'],
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    glow: '0 0 20px 0 rgba(59, 130, 246, 0.5)',
    'glow-lg': '0 0 40px 0 rgba(59, 130, 246, 0.75)',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Transitions
  transitions: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  // Z-index
  zIndex: {
    hide: '-1',
    base: '0',
    dropdown: '100',
    sticky: '200',
    fixed: '300',
    modal: '400',
    popover: '500',
    tooltip: '600',
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Utility function to access tokens
export const getToken = <T>(path: string, defaultValue?: T): T | undefined => {
  const value = path.split('.').reduce<Record<string, unknown> | undefined>((current, segment) => {
    return current?.[segment] as Record<string, unknown> | undefined;
  }, designTokens as Record<string, unknown>);
  return (value as T) ?? defaultValue;
};

// CSS variables generator
export const generateCSSVariables = (): string => {
  const vars: string[] = [];

  // Primary colors
  Object.entries(designTokens.colors.primary).forEach(([key, value]) => {
    vars.push(`  --color-primary-${key}: ${value};`);
  });

  // Secondary colors
  Object.entries(designTokens.colors.secondary).forEach(([key, value]) => {
    vars.push(`  --color-secondary-${key}: ${value};`);
  });

  // Accent colors
  Object.entries(designTokens.colors.accent).forEach(([key, value]) => {
    vars.push(`  --color-accent-${key}: ${value};`);
  });

  // Semantic colors
  vars.push(`  --color-success: ${designTokens.colors.success};`);
  vars.push(`  --color-warning: ${designTokens.colors.warning};`);
  vars.push(`  --color-error: ${designTokens.colors.error};`);
  vars.push(`  --color-info: ${designTokens.colors.info};`);

  return `:root {\n${vars.join('\n')}\n}`;
};
