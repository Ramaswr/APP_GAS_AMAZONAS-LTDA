import React, { useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from '../../styles/globalStyles';
import AppButton from '../common/AppButton';
import { CLIENT_CREDENTIALS } from '../../constants/users';

const LoginScreen = ({ onLogin, onBackToSelection, onNavigateToRegister, registeredUsers }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginAttempt = useCallback(() => {
    onLogin(user, password);
  }, [user, password, onLogin]);

  return (
    <View style={[styles.container, styles.loginContainer]}>
      <Text style={styles.header}>🔐 Login</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Credenciais Padrão:</Text>
        <Text style={{ fontSize: 13, color: '#666', marginTop: 8 }}>📧 {CLIENT_CREDENTIALS.user}</Text>
        <Text style={{ fontSize: 13, color: '#666' }}>🔑 {CLIENT_CREDENTIALS.pass}</Text>
      </View>
      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} placeholder="seu@email.com" value={user} onChangeText={setUser} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} placeholder="Sua senha" value={password} onChangeText={setPassword} secureTextEntry />
      {/* Valida as credenciais informadas e tenta autenticar */}
      <AppButton label="Entrar" onPress={handleLoginAttempt} />
      {/* Redireciona para o fluxo de cadastro */}
      <AppButton label="Novo cliente? Cadastre-se" variant="outline" onPress={onNavigateToRegister} />
      {/* Sai da tela de login voltando para a seleção de perfis */}
      <AppButton label="Voltar" variant="secondary" onPress={onBackToSelection} style={{ marginTop: 10 }} />
    </View>
  );
};

export default LoginScreen;
