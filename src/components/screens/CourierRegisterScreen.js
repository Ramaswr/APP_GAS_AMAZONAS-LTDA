import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import AppButton from '../common/AppButton';

const INITIAL_FORM = {
  name: '',
  cpf: '',
  cep: '',
  vehicleBrand: '',
  vehicleDescription: '',
};

const CourierRegisterScreen = ({ onSave, onCancel }) => {
  const { styles, themeColors } = useTheme();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isFormDirty = useMemo(
    () => Object.values(form).some((value) => value && value.length > 0),
    [form]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Informe o nome completo.';
    }
    const cpfDigits = form.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      nextErrors.cpf = 'CPF precisa ter 11 dígitos.';
    }
    const cepDigits = form.cep.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      nextErrors.cep = 'CEP precisa ter 8 dígitos.';
    }
    if (!form.vehicleBrand.trim()) {
      nextErrors.vehicleBrand = 'Informe a marca do veículo.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form });
    setForm(INITIAL_FORM);
  };

  const handleCancel = () => {
    if (isFormDirty) {
      Alert.alert('Descartar cadastro?', 'Os dados preenchidos serão perdidos.', [
        { text: 'Manter preenchimento', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            setForm(INITIAL_FORM);
            onCancel();
          },
        },
      ]);
      return;
    }
    onCancel();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <ThemeToggle showHint={false} />
      <Text style={styles.header}>Cadastro de Entregador</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dados pessoais</Text>
        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do entregador"
          placeholderTextColor={themeColors.mutedText}
          value={form.name}
          onChangeText={(text) => updateField('name', text)}
          autoCapitalize="words"
        />
        {errors.name && <Text style={styles.inputError}>{errors.name}</Text>}

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor={themeColors.mutedText}
          value={form.cpf}
          onChangeText={(text) => updateField('cpf', text)}
          keyboardType="numeric"
          maxLength={14}
        />
        {errors.cpf && <Text style={styles.inputError}>{errors.cpf}</Text>}

        <Text style={styles.label}>CEP</Text>
        <TextInput
          style={styles.input}
          placeholder="69000-000"
          placeholderTextColor={themeColors.mutedText}
          value={form.cep}
          onChangeText={(text) => updateField('cep', text)}
          keyboardType="numeric"
          maxLength={9}
        />
        {errors.cep && <Text style={styles.inputError}>{errors.cep}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Veículo</Text>
        <Text style={styles.label}>Marca / Modelo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Honda CG 160"
          placeholderTextColor={themeColors.mutedText}
          value={form.vehicleBrand}
          onChangeText={(text) => updateField('vehicleBrand', text)}
        />
        {errors.vehicleBrand && (
          <Text style={styles.inputError}>{errors.vehicleBrand}</Text>
        )}

        <Text style={styles.label}>Detalhes adicionais (placa, cor, baú)</Text>
        <TextInput
          style={styles.input}
          placeholder="Informações extras para controle interno"
          placeholderTextColor={themeColors.mutedText}
          value={form.vehicleDescription}
          onChangeText={(text) => updateField('vehicleDescription', text)}
          multiline
        />
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <AppButton label="Salvar entregador" onPress={handleSubmit} />
        <AppButton
          label="Cancelar"
          variant="secondary"
          onPress={handleCancel}
          style={{ marginTop: 12 }}
        />
      </View>
    </ScrollView>
  );
};

export default CourierRegisterScreen;
