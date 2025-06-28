import {
  formatDuration,
  formatEndTime,
  formatTemperature
} from './formatters';

// src/utils/localize.js
// Cache for parsed path results
const pathCache = new Map();

/**
 * Get a nested value from an object using a dot-separated path
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path
 * @returns {*} Value at path or undefined
 */
const getNestedValue = (obj, path) => {
  // Check cache first
  const cacheKey = `${path}`;
  if (pathCache.has(cacheKey)) {
    const cached = pathCache.get(cacheKey);
    return cached(obj);
  }

  // Create and cache accessor function
  const parts = path.split('.');
  const accessor = (target) => {
    let current = target;
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  };

  pathCache.set(cacheKey, accessor);
  return accessor(obj);
};

export class Localize {
  constructor() {
    this._strings = new Map();
    this._fallbackLang = 'en';
    this._currentLang = this._fallbackLang;
  }

  /**
   * Load translations for a language
   * @param {string} lang - Language code
   * @param {Object} translations - Translation object
   */
  loadTranslations(lang, translations) {
    this._strings.set(lang, translations);
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  get language() {
    return document.querySelector('home-assistant')?.hass?.language || this._fallbackLang;
  }

  /**
   * Set fallback language
   * @param {string} lang - Language code
   */
  setFallbackLanguage(lang) {
    this._fallbackLang = lang;
  }

  /**
   * Localize a string with parameters
   * @param {string} key - Translation key
   * @param {Object} params - Parameters for translation
   * @returns {string} Localized string
   */
  localize(key, params = {}) {
    // Try current language
    let translated = getNestedValue(this._strings.get(this.language), key);
    
    // Fallback to default language if needed
    if (translated === undefined && this.language !== this._fallbackLang) {
      translated = getNestedValue(this._strings.get(this._fallbackLang), key);
    }

    // Return key if no translation found
    if (translated === undefined) {
      console.warn(`No translation found for key: ${key}`);
      return key;
    }

    // Replace parameters
    return translated.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }

  /**
   * Helper method for card strings
   * @param {string} key - Translation key
   * @param {Object} params - Parameters for translation
   * @returns {string} Localized string
   */
  t(key, params = {}) {
    return this.localize(`ui.card.printwatch.${key}`, params);
  }
}

// Initialize and export singleton
export const localize = new Localize();

// Load default translations
import * as en from '../translations/en.json';
import * as de from '../translations/de.json';

localize.loadTranslations('en', en.default || en);
localize.loadTranslations('de', de.default || de);
