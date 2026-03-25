export const APP_NAME = 'Stealth Dev';

export const DEFAULTS = {
  ROOM_ID: 'general',
  SECRET_KEY: 'stealth_dev_key_2024',
  ENCODING_DUMMY_KEY: 'dummy_key',
} as const;

export const STORAGE_KEYS = {
  USERNAME: 'stealth_username',
  ROOM_ID: 'stealth_room_id',
  AUTO_REVEAL: 'stealth_auto_reveal',
  SECRET_KEY: 'stealth_secret_key',
  PANIC_MODE: 'stealth_panic_mode',
  PRIVATE_MODE: 'stealth_private_mode',
} as const;

