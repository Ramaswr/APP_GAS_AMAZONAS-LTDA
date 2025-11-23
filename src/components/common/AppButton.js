import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#1ABC9C',
  secondary: '#6C757D',
  outline: '#FFFFFF',
};

const AppButton = ({ label, onPress, variant = 'primary', style, textStyle, disabled = false, icon }) => {
  const isOutline = variant === 'outline';
  const backgroundColor = isOutline ? 'transparent' : (COLORS[variant] || COLORS.primary);
  const borderColor = isOutline ? '#007BFF' : 'transparent';
  const computedTextColor = isOutline ? '#007BFF' : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.6 : 1,
          borderWidth: isOutline ? 2 : 0,
          borderColor,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: computedTextColor }, textStyle]}>{icon ? `${icon} ${label}` : label}</Text>
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
    shadowColor: '#000',
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
