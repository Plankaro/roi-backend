import { Business } from '@prisma/client';
import { differenceInMilliseconds, format } from 'date-fns';
import * as crypto from 'crypto';

export const sanitizePhoneNumber = (phone: any) => {
  const phoneStr = String(phone); // Convert to string if not already
  return phoneStr.startsWith('+') ? phoneStr.slice(1) : phoneStr;
};

export function getFirstAndLastName(fullName: string) {
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
  };
}

export function getShopifyConfig(buisness: Business) {
  return {
    store: buisness?.shopify_domain || process.env.SHOPIFY_STORE,
    accessToken: decrypt(buisness?.shopify_Token) || process.env.SHOPIFY_ACCESS_TOKEN,
  };
}

export function getgoogleAnalyticsConfig(buisness: Business) {
  return {
    mesurementId: decrypt(buisness?.g_mesurement_id),
    apiSecret: decrypt(buisness?.g_api_secret),
  };
}

export function getMetaPixelConfig(buisness: Business) {
  return {
    pixelId: decrypt(buisness?.p_track_id),
  };
}





export function getWhatsappConfig(buisness?: Business) {
  return {
    whatsappMobileId:
      buisness?.whatsapp_mobile_id || process.env.WHATSAPP_MOBILE_ID, // required for sending messages (template/text/media)
    whatsappBusinessId:
      buisness?.whatsapp_buisness_id || process.env.WHATSAPP_BUISNESS_ID, // required for template management (get/create/delete)
    whatsappApiToken: decrypt(buisness?.whatsapp_token)
       || process.env.WHATSAPP_API_TOKEN,
    whatsappMobile: buisness?.whatsapp_mobile || '15551365364',
    whatsappAppId: buisness?.whatsapp_app_id || process.env.WHATSAPP_APP_ID, // required
  };
}

export function getRazorpayConfig(buisness?: Business) {
  return {
    razorpayApiKey: decrypt(buisness?.razorpay_id),
    razorpayApiSecret: decrypt(buisness?.razorpay_secret),
  };
}

export function mergeDateTime(dateStr: string, timeStr: string): string {
  const parsedDate = new Date(dateStr); // Convert date string to Date object

  // Extract hours and minutes from time string
  const [hours, minutes] = timeStr.match(/\d+/g).map(Number);
  const isPM = timeStr.includes('PM');

  // Adjust for 12-hour format
  parsedDate.setHours(
    isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours,
    minutes,
    0,
  );

  // Format final datetime string
  return format(parsedDate, 'yyyy-MM-dd HH:mm:ssXXX');
}

export function calculateDelay(targetDate: Date): number {
  const now = new Date();
  const delay = differenceInMilliseconds(targetDate, now);

  return delay > 0 ? delay : 0;
}

export function getFromDate(expression: string): Date {
  // Example of valid expressions: "24 days", "3 hours", "30 minutes"
  const [valueString, unit] = expression.trim().split(' ');
  const value = parseInt(valueString, 10);

  if (isNaN(value) || !unit) {
    throw new Error(`Invalid time expression: "${expression}"`);
  }

  let msToSubtract = 0;

  switch (unit.toLowerCase()) {
    case 'day':
    case 'days':
      msToSubtract = value * 24 * 60 * 60 * 1000; // days -> ms
      break;
    case 'hour':
    case 'hours':
      msToSubtract = value * 60 * 60 * 1000; // hours -> ms
      break;
    case 'minute':
    case 'minutes':
      msToSubtract = value * 60 * 1000; // minutes -> ms
      break;
    default:
      throw new Error(`Invalid unit in time expression: "${unit}"`);
  }

  return new Date(Date.now() - msToSubtract);
}

export function getTagsArray(tagsInput) {
  // If input is an array, flatten each string into individual tags.
  if (Array.isArray(tagsInput) && tagsInput.length > 0) {
    return tagsInput.flatMap((item) =>
      item.trim() ? item.split(',').map((tag) => tag.trim()) : [],
    );
  }
  // Otherwise, if it's a string, process it directly.
  if (typeof tagsInput === 'string') {
    return tagsInput.trim()
      ? tagsInput.split(',').map((tag) => tag.trim())
      : [];
  }
  // If neither, return an empty array.
  return [];
}

// Returns true if every tag in tagsFromDb is exactly present in the extracted tags array.
export function allTagsPresent(tagsFromField, tagsFromDb) {
  if (tagsFromDb.length === 0) return true;
  const fieldTags = getTagsArray(tagsFromField);
  return tagsFromDb.every((tag) => fieldTags.includes(tag));
}

