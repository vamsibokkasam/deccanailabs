/** Business WhatsApp number in international format without + or spaces. */
export const WHATSAPP_NUMBER = "919845428526";

export function buildWhatsAppUrl(text) {
  const message = String(text || "").trim();
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}${query}`;
}
