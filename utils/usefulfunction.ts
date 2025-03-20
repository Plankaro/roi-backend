import { Business } from "@prisma/client";
import { differenceInMilliseconds, format } from 'date-fns';
export const sanitizePhoneNumber = (phone: any) => {
  const phoneStr = String(phone); // Convert to string if not already
  return phoneStr.startsWith('+') ? phoneStr.slice(1) : phoneStr;
};



export function getFirstAndLastName(fullName: string) {
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
    };
  }


export function getShopifyConfig(buisness:Business){
  return {
    store: buisness?.shopify_domain || process.env.SHOPIFY_STORE,
    accessToken: buisness?.shopify_Token || process.env.SHOPIFY_ACCESS_TOKEN
  }
}

export function getWhatsappConfig(buisness?:Business){
  return {
    whatsappMobileId: buisness?.whatsapp_mobile_id || process.env.WHATSAPP_MOBILE_ID  ,   // required for sending messages (template/text/media)
  whatsappBusinessId: buisness?.whatsapp_buisness_id ||process.env.WHATSAPP_BUISNESS_ID , // required for template management (get/create/delete)
  whatsappApiToken: buisness?.whatsapp_token || process.env.WHATSAPP_API_TOKEN,
  whatsappMobile:buisness?.whatsapp_mobile || "15551365364",
  whatsappAppId: buisness?.whatsapp_app_id || process.env.WHATSAPP_APP_ID,// required
  }
}


export function mergeDateTime(dateStr: string, timeStr: string): string {
  const parsedDate = new Date(dateStr); // Convert date string to Date object

  // Extract hours and minutes from time string
  const [hours, minutes] = timeStr.match(/\d+/g).map(Number);
  const isPM = timeStr.includes("PM");

  // Adjust for 12-hour format
  parsedDate.setHours(
    isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours,
    minutes,
    0
  );

  // Format final datetime string
  return format(parsedDate, "yyyy-MM-dd HH:mm:ssXXX");
} 

export function calculateDelay(targetDate: Date): number {
  const now = new Date();
  const delay = differenceInMilliseconds(targetDate, now);

  return delay > 0 ? delay : 0;
}

export function getFromDate(expression: string): Date {
  // Example of valid expressions: "24 days", "3 hours", "30 minutes"
  const [valueString, unit] = expression.trim().split(" ");
  const value = parseInt(valueString, 10);

  if (isNaN(value) || !unit) {
    throw new Error(`Invalid time expression: "${expression}"`);
  }

  let msToSubtract = 0;

  switch (unit.toLowerCase()) {
    case "day":
    case "days":
      msToSubtract = value * 24 * 60 * 60 * 1000; // days -> ms
      break;
    case "hour":
    case "hours":
      msToSubtract = value * 60 * 60 * 1000; // hours -> ms
      break;
    case "minute":
    case "minutes":
      msToSubtract = value * 60 * 1000; // minutes -> ms
      break;
    default:
      throw new Error(`Invalid unit in time expression: "${unit}"`);
  }

  return new Date(Date.now() - msToSubtract);
}


export function getTagsArray(tagsInput) {
  // If input is an array, flatten each string into individual tags.
  if (Array.isArray(tagsInput) && tagsInput.length>0) {
    
    return tagsInput.flatMap(item =>
      item.trim() ? item.split(',').map(tag => tag.trim()) : []
    );
  }
  // Otherwise, if it's a string, process it directly.
  if (typeof tagsInput === 'string') {
    return tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()) : [];
  }
  // If neither, return an empty array.
  return [];
}


// Returns true if every tag in tagsFromDb is exactly present in the extracted tags array.
export function allTagsPresent(tagsFromField, tagsFromDb) {
  if(tagsFromDb.length === 0) return true
  const fieldTags = getTagsArray(tagsFromField);
  return tagsFromDb.every(tag => fieldTags.includes(tag));
}

// Returns true if at least one tag in tagsFromDb is exactly present in the extracted tags array.
export function anyTagPresent(tagsFromField, tagsFromDb) {
  if(tagsFromDb.length === 0) return true
  const fieldTags = getTagsArray(tagsFromField);
  return tagsFromDb.some(tag => fieldTags.includes(tag));
}

// Returns true if none of the tags in tagsFromDb is present in the extracted tags array.
export function noneTagPresent(tagsFromField, tagsFromDb) {
  if(tagsFromDb.length === 0) return true
  const fieldTags = getTagsArray(tagsFromField);
  return tagsFromDb.every(tag => !fieldTags.includes(tag));
}


export function getFutureTimestamp(expression: string): number {
  // Example of valid expressions: "24 days", "3 hours", "30 minutes"
  const [valueString, unit] = expression.trim().split(" ");
  const value = parseInt(valueString, 10);

  if (isNaN(value) || !unit) {
    throw new Error(`Invalid time expression: "${expression}"`);
  }

  let msToAdd = 0;

  switch (unit.toLowerCase()) {
    case "day":
    case "days":
      msToAdd = value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      break;
    case "hour":
    case "hours":
      msToAdd = value * 60 * 60 * 1000; // Convert hours to milliseconds
      break;
    case "minute":
    case "minutes":
      msToAdd = value * 60 * 1000; // Convert minutes to milliseconds
      break;
    default:
      throw new Error(`Invalid unit in time expression: "${unit}"`);
  }

  return Date.now() + msToAdd; // Return future timestamp in milliseconds
}
