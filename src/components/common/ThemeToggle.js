import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

const ThemeToggle = ({ showHint = true }) => {
  const { themeMode, toggleTheme, themeColors, styles } = useTheme();

  return (
    <View style={styles.themeToggle}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.themeToggleText}>
          {themeMode === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}
        </Text>
        {showHint && (
          <Text style={styles.themeToggleHint}>
            Preferência salva automaticamente para manter conforto visual.
          </Text>
        )}
      </View>
      <Switch
        value={themeMode === 'dark'}
        onValueChange={toggleTheme}
        trackColor={{ false: themeColors.border, true: themeColors.primary }}
        thumbColor={themeMode === 'dark' ? '#f8fafc' : '#ffffff'}
      />
    </View>
  );
};

export default ThemeToggle;
