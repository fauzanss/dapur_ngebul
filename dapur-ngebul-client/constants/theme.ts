/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Dapur Ngebul Palette
// Fire Red, Burnt Orange, Dark Brown, Warm Gold, Charcoal Black, Coffee Beige, Salmon Light
const FireRed = '#B22222';
const BurntOrange = '#FF8C00';
const DarkBrown = '#3B1F0B';
const WarmGold = '#D4A15E';
const CharcoalBlack = '#1A1A1A';
const CoffeeBeige = '#C6A77B';
const SalmonLight = '#F4B07D';
const SuccessGreen = '#2E7D32';

const tintColorLight = FireRed;
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    text: CharcoalBlack,
    background: CoffeeBeige,
    tint: tintColorLight,
    icon: WarmGold,
    tabIconDefault: WarmGold,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: DarkBrown,
    tint: tintColorDark,
    icon: WarmGold,
    tabIconDefault: WarmGold,
    tabIconSelected: tintColorDark,
  },
};

export const Brand = {
  FireRed,
  BurntOrange,
  DarkBrown,
  WarmGold,
  CharcoalBlack,
  CoffeeBeige,
  SalmonLight,
  SuccessGreen,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
