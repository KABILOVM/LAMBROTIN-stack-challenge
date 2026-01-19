
export type Language = 'ru' | 'tg';

export interface User {
  id: string;
  name: string;
  city: string;
  phone: string;
  password?: string;
  registeredAt: string;
  claimedPrizes: string[]; // Array of Prize IDs (titles)
  deliveryRequested: boolean;
}

export interface GameResult {
  id: string;
  userId: string;
  score: number;
  prize: string | null; // This represents the potential prize tier reached in that specific game
  playedAt: string;
  codeUsed: string;
}

export interface PromoCode {
  code: string;
  isUsed: boolean;
  isIssued?: boolean; // Track if code has been given to a player
  assignedTo?: string; // userId
  generatedAt: string;
  invoiceNumber?: string;
  purchaseAmount?: number;
}

export interface PrizeConfig {
    id: string;
    title: string;
    description: string;
    icon: string;
    threshold: number;
    isValuable: boolean;
    isOutOfStock: boolean;
}

export interface Screen {
  type: 'register' | 'code_entry' | 'game' | 'result' | 'admin';
}

export const CITIES = ['Душанбе', 'Худжанд', 'Куляб', 'Бохтар'];

// DEPRECATED CONSTANTS - used for seeding ONLY. 
// Logic moved to backend state.
export const INITIAL_PRIZES: PrizeConfig[] = [
    {
        id: 'TIER_1',
        title: 'Карта «Ёвар»',
        description: 'Обязательный базовый приз. Карта лояльности со скидками в сети «Ёвар».',
        icon: 'card',
        threshold: 10,
        isValuable: false,
        isOutOfStock: false
    },
    {
        id: 'TIER_2',
        title: 'Беспроводные наушники',
        description: 'Удобные наушники с отличным звучанием и долгим зарядом.',
        icon: 'headphones',
        threshold: 20,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_3_TV',
        title: 'Телевизор',
        description: 'Современный Smart TV с ярким экраном для любимых фильмов.',
        icon: 'tv',
        threshold: 30,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_3_WATCH',
        title: 'Смарт часы',
        description: 'Умный гаджет для отслеживания активности и уведомлений.',
        icon: 'watch',
        threshold: 30,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_3_COFFEE',
        title: 'Кофемашина',
        description: 'Для приготовления ароматного кофе каждое утро.',
        icon: 'coffee',
        threshold: 30,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_3_SPEAKER',
        title: 'Беспроводные колонки',
        description: 'Портативная аудиосистема с мощным басом.',
        icon: 'speaker',
        threshold: 30,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_3_HUMIDIFIER',
        title: 'Увлажнитель воздуха',
        description: 'Поддерживает комфортный климат в вашем доме.',
        icon: 'air',
        threshold: 30,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_4_PHONE',
        title: 'Смартфон',
        description: 'Современный смартфон с отличной камерой и быстрым процессором.',
        icon: 'phone',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_4_TABLET',
        title: 'Планшет',
        description: 'Удобный планшет для работы, учебы и развлечений.',
        icon: 'tablet',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_4_BIKE',
        title: 'Велосипед',
        description: 'Надежный велосипед для прогулок и активного отдыха.',
        icon: 'bike',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_4_AC',
        title: 'Кондиционер',
        description: 'Мощный кондиционер для прохлады летом и тепла зимой.',
        icon: 'ac',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_4_VACUUM',
        title: 'Пылесос',
        description: 'Современный пылесос для идеальной чистоты в доме.',
        icon: 'vacuum',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_4_OVEN',
        title: 'Духовая печь',
        description: 'Электрическая печь для выпечки и запекания блюд.',
        icon: 'oven',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false
    },
    {
        id: 'TIER_5',
        title: 'Поездка в Грузию',
        description: 'Главный приз. Незабываемое путешествие: горы, море и гостеприимство.',
        icon: 'trip',
        threshold: 100,
        isValuable: true,
        isOutOfStock: false
    }
];

export const PRIZES = {
  TIER_1: 'Карта «Ёвар»',
  TIER_2: 'Беспроводные наушники',
  TIER_3_TV: 'Телевизор',
  TIER_3_WATCH: 'Смарт часы',
  TIER_3_COFFEE: 'Кофемашина',
  TIER_3_SPEAKER: 'Беспроводные колонки',
  TIER_3_HUMIDIFIER: 'Увлажнитель воздуха',
  TIER_4_PHONE: 'Смартфон',
  TIER_4_TABLET: 'Планшет',
  TIER_4_BIKE: 'Велосипед',
  TIER_4_AC: 'Кондиционер',
  TIER_4_VACUUM: 'Пылесос',
  TIER_4_OVEN: 'Духовая печь',
  TIER_5: 'Поездка в Грузию'
};

export const THRESHOLDS = {
  TIER_1: 10,
  TIER_2: 20,
  TIER_3_TV: 30,
  TIER_3_WATCH: 30,
  TIER_3_COFFEE: 30,
  TIER_3_SPEAKER: 30,
  TIER_3_HUMIDIFIER: 30,
  TIER_4_PHONE: 50,
  TIER_4_TABLET: 50,
  TIER_4_BIKE: 50,
  TIER_4_AC: 50,
  TIER_4_VACUUM: 50,
  TIER_4_OVEN: 50,
  TIER_5: 100
};

export type ScreenType = 'register' | 'code_entry' | 'game' | 'result' | 'admin' | 'profile';
