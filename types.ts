
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

// Helper to define tier-specific prize metadata with increasing value
const TIER_METADATA: Record<PrizeTier, any> = {
    BASIC: {},
    BRONZE: {
        5: [{ title: 'Карта «Ёвар» Bronze', desc: 'Скидки и бонусы уровня Bronze.', icon: 'card' }],
        10: [
            { title: 'Брендовая кепка', desc: 'Стильный летний аксессуар.', icon: 'air' },
            { title: 'Кружка Belinda', desc: 'Керамическая кружка с лого.', icon: 'coffee' },
            { title: 'Брелок-фонарик', desc: 'Полезная мелочь в кармане.', icon: 'watch' }
        ],
        15: [
            { title: 'Зонт Belinda', desc: 'Защита от дождя и солнца.', icon: 'trip' },
            { title: 'Флешка 32ГБ', desc: 'Для ваших важных документов.', icon: 'tablet' },
            { title: 'Коврик для мыши', desc: 'Гладкое скольжение.', icon: 'tablet' }
        ],
        20: [
            { title: 'Проводная мышь', desc: 'Надежное управление.', icon: 'tablet' },
            { title: 'Наушники вкладыши', desc: 'Простота и звук.', icon: 'headphones' },
            { title: 'Настольная лампа', desc: 'Свет для рабочего стола.', icon: 'watch' }
        ],
        30: [
            { title: 'Тостер Basic', desc: 'Хрустящий завтрак каждый день.', icon: 'oven' },
            { title: 'Ручной миксер', desc: 'Помощник в выпечке.', icon: 'coffee' },
            { title: 'Фен для волос', desc: 'Быстрая сушка.', icon: 'air' }
        ],
        50: [
            { title: 'Микроволновка', desc: 'Быстрый разогрев еды.', icon: 'oven' },
            { title: 'Бюджетный планшет', desc: 'Для чтения и видео.', icon: 'tablet' },
            { title: 'Мини-холодильник', desc: 'Компактный холод.', icon: 'oven' }
        ]
    },
    SILVER: {
        5: [{ title: 'Карта «Ёвар» Silver', desc: 'Повышенный кэшбэк и бонусы Silver.', icon: 'card' }],
        10: [
            { title: 'Термос 1л', desc: 'Держит тепло весь день.', icon: 'coffee' },
            { title: 'Спортивная сумка', desc: 'Для походов в зал.', icon: 'trip' },
            { title: 'Настенные часы', desc: 'Украшение интерьера.', icon: 'watch' }
        ],
        15: [
            { title: 'Powerbank 10k', desc: 'Заряда хватит на два раза.', icon: 'phone' },
            { title: 'Мультитул 12 в 1', desc: 'Инструмент на все случаи.', icon: 'watch' },
            { title: 'BT-мышь', desc: 'Работа без проводов.', icon: 'tablet' }
        ],
        20: [
            { title: 'TWS Наушники', desc: 'Стильные и компактные.', icon: 'headphones' },
            { title: 'Фитнес-трекер', desc: 'Следите за здоровьем.', icon: 'watch' },
            { title: 'Электрочайник', desc: 'Стиль на вашей кухне.', icon: 'coffee' }
        ],
        30: [
            { title: 'Аэрогриль', desc: 'Здоровая еда без масла.', icon: 'oven' },
            { title: 'Соковыжималка', desc: 'Свежий сок каждое утро.', icon: 'coffee' },
            { title: 'Утюг с паром', desc: 'Идеальные складки.', icon: 'air' }
        ],
        50: [
            { title: 'Проектор HD', desc: 'Кинотеатр в спальне.', icon: 'tv' },
            { title: 'iPad Mini', desc: 'Мощь в малом корпусе.', icon: 'tablet' },
            { title: 'Приставка Retro', desc: 'Классика игр.', icon: 'tv' }
        ]
    },
    GOLD: {
        5: [{ title: 'Карта «Ёвар» Gold', desc: 'Золотой статус и эксклюзивные скидки.', icon: 'card' }],
        10: [
            { title: 'Кожаный кошелек', desc: 'Премиальное качество.', icon: 'card' },
            { title: 'Худи Belinda Pro', desc: 'Качественный хлопок.', icon: 'air' },
            { title: 'Авто-компрессор', desc: 'Для вашего автомобиля.', icon: 'watch' }
        ],
        15: [
            { title: 'Powerbank 20k', desc: 'Мощный заряд для всего.', icon: 'phone' },
            { title: 'Умные весы Pro', desc: 'Анализ состава тела.', icon: 'watch' },
            { title: 'Рюкзак Urban', desc: 'Защита для ноутбука.', icon: 'trip' }
        ],
        20: [
            { title: 'Smart Watch 4', desc: 'Функционал и стиль.', icon: 'watch' },
            { title: 'ANC Наушники', desc: 'Тишина в любом месте.', icon: 'headphones' },
            { title: 'Авто-пылесос', desc: 'Чистота в салоне.', icon: 'vacuum' }
        ],
        30: [
            { title: 'Эспрессо-машина', desc: 'Настоящий кофе дома.', icon: 'coffee' },
            { title: 'Робот-пылесос', desc: 'Чистота без участия.', icon: 'vacuum' },
            { title: 'Гриль-пресс', desc: 'Идеальные стейки.', icon: 'oven' }
        ],
        50: [
            { title: 'Smart TV 50"', desc: 'Кино в 4К разрешении.', icon: 'tv' },
            { title: 'Ноутбук Office', desc: 'Для работы и учебы.', icon: 'tablet' },
            { title: 'Смартфон 5G', desc: 'Скорость и мощь.', icon: 'phone' }
        ]
    },
    DIAMOND: {
        5: [{ title: 'Карта «Ёвар» Diamond', desc: 'Максимальные привилегии Diamond уровня.', icon: 'card' }],
        10: [
            { title: 'Серебряная монета', desc: 'Инвестиция в будущее.', icon: 'watch' },
            { title: 'Ручка Parker', desc: 'Для важных подписей.', icon: 'tablet' },
            { title: 'AirTag 4-pack', desc: 'Никогда не теряйте вещи.', icon: 'watch' }
        ],
        15: [
            { title: 'MagSafe Duo', desc: 'Зарядка для iPhone и Watch.', icon: 'phone' },
            { title: 'Hi-Fi Наушники', desc: 'Звук без компромиссов.', icon: 'headphones' },
            { title: 'Массажер Gun', desc: 'Для восстановления мышц.', icon: 'watch' }
        ],
        20: [
            { title: 'Apple Watch S9', desc: 'Последнее поколение.', icon: 'watch' },
            { title: 'Sony XM5', desc: 'Лучшее шумоподавление.', icon: 'headphones' },
            { title: 'HomePod Pro', desc: 'Звук заполняющий комнату.', icon: 'speaker' }
        ],
        30: [
            { title: 'Фен Dyson', desc: 'Профессиональный уход.', icon: 'air' },
            { title: 'Робот-пылесос Gen 2', desc: 'Станция самоочистки.', icon: 'vacuum' },
            { title: 'KitchenAid Mixer', desc: 'Легенда на кухне.', icon: 'coffee' }
        ],
        50: [
            { title: 'iPhone 15 Pro', desc: 'Титан и мощь.', icon: 'phone' },
            { title: 'Путевка в Дубай', desc: 'Отпуск вашей мечты.', icon: 'trip' },
            { title: 'Электросамокат Pro', desc: 'Премиум транспорт.', icon: 'bike' }
        ]
    }
};

const generateTierPrizes = (tier: PrizeTier, prefix: string): PrizeConfig[] => {
    const meta = TIER_METADATA[tier];
    const result: PrizeConfig[] = [];

    [5, 10, 15, 20, 30, 50].forEach(points => {
        const items = meta[points];
        items.forEach((item: any, idx: number) => {
            result.push({
                id: `${prefix}_${points}_${idx + 1}`,
                title: item.title,
                description: item.desc,
                icon: item.icon,
                threshold: points,
                isValuable: points >= 10,
                isOutOfStock: false,
                tier
            });
        });
    });

    return result;
};

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
    ...generateTierPrizes('BRONZE', 'BR'),
    ...generateTierPrizes('SILVER', 'SL'),
    ...generateTierPrizes('GOLD', 'GD'),
    ...generateTierPrizes('DIAMOND', 'DM'),
];

export type ScreenType = 'register' | 'code_entry' | 'game' | 'result' | 'admin' | 'profile';
