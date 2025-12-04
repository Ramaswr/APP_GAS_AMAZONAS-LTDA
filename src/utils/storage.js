import AsyncStorage from '@react-native-async-storage/async-storage';

export const readJson = async (key, fallback = null) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Falha ao ler ${key}`, e);
    try {
      await AsyncStorage.removeItem(key);
    } catch (clearErr) {
      console.warn('Falha ao limpar chave corrompida', clearErr);
    }
    return fallback;
  }
};

export const writeJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Falha ao salvar ${key}`, e);
    return false;
  }
};