// Returns true if at least one tag in tagsFromDb is exactly present in the extracted tags array.
export function anyTagPresent(tagsFromField, tagsFromDb) {
  if (tagsFromDb.length === 0) return true;
  const fieldTags = getTagsArray(tagsFromField);
  return tagsFromDb.some((tag) => fieldTags.includes(tag));
}

// Returns true if none of the tags in tagsFromDb is present in the extracted tags array.
export function noneTagPresent(tagsFromField, tagsFromDb) {
  if (tagsFromDb.length === 0) return true;
  const fieldTags = getTagsArray(tagsFromField);
  return tagsFromDb.every((tag) => !fieldTags.includes(tag));
}

interface Expression {
  time: number;
  unit: string;
}

export function getFutureTimestamp(expression: Expression): number {
  const { time, unit } = expression;

  if (isNaN(time) || !unit) {
    throw new Error(`Invalid time expression: ${JSON.stringify(expression)}`);
  }

  let msToAdd = 0;

  switch (unit.toLowerCase()) {
    case 'day':
    case 'days':
      msToAdd = time * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      break;
    case 'hour':
    case 'hours':
      msToAdd = time * 60 * 60 * 1000; // Convert hours to milliseconds
      break;
    case 'minute':
    case 'minutes':
      msToAdd = time * 60 * 1000; // Convert minutes to milliseconds
      break;
    default:
      throw new Error(`Invalid unit in time expression: "${unit}"`);
  }

  return  msToAdd; // Return future timestamp in milliseconds
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isTemplateButtonRedirectSafe(template: any): boolean {
  const BACKEND_URL = process.env.BACKEND_URL?.replace(
    /^https?:\/\//,
    '',
  ).toLowerCase();

  if (!BACKEND_URL) {
    console.warn('⚠️ BACKEND_URL is not defined in environment variables.');
    return false;
  }

  const buttonComponent = template?.components?.find(
    (component) => component.type === 'BUTTONS',
  );

  if (!buttonComponent || !Array.isArray(buttonComponent.buttons)) {
    console.warn('⚠️ No BUTTONS component found in template.');
    return false;
  }

  const matchingUrlButton = buttonComponent.buttons.find((button) => {
    if (button.type === 'URL' && button.url) {
      const normalizedUrl = button.url
        .replace(/^https?:\/\//, '')
        .toLowerCase();
      console.log('🔍 Checking button URL:', normalizedUrl);
      return normalizedUrl.startsWith(BACKEND_URL);
    }
    return false;
  });

  const isSafe = !!matchingUrlButton;
  console.log(
    `🔐 URL Button is ${isSafe ? 'safe ✅' : 'not safe ❌'} for redirect.`,
  );

  return isSafe;
}
export const generateLinkWithUTM = (
  utmParameters: any,
  button: { value: string },
) => {
  let link = button.value; // Start with the button value, like 'facebook'

  // Only append utm_campaign if enabled
  if (utmParameters.utm_campaign.enabled) {
    link += `?utm_campaign=${utmParameters.utm_campaign.value}`;
  }

  // Only append utm_source if enabled
  if (utmParameters.utm_source.enabled) {
    link += link.includes('?')
      ? `&utm_source=${utmParameters.utm_source.value}`
      : `?utm_source=${utmParameters.utm_source.value}`;
  }

  // Only append utm_medium if enabled
  if (utmParameters.utm_medium.enabled) {
    link += link.includes('?')
      ? `&utm_medium=${utmParameters.utm_medium.value}`
      : `?utm_medium=${utmParameters.utm_medium.value}`;
  }

  return link;
};

// Decode your Base64 key into a 32-byte Buffer:
const KEY = Buffer.from(process.env.API_ENCRYPTION_KEY!, 'base64');

/**
 * Encrypts a UTF‑8 string with AES‑256‑CBC, returning a Base64 payload.
 * Format: base64(iv + ciphertext)
 */

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(16); // 16‑byte IV
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  // Prepend IV and encode all as Base64:
  return Buffer.concat([iv, encrypted]).toString('base64');
}

export function decrypt(payload: string): string {
  const data = Buffer.from(payload, 'base64'); // decode iv+ciphertext
  // Use subarray for view; if you need a copy, wrap in Buffer.from(...)
  const iv = data.subarray(0, 16); // first 16 bytes view :contentReference[oaicite:5]{index=5}
  const encrypted = data.subarray(16); // remainder view :contentReference[oaicite:6]{index=6}
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
