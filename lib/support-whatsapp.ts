/** WhatsApp number for support (country code + national number, no + or spaces). */
const SUPPORT_WHATSAPP_DIGITS = "2348140669712";

const DEFAULT_PREFILL =
  "Hi — I'm using Diagflow and ran into an issue (diagram / export / credits):";

export function getWhatsAppSupportUrl(): string {
  const text = encodeURIComponent(DEFAULT_PREFILL);
  return `https://wa.me/${SUPPORT_WHATSAPP_DIGITS}?text=${text}`;
}
