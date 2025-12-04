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

export const PAYMENT_OPTIONS = [
  { key: 'Dinheiro', label: 'Dinheiro', icon: '💵' },
  { key: 'PIX', label: 'PIX', icon: '⚡' },
  { key: 'Cartão', label: 'Cartão', icon: '💳' },
];
