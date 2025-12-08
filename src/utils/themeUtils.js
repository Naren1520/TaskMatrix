/**
 * Theme configurations for the app
 */

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  OCEAN: 'ocean',
  FOREST: 'forest',
  SUNSET: 'sunset',
  CHERRY: 'cherry',
  LAVENDER: 'lavender',
  MINT: 'mint',
  CUSTOM: 'custom'
};

/**
 * Color palette for each theme
 */
export const themeColors = {
  [THEMES.LIGHT]: {
    name: 'Light',
    icon: '☀️',
    background: '#ffffff',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
    cardBg: '#f9fafb',
    hoverBg: '#f3f4f6'
  },

  [THEMES.DARK]: {
    name: 'Dark',
    icon: '🌙',
    background: '#0f172a',
    primary: '#60a5fa',
    secondary: '#34d399',
    accent: '#fbbf24',
    text: '#f1f5f9',
    textMuted: '#cbd5e1',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBg: '#1e293b',
    hoverBg: '#334155'
  },

  [THEMES.OCEAN]: {
    name: 'Ocean',
    icon: '🌊',
    background: '#e0f2fe',
    primary: '#0284c7',
    secondary: '#06b6d4',
    accent: '#00d9ff',
    text: '#0c2d48',
    textMuted: '#0f766e',
    border: '#7dd3fc',
    success: '#06b6d4',
    warning: '#f59e0b',
    error: '#f87171',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%)',
    cardBg: '#f0f9ff',
    hoverBg: '#e0f2fe'
  },

  [THEMES.FOREST]: {
    name: 'Forest',
    icon: '🌲',
    background: '#ecfdf5',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    text: '#064e3b',
    textMuted: '#047857',
    border: '#a7f3d0',
    success: '#10b981',
    warning: '#d97706',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    cardBg: '#f0fdf4',
    hoverBg: '#dcfce7'
  },

  [THEMES.SUNSET]: {
    name: 'Sunset',
    icon: '🌅',
    background: '#fef3c7',
    primary: '#d97706',
    secondary: '#f97316',
    accent: '#fb923c',
    text: '#78350f',
    textMuted: '#b45309',
    border: '#fcd34d',
    success: '#f59e0b',
    warning: '#d97706',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fef08a 100%)',
    cardBg: '#fffbeb',
    hoverBg: '#fef3c7'
  },

  [THEMES.CHERRY]: {
    name: 'Cherry',
    icon: '🍒',
    background: '#ffe4e6',
    primary: '#be123c',
    secondary: '#ec4899',
    accent: '#f472b6',
    text: '#500724',
    textMuted: '#831843',
    border: '#fbcfe8',
    success: '#ec4899',
    warning: '#f43f5e',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #ffe4e6 0%, #ffcdd2 100%)',
    cardBg: '#fff1f2',
    hoverBg: '#ffe4e6'
  },

  [THEMES.LAVENDER]: {
    name: 'Lavender',
    icon: '💜',
    background: '#f3e8ff',
    primary: '#7c3aed',
    secondary: '#a855f7',
    accent: '#d8b4fe',
    text: '#4c1d95',
    textMuted: '#6b21a8',
    border: '#e9d5ff',
    success: '#a855f7',
    warning: '#f59e0b',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
    cardBg: '#faf5ff',
    hoverBg: '#f3e8ff'
  },

  [THEMES.MINT]: {
    name: 'Mint',
    icon: '🌿',
    background: '#ccfbf1',
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#2dd4bf',
    text: '#134e4a',
    textMuted: '#0f766e',
    border: '#99f6e4',
    success: '#14b8a6',
    warning: '#f59e0b',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #ccfbf1 0%, #b2f5ea 100%)',
    cardBg: '#f0fdfa',
    hoverBg: '#d1faf7'
  }
};

/**
 * Get all available themes
 */
export const getAvailableThemes = () => {
  return Object.keys(themeColors)
    .filter(key => key !== THEMES.CUSTOM)
    .map(key => ({
      id: key,
      ...themeColors[key]
    }));
};

/**
 * Apply theme colors to document
 */
export const applyTheme = (themeName, customColors = null) => {
  const colors = customColors || themeColors[themeName];

  if (!colors) return;

  // Update CSS variables
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const cssVar = `--color-${key}`;
      root.style.setProperty(cssVar, value);
    }
  });

  // Apply theme to body
  document.documentElement.setAttribute('data-theme', themeName);

  // Also apply immediate styles for background and text to body for quicker visual feedback
  try {
    document.body.style.background = colors.background || '';
    document.body.style.color = colors.text || '';
  } catch {
    // ignore in non-browser contexts
  }

  // Inject CSS overrides for key UI parts (header, themed buttons, cards)
  const styleId = 'theme-overrides';
  let styleEl = document.getElementById(styleId);
  const safeGradient = colors.gradient || colors.background || '';
  const css = `
    [data-theme="${themeName}"] .app-header { background: ${safeGradient} !important; }
    [data-theme="${themeName}"] .themed-primary { background-color: ${colors.primary} !important; color: ${colors.text} !important; }
    [data-theme="${themeName}"] .card-bg-override { background-color: ${colors.cardBg || colors.background} !important; color: ${colors.text} !important; }
  `;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
};

/**
 * Get current theme from localStorage or system preference
 */
export const getCurrentTheme = () => {
  const saved = localStorage.getItem('appTheme');
  if (saved) return saved;

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }

  return THEMES.LIGHT;
};

/**
 * Save theme preference
 */
export const saveThemePreference = (themeName, customColors = null) => {
  localStorage.setItem('appTheme', themeName);
  // If saving a custom theme and colors are provided, persist and apply them
  if (themeName === THEMES.CUSTOM) {
    if (customColors) {
      saveCustomTheme(customColors);
      return;
    }

    // Otherwise try to apply stored custom theme
    const custom = getCustomTheme();
    if (custom) {
      applyTheme(THEMES.CUSTOM, custom);
      return;
    }
    return;
  }

  // For light/dark mode toggles we do NOT apply full theme overrides here.
  // This preserves the previous behavior where toggling dark mode only adds/removes the `dark` class.
  if (themeName === THEMES.LIGHT || themeName === THEMES.DARK) {
    // store only, do not call applyTheme to avoid overriding Tailwind utility colors
    return;
  }

  // For other preset themes (ocean, forest, etc.) apply their overrides
  applyTheme(themeName);
};

/**
 * Get custom theme from localStorage
 */
export const getCustomTheme = () => {
  const saved = localStorage.getItem('customTheme');
  return saved ? JSON.parse(saved) : null;
};

/**
 * Save custom theme to localStorage
 */
export const saveCustomTheme = (customColors, name = 'Custom Theme') => {
  const theme = {
    ...customColors,
    name,
    icon: '🎨'
  };
  localStorage.setItem('customTheme', JSON.stringify(theme));
  // Apply immediately so user sees changes
  applyTheme(THEMES.CUSTOM, customColors);
  return theme;
};

/**
 * Get gradient backgrounds
 */
export const getGradientBackgrounds = () => [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  'linear-gradient(135deg, #2e2e78 0%, #1c1c2e 100%)',
  'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)'
];
