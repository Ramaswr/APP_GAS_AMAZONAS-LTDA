import React, { useState, useCallback } from 'react';
import { ScrollView, Text, TextInput } from 'react-native';
import styles from '../../styles/globalStyles';
import AppButton from '../common/AppButton';

const RegisterScreen = ({ onRegisterSuccess, onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterAttempt = useCallback(() => {
    onRegisterSuccess({ name, email, password, confirmPassword });
  }, [name, email, password, confirmPassword, onRegisterSuccess]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.loginContainer}>
      <Text style={styles.header}>📝 Criar Conta</Text>
      <Text style={styles.label}>Nome Completo</Text>
      <TextInput style={styles.input} placeholder="Seu nome" value={name} onChangeText={setName} />
      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry />
      <Text style={styles.label}>Confirmar Senha</Text>
      <TextInput style={styles.input} placeholder="Confirme a senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      {/* Envia o formulário e tenta criar o cadastro */}
      <AppButton label="Cadastrar" onPress={handleRegisterAttempt} />
      {/* Volta para a tela de login caso o usuário já possua conta */}
      <AppButton label="Já tem conta? Login" variant="outline" onPress={onBackToLogin} />
    </ScrollView>
  );
};

export default RegisterScreen;
