
export type Language = 'ru' | 'tg';

export type PrizeTier = 'BASIC' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface User {
  id: string;
  name: string;
  city: string;
  phone: string;
  password?: string;
  registeredAt: string;
  claimedPrizes: string[]; 
  deliveryRequested: boolean;
  maxPurchaseTier: PrizeTier; // Track user's highest purchase tier
}

export interface GameResult {
  id: string;
  userId: string;
  score: number;
  prize: string | null; 
  playedAt: string;
  codeUsed: string;
}

export interface PromoCode {
  code: string;
  isUsed: boolean;
  isIssued?: boolean; 
  assignedTo?: string; 
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
    tier: PrizeTier; // New field for categorization
}

export interface CodeRequest {
    id: string;
    userId: string;
    photoData: string; 
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    invoiceNumber?: string;
    purchaseAmount?: number;
    codesIssued?: number;
    createdAt: string;
    photoSizeKb: number;
}

export const CITIES = ['Душанбе', 'Худжанд', 'Куляб', 'Бохтар'];

export const INITIAL_PRIZES: PrizeConfig[] = [
    {
        id: 'TIER_1',
        title: 'Карта «Ёвар»',
        description: 'Обязательный базовый приз. Карта лояльности со скидками в сети «Ёвар».',
        icon: 'card',
        threshold: 10,
        isValuable: false,
        isOutOfStock: false,
        tier: 'BASIC'
    },
    {
        id: 'TIER_2',
        title: 'Беспроводные наушники',
        description: 'Удобные наушники с отличным звучанием и долгим зарядом.',
        icon: 'headphones',
        threshold: 20,
        isValuable: true,
        isOutOfStock: false,
        tier: 'BRONZE'
    },
    {
        id: 'TIER_3_TV',
        title: 'Телевизор',
        description: 'Современный Smart TV с ярким экраном для любимых фильмов.',
        icon: 'tv',
        threshold: 30,
        isValuable: true,
        isOutOfStock: false,
        tier: 'SILVER'
    },
    {
        id: 'TIER_4_PHONE',
        title: 'Смартфон',
        description: 'Современный смартфон с отличной камерой и быстрым процессором.',
        icon: 'phone',
        threshold: 50,
        isValuable: true,
        isOutOfStock: false,
        tier: 'GOLD'
    },
    {
        id: 'TIER_5',
        title: 'Поездка в Грузию',
        description: 'Главный приз. Незабываемое путешествие: горы, море и гостеприимство.',
        icon: 'trip',
        threshold: 100,
        isValuable: true,
        isOutOfStock: false,
        tier: 'DIAMOND'
    }
];

export type ScreenType = 'register' | 'code_entry' | 'game' | 'result' | 'admin' | 'profile';
