const images = {
  gas: require('../../assets/images/gas.png'),
  water: require('../../assets/images/water.png'),
};

export const PRODUCTS = [
  {
    id: 'p13',
    name: 'Gás de Cozinha (P13)',
    price: 105.0,
    weight: '13kg',
    type: 'gas',
    image: images.gas,
  },
  {
    id: 'p7',
    name: 'Gás Econômico (P7)',
    price: 80.0,
    weight: '7kg',
    type: 'gas',
    image: images.gas,
  },
  {
    id: 'p5',
    name: 'Gás Compacto (P5)',
    price: 60.0,
    weight: '5kg',
    type: 'gas',
    image: images.gas,
  },
  {
    id: 'p45',
    name: 'Gás Industrial (P45)',
    price: 380.0,
    weight: '45kg',
    type: 'gas',
    image: images.gas,
  },
  {
    id: 'w20_yara',
    name: 'Água Mineral 20L - Yara',
    price: 10.0,
    weight: '20L',
    type: 'water',
    image: images.water,
  },
  {
    id: 'w20_toya',
    name: 'Água Mineral 20L - Toya',
    price: 8.0,
    weight: '20L',
    type: 'water',
    image: images.water,
  },
  {
    id: 'w20_manaus',
    name: 'Água Manaus Soberano',
    price: 5.0,
    weight: '20L',
    type: 'water',
    image: images.water,
  },
];

export const CARD_BRANDS = [
  {
    name: 'Visa',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Visa_Logo.png/320px-Visa_Logo.png',
  },
  {
    name: 'Mastercard',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Mastercard-logo.png/320px-Mastercard-logo.png',
  },
  {
    name: 'Elo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Elo_card_logo.png/320px-Elo_card_logo.png',
  },
  {
    name: 'Hipercard',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Hipercard_logo.png/320px-Hipercard_logo.png',
  },
  {
    name: 'American Express',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo_%282018%29.svg/512px-American_Express_logo_%282018%29.svg.png',
  },
  {
    name: 'Cabal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Cabal_logo.svg/512px-Cabal_logo.svg.png',
  },
];

export const PAYMENT_OPTIONS = [
  { key: 'Dinheiro', label: 'Dinheiro', icon: '💵' },
  { key: 'PIX', label: 'PIX', icon: '⚡' },
  {
    key: 'CartaoCredito',
    label: 'Cartão de Crédito',
    icon: '💳',
    description: 'Aceitamos todas as bandeiras de cartão de crédito.',
    brands: CARD_BRANDS,
  },
  {
    key: 'CartaoDebito',
    label: 'Cartão de Débito',
    icon: '🏧',
    description: 'Débito com aprovação imediata em qualquer bandeira.',
    brands: CARD_BRANDS,
  },
];
