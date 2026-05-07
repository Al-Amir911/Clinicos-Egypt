import { formatEgyptianPhoneForWhatsApp } from "./format";

interface EvolutionSendTextResponse {
  key?: {
    remoteJid?: string;
    fromMe?: boolean;
    id?: string;
  };
  message?: object;
  messageTimestamp?: number;
  status?: string;
  error?: string;
}

/**
 * Sends a WhatsApp text message via Evolution API v2.
 * @param phone The raw phone number of the recipient.
 * @param text The text message to send.
 * @returns A promise resolving to the API response or throws an error.
 */
export async function sendWhatsAppMessage(phone: string, text: string): Promise<EvolutionSendTextResponse | null> {
  const EVO_API_URL = process.env.EVO_API_URL;
  const EVO_API_KEY = process.env.EVO_API_KEY;
  const EVO_INSTANCE_NAME = process.env.EVO_INSTANCE_NAME;

  if (!EVO_API_URL || !EVO_API_KEY || !EVO_INSTANCE_NAME) {
    console.warn("Evolution API environment variables are not configured.");
    return null;
  }

  const formattedPhone = formatEgyptianPhoneForWhatsApp(phone);
  if (!formattedPhone) {
    throw new Error("Invalid phone number provided to Evolution API.");
  }

  const endpoint = `${EVO_API_URL.replace(/\/+$/, '')}/message/sendText/${EVO_INSTANCE_NAME}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVO_API_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Evolution API Error [${response.status}]:`, errorText);
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to call Evolution API:", error);
    throw error;
  }
}
