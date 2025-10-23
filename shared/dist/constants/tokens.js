// Tradeable tokens on TON blockchain
// These are the tokens available for trading in the app
// Top tradeable tokens on TON
export const TRADEABLE_TOKENS = {
    STON: {
        symbol: 'STON',
        name: 'STON.fi Token',
        contractAddress: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
        decimals: 9,
        dexName: 'STON.fi',
        pairAddress: 'EQD8TJ8xEWB1SpnRE4d4iwBaWcyk7E0GRlEd8Eu1K1meJkCb',
        logoUrl: 'https://cache.tonapi.io/imgproxy/T3PB4s7oprNVaJkwqbGg54nexKE0zzKhcrPv8jcWYzU/rs:fill:200:200:1/g:no/aHR0cHM6Ly9hc3NldHMuZGVkdXN0LmlvL2ltYWdlcy9zdG9uLnN2Zw.webp',
    },
    DOGS: {
        symbol: 'DOGS',
        name: 'DOGS Token',
        contractAddress: 'EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS',
        decimals: 9,
        dexName: 'STON.fi',
        pairAddress: 'EQBcYb1VGW2oCVNXpbAzEzCXRXKrEqmBG_4vDZBNKVALSWAG',
        logoUrl: 'https://cache.tonapi.io/imgproxy/7S0XyJ0Hge85LhgJpXMQKvHLjaTRSLDqmQjqVmzZm6s/rs:fill:200:200:1/g:no/aHR0cHM6Ly9hc3NldHMuZGVkdXN0LmlvL2ltYWdlcy9kb2dzLnBuZw.webp',
    },
    NOT: {
        symbol: 'NOT',
        name: 'Notcoin',
        contractAddress: 'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT',
        decimals: 9,
        dexName: 'STON.fi',
        pairAddress: 'EQBIkUFwD1rZcQXMcJ9hN1L6p0NLSYLBQqpKv1MKmqLgB1fJ',
        logoUrl: 'https://cache.tonapi.io/imgproxy/W5q1MRf1EKcceHM5nwjKLSKdGqWBd5Bq_yHKQe8ZLVE/rs:fill:200:200:1/g:no/aHR0cHM6Ly9jZG4uam9pbmNvbW11bml0eS54eXovaW1hZ2VzL2NvaW4vbm90Y29pbi5qcGc.webp',
    },
    HMSTR: {
        symbol: 'HMSTR',
        name: 'Hamster Kombat',
        contractAddress: 'EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy4B8Ek_qLh',
        decimals: 9,
        dexName: 'STON.fi',
        pairAddress: 'EQC-tdRjjoYMz3MXKW4pj95bNZgvRyBz8gVxZbH72pELR0W9',
        logoUrl: 'https://cache.tonapi.io/imgproxy/j9lZIAqBxwC2EQv0J7I0kN9e1WSPpYrT0hl3N4YJJwE/rs:fill:200:200:1/g:no/aHR0cHM6Ly9hc3NldHMuZGVkdXN0LmlvL2ltYWdlcy9obXN0ci5wbmc.webp',
    },
    SCALE: {
        symbol: 'SCALE',
        name: 'Scaleton',
        contractAddress: 'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
        decimals: 9,
        dexName: 'STON.fi',
        pairAddress: 'EQAW4jv_1RzHTmTHrJJ3qPqHQNLfpk7YbEdLaW6-vQhGfaLt',
        logoUrl: 'https://cache.tonapi.io/imgproxy/qhfVNzSvhGnLrqHT1mNFHYm2pDkLmV7zbiJKEj7ycxg/rs:fill:200:200:1/g:no/aHR0cHM6Ly9hc3NldHMuZGVkdXN0LmlvL2ltYWdlcy9zY2FsZS5zdmc.webp',
    },
    USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        contractAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        decimals: 6,
        dexName: 'STON.fi',
        pairAddress: 'EQDvqJ_VQqY0JDZ3jh-3vC2vKp0o3_YDwpGbGgFIJHmB2_jv',
        logoUrl: 'https://cache.tonapi.io/imgproxy/0e0Vtcz5fJQ3GilbGXwHZFokh1WyZ5JLHnf3GC_6VBw/rs:fill:200:200:1/g:no/aHR0cHM6Ly90ZXRoZXIudG8vaW1hZ2VzL2xvZ29DaXJjbGUucG5n.webp',
    },
};
// Default token list (most popular for MVP)
export const DEFAULT_TOKEN_LIST = ['STON', 'DOGS', 'NOT', 'HMSTR', 'SCALE'];
// Trading configuration
export const TRADING_CONFIG = {
    DEFAULT_TRADE_AMOUNT_TON: 1, // Default: 1 TON per trade
    MIN_TRADE_AMOUNT_TON: 0.1, // Minimum: 0.1 TON
    MAX_TRADE_AMOUNT_TON: 100, // Maximum: 100 TON
    DEFAULT_SLIPPAGE_PERCENT: 1, // Default: 1% slippage
    MAX_SLIPPAGE_PERCENT: 5, // Maximum: 5% slippage
    PRICE_UPDATE_INTERVAL_MS: 30000, // Update prices every 30 seconds
    TRANSACTION_TIMEOUT_MS: 120000, // 2 minutes timeout for transactions
    TRANSACTION_POLL_INTERVAL_MS: 5000, // Poll transaction status every 5 seconds
};
// TON native token (for display purposes)
export const TON_NATIVE = {
    symbol: 'TON',
    name: 'Toncoin',
    contractAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    decimals: 9,
    dexName: 'Native',
    pairAddress: '',
    logoUrl: 'https://cache.tonapi.io/imgproxy/T3PB4s7oprNVaJkwqbGg54nexKE0zzKhcrPv8jcWYzU/rs:fill:200:200:1/g:no/aHR0cHM6Ly90ZXRoZXIudG8vaW1hZ2VzL2xvZ29DaXJjbGUucG5n.webp',
};
//# sourceMappingURL=tokens.js.map