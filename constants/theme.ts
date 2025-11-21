/**
 * Tema personalizado para GymMaster - Dark Mode Elegante
 */

import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Colores para el tema dark elegante
export const colors = {
  // Colores principales
  primary: '#3B82F6', // Azul moderno
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Colores de fondo
  background: '#0F0F0F', // Negro profundo
  surface: '#1A1A1A', // Gris muy oscuro
  surfaceVariant: '#2A2A2A', // Gris oscuro
  
  // Colores de tarjetas y elementos
  card: '#1F1F1F',
  cardElevated: '#252525',
  
  // Colores de texto
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  
  // Colores de éxito, advertencia y error
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Colores de estado
  active: '#22C55E',
  inactive: '#6B7280',
  
  // Colores de borde
  border: '#333333',
  borderLight: '#404040',
  
  // Colores específicos para el gimnasio
  accent: '#8B5CF6', // Púrpura para acentos
  gym: '#F59E0B', // Naranja para elementos del gimnasio
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

// Tipografía
export const typography = {
  // Tamaños de fuente
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Pesos de fuente
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Espaciado
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Radio de bordes
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 999,
};

// Sombras
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Dimensiones de pantalla
export const screen = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Tema completo
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  screen,
};

// Compatibilidad con el sistema de colores original
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.textSecondary,
    tabIconDefault: colors.textSecondary,
    tabIconSelected: colors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Estilos comunes reutilizables
export const commonStyles = {
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Centrado
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Flexbox helpers
  row: {
    flexDirection: 'row' as const,
  },
  
  column: {
    flexDirection: 'column' as const,
  },
  
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  
  // Tarjetas
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.lg,
  },
  
  // Botones base
  button: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Texto
  textPrimary: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: typography.weights.normal,
  },
  
  textSecondary: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    fontWeight: typography.weights.normal,
  },
  
  textHeading: {
    color: colors.text,
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
  },
  
  // Inputs
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.base,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  // Separadores
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  
  // Loading
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backdrop,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
};
