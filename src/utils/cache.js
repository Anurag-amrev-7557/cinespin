/**
 * Safely retrieves a value from browser cache.
 *
 * @param {string} key - The cache key (without namespace).
 * @param {Object} [options]
 * @param {string} [options.namespace='app'] - Cache namespace.
 * @param {Storage} [options.storage=sessionStorage] - sessionStorage or localStorage.
 * @returns {any|null} The parsed value, or null if not found or invalid.
 */
export const getFromCache = (key, options = {}) => {
  const {
    namespace = 'app',
    storage = sessionStorage,
  } = options;

  const namespacedKey = `${namespace}:${key}`;
  const raw = storage.getItem(namespacedKey);

  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    // Optional future schema or TTL checks
    // if (data?.expiresAt && Date.now() > data.expiresAt) {
    //   storage.removeItem(namespacedKey);
    //   return null;
    // }

    return data?.value ?? null;
  } catch (err) {
    console.warn(`Cache parse error for key: ${namespacedKey}`, err);
    storage.removeItem(namespacedKey); // clean corrupted data
    return null;
  }
};

/**
 * Safely stores a value in browser cache.
 *
 * @param {string} key - The cache key (without namespace).
 * @param {any} value - The data to store.
 * @param {Object} [options]
 * @param {string} [options.namespace='app'] - Cache namespace.
 * @param {Storage} [options.storage=sessionStorage] - sessionStorage or localStorage.
 * @returns {boolean} Whether the value was successfully cached.
 */
export const setToCache = (key, value, options = {}) => {
  const {
    namespace = 'app',
    storage = sessionStorage,
  } = options;

  const namespacedKey = `${namespace}:${key}`;
  const payload = {
    version: 1,        // for future upgrades
    timestamp: Date.now(),
    value,
    // expiresAt: Date.now() + 1000 * 60 * 60 * 24 // optional TTL (1 day)
  };

  try {
    storage.setItem(namespacedKey, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn(`Failed to cache data for key: ${namespacedKey}`, err);
    return false;
  }
};