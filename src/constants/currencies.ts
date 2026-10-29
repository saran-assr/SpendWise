export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
  symbolPosition?: 'prefix' | 'suffix';
  region?: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  // --- Major Global Currencies ---
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2, symbolPosition: 'prefix', region: 'North America' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2, symbolPosition: 'prefix', region: 'Europe' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0, symbolPosition: 'prefix', region: 'Asia' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2, symbolPosition: 'prefix', region: 'North America' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2, symbolPosition: 'prefix', region: 'Oceania' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH', decimals: 2, symbolPosition: 'prefix', region: 'Europe' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', decimals: 2, symbolPosition: 'prefix', region: 'Oceania' },

  // --- Middle East ---
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE', decimals: 2, symbolPosition: 'suffix', region: 'Middle East' },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'en-SA', decimals: 2, symbolPosition: 'suffix', region: 'Middle East' },
  QAR: { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', locale: 'en-QA', decimals: 2, symbolPosition: 'suffix', region: 'Middle East' },
  KWD: { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', locale: 'en-KW', decimals: 3, symbolPosition: 'prefix', region: 'Middle East' },
  BHD: { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', locale: 'en-BH', decimals: 3, symbolPosition: 'prefix', region: 'Middle East' },
  OMR: { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', locale: 'en-OM', decimals: 3, symbolPosition: 'suffix', region: 'Middle East' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', locale: 'he-IL', decimals: 2, symbolPosition: 'prefix', region: 'Middle East' },
  JOD: { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', locale: 'en-JO', decimals: 3, symbolPosition: 'prefix', region: 'Middle East' },

  // --- Asia & Pacific ---
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', decimals: 0, symbolPosition: 'prefix', region: 'Asia' },
  TWD: { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', locale: 'zh-TW', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimals: 0, symbolPosition: 'prefix', region: 'Asia' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', decimals: 0, symbolPosition: 'suffix', region: 'Asia' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  LKR: { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', locale: 'en-LK', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },
  NPR: { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', locale: 'ne-NP', decimals: 2, symbolPosition: 'prefix', region: 'Asia' },

  // --- Europe & Nordics ---
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  DKK: { code: 'DKK', symbol: 'kr.', name: 'Danish Krone', locale: 'da-DK', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU', decimals: 0, symbolPosition: 'suffix', region: 'Europe' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR', decimals: 2, symbolPosition: 'prefix', region: 'Europe' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', locale: 'uk-UA', decimals: 2, symbolPosition: 'suffix', region: 'Europe' },

  // --- Latin America ---
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimals: 2, symbolPosition: 'prefix', region: 'Latin America' },
  MXN: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', locale: 'es-MX', decimals: 2, symbolPosition: 'prefix', region: 'Latin America' },
  CLP: { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso', locale: 'es-CL', decimals: 0, symbolPosition: 'prefix', region: 'Latin America' },
  COP: { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', locale: 'es-CO', decimals: 0, symbolPosition: 'prefix', region: 'Latin America' },
  ARS: { code: 'ARS', symbol: 'ARS$', name: 'Argentine Peso', locale: 'es-AR', decimals: 2, symbolPosition: 'prefix', region: 'Latin America' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', locale: 'es-PE', decimals: 2, symbolPosition: 'prefix', region: 'Latin America' },

  // --- Africa ---
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', decimals: 2, symbolPosition: 'prefix', region: 'Africa' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG', decimals: 2, symbolPosition: 'prefix', region: 'Africa' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', decimals: 2, symbolPosition: 'prefix', region: 'Africa' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'en-EG', decimals: 2, symbolPosition: 'prefix', region: 'Africa' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH', decimals: 2, symbolPosition: 'prefix', region: 'Africa' },
  MAD: { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', locale: 'fr-MA', decimals: 2, symbolPosition: 'suffix', region: 'Africa' },
};

export const DEFAULT_CURRENCY = 'USD';

/**
 * Returns configuration for a given currency code, with fallback to USD or dynamic Intl support
 */
export function getCurrencyConfig(currencyCode: string = 'USD'): CurrencyConfig {
  const upper = (currencyCode || 'USD').toUpperCase();
  if (SUPPORTED_CURRENCIES[upper]) {
    return SUPPORTED_CURRENCIES[upper];
  }
  // Dynamic fallback for any ISO currency code
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: upper }).formatToParts(0);
    const sym = parts.find((p) => p.type === 'currency')?.value || upper;
    return {
      code: upper,
      symbol: sym,
      name: `${upper} Currency`,
      locale: 'en-US',
      decimals: 2,
      symbolPosition: 'prefix',
      region: 'Other',
    };
  } catch {
    return SUPPORTED_CURRENCIES.USD;
  }
}

/**
 * Returns symbol for currency code
 */
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  return getCurrencyConfig(currencyCode).symbol;
}

export type CurrencyDisplayFormat = 'symbol' | 'code' | 'symbol_and_code' | 'name';

/**
 * Formats a monetary number in any currency and requested format style:
 * - 'symbol': $1,234.56 or 1 234,56 € or ₹1,23,456.00
 * - 'code': 1,234.56 USD
 * - 'symbol_and_code': $1,234.56 USD
 * - 'name': 1,234.56 US Dollar
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  displayFormat: CurrencyDisplayFormat = 'symbol'
): string {
  const config = getCurrencyConfig(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber: string;
  try {
    formattedNumber = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(absAmount);
  } catch {
    formattedNumber = absAmount.toFixed(config.decimals);
  }

  const sign = isNegative ? '-' : '';

  switch (displayFormat) {
    case 'code':
      return `${sign}${formattedNumber} ${config.code}`;
    case 'symbol_and_code':
      return `${sign}${config.symbol}${formattedNumber} (${config.code})`;
    case 'name':
      return `${sign}${formattedNumber} ${config.name}`;
    case 'symbol':
    default:
      if (config.symbolPosition === 'suffix') {
        return `${sign}${formattedNumber} ${config.symbol}`;
      }
      return `${sign}${config.symbol}${formattedNumber}`;
  }
}

/**
 * List of all supported currencies grouped by region
 */
export function getAllCurrenciesList(): CurrencyConfig[] {
  return Object.values(SUPPORTED_CURRENCIES);
}
