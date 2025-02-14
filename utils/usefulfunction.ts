import { Business } from "@prisma/client";
export const sanitizePhoneNumber = (phone: string) =>
    phone.startsWith('+') ? phone.slice(1) : phone;



export function getFirstAndLastName(fullName: string) {
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
    };
  }


export function getShopifyConfig(buisness:Business){
  return {
    store: buisness.shopify_domain,
    accessToken: buisness.shopify_Token
  }
}

export function getWhatsappConfig(buisness:Business){
  return {
    whatsappMobileId: buisness.whatsapp_mobile_id,   // required for sending messages (template/text/media)
  whatsappBusinessId: buisness.whatsapp_buisness_id, // required for template management (get/create/delete)
  whatsappApiToken: buisness.whatsapp_token,
  whatsappMobile:buisness.whatsapp_mobile, // required
  }
}