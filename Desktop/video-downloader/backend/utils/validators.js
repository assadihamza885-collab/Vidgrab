const SUPPORTED_PATTERNS = [
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(instagram\.com)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(pinterest\.com|pin\.it)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(reddit\.com|v\.redd\.it)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(dailymotion\.com|dai\.ly)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(threads\.net)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(snapchat\.com)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(soundcloud\.com)\/.+$/i,
  /^(https?:\/\/)?(www\.)?(twitch\.tv)\/.+$/i
];

const validateURL = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
  } catch (err) {
    return false;
  }
  return SUPPORTED_PATTERNS.some((pattern) => pattern.test(trimmed));
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/["';`|$&><\\]/g, '').trim();
};

module.exports = {
  validateURL,
  sanitizeInput
};