import { getWhatsAppSupportUrl } from "@/lib/support-whatsapp";
import { SupportWhatsAppBubbleClient } from "@/components/support-whatsapp-bubble-client";

/** Site-wide support bubble; number is defined in `lib/support-whatsapp.ts`. */
export function SupportWhatsAppBubble() {
  const url = getWhatsAppSupportUrl();
  return <SupportWhatsAppBubbleClient url={url} />;
}
