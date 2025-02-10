export const sanitizePhoneNumber = (phone: string) =>
    phone.startsWith('+') ? phone.slice(1) : phone;



export function getFirstAndLastName(fullName: string) {
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
    };
  }