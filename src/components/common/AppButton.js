import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  icon,
}) => {
  const { themeColors } = useTheme();
  const { backgroundColor, borderColor, computedTextColor } = useMemo(() => {
    const palette = {
      primary: themeColors.primary,
      secondary: themeColors.secondary,
      outline: 'transparent',
    };
    const isOutline = variant === 'outline';
    const bg = isOutline ? 'transparent' : palette[variant] || palette.primary;
    const border = isOutline ? themeColors.accent : 'transparent';
    const textColor = isOutline
      ? themeColors.accent
      : variant === 'secondary'
        ? themeColors.onSecondary
        : themeColors.onPrimary;
    return { backgroundColor: bg, borderColor: border, computedTextColor: textColor };
  }, [themeColors, variant]);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.6 : 1,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor,
          shadowColor: themeColors.mode === 'dark' ? '#000' : '#000',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: computedTextColor }, textStyle]}>
        {icon ? `${icon} ${label}` : label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AppButton;
